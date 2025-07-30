import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import ModeFactory from "../factories/ModeFactory";
import Mode from "./modes/Mode";

@boundClass
@injectable()
class Bearsistence {
  constructor(@inject(TYPES.ModeFactory) private modeFactory: ModeFactory) {}

  async run() {
    const mode = this.getCorrectMode();

    try {
      await mode.run();
    } catch {
      mode.exit();
    }
  }

  private getCorrectMode(): Mode {
    return this.shouldUseInteractiveMode()
      ? this.modeFactory.createInteractiveMode()
      : this.modeFactory.createCommandMode();
  }

  private shouldUseInteractiveMode(): boolean {
    const args = process.argv.slice(2);

    return args.length === 0;
  }
}

export default Bearsistence;
