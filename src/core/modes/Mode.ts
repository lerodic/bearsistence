import { boundClass } from "autobind-decorator";
import Logger from "../Logger";
import { BackupSchedule, ScriptExecutionOptions } from "../../types";
import ScriptRunner from "../ScriptRunner";
import RecordParser from "../RecordParser";
import { injectable } from "inversify";
import { PLIST_LABEL, PLIST_PATH, SCRIPTS } from "../../config/constants";
import PlistGenerator from "../PlistGenerator";
import fs from "fs/promises";
import { exec } from "child_process";

@boundClass
@injectable()
abstract class Mode {
  constructor(protected logger: Logger, protected parser: RecordParser) {}

  abstract run(): Promise<void>;

  protected async addSchedule(schedule: BackupSchedule) {
    const plistContent = new PlistGenerator(PLIST_LABEL).generate(
      schedule.frequency,
      schedule
    );
    await this.createSchedulePlistFile(plistContent);

    this.loadLaunchDaemon();
  }

  private async createSchedulePlistFile(content: string) {
    await fs.writeFile(PLIST_PATH, content, {
      encoding: "utf-8",
    });
  }

  private loadLaunchDaemon() {
    this.unloadLaunchDaemon();

    exec(`launchctl load ${PLIST_PATH}`);
    this.logger.success("Backup task scheduled successfully!");
  }

  private unloadLaunchDaemon() {
    try {
      exec(`launchctl unload ${PLIST_PATH}`);
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

  exit() {
    this.logger.info("Goodbye!");
    process.exit(1);
  }
}

export default Mode;
