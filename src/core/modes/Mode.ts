import { boundClass } from "autobind-decorator";
import Logger from "../Logger";
import { BackupSchedule, PlistInfo, ScriptExecutionOptions } from "../../types";
import ScriptRunner from "../ScriptRunner";
import RecordParser from "../RecordParser";
import { injectable } from "inversify";
import { SCRIPTS } from "../../config/constants";
import PlistGenerator from "../PlistGenerator";
import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import os from "os";
import ScheduleService from "../ScheduleService";

@boundClass
@injectable()
abstract class Mode {
  constructor(
    protected logger: Logger,
    protected parser: RecordParser,
    protected scheduleService: ScheduleService
  ) {}

  abstract run(): Promise<void>;

  async init() {
    await this.scheduleService.init();
  }

  protected async addSchedule(schedule: BackupSchedule) {
    const { id, path, content } = this.getPlistInfo(schedule);

    await this.createSchedulePlistFile(content, path);
    const hasScheduleBeenAdded = await this.scheduleService.add(schedule);
    if (!hasScheduleBeenAdded) {
      return this.logger.error(
        `Schedule '${schedule.name}' could not be created.`
      );
    }

    this.loadLaunchDaemon(id, path);
  }

  private getPlistInfo(schedule: BackupSchedule): PlistInfo {
    const id = this.generatePlistLabel(schedule.name);
    const plistPath = path.join(
      os.homedir(),
      "Library",
      "LaunchAgents",
      `${id}.plist`
    );
    const plistContent = new PlistGenerator(id).generate(
      schedule.frequency,
      schedule
    );

    return {
      id,
      path: plistPath,
      content: plistContent,
    };
  }

  private generatePlistLabel(name: string): string {
    const normalizedName = name.toLowerCase().replaceAll(" ", "-");

    return `com.bearsistence.${normalizedName}`;
  }

  private async createSchedulePlistFile(content: string, plistPath: string) {
    await fs.writeFile(plistPath, content, {
      encoding: "utf-8",
    });
  }

  private loadLaunchDaemon(id: string, plistPath: string) {
    this.unloadLaunchDaemon(id);

    exec(`launchctl load ${plistPath}`);
    this.logger.success("Backup task scheduled successfully!");
  }

  private unloadLaunchDaemon(launchDaemon: string) {
    try {
      exec(`launchctl bootout gui/$(id -u)/${launchDaemon}`);
    } catch {}
  }

  protected async testConnection() {
    try {
      this.logger.info("Testing Bear Notes connection...");

      const result = await this.evaluateScript(SCRIPTS.TEST_CONNECTION);

      return result.errorMessage
        ? this.logger.error(
            "Bear Notes is inaccessible. Are you sure it's up and running?"
          )
        : this.logger.success("Bear Notes is accessible!");
    } catch {
      this.logger.error(
        "There was an error while assessing the status of Bear Notes."
      );
    }
  }

  private async evaluateScript(options: ScriptExecutionOptions) {
    const scriptRunner = new ScriptRunner(options.script);
    const rawResult = await scriptRunner.callHandler(options.handler);

    return this.parser.parse(rawResult as string, options.defaultValues);
  }

  protected listSchedules() {
    const schedules = this.scheduleService.schedules;
    if (schedules.length === 0) {
      return this.logger.warn("You haven't set up any schedules yet.");
    }

    const rows = schedules.map((schedule) => ({
      name: schedule.name,
      frequency: schedule.frequency,
      time: schedule.options.time ?? "-",
      day: schedule.options.day ?? "-",
      interval: schedule.options.hours ?? "-",
    })) as Record<string, any>;

    this.logger.table(rows);
  }

  protected async deleteSchedule(schedule: string) {
    if (!this.scheduleService.doesScheduleExist(schedule)) {
      return this.logger.error(`Schedule '${schedule}' does not exist.`);
    }

    try {
      const id = this.generatePlistLabel(schedule);

      await this.removeSchedulePlistFile(schedule);
      await this.scheduleService.remove(schedule);
      this.unloadLaunchDaemon(id);
      this.logger.success(`Schedule '${schedule} deleted successfully!'`);
    } catch {
      this.logger.error(`Failed to delete schedule '${schedule}'`);
    }
  }

  protected async clearSchedules() {
    for (const schedule of this.scheduleService.schedules) {
      try {
        await this.removeSchedulePlistFile(schedule.name);
        await this.scheduleService.remove(schedule.name);
      } catch {
        return this.logger.error(
          `Failed to delete schedule '${schedule.name}. Aborting.'`
        );
      }
    }

    this.logger.success("All schedules removed.");
  }

  private async removeSchedulePlistFile(schedule: string) {
    const plistPath = path.join(
      os.homedir(),
      "Library",
      "LaunchAgents",
      `${this.generatePlistLabel(schedule)}.plist`
    );

    await fs.unlink(plistPath);
  }

  exit() {
    this.logger.info("Goodbye!");
    process.exit(1);
  }
}

export default Mode;
