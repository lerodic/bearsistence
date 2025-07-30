import { Container } from "inversify";
import TYPES from "./inversify.types";
import Logger from "../../core/Logger";
import RecordParser from "../../core/RecordParser";

function setupContainer(): Container {
  const container = new Container();

  container.bind<Logger>(TYPES.Logger).to(Logger);

  container.bind<RecordParser>(TYPES.RecordParser).to(RecordParser);

  return container;
}

const container = setupContainer();

export default container;
