const { exec } = require("@actions/exec");
const { getExecOutput } = require("@actions/exec");
const semver = require("semver");

const MIN_VERSION = "3.50.0";
const MAX_THEME_VERSION = "3.59.0";

async function installCli(version) {
  const versionSuffix = version ? `@${version}` : "";

  if (!isValidVersion(version)) {
    throw new Error(
      `Shopify CLI version: ${version} is invalid or smaller than ${MIN_VERSION}`
    );
  }

  await exec(
    "npm",
    [
      "install",
      "--no-package-lock",
      "--no-save",
      "-g",
      `@shopify/cli${versionSuffix}`,
      shouldIncludeTheme(version) ? `@shopify/theme${versionSuffix}` : "",
    ].filter(Boolean)
  );
  const { stdout } = await getExecOutput("shopify", ["--version"]);
  console.log(stdout.trim());
}

function shouldIncludeTheme(version) {
  if (!version || version.includes("experimental")) {
    return false;
  }

  if (!semver.valid(version)) {
    return false;
  }

  if (
    semver.gte(version, MIN_VERSION) &&
    semver.lt(version, MAX_THEME_VERSION)
  ) {
    return true;
  }

  return false;
}

function isValidVersion(version) {
  if (!version || version.includes("experimental")) {
    return true;
  }

  // Check if the version is valid
  if (!semver.valid(version)) {
    return false;
  }

  // Check if the version is greater than or equal to the minimum version
  if (!semver.gte(version, MIN_VERSION)) {
    return false;
  }

  return true;
}

module.exports = { installCli };
