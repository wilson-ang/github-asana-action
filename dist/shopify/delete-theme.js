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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTheme = deleteTheme;
const node_fetch_1 = __importDefault(require("node-fetch"));
const get_theme_1 = require("./get-theme");
function deleteTheme(themeName, shopifyAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        // Consider defining a more specific type for the return value
        if (themeName.toUpperCase() === "STAGING" ||
            themeName.toUpperCase() === "LIVE") {
            throw new Error("Cannot delete STAGING or LIVE themes");
        }
        const theme = yield (0, get_theme_1.getThemeByName)(themeName, shopifyAuth);
        if (!theme) {
            throw new Error(`Theme ${themeName} not found`);
        }
        if (theme.role === "main") {
            throw new Error("Cannot delete the main theme");
        }
        const res = yield (0, node_fetch_1.default)(`https://${shopifyAuth.storeUrl}.myshopify.com/admin/api/2024-04/themes/${theme.id}.json`, {
            method: "DELETE",
            headers: {
                "X-Shopify-Access-Token": shopifyAuth.password,
            },
        });
        const data = yield res.json();
        return data;
    });
}
