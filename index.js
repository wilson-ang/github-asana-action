const core = require('@actions/core');
const action = require('./action');

async function run() {
  try {
    await action();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()