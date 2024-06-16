const { getExecOutput } = require("@actions/exec");

async function checkTheme(
  root,
  shopifyExecutable = "shopify",
  devPreview = true,
  flags = ""
) {
  const { exitCode, stdout, stderr } = await getExecOutput(
    shopifyExecutable,
    [
      "theme",
      "check",
      devPreview ? "--development" : undefined,
      ...flags.split(" "),
      ...["--path", root],
      ...["--output", "json"],
    ].filter((x) => Boolean(x)),
    {
      silent: true,
      ignoreReturnCode: true,
    }
  );
  console.error(stderr);

  return {
    exitCode,
    report: JSON.parse(stdout),
  };
}

module.exports = { checkTheme };
