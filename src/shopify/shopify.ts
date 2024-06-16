import { checkTheme } from "./check-theme";
import { deleteTheme } from "./delete-theme";
import { deployTheme } from "./deploy-theme";
import { installCli } from "./install-cli";

export interface ShopifyAuth {
  themeName: string;
  password: string;
  storeUrl: string;
}

const cwd: string = process.cwd();
const shopifyExecutable: string = `${cwd}/node_modules/.bin/shopify`;
const themeRoot: string = cwd;

// Function to create a new theme
export async function createTheme(shopifyAuth: ShopifyAuth): Promise<string> {
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

// Function to check theme
export async function runCheckTheme(): Promise<void> {
  try {
    const { report } = await checkTheme(themeRoot, shopifyExecutable, false);
    console.log("Check theme report:", report);
  } catch (error) {
    console.error("Error checking theme:", error);
    throw error;
  }
}

// Function to update an existing theme
export async function updateTheme(shopifyAuth: ShopifyAuth): Promise<string> {
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
    console.error("Error updating theme:", error);
    throw error;
  }
}

// Function to remove a theme
export async function removeTheme(shopifyAuth: ShopifyAuth): Promise<void> {
  try {
    console.log("Deleting theme...");
    console.log("Theme name:", shopifyAuth.themeName);
    await deleteTheme(shopifyAuth.themeName, shopifyAuth);
  } catch (error) {
    console.error("Error deleting theme:", error);
    throw error;
  }
}
