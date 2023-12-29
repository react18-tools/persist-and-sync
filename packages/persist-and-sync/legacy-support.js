"use strict";

const fs = require("fs");
const path = require("path");
const packageJson = require(path.resolve(__dirname, "package.json"));

delete packageJson.scripts;
packageJson.main = packageJson.main.split("/")[1];
packageJson.types = packageJson.types.split("/")[1];
packageJson.name = "persistnsync";

fs.writeFileSync(
	path.resolve(__dirname, "dist", "package.json"),
	JSON.stringify(packageJson, null, 2),
);

