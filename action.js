const core = require("@actions/core");
const github = require("@actions/github");
const asana = require("asana");
const { updateTheme, createTheme } = require("./shopify/shopify");
const { createIssueComment } = require("./github/github");

async function moveSection(client, taskId, targets) {
  const task = await client.tasks.findById(taskId);

  targets.forEach(async (target) => {
    const targetProject = task.projects.find(
      (project) => project.name === target.project
    );
    if (!targetProject) {
      core.info(`This task does not exist in "${target.project}" project`);
      return;
    }
    let targetSection = await client.sections
      .findByProject(targetProject.gid)
      .then((sections) =>
        sections.find((section) => section.name === target.section)
      );
    if (targetSection) {
      await client.sections.addTask(targetSection.gid, { task: taskId });
      core.info(`Moved to: ${target.project}/${target.section}`);
    } else {
      core.error(`Asana section ${target.section} not found.`);
    }
  });
}

async function updateTask(client, taskId, targets) {
  const task = await client.tasks.findById(taskId);
  if (!task) {
    core.info(`This task does not exist`);
    return;
  }
  targets.forEach(async (target) => {
    await client.tasks.update(taskId, {
      custom_fields: {
        [target.fieldId]: target.fieldValue,
      },
    });
    core.info(`Task status updated to "${target.fieldValue}"`);
  });
}

async function updateSection(client, targets) {
  targets.forEach(async (target) => {
    const targetProject = await client.projects.findById(target.projectId);
    if (!targetProject) {
      console.log("Project ID not applicable");
      core.info(`This Project ID does not exist in Asana.`);
      return;
    }
    let fromSection = await client.sections
      .findByProject(targetProject.gid)
      .then((sections) =>
        sections.find((section) => section.name === target.from)
      );
    if (!fromSection) {
      core.info(
        `The ${target.from} is not found within ${targetProject.name}.`
      );
      return;
    }
    const tasksToUpdate = await client.tasks
      .findBySection(fromSection.gid)
      .then((tasks) => tasks.data);
    if (target.fieldId) {
      for (const taskToUpdate of tasksToUpdate)
        await client.tasks.update(taskToUpdate.gid, {
          custom_fields: {
            [target.fieldId]: target.fieldValue,
          },
        });
      core.info(`Updated tasks from ${target.from}`);
    } else {
      core.error(`No custom field ID`);
    }
  });
}

async function migrateSection(client, targets) {
  targets.forEach(async (target) => {
    const targetProject = await client.projects.findById(target.projectId);
    if (!targetProject) {
      console.log("Project ID not applicable");
      core.info(`This Project ID does not exist in Asana.`);
      return;
    }
    let fromSection = await client.sections
      .findByProject(targetProject.gid)
      .then((sections) =>
        sections.find((section) => section.name === target.from)
      );
    if (!fromSection) {
      core.info(
        `The ${target.from} is not found within ${targetProject.name}.`
      );
      return;
    }
    let toSection = await client.sections
      .findByProject(targetProject.gid)
      .then((sections) =>
        sections.find((section) => section.name === target.to)
      );
    if (!toSection) {
      core.info(`The ${target.to} is not found within ${targetProject.name}.`);
      return;
    }
    const tasksToMigrate = await client.tasks
      .findBySection(fromSection.gid)
      .then((tasks) => tasks.data);
    if (toSection) {
      for (const taskToMigrate of tasksToMigrate)
        await client.sections.addTask(toSection.gid, {
          task: taskToMigrate.gid,
        });
      core.info(`Moved projects from ${target.from} to ${target.to}`);
    } else {
      core.error(`Asana section ${target.to} not found.`);
    }
  });
}

async function findComment(client, taskId, commentId) {
  let stories;
  try {
    const storiesCollection = await client.tasks.stories(taskId);
    stories = await storiesCollection.fetch(200);
  } catch (error) {
    throw error;
  }

  return stories.find((story) => story.text.indexOf(commentId) !== -1);
}

async function addComment(client, taskId, commentId, text, isPinned) {
  if (commentId) {
    text += "\n" + commentId + "\n";
  }
  try {
    const comment = await client.tasks.addComment(taskId, {
      text: text,
      is_pinned: isPinned,
    });
    return comment;
  } catch (error) {
    console.error("rejecting promise", error);
  }
}

async function buildClient(asanaPAT) {
  return asana.Client.create({
    defaultHeaders: { "asana-enable": "new-sections,string_ids" },
    logAsanaChangeWarnings: false,
  })
    .useAccessToken(asanaPAT)
    .authorize();
}

async function action() {
  const ASANA_PAT = core.getInput("asana-pat", { required: true }),
    ACTION = core.getInput("action", { required: true }),
    TRIGGER_PHRASE = core.getInput("trigger-phrase") || "",
    PULL_REQUEST = github.context.payload.pull_request,
    REGEX_STRING = `${TRIGGER_PHRASE}(?:\s*)https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+)`,
    REGEX = new RegExp(REGEX_STRING, "g"),
    SHOPIFY_AUTH = {
      password: core.getInput("shopify-password", { required: true }),
      storeUrl: core.getInput("shopify-store-url", { required: true }),
      themeName: github.context.payload.pull_request.head.ref,
    };

  const client = await buildClient(ASANA_PAT);
  if (client === null) {
    throw new Error("client authorization failed");
  }

  console.info("looking in body", PULL_REQUEST?.body, "regex", REGEX_STRING);
  let foundAsanaTasks = [];
  while ((parseAsanaURL = REGEX.exec(PULL_REQUEST?.body)) !== null) {
    const taskId = parseAsanaURL.groups.task;
    if (!taskId) {
      core.error(
        `Invalid Asana task URL after the trigger phrase ${TRIGGER_PHRASE}`
      );
      continue;
    }
    foundAsanaTasks.push(taskId);
  }
  console.info(
    `found ${foundAsanaTasks.length} taskIds:`,
    foundAsanaTasks.join(",")
  );

  console.info("calling", ACTION);
  switch (ACTION) {
    case "assert-link": {
      const githubToken = core.getInput("github-token", { required: true });
      const linkRequired =
        core.getInput("link-required", { required: true }) === "true";
      const octokit = new github.GitHub(githubToken);
      const statusState =
        !linkRequired || foundAsanaTasks.length > 0 ? "success" : "error";
      core.info(
        `setting ${statusState} for ${github.context.payload.pull_request?.head.sha}`
      );
      octokit.repos.createStatus({
        ...github.context.repo,
        context: "asana-link-presence",
        state: statusState,
        description: "asana link not found",
        sha: github.context.payload.pull_request?.head.sha,
      });
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
        comments.push(comment);
      }
      return comments;
    }
    case "remove-comment": {
      const commentId = core.getInput("comment-id", { required: true });
      const removedCommentIds = [];
      for (const taskId of foundAsanaTasks) {
        const comment = await findComment(client, taskId, commentId);
        if (comment) {
          console.info("removing comment", comment.gid);
          try {
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
      const taskIds = [];
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
      const movedTasks = [];
      for (const taskId of foundAsanaTasks) {
        await moveSection(client, taskId, targets);
        movedTasks.push(taskId);
      }
      return movedTasks;
    }
    case "migrate-section": {
      const targetJSON = core.getInput("targets", { required: true });
      const targets = JSON.parse(targetJSON);
      const migratedTasks = [];
      await migrateSection(client, targets);
      return migratedTasks;
    }
    case "update-task": {
      const targetJSON = core.getInput("targets", { required: true });
      const targets = JSON.parse(targetJSON);
      const updatedTask = [];
      for (const taskId of foundAsanaTasks) {
        await updateTask(client, taskId, targets);
        updatedTask.push(taskId);
        return updatedTask;
      }
    }
    case "update-section": {
      const targetJSON = core.getInput("targets", { required: true });
      const targets = JSON.parse(targetJSON);
      const updatedTasks = [];
      await updateSection(client, targets);
      return updatedTasks;
    }
    case "create-theme": {
      const themeUrl = await createTheme(SHOPIFY_AUTH);

      const commentId = core.getInput("comment-id"),
        isPinned = core.getInput("is-pinned") === "true",
        githubToken = core.getInput("github-token", { required: true });
      const octokit = new github.GitHub(githubToken);
      const htmlText = `\n[Preview Theme]\n${themeUrl}`;
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
        comments.push(comment);
      }
      return comments;
    }
    case "update-theme": {
      const themeName = github.event.pull_request.head.ref;
      const themeUrl = await updateTheme(themeName, SHOPIFY_AUTH);
    }
    default:
      core.setFailed("unexpected action ${ACTION}");
  }
}

module.exports = {
  action,
  default: action,
  buildClient: buildClient,
};
