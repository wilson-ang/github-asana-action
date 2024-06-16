const { deployTheme } = require("./deploy-theme");
const { installCli } = require("./install-cli");

// Function to create a new theme
async function createTheme(shopifyAuth) {
  try {
    await installCli();
    const { report } = await deployTheme(
      "/",
      "shopify",
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
