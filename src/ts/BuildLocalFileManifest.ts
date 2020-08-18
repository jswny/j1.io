import * as fs from "fs";
import * as path from "path";
import { VirtualDirectory } from "./filesystem/VirtualDirectory";
import { VirtualFile } from "./filesystem/VirtualFile";
import { VirtualFileType } from "./filesystem/VirtualFileType";

function parseVirtualFileType(fileName: string): VirtualFileType {
  const split = fileName.split(".");
  const extension = split[split.length - 1];

  let type: VirtualFileType;

  switch (extension) {
    case "md": {
      type = VirtualFileType.Markdown;
      break;
    }
    case "pdf": {
      type = VirtualFileType.PDF;
      break;
    }
    case "link": {
      type = VirtualFileType.Link;
      break;
    }
    case "gist": {
      type = VirtualFileType.Gist;
      break;
    }
    default: {
      throw new Error("Unrecognized file extension: " + extension);
    }
  }

  return type;
}

function getContent(filePath: string, type: VirtualFileType) {
  const buffer: Buffer = fs.readFileSync(filePath);
  let content: string;

  switch (type) {
    case VirtualFileType.Link:
    case VirtualFileType.Gist:
    case VirtualFileType.Markdown: {
      content = buffer.toString();
      break;
    }
    case VirtualFileType.PDF: {
      content = buffer.toString("base64");
      break;
    }
    default: {
      throw new Error(`Unhandled file type: ${type}`);
    }
  }

  return content;
}

function readDirRecursive(dirPath: string): VirtualDirectory {
  const splitPath = dirPath.split("/");
  const name = splitPath[splitPath.length - 1];

  const dir = new VirtualDirectory(name);
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath: string = dirPath + "/" + item;
    const stats: fs.Stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const dirNode: VirtualDirectory = readDirRecursive(itemPath);
      dir.addChild(dirNode);
    } else {
      const type: VirtualFileType = parseVirtualFileType(item);
      const content: string = getContent(itemPath, type);
      const file: VirtualFile = new VirtualFile(item, type, content);
      dir.addChild(file);
    }
  }

  return dir;
}

const root = path.join(__dirname, "../../files");

const result: VirtualDirectory = readDirRecursive(root);

const json: string = JSON.stringify(result, null, 2);

fs.writeFileSync(path.join(__dirname, "../LocalFileManifest.json"), json);
console.debug("Wrote local file manifest!");
