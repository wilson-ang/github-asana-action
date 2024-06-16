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
exports.deployTheme = void 0;
const exec_1 = require("@actions/exec");
/**
 * Deploy a Shopify theme to the specified store.
 * @param root The local path to the theme directory.
 * @param shopifyExecutable The executable command for Shopify CLI, default is "shopify".
 * @param themeName The identifier of the theme on Shopify, could be name or ID.
 * @param password The API password for the Shopify store.
 * @param store The myshopify.com URL or custom domain of the store.
 * @param devPreview Whether to enable development preview mode.
 * @param flags Additional flags as a single string, will be split into an array.
 * @returns A promise resolving to an object with the exit code and parsed JSON output from the command.
 */
function deployTheme(root, shopifyExecutable = "shopify", themeName, password, store, devPreview = false, flags = "") {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = [
            "theme",
            "push",
            devPreview ? "--development" : undefined,
            "--json",
            ...flags.split(" "),
            "--path",
            root,
            "--theme",
            themeName,
            "--store",
            store,
            "--password",
            password,
        ].filter(Boolean);
        const { exitCode, stdout, stderr } = yield (0, exec_1.getExecOutput)(shopifyExecutable, commandArgs, {
            silent: true,
            ignoreReturnCode: true,
        });
        // Log errors to console if any
        if (stderr) {
            console.error("Error during theme deployment:", stderr);
        }
        return {
            exitCode,
            report: stdout ? JSON.parse(stdout) : {}, // Safely parse the JSON output, handle cases where stdout might be empty
        };
    });
}
exports.deployTheme = deployTheme;
