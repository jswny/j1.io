# Prelude

## I. Preface and Motivation
This guide was written because I don't particularly enjoy deploying Phoenix (or Elixir for that matter) applications. It's not easy. Primarily, I don't have a lot of money to spend on a nice, fancy VPS so compiling my Phoenix apps on my VPS often isn't an option. For that, we have Distillery releases. However, that requires me to either have a separate server for staging to use as a build server, or to keep a particular version of Erlang installed on my VPS, neither of which sound like great options to me and they all have the possibilities of version mismatches with ERTS. In addition to all this, theres a whole lot of configuration which needs to be done to setup a Phoenix app for deployment, and it's hard to remember.

For that reason, I wanted to use Docker so that all of my deployments would be automated and reproducable. In addition, Docker would allow me to have reproducable builds for my releases. I could build my releases on any machine that I wanted in a container which would target the same architecture as the one I used to run my release when I deployed it. For instance, I could build my releases on my MacBook using an Alpine-based Docker container, and then deploy those to my VPS in a different Alpine-based container. This would save me a lot of headache with trying to compile for the correct architecture for my VPS.

In addition, using Docker would allow me to recompile and swap out my app's server without having to mess with the database at all as long as I don't change my models. Since I run apps which need a lot of time to seed the database, this would provide me a lot of granular control about when I need to do that and when I don't.

Finally, this setup would allow me to run an NGINX container to proxy all of my server's traffic to the appropriate app container, since I often run multiple apps on my server.

Overall, the biggest motivation that made me want to create this guide was to setup a VPS in which I have zero dependencies besides Docker, and I wanted to have a reproducable guide for doing that which was compatable with both Phoenix 1.2 and 1.3, since I have apps running both of those versions of Phoenix.

## II. Goals
1. Run my Phoenix apps inside slim Docker containers.
2. Run the database, migration tasks, and server in separate, self-contained containers.
3. Use Docker Compose for easy deployments.
4. Be able to swap out and upgrade individual components of the app.
5. Have each app use a separate database container.
6. Run multiple self-contained apps with Docker and maintain them individually.
7. Connect all apps to a single NGINX container with individual configs for each active app.
8. Run everything with **zero dependencies** on my VPS besides Docker. No Mix in production.
9. Be compatible with the deployment of any other kinds of apps, not just Elixir/Phoenix apps.

## III. Advantages
* Able to run multiple apps on the same server
* Compatible with deployment of any other kind of app (not just Elixir/Phoenix)
* Compilation completely decoupled from deployment so you can compile anywhere and deploy anywhere else

## IV. Phoenix 1.3
This guide is written for Phoenix 1.2. However, all necesary changes to work with [Phoenix 1.3](http://phoenixframework.org/blog/phoenix-1-3-0-released) will be marked explicitly with "**Phoenix 1.3:** ...".

## V. Postgres Backups Disclaimer
This guide currently doesn't support any kind of backups for the Docker container running your Postgres database. However, it shouldn't be hard to manually do this, or setup a simple shell script/cron job to do this automatically. For more information see [this StackOverflow post](https://stackoverflow.com/questions/24718706/backup-restore-a-dockerized-postgresql-database). I plan on adding this content when I have time to revisit this guide in the future.

## VI. Where to Get Help 💁
If you comment here on the Gist, I may see it but GitHub doesn't notify me when someone comments unfortunately. The much better place to ask me questions and get help with this guide is to post on my [Elixir Forum thread](https://elixirforum.com/t/flexible-dockerized-phoenix-deployments-1-2-1-3/12477). I get notifications for those and I check them frequently. Check out the thread if you have a question, it may have been discussed already! Thanks for reading and feel free to reach out to me if you have any questions :)

# Guide

## 1. Add and Configure Distillery
For generating releases, we will be using [Distillery](https://github.com/bitwalker/distillery), which allows us to package a release of our application into a single tarball.

1. Add Distillery to your Mix project.
```elixir
defp deps do
  [{:distillery, "~> 1.5", runtime: false}]
end
```

2. Run `mix do deps.get, compile` to get and compile Distillery.

3. Run `mix release.init` to intialize Distillery.

4. Edit the generated config file in `rel/config.exs` so that `include_erts` in the `:prod` config block is set to `false`.  We do this because we will run the release inside a container which already has Erlang installed, so we do not need to package the Erlang runtime with the release. If you want to run your release in a standard Alpine container instead of one with Erlang installed, you could keep this option set to `true`.
```elixir
...

environment :prod do
  set include_erts: false
  ...
end

...
```

## 2. Running Migrations and Seeding the Database
In order to be able to run migrations and seed the database from the release generated by Distillery, we will need to make a few modifications as generally outlined by the [Running Migrations](https://hexdocs.pm/distillery/running-migrations.html) guide. This section assumes that you have database seeding operations defined in the normal location under `priv/repo/`. If you don't have these, your database will just be migrated and no seeding will be done. Otherwise, you can strip down the `release_tasks.ex` file as shown below.

1. Create a file called `release_tasks.ex` which will contain the tasks that can be run from the release. You can place this file anywhere in your app's directory structure, but I will place it in `lib/myapp`. 
    - **Note**: if you are seeding your database with certain files, these files must be placed in the `priv/` directory of your app to ensure that they are included with the generated release. Otherwise, seeding the database will not work because the files won't exist in the release.
```elixir
defmodule MyApp.ReleaseTasks do

  @start_apps [
    :crypto,
    :ssl,
    :postgrex,
    :ecto
  ]

  def myapp, do: Application.get_application(__MODULE__)

  def repos, do: Application.get_env(myapp(), :ecto_repos, [])

  def seed do
    me = myapp()

    IO.puts "Loading #{me}.."
    # Load the code for myapp, but don't start it
    :ok = Application.load(me)

    IO.puts "Starting dependencies.."
    # Start apps necessary for executing migrations
    Enum.each(@start_apps, &Application.ensure_all_started/1)

    # Start the Repo(s) for myapp
    IO.puts "Starting repos.."
    Enum.each(repos(), &(&1.start_link(pool_size: 1)))

    # Run migrations
    migrate()

    # Run seed script
    Enum.each(repos(), &run_seeds_for/1)

    # Signal shutdown
    IO.puts "Success!"
    :init.stop()
  end

  def migrate, do: Enum.each(repos(), &run_migrations_for/1)

  def priv_dir(app), do: "#{:code.priv_dir(app)}"

  defp run_migrations_for(repo) do
    app = Keyword.get(repo.config, :otp_app)
    IO.puts "Running migrations for #{app}"
    Ecto.Migrator.run(repo, migrations_path(repo), :up, all: true)
  end

  def run_seeds_for(repo) do
    # Run the seed script if it exists
    seed_script = seeds_path(repo)
    if File.exists?(seed_script) do
      IO.puts "Running seed script.."
      Code.eval_file(seed_script)
    end
  end

  def migrations_path(repo), do: priv_path_for(repo, "migrations")

  def seeds_path(repo), do: priv_path_for(repo, "seeds.exs")

  def priv_path_for(repo, filename) do
    app = Keyword.get(repo.config, :otp_app)
    repo_underscore = repo |> Module.split |> List.last |> Macro.underscore
    Path.join([priv_dir(app), repo_underscore, filename])
  end
end
```

If your app only needs to run migrations and not seed the database, you can use a stripped-down version of the file. In this version, the `seed()` function only runs migrations via `migrate()`, it does not seed the database.

```diff
diff --git a/release_tasks.ex b/release_tasks.ex
index 8e0d066..f8117de 100644
--- a/release_tasks.ex
+++ b/release_tasks.ex
@@ -29,9 +29,6 @@ defmodule MyApp.ReleaseTasks do
     # Run migrations
     migrate()
 
-    # Run seed script
-    Enum.each(repos(), &run_seeds_for/1)
-
     # Signal shutdown
     IO.puts "Success!"
     :init.stop()
@@ -47,19 +44,8 @@ defmodule MyApp.ReleaseTasks do
     Ecto.Migrator.run(repo, migrations_path(repo), :up, all: true)
   end
 
-  def run_seeds_for(repo) do
-    # Run the seed script if it exists
-    seed_script = seeds_path(repo)
-    if File.exists?(seed_script) do
-      IO.puts "Running seed script.."
-      Code.eval_file(seed_script)
-    end
-  end
-
   def migrations_path(repo), do: priv_path_for(repo, "migrations")
 
-  def seeds_path(repo), do: priv_path_for(repo, "seeds.exs")
-
   def priv_path_for(repo, filename) do
     app = Keyword.get(repo.config, :otp_app)
     repo_underscore = repo |> Module.split |> List.last |> Macro.underscore

```

```elixir
defmodule MyApp.ReleaseTasks do

  @start_apps [
    :crypto,
    :ssl,
    :postgrex,
    :ecto
  ]

  def myapp, do: Application.get_application(__MODULE__)

  def repos, do: Application.get_env(myapp(), :ecto_repos, [])

  def seed do
    me = myapp()

    IO.puts "Loading #{me}.."
    # Load the code for myapp, but don't start it
    :ok = Application.load(me)

    IO.puts "Starting dependencies.."
    # Start apps necessary for executing migrations
    Enum.each(@start_apps, &Application.ensure_all_started/1)

    # Start the Repo(s) for myapp
    IO.puts "Starting repos.."
    Enum.each(repos(), &(&1.start_link(pool_size: 1)))

    # Run migrations
    migrate()

    # Signal shutdown
    IO.puts "Success!"
    :init.stop()
  end

  def migrate, do: Enum.each(repos(), &run_migrations_for/1)

  def priv_dir(app), do: "#{:code.priv_dir(app)}"

  defp run_migrations_for(repo) do
    app = Keyword.get(repo.config, :otp_app)
    IO.puts "Running migrations for #{app}"
    Ecto.Migrator.run(repo, migrations_path(repo), :up, all: true)
  end

  def migrations_path(repo), do: priv_path_for(repo, "migrations")

  def priv_path_for(repo, filename) do
    app = Keyword.get(repo.config, :otp_app)
    repo_underscore = repo |> Module.split |> List.last |> Macro.underscore
    Path.join([priv_dir(app), repo_underscore, filename])
  end
end
```

2. Create a release command script at `rel/commands/migrate.sh`. This script will run the `seed()` function from the module `ReleaseTasks`. 
```shell
#!/bin/sh

$RELEASE_ROOT_DIR/bin/myapp command Elixir.MyApp.ReleaseTasks seed
```

3. Add the command to the list of release commands by appending it to the commands list in the `rel/config.exs` configuration file.
```elixir
...

release :myapp do
  ...
  set commands: [
    "migrate": "rel/commands/migrate.sh"
  ]
end

...
```
Now you will be able to run migrations from the release with `bin/myapp migrate`.

## 3. Create the Build Dockerfile
1. Add a `.dockerignore` file to your app's root directory  to prevent build artifacts and other unecessary files from being copied into the build container. This is necessary to ensure that when we run the container to build the release, fresh compiles the app, installs fresh Node dependencies on its own, etc. so that none of the host machine's build artifacts leak onto the container.
```
# Git data
.git

# Elixir build artifacts
_build
# Don't ignore the directory where our releases get built
!_build/prod/rel
deps

# Node build artifacts
node_modules

# Tests
test

# Compiled static artifacts
priv/static
```

**Phoenix 1.3:** the file needs to be modified slightly for the new location of `node_modules`.
```diff
diff --git a/.dockerignore b/.dockerignore
index 858de0d..c20021c 100644
--- a/.dockerignore
+++ b/.dockerignore
@@ -6,7 +6,7 @@ _build
 deps
 
 # Node build artifacts
-node_modules
+assets/node_modules
 
 # Tests
 test
```

```
# Git data
.git

# Elixir build artifacts
_build
# Don't ignore the directory where our releases get built
!_build/prod/rel
deps

# Node build artifacts
assets/node_modules

# Tests
test

# Compiled static artifacts
priv/static
```

2. Add a file called `Dockerfile.build` to the root directory of your app. This file will be used to build the release inside a Docker container with Alpine Linux (the base image we will run the release in) as the target architecture.
```Dockerfile
FROM bitwalker/alpine-elixir-phoenix:1.6.1

ENV MIX_ENV prod

# Add the files to the image
ADD . . 

# Cache Elixir deps
RUN mix deps.get --only prod
RUN mix deps.compile

# Cache Node deps
RUN npm i

# Compile JavaScript
RUN npm run deploy

# Compile app
RUN mix compile
RUN mix phoenix.digest

# Generate release
ENTRYPOINT ["mix"]
CMD ["release", "--env=prod"]
```

**Phoenix 1.3:** the file should be modified slightly to accomidate the new `assets` directory, and the new `phx.digest` command.
```diff
diff --git a/df b/df
index fb7078b..6ea163e 100644
--- a/df
+++ b/df
@@ -9,15 +9,17 @@ ADD . .
 RUN mix deps.get --only prod
 RUN mix deps.compile
 
+WORKDIR assets
 # Cache Node deps
 RUN npm i
 
 # Compile JavaScript
 RUN npm run deploy
 
+WORKDIR ..
 # Compile app
 RUN mix compile
-RUN mix phoenix.digest
+RUN mix phx.digest
 
 # Generate release
 ENTRYPOINT ["mix"]
```

```Dockerfile
FROM bitwalker/alpine-elixir-phoenix:1.6.1

ENV MIX_ENV prod

# Add the files to the image
ADD . . 

# Cache Elixir deps
RUN mix deps.get --only prod
RUN mix deps.compile

WORKDIR assets
# Cache Node deps
RUN npm i

# Compile JavaScript
RUN npm run deploy

WORKDIR ..
# Compile app
RUN mix compile
RUN mix phx.digest

# Generate release
ENTRYPOINT ["mix"]
CMD ["release", "--env=prod"]
```

## 4. Add a Build Script
Next we will add a shell script which will build the release. This script first builds the release builder image using `Dockerfile.build`, and then it runs the container, with a volume connected to the host machine's `rel/` directory. This way, when the container is run, the release is built inside of the `rel/` directory inside of the container but the release remains on the host machine in the same directory after the container exists. Remember, since the release is built inside the container for the Alpine Linux architecture, you will probably not be able to run this release on your host machine.
- **Note:** You will most likely have to add execution permissions to this file using `sudo chmod +x build.sh`.
```shell
#!/bin/sh

# Remove old releases
rm -rf _build/prod/rel/*

# Build the image
docker build --rm -t myapp-build -f Dockerfile.build .

# Run the container
docker run -it --rm --name myapp-build -v $(pwd)/_build/prod/rel:/opt/app/_build/prod/rel myapp-build
```

Now, you can run the script with `./build.sh` and it will build and run the Docker container which will build the release in `_build/prod/rel/myapp`.

- **Note:** the `$(pwd)` variable may not function correctly with paths which include spaces. Therefore, you may have to substitute this value for the full path to your app instead.

### Diagram
The following diagram depicts the build process:

![Building the image diagram](https://i.imgur.com/HKRxWee.png)

## 5. Create the Run Dockerfile
Next, we need a Dockerfile to run the generated release that Distillery has built for us. In the root directory of your application, create a file called `Dockerfile.run`. In this file, we have not specified a default command via a `CMD` instruction for the container. This is because we will set this in the `docker-compose.yml` file later so that we can change the command there if needed.
- **Note:** you may have to change the `0.0.1` part of the path in this file depending on the version of your OTP app which you have specified. 
```Dockerfile
FROM bitwalker/alpine-erlang:20.2.2

# Set environment variables
ENV MIX_ENV=prod

# Copy tarball release
ADD _build/prod/rel/myapp/releases/0.0.1/myapp.tar.gz ./

# Set user
USER default

# Set entrypoint
ENTRYPOINT ["./bin/myapp"]
```

Now, you have a container which includes Erlang to run your release in.

## 6. Create the Docker Compose File
Next, we will create a [Docker Compose](https://docs.docker.com/compose/) file for our app. This file helps us provision and manage multiple containers so that we don't have to manually start each individual container with many parameters. To do this, create a `docker-compose.yml` file in the root directory of the app.
- **Note:** you may notice the network marked as `external` at the bottom of this file. This will be addressed in a coming section.
```yaml
version: "3"
services:
  db:
    image: postgres:10.2-alpine
    container_name: myapp-db
    environment:
      - POSTGRES_PASSWORD=postgres 
      - POSTGRES_DB=myapp_prod
    networks:
      - nginx-network
  admin:
    image: myapp-release
    container_name: myapp-admin
    build:
      context: .
      dockerfile: Dockerfile.run
    command: migrate
    networks:
      - nginx-network
    depends_on:
      - db
  server:
    image: myapp-release
    container_name: myapp-server
    environment:
      - PORT=5000
      - HOST="myapp.com"
    expose:
      - "5000"
    command: foreground
    networks:
      - nginx-network
    depends_on:
      - db
      - admin
networks:
  nginx-network:
    external: true
```
Now your app can be started with a single `docker-compose up` command. This will start a database container, then a temporary container which seeds and migrates the database with `./myapp migrate`, and finally the actual Phoenix server container. However, it still won't be able to connect to the database as we haven't configured it yet. Also, it relies on an external Docker network to have already been created.
- **Note:** the `expose` lines are not technically necessary. Your app will run fine without this in your Docker Compose file. However, it is good to include as it gives developers (including yourself) more information about which internal ports the container is exposing to other containers and services on the same network. In addition, running `docker ps` when the `expose` lines are present will show the port that you have your app mapped to via the `PORT` environment variable. This is especially useful if you are running multiple apps and need to keep track of which ports you are using for which apps.
- **Note:** if you don't want to worry about setting up an NGINX container (which is mostly there to proxy traffic from domains to your app), then you can modify the file as follows and you will be able to access your app on port `5000` of your host machine.
```yaml
...

server:
  ...
  depends_on:
    ...
  ports:
    - "5000:5000"

...
```

### Diagram
The following diagram depics the process of running the application with Docker Compose:

![Deploying the application diagram](https://i.imgur.com/PQYv4Gc.png)

## 7. Configure Your App
In order to run our releases inside the Docker environment, we need to change a few Elixir config files. This section is loosely based on the [Using Distillery With Phoenix](https://hexdocs.pm/distillery/use-with-phoenix.html).

1. Open up `config/prod.exs` and modify it as follows:
```elixir
...

config :myapp, MyApp.Endpoint,
  http: [port: {:system, "PORT"}],
  url: [host: {:system, "HOST"}, port: {:system, "PORT"}],
  server: true,
  root: ".",
  version: Application.spec(:myapp, :vsn),
  
...
```

**Phoenix 1.3:**, you only have to change the `url:` line as the `http:` line is no longer relevant. You should have a line reading `load_from_system_env: true,` instead.

Now, instead of hard-coded ports and a hard-coded hostname, the app now gets its ports from the runtime environment variables of our container. We define these environment variables in the `environment` block of our `docker-compose.yml`. In our configuration, we are using `PORT=5000` and `HOST="myapp.com"`, which is the domain that our server will run on.

2. Open up `config/prod.secret.exs` and modify it as follows:
``` elixir
...

config :myapp, MyApp.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  hostname: "myapp-db"
  database: "myapp_prod",
  ...

...
```
This will ensure that our app is able to communicate with the database container `myapp-db`. Since our containers will all be on the `nginx-network` network (more on that in the next section), any container can communicate with another container by it's container name. Therefore, we tell our app to contact the database running on the hostname `myapp-db`, which is the name of our database container.

## 8. Setup Docker Network and NGINX
Finally, we have everything in place in terms of a container for our database, a container for seeding and migrating the database, and a container for our server. However, we need to set up something to allow our containers to access the outside world. We also need to setup the `nginx-network` that our containers have been set up to connect to. Without this Docker network, our containers won't be able to start because they won't have a network to connect to.

We will setup a Docker network called `nginx-network`. Normally, each Docker container started individually joins its own network. When you specify a `docker-compose.yml` file and start multiple containers with `docker-compose up` with no netowk specified in the file, your containers will all join a default network created by Docker Compose. When all of your containers are connected to the same network, they are all reachable by their hostnames which are set as their container names. This is what we want.

Then, we will start an NGINX container and provide it with config files for our applications. This way, we can have one central NGINX container which will serve the appropriate traffic to all of our applications.

1. Setup the Docker network with `docker network create nginx-network`. Now you should be able to see the new network with `docker network ls`.

2. Next, create a new directory wherever you want called `nginx` with `$ mkdir nginx` and `$ cd nginx` into it. This directory will be where we keep our NGINX config and Docker files.

3. Create a new `docker-compose.yml` file for your NGINX container. Here, we bind our `nginx-server` container to port `80` on the host machine so it can serve all of our application traffic. We also mount a read-only volume to `./conf.d`, where we will place all of our application configs.
```yaml
version: "3"
services:
  server:
    image: nginx:1.13.8-alpine
    container_name: nginx-server
    ports:
      - "80:80"
    volumes:
      - ./conf.d:/etc/nginx/conf.d:ro
    networks:
      - nginx-network
networks:
  nginx-network:
    external: true
```

4. Make a directory for your NGINX application config files with `$ mkdir conf.d` and `$ cd conf.d` into it.

5. Create a new config file for your app in `conf.d` called `myapp.conf`. This config file will be automatically loaded into the NGINX server by the container because we have mounted a volume into the `/etc/nginx/conf.d` directory inside the container. This directory will load any `*.conf` files into the NGINX server, so you can have multiple config files for multiple applications.
```nginx
server {
    listen 80;
    server_name myapp.com;
    location / {
        proxy_pass http://myapp-server:5000/;
        proxy_set_header Host $host;
        proxy_buffering off;
    }
}
```
This config file proxies any traffic coming in from the `myapp.com` domain to the hostname `myapp-server` on port `5000`, which is the `HOST` and the `PORT` that we specified in the `environment` configuration in our app's `docker-compose.yml`. 

## 9. Tying it All Together
Now we have everything set up. Our application will run itself in the appropriate Docker containers while our NGINX container will run a server to proxy all of our application traffic to the appropriate location. Finally, we will run everything.
- **Note:** ensure that you always start your application **before** you start your NGINX container. If you don't NGINX will complain about unreachable hosts because your containers won't exist on the Docker network yet.

1. Start your application containers. In your application directory, run `docker-compose up`.

2. Start your NGINX container. In your `nginx` directory, run `docker-compose up`.

Now, you should be able to access your application on the domain that you specified.

# Extras

## 10. Extending for Multiple Applications
If you want to extend your configuration for multiple applications and domains, it's very easy! 

1. For your new application, follow the same application setup process above but change the `PORT` and the `expose` values in your app's `docker-compose.yml` so that your new app's port doesn't conflict with the original application's port siince they will both be on the same `nginx-network`.

2. Create a new configuration in `nginx/conf.d` for your new application, specifing the domain and the new port as necessary.

3. Next, start your new app by running `docker-compose up` in your new app's directory.

4. Then, restart your NGINX container by running `docker-compose restart`. Make sure your new app's server is started before you restart NGINX.

That's it! Your NGINX container will now proxy traffic appropriately for both of your apps.

### Diagram
The following diagram depicts running multiple apps using a single NGINX container to proxy traffic to the appropriate app containers:

![Multiple apps NGINX diagram](https://i.imgur.com/Kbpeawy.png)

## 11. Compiling Releases Separately
A huge advantage of this deployment strategy is the fact that compiling the releases is completely decoupled from deploying them. That means that you can compile your Distillery release anywhere you want, even on your development machine. It will be compiled for the correct architecture using Docker. Both the release builder image and the deployment (runner) image are based on [Alpine](https://hub.docker.com/_/alpine/).

To compile your release on a different machine than your deployment machine, do the following:
1. Run your `build.sh` script as described above on whichever machine you want to compile your release. You should now have a release built at `_build/prod/rel/myapp`. And a tarball release in `_build/prod/rel/myapp/releases/0.0.1/myapp.tar.gz` (depending on your app version).
2. Copy the release tarball to your deployment machine. If you already have your app's directory structure on that machine, you can place it in `_build/prod/rel/myapp/releases/0.0.1/myapp.tar.gz` (depending on your version).
    - Otherwise, if you don't have the entire app's directory structure on your deployment machine and are only using the Docker related files which you need to deploy the app, simply make new directories reflecting `_build/prod/rel/myapp/releases/0.0.1/myapp.tar.gz` in the root directory where your Docker files (see below) are located and place the tarball there.
 
- **Note:** on your deployment machine, you really only need the following files to deploy the app:
1. `Dockerfile.run`
2. `docker-compose.yml`
3. Your release tarball in the correct directory as described above

Then, you can run your releases without having to have the rest of the app's directory structure and code on your deployment machine.

## 12. Updating the App's Server Only
Being able to re-deploy the server for your app without resetting or touching the database is crucial. In order to do this after a code change such as a `git pull`, do the following:
1. Rebuild the release: `./build.sh`
2. Rebuild the server container based off of the new release `docker-compose build`
3. Re-deploy the server container: `docker-compose up`
- **Note:** you will most likely have to add execution permissions to the script with `chmod +x redeploy.sh`.
- **Note:** when doing this, Docker knows that the `myapp-db` container is already up-to-date, so it will only restart the `admin` and `server` containers based on the changes that were made since last time.
- **Note:** since the `server` service defined in `docker-compose.yml` depends on the `admin` service (the database seeds and migrations), running `docker-compose up` **will** also restart the admin service and re-run any seeds and migrations.

If you want to automate this process, you can create a simple shell script called `redeploy.sh` like so:
```shell
#!/bin/sh

# Pull source updates
git pull

# Rebuild the release
./build.sh

# Rebuild the runner image
docker-compose build

# Start the new containers
docker-compose up
```
Then, you can easily redeploy your app from your local machine with something like `ssh -t user@server "cd /srv/myapp && ./redeploy.sh`
- **Note:** you may want to start the new containers in detached mode instead of in foreground mode (where the `stdout` from your containers will take up your terminal). You can do this by adding `-d` to the end of the final command to start the containers.

## 13. Manually Starting the Services (Without Docker Compose)
It may be valuable to manually start the services in case you don't have access to Docker Compose for whatever reason. Here are the steps needed to manually build and start everything after you have successfully configured everything.

### Without NGINX
1. Build the release: `$ ./build.sh`
2. Create the Docker network: `docker network create myapp-network`
3. Run the Postgres container: `docker run --rm -it --name myapp-db --network maypp-network -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=maypp_prod -d postgres:10.2-alpine`
4. Build the runner image: `docker build -t myapp-release -f Dockerfile.run .`
5. Run migrations and seeds: `docker run --rm -it --network myapp-network myapp-server migrate`
6. Run the container with `docker run --rm -it --name myapp-server --network myapp-network -p 5000:5000 myapp-release foreground`

# Troubleshooting

## Old Images
Sometimes, you may change something with your app but when you re-deploy the release it doesn't reflect those changes. Many times, especially as a precaution when you think something might be wrong, it is always good to do a completely fresh build of the Docker images. You can do this by running `$ docker rmi myapp-build myapp-release`. That way, you can be sure that cached Docker images or non-rebuilt images aren't messing with the changes that you made to your app.

## `init terminating in do_boot`
If you are getting errors like the following:
```
{"init terminating in do_boot",{{badmatch,{error,{"no such file or directory","nil.app"}}},[{'Elixir.MyApp.ReleaseTasks',seed,0,[{file,"lib/MyApp/release_tasks.ex"},{line,19}]},{init,start_em,1,[]},{init,do_boot,3,[]}]}}
init terminating in do_boot ({{badmatch,{error,{[_],[_]}}},[{Elixir.MyApp.ReleaseTasks,seed,0,[{_},{_}]},{init,start_em,1,[]},{init,do_boot,3,[]}]})

Crash dump is being written to: erl_crash.dump...done
```
The problem is with the `myapp()` function, since `Application.get_application/1` is known to sometimes not work and return `nil` when running in a release. To fix this, you should replace `Application.get_application(__MODULE__)` with your OTP app name which looks like `:myapp`.
- **Note**: This solution **specifically addresses with `init terminating in do_boot` errors with something like `nil.app`** in them. Other `init terminating in do_boot` errors are probably unrelated.