export class VirtualPath {
  public static parse(path: string): string[] {
    const result = this.parseAndAdd([], path);
    return result;
  }

  public static parseAndAdd(existingPath: string[], newPath: string): string[] {
    let result: string[];
    const split = newPath.split("/");

    if (newPath === "/") {
      result = ["/"];
    } else if (newPath.charAt(0) === "/") {
      split[0] = "root";
      result = split;
    } else {
      result = existingPath.concat(split);
    }

    result = result.filter((e) => e !== "");

    return result;
  }

  public static render(path: string[]): string {
    const result = path.join("/").replace("root", "/").replace("//", "/");
    return result;
  }
}
