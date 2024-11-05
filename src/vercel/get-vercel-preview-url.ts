import { GitHub } from "@actions/github/lib/utils";
import { GitHubContext } from "../github/github-action";

export const getVercelPreviewURL = async (
  githubContext: GitHubContext,
  octokit: InstanceType<typeof GitHub>
): Promise<string | null> => {
  try {
    const { owner, repo } = githubContext.repo;
    const prNumber = githubContext.payload.pull_request?.number;

    if (!prNumber) {
      console.error(
        "This action must be run in the context of a pull request."
      );
      return null;
    }

    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
    });

    const vercelComment = comments.find(
      (comment) =>
        comment.user?.login === "vercel[bot]" &&
        comment.body?.includes("nextjs-commerce-git")
    );

    if (!vercelComment) {
      console.info("No Vercel preview comment found.");
      return null;
    }

    const vercelPreviewUrlMatch = vercelComment.body?.match(
      /https:\/\/nextjs-commerce-git[^?\s]+\.vercel\.app/
    );

    if (!vercelPreviewUrlMatch) {
      console.info("No Vercel preview URL found in the comment.");
      return null;
    }

    // const cleanVercelPreviewUrl = `https://${
    //   vercelPreviewUrlMatch[0].split("open-feedback/")[1].split("?")[0]
    // }`;

    return vercelPreviewUrlMatch[0];
  } catch (error) {
    console.error("Error fetching Vercel preview URL:", error);
    return null;
  }
};
