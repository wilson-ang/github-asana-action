const core = require("@actions/core");
const action = require("./action");
require("dotenv").config();

async function run() {
  console.log(require("dotenv").config());
  try {
    await action.action();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
