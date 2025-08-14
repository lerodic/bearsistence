import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import { BackupSchedule, BackupScheduleExtended } from "../types";
import fs from "fs/promises";
import path from "path";
import os from "os";

@boundClass
@injectable()
class ScheduleService {
  constructor(private _schedules: BackupScheduleExtended[] = []) {}

  get schedules(): BackupScheduleExtended[] {
    return [...this._schedules];
  }

  async init() {
    this._schedules = await this.loadFromLocalFile();
  }

  private async loadFromLocalFile() {
    try {
      const schedulesJson = await fs.readFile(
        path.join(os.homedir(), ".bearsistence", "schedules.json"),
        { encoding: "utf-8" }
      );

      return JSON.parse(schedulesJson);
    } catch {
      return [];
    }
  }

  async add(schedule: BackupSchedule): Promise<boolean> {
    try {
      if (this.doesScheduleExist(schedule.name)) {
        await this.remove(schedule.name);
      }

      await this.saveToLocalFile(schedule);
      this._schedules.push(schedule);

      return true;
    } catch {
      return false;
    }
  }

  doesScheduleExist(name: string): boolean {
    return (
      this._schedules.find((schedule) => schedule.name === name) !== undefined
    );
  }

  async remove(name: string) {
    this._schedules = this._schedules.filter(
      (schedule) => schedule.name !== name
    );

    await this.overwriteLocalFile(this.schedules);
  }

  private async saveToLocalFile(schedule: BackupScheduleExtended) {
    const currentSchedules = await this.loadFromLocalFile();
    currentSchedules.push(schedule);

    await this.overwriteLocalFile(currentSchedules);
  }

  private async overwriteLocalFile(schedules: BackupScheduleExtended[]) {
    await fs.writeFile(
      path.join(os.homedir(), ".bearsistence", "schedules.json"),
      JSON.stringify(schedules),
      { encoding: "utf-8" }
    );
  }
}

export default ScheduleService;
