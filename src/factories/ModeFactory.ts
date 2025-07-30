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
  createInteractiveMode(): Mode {
    return container.get<InteractiveMode>(TYPES.InteractiveMode);
  }

  createCommandMode(): Mode {
    return container.get<CommandMode>(TYPES.CommandMode);
  }
}

export default ModeFactory;
