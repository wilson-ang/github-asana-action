const deleteTheme = async (SHOPIFY_AUTH) => {
  if (
    themeName.toUpperCase() === "STAGING" ||
    themeName.toUpperCase() === "LIVE"
  ) {
    throw new Error("Cannot delete STAGING or LIVE themes");
  }

  const theme = await getThemeByName(SHOPIFY_AUTH.themeName, SHOPIFY_AUTH);
  if (!theme) {
    throw new Error(`Theme ${themeName} not found`);
  }
  if (theme.role === "main") {
    throw new Error("Cannot delete the main theme");
  }
  const res = await fetch(
    `https://${SHOPIFY_AUTH.storeUrl}/admin/api/2024-04/themes/${theme.id}.json`,
    {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_AUTH.password,
      },
    }
  );
  const data = await res.json();
  return data;
};
