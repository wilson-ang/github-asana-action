import { ExecOutput, getExecOutput } from "@actions/exec";

/**
 * Deploy a Shopify theme to the specified store.
 * @param root The local path to the theme directory.
 * @param shopifyExecutable The executable command for Shopify CLI, default is "shopify".
 * @param themeName The identifier of the theme on Shopify, could be name or ID.
 * @param password The API password for the Shopify store.
 * @param store The myshopify.com URL or custom domain of the store.
 * @param devPreview Whether to enable development preview mode.
 * @param flags Additional flags as a single string, will be split into an array.
 * @returns A promise resolving to an object with the exit code and parsed JSON output from the command.
 */
export async function deployTheme(
  root: string,
  shopifyExecutable: string = "shopify",
  themeName: string,
  password: string,
  store: string,
  devPreview: boolean = false,
  flags: string = ""
): Promise<{ exitCode: number; report: any }> {
  const commandArgs = [
    "theme",
    "push",
    devPreview ? "--development" : undefined,
    "--json", // Ensures JSON output for parsing
    ...flags.split(" "),
    "--path",
    root,
    "--theme",
    themeName,
    "--store",
    store,
    "--password",
    password,
  ].filter(Boolean) as string[];
  const { exitCode, stdout, stderr }: ExecOutput = await getExecOutput(
    shopifyExecutable,
    commandArgs,
    {
      silent: true,
      ignoreReturnCode: true,
    }
  );
  // Log errors to console if any
  if (stderr) {
    console.error("Error during theme deployment:", stderr);
  }

  return {
    exitCode,
    report: stdout ? JSON.parse(stdout) : {}, // Safely parse the JSON output, handle cases where stdout might be empty
  };
}
