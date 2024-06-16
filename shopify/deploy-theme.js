const { getExecOutput } = require("@actions/exec");

/**
 * Deploy a Shopify theme to the specified store.
 * @param {string} root The local path to the theme directory.
 * @param {string} shopifyExecutable The executable command for Shopify CLI, default is "shopify".
 * @param {string} themeName The identifier of the theme on Shopify, could be name or ID.
 * @param {string} password The API password for the Shopify store.
 * @param {string} store The myshopify.com URL or custom domain of the store.
 * @param {boolean} devPreview Whether to enable development preview mode.
 * @param {string} flags Additional flags as a single string, will be split into an array.
 * @returns {Promise<{exitCode: number, report: any}>} The exit code and parsed JSON output from the command.
 */
async function deployTheme(
  root,
  shopifyExecutable = "shopify",
  themeName,
  password,
  store,
  devPreview = false,
  flags = ""
) {
  const { exitCode, stdout, stderr } = await getExecOutput(
    shopifyExecutable,
    [
      "theme",
      "push",
      devPreview ? "--development" : undefined,
      "--json", // Always output JSON for easier parsing
      ...flags.split(" "),
      ...["--path", root], // Uncomment and use this if you need to specify the theme directory path
      ...["--theme", themeName],
      ...["--store", store],
      ...["--password", password],
    ].filter(Boolean), // Filter out any undefined or falsy values from the array
    {
      silent: true,
      ignoreReturnCode: true, // This allows the function to process error output and handle it appropriately
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

module.exports = { deployTheme };
