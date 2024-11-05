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
exports.getVercelPreviewURL = void 0;
const getVercelPreviewURL = (githubContext, octokit) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { owner, repo } = githubContext.repo;
        const prNumber = (_a = githubContext.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
        if (!prNumber) {
            console.error("This action must be run in the context of a pull request.");
            return null;
        }
        const { data: comments } = yield octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: prNumber,
        });
        const vercelComment = comments.find((comment) => {
            var _a, _b;
            return ((_a = comment.user) === null || _a === void 0 ? void 0 : _a.login) === "vercel[bot]" &&
                ((_b = comment.body) === null || _b === void 0 ? void 0 : _b.includes("nextjs-commerce-git"));
        });
        if (!vercelComment) {
            console.info("No Vercel preview comment found.");
            return null;
        }
        const vercelPreviewUrlMatch = (_b = vercelComment.body) === null || _b === void 0 ? void 0 : _b.match(/https:\/\/nextjs-commerce-git[^?\s]+\.vercel\.app/);
        if (!vercelPreviewUrlMatch) {
            console.info("No Vercel preview URL found in the comment.");
            return null;
        }
        // const cleanVercelPreviewUrl = `https://${
        //   vercelPreviewUrlMatch[0].split("open-feedback/")[1].split("?")[0]
        // }`;
        return vercelPreviewUrlMatch[0];
    }
    catch (error) {
        console.error("Error fetching Vercel preview URL:", error);
        return null;
    }
});
exports.getVercelPreviewURL = getVercelPreviewURL;
