const { getThemeByName } = require("./get-theme");

const deleteTheme = async (themeName, shopifyAuth) => {
  if (
    themeName.toUpperCase() === "STAGING" ||
    themeName.toUpperCase() === "LIVE"
  ) {
    throw new Error("Cannot delete STAGING or LIVE themes");
  }

  const theme = await getThemeByName(themeName, shopifyAuth);
  if (!theme) {
    throw new Error(`Theme ${themeName} not found`);
  }
  if (theme.role === "main") {
    throw new Error("Cannot delete the main theme");
  }
  const res = await fetch(
    `https://${shopifyAuth.storeUrl}/admin/api/2024-04/themes/${theme.id}.json`,
    {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": shopifyAuth.password,
      },
    }
  );
  const data = await res.json();
  return data;
};
module.exports = { deleteTheme };
