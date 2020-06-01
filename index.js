const core = require('@actions/core');

async function run() {
  try {
    await action();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()