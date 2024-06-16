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
exports.getThemeByName = exports.getAllThemes = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const getAllThemes = (SHOPIFY_AUTH) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, node_fetch_1.default)(`https://${SHOPIFY_AUTH.storeUrl}.myshopify.com/admin/api/2024-04/themes.json`, {
        headers: {
            "X-Shopify-Access-Token": SHOPIFY_AUTH.password,
        },
    });
    const data = (yield res.json());
    return data.themes;
});
exports.getAllThemes = getAllThemes;
const getThemeByName = (themeName, SHOPIFY_AUTH) => __awaiter(void 0, void 0, void 0, function* () {
    // No way to retrieve a theme by name, so retrieve all themes and find the matching theme
    const themes = yield (0, exports.getAllThemes)(SHOPIFY_AUTH);
    return themes.find((theme) => theme.name === themeName);
});
exports.getThemeByName = getThemeByName;
