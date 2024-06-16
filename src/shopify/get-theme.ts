import fetch from "node-fetch";
import { ShopifyAuth } from "./shopify";

export interface Theme {
  id: string;
  name: string;
  role: string;
}

export const getAllThemes = async (
  SHOPIFY_AUTH: ShopifyAuth
): Promise<Theme[]> => {
  const res = await fetch(
    `https://${SHOPIFY_AUTH.storeUrl}.myshopify.com/admin/api/2024-04/themes.json`,
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_AUTH.password,
      },
    }
  );
  const data = (await res.json()) as { themes: Theme[] };
  return data.themes;
};

export const getThemeByName = async (
  themeName: string,
  SHOPIFY_AUTH: ShopifyAuth
): Promise<Theme | undefined> => {
  // No way to retrieve a theme by name, so retrieve all themes and find the matching theme
  const themes = await getAllThemes(SHOPIFY_AUTH);
  return themes.find((theme: Theme) => theme.name === themeName);
};
