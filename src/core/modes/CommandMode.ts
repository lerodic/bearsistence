import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import Mode from "./Mode";
import Logger from "../Logger";
import TYPES from "../../config/inversify/inversify.types";
import RecordParser from "../RecordParser";
import { Program } from "../../types";

@boundClass
@injectable()
class CommandMode extends Mode {
  constructor(
    @inject(TYPES.Program) private program: Program,
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.RecordParser) parser: RecordParser
  ) {
    super(logger, parser);
  }

  async run() {
    this.logger.info("🐻 Welcome to Bearup!\n");

    this.registerCommands();

    await this.program.parseAsync();
  }

  private registerCommands() {
    this.program
      .command("test")
      .description("Test Bear Notes connection")
      .action(async () => {
        await this.testConnection();
      });
  }
}

export default CommandMode;
