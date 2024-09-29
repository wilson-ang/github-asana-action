import * as core from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";

export interface GitHubContext extends Context {
  repo: {
    owner: string;
    repo: string;
  };
  payload: {
    pull_request?: {
      number: number;
    };
  };
}

const createIssueComment = async (
  message: string,
  githubContext: GitHubContext,
  octokit: InstanceType<typeof GitHub>
): Promise<void> => {
  try {
    if (!githubContext.payload.pull_request) {
      // Could be running outside of a PR, if so do not add a comment
      core.info("GitHub Action is not running from within a PR.");
      return;
    }

    await octokit.rest.issues.createComment({
      ...githubContext.repo,
      issue_number: githubContext.payload.pull_request.number,
      body: message,
    });
  } catch (error) {
    console.error("Error creating issue comment:", error);
  }
};

const retrieveShopifyThemeIdFromIssueComment = (
  commentBody: string
): number | undefined => {
  const regexMatch = /<!-- Shopify Theme ID ([0-9]+) -->/.exec(commentBody);
  if (!regexMatch) {
    core.error(
      "Cannot find Shopify Theme ID in the last deployment preview comment."
    );
    return;
  }

  return parseInt(regexMatch[1]);
};

export { createIssueComment, retrieveShopifyThemeIdFromIssueComment };
