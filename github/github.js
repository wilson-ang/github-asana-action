const core = require("@actions/core");

const createIssueComment = async (message, githubContext, octokit) => {
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
};

const retrieveShopifyThemeIdFromIssueComment = (commentBody) => {
  const regexMatch = /<!-- Shopify Theme ID ([0-9]+) -->/.exec(commentBody);
  if (!regexMatch) {
    core.error(
      `Cannot find Shopify Theme ID in the last deployment preview comment.`
    );
    return;
  }

  const shopifyThemeId = parseInt(regexMatch[1]);
  return shopifyThemeId;
};

module.exports = { createIssueComment };
