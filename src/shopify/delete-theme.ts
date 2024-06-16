import fetch from "node-fetch";
import { Theme, getThemeByName } from "./get-theme";
import { ShopifyAuth } from "./shopify";

async function deleteTheme(
  themeName: string,
  shopifyAuth: ShopifyAuth
): Promise<any> {
  // Consider defining a more specific type for the return value
  if (
    themeName.toUpperCase() === "STAGING" ||
    themeName.toUpperCase() === "LIVE"
  ) {
    throw new Error("Cannot delete STAGING or LIVE themes");
  }

  const theme: Theme | undefined = await getThemeByName(themeName, shopifyAuth);
  if (!theme) {
    throw new Error(`Theme ${themeName} not found`);
  }
  if (theme.role === "main") {
    throw new Error("Cannot delete the main theme");
  }
  const res = await fetch(
    `https://${shopifyAuth.storeUrl}.myshopify.com/admin/api/2024-04/themes/${theme.id}.json`,
    {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": shopifyAuth.password,
      },
    }
  );
  const data = await res.json();
  return data;
}

export { deleteTheme };
