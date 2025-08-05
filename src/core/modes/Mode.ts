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
    const { path, content } = this.getPlistInfo(schedule);

    await this.createSchedulePlistFile(content, path);
    const hasScheduleBeenAdded = await this.scheduleService.add(schedule);
    if (!hasScheduleBeenAdded) {
      return this.logger.error(
        `Schedule '${schedule.name}' could not be created.`
      );
    }

    this.loadLaunchDaemon(path);
  }

  private getPlistInfo(schedule: BackupSchedule): PlistInfo {
    const plistPath = path.join(
      os.homedir(),
      "Library",
      "LaunchAgents",
      `${this.generatePlistLabel(schedule.name)}.plist`
    );
    const plistContent = new PlistGenerator(
      this.generatePlistLabel(schedule.name)
    ).generate(schedule.frequency, schedule);

    return {
      path: plistPath,
      content: plistContent,
    };
  }

  private generatePlistLabel(name: string): string {
    const normalizedName = name.toLowerCase().replace(" ", "-");

    return `com.bearsistence.${normalizedName}`;
  }

  private async createSchedulePlistFile(content: string, plistPath: string) {
    await fs.writeFile(plistPath, content, {
      encoding: "utf-8",
    });
  }

  private loadLaunchDaemon(plistPath: string) {
    this.unloadLaunchDaemon(plistPath);

    exec(`launchctl load ${plistPath}`);
    this.logger.success("Backup task scheduled successfully!");
  }

  private unloadLaunchDaemon(plistPath: string) {
    try {
      exec(`launchctl unload ${plistPath}`);
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

  protected async listSchedules() {
    const schedules = this.scheduleService.schedules;
    if (schedules.length === 0) {
      return this.logger.info("You haven't set up any schedules yet.");
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
    try {
      const plistPath = path.join(
        os.homedir(),
        "Library",
        "LaunchAgents",
        `${this.generatePlistLabel(schedule)}.plist`
      );

      await fs.unlink(plistPath);
      this.scheduleService.remove(schedule);
      this.logger.success(`Schedule '${schedule} deleted successfully!'`);
    } catch {
      this.logger.error(`Failed to delete schedule '${schedule}'`);
    }
  }

  exit() {
    this.logger.info("Goodbye!");
    process.exit(1);
  }
}

export default Mode;
