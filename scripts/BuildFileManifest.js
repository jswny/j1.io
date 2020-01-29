"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var manifest = {};
var root = path.join(__dirname, "../files");
manifest.root = root;
function parseFileType(fileName) {
    var split = fileName.split(".");
    var extension = split[split.length - 1];
    return extension;
}
function readDirRecursive(dirPath) {
    var children = [];
    var items = fs.readdirSync(dirPath);
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var itemPath = dirPath + "/" + item;
        var stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
            var dir = {};
            dir.isDirectory = true;
            dir.name = item;
            dir.children = readDirRecursive(itemPath);
            children.push(dir);
        }
        else {
            var file = {};
            file.isDirectory = false;
            file.name = item;
            file.type = parseFileType(item);
            var contents = fs.readFileSync(itemPath).toString();
            file.contents = contents;
            children.push(file);
        }
    }
    return children;
}
var result = {};
result.root = readDirRecursive(root);
console.debug(result);
var json = JSON.stringify(result);
console.debug(json);
fs.writeFileSync(path.join(__dirname, "../dist/LocalFSManifest.json"), json);
