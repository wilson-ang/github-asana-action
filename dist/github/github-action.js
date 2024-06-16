"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.retrieveShopifyThemeIdFromIssueComment = exports.createIssueComment = void 0;
const core = __importStar(require("@actions/core"));
const createIssueComment = (message, githubContext, octokit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!githubContext.payload.pull_request) {
            // Could be running outside of a PR, if so do not add a comment
            core.info("GitHub Action is not running from within a PR.");
            return;
        }
        yield octokit.rest.issues.createComment(Object.assign(Object.assign({}, githubContext.repo), { issue_number: githubContext.payload.pull_request.number, body: message }));
    }
    catch (error) {
        console.error("Error creating issue comment:", error);
    }
});
exports.createIssueComment = createIssueComment;
const retrieveShopifyThemeIdFromIssueComment = (commentBody) => {
    const regexMatch = /<!-- Shopify Theme ID ([0-9]+) -->/.exec(commentBody);
    if (!regexMatch) {
        core.error("Cannot find Shopify Theme ID in the last deployment preview comment.");
        return;
    }
    return parseInt(regexMatch[1]);
};
exports.retrieveShopifyThemeIdFromIssueComment = retrieveShopifyThemeIdFromIssueComment;
