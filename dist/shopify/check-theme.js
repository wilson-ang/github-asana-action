"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTheme = checkTheme;
const exec_1 = require("@actions/exec");
function checkTheme(root_1) {
    return __awaiter(this, arguments, void 0, function* (root, shopifyExecutable = "shopify", devPreview = true, flags = "") {
        const { exitCode, stdout, stderr } = yield (0, exec_1.getExecOutput)(shopifyExecutable, [
            "theme",
            "check",
            devPreview ? "--development" : undefined,
            ...flags.split(" "),
            ...["--path", root],
            ...["--output", "json"],
        ].filter((x) => Boolean(x)), {
            silent: true,
            ignoreReturnCode: true,
        });
        console.error(stderr);
        return {
            exitCode,
            report: JSON.parse(stdout),
        };
    });
}
