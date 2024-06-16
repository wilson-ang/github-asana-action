const { checkTheme } = require("./check-theme");
const { deployTheme } = require("./deploy-theme");
const { installCli } = require("./install-cli");
const { deleteTheme } = require("./delete-theme");

const cwd = process.cwd();
const shopifyExecutable = `${cwd}/node_modules/.bin/shopify`;
const themeRoot = cwd;

// Function to create a new theme
async function createTheme(shopifyAuth) {
  try {
    await installCli();
    console.log("Shopify CLI installed successfully");
    console.log("Creating theme...");
    const { report } = await deployTheme(
      themeRoot,
      shopifyExecutable,
      shopifyAuth.themeName,
      shopifyAuth.password,
      shopifyAuth.storeUrl,
      false,
      "-u" // Set unpublished flag
    );
    return report.theme.preview_url;
  } catch (error) {
    console.error("Error creating theme:", error);
    throw error;
  }
}
async function runCheckTheme() {
  try {
    const { report } = await checkTheme(themeRoot, shopifyExecutable, false);
    console.log("Check theme report:", report);
  } catch (error) {
    console.error("Error checking theme:", error);
    throw error;
  }
}

// Function to update an existing theme
async function updateTheme(shopifyAuth) {
  try {
    await installCli();
    console.log("Shopify CLI installed successfully");
    console.log("Updating theme...");
    const { report } = await deployTheme(
      themeRoot,
      shopifyExecutable,
      shopifyAuth.themeName,
      shopifyAuth.password,
      shopifyAuth.storeUrl,
      false
    );
    return report.theme.preview_url;
  } catch (error) {
    console.error("Error creating theme:", error);
    throw error;
  }
}

async function removeTheme(shopifyAuth) {
  try {
    console.log("Deleting theme...");
    console.log("Theme name:", shopifyAuth.themeName);
    await deleteTheme(shopifyAuth.themeName, shopifyAuth);
  } catch (error) {
    console.error("Error deleting theme:", error);
    throw error;
  }
}

module.exports = {
  createTheme,
  updateTheme,
  removeTheme,
};
