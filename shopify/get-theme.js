const getAllThemes = async (SHOPIFY_AUTH) => {
  const res = await fetch(
    `https://${SHOPIFY_AUTH.storeUrl}/admin/api/2024-04/themes.json`,
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_AUTH.password,
      },
    }
  );
  const data = await res.json();
  return data.themes;
};

const getThemeByName = async (themeName, SHOPIFY_AUTH) => {
  // No way to retrieve a theme by name, so retrieve all themes and find the matching theme
  const themes = await getAllThemes(SHOPIFY_AUTH);
  return themes.find((theme) => theme.name === themeName);
};

module.exports = { getThemeByName, getAllThemes };
