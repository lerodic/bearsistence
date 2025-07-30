import { boundClass } from "autobind-decorator";
import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";

@boundClass
class ScriptRunner {
  private scriptPath: string;

  constructor(script: string) {
    this.scriptPath = path.resolve(
      __dirname,
      "..",
      "scripts",
      `${script}.applescript`
    );
  }

  async callHandler(handlerName: string, ...args: any[]) {
    try {
      let script = await fs.readFile(this.scriptPath, { encoding: "utf-8" });
      const formattedArgs = args.map((arg) => `"${arg}"`).join(", ");

      script += this.buildHandlerCall(handlerName, formattedArgs);

      return new Promise((resolve, reject) => {
        exec(
          `osascript -e '${script.replace(/'/g, "'\\''")}'`,
          (error, stdout, stderr) => {
            return error ? reject(stderr ?? error) : resolve(stdout.trim());
          }
        );
      });
    } catch {
      throw new Error(`Failed to call ${handlerName}`);
    }
  }

  private buildHandlerCall(handlerName: string, formattedArgs: string) {
    return `\n\n${handlerName}(${formattedArgs})`;
  }
}

export default ScriptRunner;
