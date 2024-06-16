const { checkTheme } = require("./check-theme");
const { deployTheme } = require("./deploy-theme");
const { installCli } = require("./install-cli");

const cwd = process.cwd();
const shopifyExecutable = `${cwd}/node_modules/.bin/shopify`;
const themeRoot = cwd;
console.log("theme root", themeRoot);

// Function to create a new theme
async function createTheme(shopifyAuth) {
  try {
    await installCli();
    console.log("Shopify CLI installed successfully");
    console.log("Creating theme...");
    console.log(
      "Theme name:",
      shopifyAuth.themeName,
      "Store URL:",
      shopifyAuth.storeUrl
    );
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
    const { report } = await deployTheme(
      "/",
      "shopify",
      shopifyAuth.themeName,
      shopifyAuth.password,
      shopifyAuth.storeUrl,
      false
    );
    return report.theme.preview_url;
  } catch (error) {
    console.error("Error updating theme:", error);
    throw error;
  }
}

module.exports = {
  createTheme,
  updateTheme,
};
