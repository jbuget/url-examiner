#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Program_1 = __importDefault(require("./Program"));
const images_1 = require("./plugins/images");
const program = new Program_1.default();
program.use(images_1.plugin);
program.run(process.argv).then(() => process.exit(0));
//# sourceMappingURL=index.js.map