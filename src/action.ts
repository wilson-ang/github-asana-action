import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  addComment,
  buildClient,
  findComment,
  migrateSection,
  moveSection,
  updateSection,
  updateTask,
} from "./asana/asana-action";
import { createIssueComment } from "./github/github-action";
import {
  ShopifyAuth,
  createTheme,
  removeTheme,
  updateTheme,
} from "./shopify/shopify";

async function action() {
  const ASANA_PAT: string = core.getInput("asana-pat", { required: true });
  const ACTION: string = core.getInput("action", { required: true });
  const TRIGGER_PHRASE: string = core.getInput("trigger-phrase") || "";
  const PULL_REQUEST = github.context.payload.pull_request;
  const REGEX_STRING: string = `${TRIGGER_PHRASE}(?:\s*)https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+)`;
  const REGEX = new RegExp(REGEX_STRING, "g");
  const shopifyActions = ["create-theme", "update-theme", "delete-theme"];
  const isShopifyAction = shopifyActions.includes(ACTION);
  const shopifyAuth: ShopifyAuth = {
    password: core.getInput("shopify-password", { required: isShopifyAction }),
    storeUrl: core.getInput("shopify-store-url", { required: isShopifyAction }),
    themeName: PULL_REQUEST?.head.ref || "default-ref",
  };

  const client = await buildClient(ASANA_PAT);
  if (!client) {
    throw new Error("Client authorization failed");
  }

  let parseAsanaURL: RegExpExecArray | null;
  let foundAsanaTasks: string[] = [];
  while ((parseAsanaURL = REGEX.exec(PULL_REQUEST?.body || "")) !== null) {
    const taskId = parseAsanaURL.groups!.task;
    if (!taskId) {
      core.error(
        `Invalid Asana task URL after the trigger phrase ${TRIGGER_PHRASE}`
      );
      continue;
    }
    foundAsanaTasks.push(taskId);
  }

  console.info("calling", ACTION);
  switch (ACTION) {
    case "assert-link": {
      //   const githubToken = core.getInput("github-token", { required: true });
      //   const linkRequired =
      //     core.getInput("link-required", { required: true }) === "true";
      //   const octokit = github.getOctokit(githubToken);
      //   const statusState =
      //     !linkRequired || foundAsanaTasks.length > 0 ? "success" : "error";
      //   core.info(
      //     `setting ${statusState} for ${github.context.payload.pull_request?.head.sha}`
      //   );
      //   octokit.rest.repos.createStatus({
      //     ...github.context.repo,
      //     context: "asana-link-presence",
      //     state: statusState,
      //     description: "asana link not found",
      //     sha: github.context.payload.pull_request?.head.sha,
      //   });
      break;
    }
    case "add-comment": {
      const commentId = core.getInput("comment-id"),
        htmlText = core.getInput("text", { required: true }),
        isPinned = core.getInput("is-pinned") === "true";
      const comments = [];
      for (const taskId of foundAsanaTasks) {
        if (commentId) {
          const comment = await findComment(client, taskId, commentId);
          if (comment) {
            console.info("found existing comment", comment.gid);
            continue;
          }
        }
        const comment = await addComment(
          client,
          taskId,
          commentId,
          htmlText,
          isPinned
        );
        //@ts-ignore
        comments.push(comment);
      }
      return comments;
    }
    case "remove-comment": {
      const commentId = core.getInput("comment-id", { required: true });
      const removedCommentIds: string[] = [];
      for (const taskId of foundAsanaTasks) {
        const comment = await findComment(client, taskId, commentId);
        if (comment) {
          console.info("removing comment", comment.gid);
          try {
            //@ts-ignore
            await client.stories.delete(comment.gid);
          } catch (error) {
            console.error("rejecting promise", error);
          }
          removedCommentIds.push(comment.gid);
        }
      }
      return removedCommentIds;
    }
    case "complete-task": {
      const isComplete = core.getInput("is-complete") === "true";
      const taskIds: string[] = [];
      for (const taskId of foundAsanaTasks) {
        console.info(
          "marking task",
          taskId,
          isComplete ? "complete" : "incomplete"
        );
        try {
          await client.tasks.update(taskId, {
            completed: isComplete,
          });
        } catch (error) {
          console.error("rejecting promise", error);
        }
        taskIds.push(taskId);
      }
      return taskIds;
    }
    case "move-section": {
      const targetJSON = core.getInput("targets", { required: true });
      const targets = JSON.parse(targetJSON);
      const movedTasks: string[] = [];
      for (const taskId of foundAsanaTasks) {
        await moveSection(client, taskId, targets);
        movedTasks.push(taskId);
      }
      return movedTasks;
    }
    case "migrate-section": {
      const targetJSON = core.getInput("targets", { required: true });
      const targets = JSON.parse(targetJSON);
      await migrateSection(client, targets);
      return;
    }
    case "update-task": {
      const targetJSON = core.getInput("targets", { required: true });
      const targets = JSON.parse(targetJSON);
      const updatedTask: string[] = [];
      for (const taskId of foundAsanaTasks) {
        await updateTask(client, taskId, targets);
        updatedTask.push(taskId);
        return updatedTask;
      }
      break;
    }
    case "update-section": {
      const targetJSON = core.getInput("targets", { required: true });
      const targets = JSON.parse(targetJSON);
      await updateSection(client, targets);
      return;
    }
    case "create-theme": {
      const themeUrl = await createTheme(shopifyAuth);

      const commentId = core.getInput("comment-id"),
        isPinned = core.getInput("is-pinned") === "true",
        githubToken = core.getInput("github-token", { required: true });
      const octokit = github.getOctokit(githubToken);
      const htmlText = `[Preview Theme]\n${themeUrl}`;
      await createIssueComment(htmlText, github.context, octokit);
      const comments = [];
      for (const taskId of foundAsanaTasks) {
        if (commentId) {
          const comment = await findComment(client, taskId, commentId);
          if (comment) {
            console.info("found existing comment", comment.gid);
            continue;
          }
        }
        const comment = await addComment(
          client,
          taskId,
          commentId,
          htmlText,
          isPinned
        );
        //@ts-ignore
        comments.push(comment);
      }
      return comments;
    }
    case "update-theme": {
      await updateTheme(shopifyAuth);
      break;
    }
    case "delete-theme": {
      await removeTheme(shopifyAuth);
      break;
    }
    // case "check-deployment": {
    //   await checkDeployment(github.context);
    //   break;
    // }
    default:
      core.setFailed("unexpected action ${ACTION}");
  }
}

export { action, buildClient };
