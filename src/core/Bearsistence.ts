import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import ModeFactory from "../factories/ModeFactory";
import fs from "fs/promises";
import path from "path";
import os from "os";

@boundClass
@injectable()
class Bearsistence {
  constructor(@inject(TYPES.ModeFactory) private modeFactory: ModeFactory) {}

  async run() {
    await this.init();
    await this.runMode();
  }

  private async init() {
    await this.createSchedulesDirectory();
    await this.createSchedulesJson();
  }

  private async createSchedulesDirectory() {
    try {
      await fs.mkdir(path.join(os.homedir(), ".bearsistence"), {
        recursive: true,
      });
    } catch {}
  }

  private async createSchedulesJson() {
    try {
      await fs.stat(path.join(os.homedir(), ".bearsistence", "schedules.json"));
    } catch {
      await fs.writeFile(
        path.join(os.homedir(), ".bearsistence", "schedules.json"),
        JSON.stringify([]),
        { encoding: "utf-8" }
      );
    }
  }

  private async runMode() {
    const mode = this.modeFactory.create();

    try {
      await mode.init();
      await mode.run();
    } catch {
      mode.exit();
    }
  }
}

export default Bearsistence;
