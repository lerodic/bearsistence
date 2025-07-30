import { boundClass } from "autobind-decorator";
import Logger from "../Logger";
import { ScriptExecutionOptions } from "../../types";
import ScriptRunner from "../ScriptRunner";
import RecordParser from "../RecordParser";
import { injectable } from "inversify";
import SCRIPTS from "../../config/constants";

@boundClass
@injectable()
abstract class Mode {
  constructor(protected logger: Logger, protected parser: RecordParser) {}

  abstract run(): Promise<void>;

  protected async testConnection() {
    try {
      this.logger.info("Testing Bear Notes connection...");

      const result = await this.evaluateScript(SCRIPTS.TEST_CONNECTION);

      return result.errorMessage
        ? this.logger.error(
            "Bear Notes is inaccessible. Are you sure it's up and running?"
          )
        : this.logger.success("Bear Notes is accessible!");
    } catch {
      this.logger.error(
        "There was an error while assessing the status of Bear Notes."
      );
    }
  }

  private async evaluateScript(options: ScriptExecutionOptions) {
    const scriptRunner = new ScriptRunner(options.script);
    const rawResult = await scriptRunner.callHandler(options.handler);

    return this.parser.parse(rawResult as string, options.defaultValues);
  }

  exit() {
    this.logger.info("Goodbye!");
  }
}

export default Mode;
