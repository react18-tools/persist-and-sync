"use strict";

const fs = require("fs");
const path = require("path");
const packageJson = require(path.resolve(__dirname, "package.json"));

const { devDependencies, scripts, ...newPackageJSON } = packageJson;
newPackageJSON.main = packageJson.main.split("/")[1];
newPackageJSON.types = packageJson.types.split("/")[1];

fs.writeFileSync(path.resolve(__dirname, "dist", "package.json"), JSON.stringify(newPackageJSON, null, 2));
