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
exports.installCli = installCli;
const exec_1 = require("@actions/exec");
const semver_1 = __importDefault(require("semver"));
const MIN_VERSION = "3.50.0";
const MAX_THEME_VERSION = "3.59.0";
function installCli(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const versionSuffix = version ? `@${version}` : "";
        if (!isValidVersion(version)) {
            throw new Error(`Shopify CLI version: ${version} is invalid or smaller than ${MIN_VERSION}`);
        }
        yield (0, exec_1.exec)("npm", [
            "install",
            "--no-package-lock",
            "--no-save",
            `@shopify/cli${versionSuffix}`,
            shouldIncludeTheme(version) ? `@shopify/theme${versionSuffix}` : "",
        ].filter(Boolean));
    });
}
function shouldIncludeTheme(version) {
    if (!version || version.includes("experimental")) {
        return false;
    }
    if (!semver_1.default.valid(version)) {
        return false;
    }
    if (semver_1.default.gte(version, MIN_VERSION) &&
        semver_1.default.lt(version, MAX_THEME_VERSION)) {
        return true;
    }
    return false;
}
function isValidVersion(version) {
    if (!version || version.includes("experimental")) {
        return true; // Assuming 'experimental' versions are always valid
    }
    if (!semver_1.default.valid(version)) {
        return false;
    }
    if (!semver_1.default.gte(version, MIN_VERSION)) {
        return false;
    }
    return true;
}
