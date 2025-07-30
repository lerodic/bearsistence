import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import Mode from "./Mode";
import TYPES from "../../config/inversify/inversify.types";
import Logger from "../Logger";
import RecordParser from "../RecordParser";
import Prompt from "../Prompt";

@boundClass
@injectable()
class InteractiveMode extends Mode {
  constructor(
    @inject(TYPES.Prompt) private prompt: Prompt,
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.RecordParser) parser: RecordParser
  ) {
    super(logger, parser);
  }

  async run() {
    this.logger.info("🐻 Welcome to Bearup!\n");

    const action = await this.prompt.getAction();

    await this.handleAction(action);
  }

  private async handleAction(action: string) {
    switch (action) {
      case "test":
        await this.testConnection();
        break;
      case "exit":
        this.logger.info("Goodbye!");
        return;
    }
  }
}

export default InteractiveMode;
