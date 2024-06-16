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
exports.updateTask = exports.updateSection = exports.moveSection = exports.migrateSection = exports.findComment = exports.buildClient = exports.addComment = void 0;
const core = __importStar(require("@actions/core"));
const asana = __importStar(require("asana"));
function moveSection(client, taskId, targets) {
    return __awaiter(this, void 0, void 0, function* () {
        const task = yield client.tasks.findById(taskId);
        for (const target of targets) {
            const targetProject = task.projects.find((project) => project.name === target.project);
            if (!targetProject) {
                core.info(`This task does not exist in "${target.project}" project`);
                return;
            }
            const sections = yield client.sections.findByProject(targetProject.gid);
            const targetSection = sections.find((section) => section.name === target.section);
            if (targetSection) {
                yield client.sections.addTask(targetSection.gid, { task: taskId });
                core.info(`Moved to: ${target.project}/${target.section}`);
            }
            else {
                core.error(`Asana section ${target.section} not found.`);
            }
        }
    });
}
exports.moveSection = moveSection;
function updateTask(client, taskId, targets) {
    return __awaiter(this, void 0, void 0, function* () {
        const task = yield client.tasks.findById(taskId);
        if (!task) {
            core.info(`This task does not exist`);
            return;
        }
        for (const target of targets) {
            yield client.tasks.update(taskId, {
                custom_fields: {
                    [target.fieldId]: target.fieldValue,
                },
            });
            core.info(`Task status updated to "${target.fieldValue}"`);
        }
    });
}
exports.updateTask = updateTask;
function updateSection(client, targets) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const target of targets) {
            const targetProject = yield client.projects.findById(target.projectId);
            if (!targetProject) {
                core.info(`This Project ID does not exist in Asana.`);
                return;
            }
            const sections = yield client.sections.findByProject(targetProject.gid);
            const fromSection = sections.find((section) => section.name === target.from);
            if (!fromSection) {
                core.info(`The ${target.from} is not found within ${targetProject.name}.`);
                return;
            }
            const tasksToUpdate = yield client.tasks
                .findBySection(fromSection.gid)
                .then((tasks) => tasks.data);
            if (target.fieldId) {
                for (const taskToUpdate of tasksToUpdate) {
                    yield client.tasks.update(taskToUpdate.gid, {
                        custom_fields: {
                            [target.fieldId]: target.fieldValue,
                        },
                    });
                }
                core.info(`Updated tasks from ${target.from}`);
            }
            else {
                core.error(`No custom field ID`);
            }
        }
    });
}
exports.updateSection = updateSection;
function migrateSection(client, targets) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const target of targets) {
            const targetProject = yield client.projects.findById(target.projectId);
            if (!targetProject) {
                core.info(`This Project ID does not exist in Asana.`);
                return;
            }
            const sections = yield client.sections.findByProject(targetProject.gid);
            const fromSection = sections.find((section) => section.name === target.from);
            const toSection = sections.find((section) => section.name === target.to);
            if (!fromSection || !toSection) {
                core.info(`Section ${fromSection ? target.to : target.from} not found within ${targetProject.name}.`);
                return;
            }
            const tasksToMigrate = yield client.tasks
                .findBySection(fromSection.gid)
                .then((tasks) => tasks.data);
            for (const taskToMigrate of tasksToMigrate) {
                yield client.sections.addTask(toSection.gid, { task: taskToMigrate.gid });
            }
            core.info(`Moved projects from ${target.from} to ${target.to}`);
        }
    });
}
exports.migrateSection = migrateSection;
function findComment(client, taskId, commentId) {
    return __awaiter(this, void 0, void 0, function* () {
        let stories;
        try {
            const storiesCollection = yield client.tasks.stories(taskId);
            stories = yield storiesCollection.fetch(200);
        }
        catch (error) {
            throw error;
        }
        return stories.find((story) => story.text.indexOf(commentId) !== -1);
    });
}
exports.findComment = findComment;
function addComment(client, taskId, commentId, text, isPinned) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commentId) {
            text += "\n" + commentId + "\n";
        }
        try {
            const comment = yield client.tasks.addComment(taskId, {
                text: text,
                is_pinned: isPinned,
            });
            return comment;
        }
        catch (error) {
            console.error("rejecting promise", error);
        }
    });
}
exports.addComment = addComment;
function buildClient(asanaPAT) {
    return __awaiter(this, void 0, void 0, function* () {
        return asana.Client.create({
            defaultHeaders: { "asana-enable": "new-sections,string_ids" },
            logAsanaChangeWarnings: false,
        })
            .useAccessToken(asanaPAT)
            .authorize();
    });
}
exports.buildClient = buildClient;
