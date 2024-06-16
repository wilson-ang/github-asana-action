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
exports.removeTheme = exports.updateTheme = exports.runCheckTheme = exports.createTheme = void 0;
const check_theme_1 = require("./check-theme");
const delete_theme_1 = require("./delete-theme");
const deploy_theme_1 = require("./deploy-theme");
const install_cli_1 = require("./install-cli");
const cwd = process.cwd();
const shopifyExecutable = `${cwd}/node_modules/.bin/shopify`;
const themeRoot = cwd;
// Function to create a new theme
function createTheme(shopifyAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, install_cli_1.installCli)();
            console.log("Shopify CLI installed successfully");
            console.log("Creating theme...");
            const { report } = yield (0, deploy_theme_1.deployTheme)(themeRoot, shopifyExecutable, shopifyAuth.themeName, shopifyAuth.password, shopifyAuth.storeUrl, false, "-u" // Set unpublished flag
            );
            return report.theme.preview_url;
        }
        catch (error) {
            console.error("Error creating theme:", error);
            throw error;
        }
    });
}
exports.createTheme = createTheme;
// Function to check theme
function runCheckTheme() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { report } = yield (0, check_theme_1.checkTheme)(themeRoot, shopifyExecutable, false);
            console.log("Check theme report:", report);
        }
        catch (error) {
            console.error("Error checking theme:", error);
            throw error;
        }
    });
}
exports.runCheckTheme = runCheckTheme;
// Function to update an existing theme
function updateTheme(shopifyAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, install_cli_1.installCli)();
            console.log("Shopify CLI installed successfully");
            console.log("Updating theme...");
            const { report } = yield (0, deploy_theme_1.deployTheme)(themeRoot, shopifyExecutable, shopifyAuth.themeName, shopifyAuth.password, shopifyAuth.storeUrl, false);
            return report.theme.preview_url;
        }
        catch (error) {
            console.error("Error updating theme:", error);
            throw error;
        }
    });
}
exports.updateTheme = updateTheme;
// Function to remove a theme
function removeTheme(shopifyAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Deleting theme...");
            console.log("Theme name:", shopifyAuth.themeName);
            yield (0, delete_theme_1.deleteTheme)(shopifyAuth.themeName, shopifyAuth);
        }
        catch (error) {
            console.error("Error deleting theme:", error);
            throw error;
        }
    });
}
exports.removeTheme = removeTheme;
