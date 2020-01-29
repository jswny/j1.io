import * as fs from "fs";
import * as path from "path";

const manifest: any = {};

const root = path.join(__dirname, "../files");
manifest.root = root;

function parseFileType(fileName: string) {
  const split = fileName.split(".");
  const extension = split[split.length - 1];
  return extension;
}

function readDirRecursive(dirPath: string): any[] {
  const children: any[] = [];

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath: string = dirPath + "/" + item;

    const stats: fs.Stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const dir: any = {};
      dir.isDirectory = true;
      dir.name = item;
      dir.children = readDirRecursive(itemPath);
      children.push(dir);
    } else {
      const file: any = {};
      file.isDirectory = false;
      file.name = item;
      file.type = parseFileType(item);

      const contents: string = fs.readFileSync(itemPath).toString();
      file.contents = contents;
      children.push(file);
    }
  }

  return children;
}

const result: any = {};
result.root = readDirRecursive(root);
console.debug(result);

const json: string = JSON.stringify(result);
console.debug(json);

fs.writeFileSync(path.join(__dirname, "../dist/LocalFSManifest.json"), json);
