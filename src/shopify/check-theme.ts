import { ExecOutput, getExecOutput } from "@actions/exec";

interface ThemeCheckResult {
  exitCode: number;
  report: any;
}

export async function checkTheme(
  root: string,
  shopifyExecutable: string = "shopify",
  devPreview: boolean = true,
  flags: string = ""
): Promise<ThemeCheckResult> {
  const { exitCode, stdout, stderr }: ExecOutput = await getExecOutput(
    shopifyExecutable,
    [
      "theme",
      "check",
      devPreview ? "--development" : undefined,
      ...flags.split(" "),
      ...["--path", root],
      ...["--output", "json"],
    ].filter((x): x is string => Boolean(x)),
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
