import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import Mode from "../core/modes/Mode";
import container from "../config/inversify/inversify.config";
import InteractiveMode from "../core/modes/InteractiveMode";
import TYPES from "../config/inversify/inversify.types";
import CommandMode from "../core/modes/CommandMode";

@boundClass
@injectable()
class ModeFactory {
  create(): Mode {
    return this.shouldUseInteractiveMode()
      ? this.createInteractiveMode()
      : this.createCommandMode();
  }

  private shouldUseInteractiveMode(): boolean {
    const args = process.argv.slice(2);

    return args.length === 0;
  }

  private createInteractiveMode(): Mode {
    return container.get<InteractiveMode>(TYPES.InteractiveMode);
  }

  private createCommandMode(): Mode {
    return container.get<CommandMode>(TYPES.CommandMode);
  }
}

export default ModeFactory;
