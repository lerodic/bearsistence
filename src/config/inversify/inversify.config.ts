import { Container } from "inversify";
import TYPES from "./inversify.types";
import Logger from "../../core/Logger";
import RecordParser from "../../core/RecordParser";
import Prompt from "../../core/Prompt";
import InteractiveMode from "../../core/modes/InteractiveMode";
import CommandMode from "../../core/modes/CommandMode";
import { Program } from "../../types";
import { Command } from "commander";

function setupContainer(): Container {
  const container = new Container();

  container.bind<Logger>(TYPES.Logger).to(Logger);

  container.bind<RecordParser>(TYPES.RecordParser).to(RecordParser);

  container.bind<Prompt>(TYPES.Prompt).to(Prompt);

  container.bind<InteractiveMode>(TYPES.InteractiveMode).to(InteractiveMode);

  container.bind<CommandMode>(TYPES.CommandMode).to(CommandMode);

  container.bind<Program>(TYPES.Program).toDynamicValue(() => {
    return new Command();
  });

  return container;
}

const container = setupContainer();

export default container;
