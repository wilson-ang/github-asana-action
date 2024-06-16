const core = require("@actions/core");
const github = require("@actions/github");

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

module.exports = { createIssueComment };
