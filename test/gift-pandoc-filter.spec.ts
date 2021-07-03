import { promisify } from "util";
import { exec as sysExec } from "child_process"
const exec = promisify(sysExec);

async function execPandocOnFile(fileName: string, format: "markdown" | "html" | "pdf") {
  const { stdout } = await exec(
    `pandoc -s -f markdown test/${fileName} --filter dist/index.js -t ${format}`
  );
  return String(stdout);
}

describe("GIFT Pandoc Filter", function() {
  it("should generate markdown with codeblock", async () => {
    const output = await execPandocOnFile(`example-gift-codeblock.md`, "markdown");
    expect(output).toMatchSnapshot();
  });
});