import * as core from "@actions/core";
import { action as runAction } from "./action";

async function run(): Promise<void> {
  try {
    await runAction();
  } catch (error: any) {
    // If you know the type of the error, you can replace 'any' with that type.
    core.setFailed(error.message);
  }
}

run();
