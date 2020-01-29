import * as fs from "fs";
import * as path from "path";
import { Directory } from "../src/ts/filesystem/Directory";
import { File } from "../src/ts/filesystem/File";
import { FileType } from "../src/ts/filesystem/FileType";
import { INode } from "../src/ts/filesystem/INode";

const manifest: any = {};

const root = path.join(__dirname, "../files");
manifest.root = root;

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
    console.debug(item);
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

const result: any = {};
result.root = readDirRecursive(root);
console.debug(result.root);

const json: string = JSON.stringify(result);
console.debug(json);

fs.writeFileSync(path.join(__dirname, "../dist/LocalFSManifest.json"), json);
