import * as core from "@actions/core";
import * as asana from "asana";
import { Client } from "asana";

interface TaskTarget {
  project: string;
  section: string;
}

interface UpdateTarget {
  fieldId: string;
  fieldValue: string;
  projectId: string;
  from: string;
  to?: string;
}
// types not working asana
async function moveSection(
  client: Client,
  taskId: string | number,
  targets: TaskTarget[]
) {
  const task = await client.tasks.findById(taskId);

  for (const target of targets) {
    const targetProject = task.projects.find(
      (project) => project.name === target.project
    );
    if (!targetProject) {
      core.info(`This task does not exist in "${target.project}" project`);
      return;
    }
    const sections = await client.sections.findByProject(targetProject.gid);
    const targetSection = sections.find(
      (section) => section.name === target.section
    );
    if (targetSection) {
      await client.sections.addTask(targetSection.gid, { task: taskId });
      core.info(`Moved to: ${target.project}/${target.section}`);
    } else {
      core.error(`Asana section ${target.section} not found.`);
    }
  }
}

async function updateTask(
  client: Client,
  taskId: string | number,
  targets: UpdateTarget[]
) {
  const task = await client.tasks.findById(taskId);
  if (!task) {
    core.info(`This task does not exist`);
    return;
  }
  for (const target of targets) {
    await client.tasks.update(taskId, {
      custom_fields: {
        [target.fieldId]: target.fieldValue,
      },
    });
    core.info(`Task status updated to "${target.fieldValue}"`);
  }
}

async function updateSection(client: Client, targets: UpdateTarget[]) {
  for (const target of targets) {
    const targetProject = await client.projects.findById(target.projectId);
    if (!targetProject) {
      core.info(`This Project ID does not exist in Asana.`);
      return;
    }
    const sections = await client.sections.findByProject(targetProject.gid);
    const fromSection = sections.find(
      (section) => section.name === target.from
    );
    if (!fromSection) {
      core.info(
        `The ${target.from} is not found within ${targetProject.name}.`
      );
      return;
    }
    const tasksToUpdate = await client.tasks
      // @ts-ignore
      .findBySection(fromSection.gid)
      .then((tasks: { data: any }) => tasks.data);
    if (target.fieldId) {
      for (const taskToUpdate of tasksToUpdate) {
        await client.tasks.update(taskToUpdate.gid, {
          custom_fields: {
            [target.fieldId]: target.fieldValue,
          },
        });
      }
      core.info(`Updated tasks from ${target.from}`);
    } else {
      core.error(`No custom field ID`);
    }
  }
}

async function migrateSection(client: Client, targets: UpdateTarget[]) {
  for (const target of targets) {
    const targetProject = await client.projects.findById(target.projectId);
    if (!targetProject) {
      core.info(`This Project ID does not exist in Asana.`);
      return;
    }
    const sections = await client.sections.findByProject(targetProject.gid);
    const fromSection = sections.find(
      (section) => section.name === target.from
    );
    const toSection = sections.find((section) => section.name === target.to);
    if (!fromSection || !toSection) {
      core.info(
        `Section ${fromSection ? target.to : target.from} not found within ${
          targetProject.name
        }.`
      );
      return;
    }
    const tasksToMigrate = await client.tasks
      // @ts-ignore
      .findBySection(fromSection.gid)
      .then((tasks: { data: any }) => tasks.data);
    for (const taskToMigrate of tasksToMigrate) {
      await client.sections.addTask(toSection.gid, { task: taskToMigrate.gid });
    }
    core.info(`Moved projects from ${target.from} to ${target.to}`);
  }
}
async function findComment(
  client: Client,
  taskId: string | number,
  commentId: string
) {
  let stories;
  try {
    const storiesCollection = await client.tasks.stories(taskId);
    // @ts-ignore
    stories = await storiesCollection.fetch(200);
  } catch (error) {
    throw error;
  }

  return stories.find((story: any) => story.text.indexOf(commentId) !== -1);
}

async function addComment(
  client: Client,
  taskId: string,
  commentId: string,
  text: string,
  isPinned: boolean
) {
  if (commentId) {
    text += "\n" + commentId + "\n";
  }
  try {
    const comment = await client.tasks.addComment(taskId, {
      text: text,
      // @ts-ignore
      is_pinned: isPinned,
    });
    return comment;
  } catch (error) {
    console.error("rejecting promise", error);
  }
}

async function buildClient(asanaPAT: string): Promise<Client> {
  return asana.Client.create({
    defaultHeaders: { "asana-enable": "new-sections,string_ids" },
    // @ts-ignore
    logAsanaChangeWarnings: false,
  })
    .useAccessToken(asanaPAT)
    .authorize();
}

export {
  addComment,
  buildClient,
  findComment,
  migrateSection,
  moveSection,
  updateSection,
  updateTask,
};
