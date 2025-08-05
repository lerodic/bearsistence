import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import ModeFactory from "../factories/ModeFactory";
import Mode from "./modes/Mode";
import fs from "fs/promises";
import path from "path";
import os from "os";

@boundClass
@injectable()
class Bearsistence {
  constructor(@inject(TYPES.ModeFactory) private modeFactory: ModeFactory) {}

  async run() {
    await this.init();
    const mode = this.getCorrectMode();

    try {
      await mode.init();
      await mode.run();
    } catch {
      mode.exit();
    }
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
