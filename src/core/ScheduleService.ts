import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import { BackupSchedule } from "../types";
import fs from "fs/promises";
import path from "path";
import os from "os";

@boundClass
@injectable()
class ScheduleService {
  constructor(private _schedules: BackupSchedule[] = []) {}

  get schedules(): BackupSchedule[] {
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
    if (this.doesScheduleExist(schedule.name)) {
      this.remove(schedule.name);
    }

    try {
      await this.saveToLocalFile(schedule);
      this._schedules.push(schedule);

      return true;
    } catch {
      return false;
    }
  }

  private doesScheduleExist(name: string): boolean {
    return (
      this._schedules.find((schedule) => schedule.name === name) !== undefined
    );
  }

  remove(name: string) {
    this._schedules = this._schedules.filter(
      (schedule) => schedule.name !== name
    );
  }

  private async saveToLocalFile(schedule: BackupSchedule) {
    const currentSchedules: BackupSchedule[] = await this.loadFromLocalFile();
    currentSchedules.push(schedule);

    await fs.writeFile(
      path.join(os.homedir(), ".bearsistence", "schedules.json"),
      JSON.stringify(currentSchedules),
      { encoding: "utf-8" }
    );
  }
}

export default ScheduleService;
