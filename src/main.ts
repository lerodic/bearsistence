import "reflect-metadata";
import container from "./config/inversify/inversify.config";
import TYPES from "./config/inversify/inversify.types";
import Bearsistence from "./core/Bearsistence";

const bearsistence = container.get<Bearsistence>(TYPES.Bearsistence);
bearsistence.run();
