import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import { BackupSchedule, BackupScheduleExtended } from "../types";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { DAYS_OF_WEEK, TimeUnits } from "../config/constants";

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

  getNextBackup(schedule: BackupScheduleExtended): string {
    const nextBackupDate = this.getNextBackupDate(schedule);
    const differenceInMs =
      nextBackupDate.getTime() - new Date(Date.now()).getTime();

    return differenceInMs < TimeUnits.MS_PER_MINUTE
      ? "< 1m"
      : this.getTimeUntilNextBackup(differenceInMs);
  }

  private getNextBackupDate(schedule: BackupScheduleExtended): Date {
    switch (schedule.frequency) {
      case "daily":
        return this.getNextBackupForDailySchedule(schedule);
      case "weekly":
        return this.getNextBackupForWeeklySchedule(schedule);
      case "hourly":
        return this.getNextBackupForHourlySchedule(schedule);
    }
  }

  private getNextBackupForDailySchedule(schedule: BackupSchedule): Date {
    const now = new Date(Date.now());
    const [hours, minutes] = schedule.options.time!.split(":").map(Number);
    const nextBackup = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        0,
        0
      )
    );

    if (nextBackup.getTime() <= Date.now()) {
      nextBackup.setUTCDate(nextBackup.getUTCDate() + 1);
    }

    return nextBackup;
  }

  private getNextBackupForWeeklySchedule(schedule: BackupSchedule): Date {
    const now = new Date(Date.now());
    const [hours, minutes] = schedule.options.time!.split(":").map(Number);
    const targetDayIndex = DAYS_OF_WEEK.indexOf(schedule.options.day!);
    const nextBackup = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        0,
        0
      )
    );

    const currentDayIndex = (now.getDay() + 6) % 7;
    let daysUntil = targetDayIndex - currentDayIndex;

    if (
      daysUntil < 0 ||
      (daysUntil === 0 && nextBackup.getTime() <= Date.now())
    ) {
      daysUntil += 7;
    }

    nextBackup.setUTCDate(nextBackup.getUTCDate() + daysUntil);

    return nextBackup;
  }

  private getNextBackupForHourlySchedule(
    schedule: BackupScheduleExtended
  ): Date {
    const now = new Date(Date.now());
    const createdAt = new Date(schedule.createdAt);
    const intervalInMs = schedule.options.hours! * 60 * 60 * 1000;

    const elapsedMs = now.getTime() - createdAt.getTime();
    const remainder = elapsedMs % intervalInMs;
    const msUntilNext = intervalInMs - remainder;

    return new Date(now.getTime() + msUntilNext);
  }

  private getTimeUntilNextBackup(differenceInMs: number): string {
    const totalMinutes = Math.ceil(differenceInMs / TimeUnits.MS_PER_MINUTE);
    const days = Math.floor(totalMinutes / TimeUnits.MINUTES_PER_DAY);
    const hours = Math.floor(
      (totalMinutes % TimeUnits.MINUTES_PER_DAY) / TimeUnits.MINUTES_PER_HOUR
    );
    const minutes = totalMinutes % TimeUnits.SECONDS_PER_MINUTE;

    return this.getFormattedTime(days, hours, minutes);
  }

  private getFormattedTime(
    days: number,
    hours: number,
    minutes: number
  ): string {
    const parts = [];

    if (days) {
      parts.push(`${days}d`);
    }
    if (hours) {
      parts.push(`${hours}h`);
    }
    if (minutes) {
      parts.push(`${minutes}m`);
    }

    return parts.join(" ");
  }
}

export default ScheduleService;
