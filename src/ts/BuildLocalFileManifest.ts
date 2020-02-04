import * as fs from "fs";
import * as path from "path";
import { Directory } from "./filesystem/Directory";
import { File } from "./filesystem/File";
import { FileType } from "./filesystem/FileType";

function parseFileType(fileName: string): FileType {
  const split = fileName.split(".");
  const extension = split[split.length - 1];

  let type: FileType;

  switch (extension) {
    case "md": {
      type = FileType.Markdown;
      break;
    }
    default: {
      throw new Error("Unrecognized file extension: " + extension);
    }
  }

  return type;
}

function readDirRecursive(dirPath: string): Directory {
  const splitPath = dirPath.split("/");
  const name = splitPath[splitPath.length - 1];

  const dir = new Directory(name);
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath: string = dirPath + "/" + item;
    const stats: fs.Stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const dirNode: Directory = readDirRecursive(itemPath);
      dir.addChild(dirNode);
    } else {
      const content: string = fs.readFileSync(itemPath).toString();
      const file: File = new File(item, parseFileType(item), content);
      dir.addChild(file);
    }
  }

  return dir;
}

const root = path.join(__dirname, "../../files");

const result: Directory = readDirRecursive(root);

const json: string = JSON.stringify(result);

fs.writeFileSync(path.join(__dirname, "../LocalFileManifest.json"), json);
console.debug("Wrote local file manifest!");
