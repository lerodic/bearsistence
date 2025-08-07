import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import Mode from "./Mode";
import Logger from "../Logger";
import TYPES from "../../config/inversify/inversify.types";
import RecordParser from "../RecordParser";
import {
  BackupSchedule,
  BackupScheduleOptionsDaily,
  BackupScheduleOptionsHourly,
  BackupScheduleOptionsWeekly,
  CLIOptions,
  Day,
  Program,
  ScheduleFrequency,
  ScheduleOptions,
} from "../../types";
import ScheduleService from "../ScheduleService";

@boundClass
@injectable()
class CommandMode extends Mode {
  constructor(
    @inject(TYPES.Program) private program: Program,
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.RecordParser) parser: RecordParser,
    @inject(TYPES.ScheduleService) scheduleService: ScheduleService
  ) {
    super(logger, parser, scheduleService);

    this.registerCommands();
  }

  async run() {
    this.logger.info("🐻 Welcome to Bearsistence!\n");

    await this.program.parseAsync(process.argv);
  }

  private registerCommands() {
    this.program
      .command("test")
      .description("Test Bear Notes connection")
      .action(async () => {
        await this.testConnection();
      });

    this.registerScheduleCommand();
  }

  private registerScheduleCommand() {
    const scheduleCommand = this.program
      .command("schedule")
      .description("Manage backup schedules");

    scheduleCommand
      .command("add <name>")
      .description("Add a new backup schedule")
      .option("-d, --daily <time>", "Daily backup at specified time")
      .option(
        "-w, --weekly <day-time>",
        "Weekly backup on specific day at specified time"
      )
      .option("-h, --hourly <hours>", "Backup every X hours", parseInt)
      .option("-o, --output <path>", "Path to output directory")
      .action(async (name: string, options: CLIOptions) => {
        const schedule = this.parseCommand(name, options);

        await this.addSchedule(schedule);
      });
  }

  private parseCommand(name: string, cliOptions: CLIOptions): BackupSchedule {
    const frequency = this.parseFrequency(cliOptions);
    const options = this.parseCliOptions(frequency, cliOptions);

    return {
      name,
      frequency,
      options,
    };
  }

  private parseFrequency(cliOptions: CLIOptions): ScheduleFrequency {
    if (cliOptions.daily) {
      return "daily";
    } else if (cliOptions.hourly) {
      return "hourly";
    } else {
      return "weekly";
    }
  }

  private parseCliOptions(
    frequency: ScheduleFrequency,
    cliOptions: CLIOptions
  ): ScheduleOptions {
    switch (frequency) {
      case "daily":
        return this.parseDailyScheduleOptions(cliOptions);
      case "weekly":
        return this.parseWeeklyScheduleOptions(cliOptions);
      case "hourly":
        return this.parseHourlyScheduleOptions(cliOptions);
    }
  }

  private parseDailyScheduleOptions(
    cliOptions: CLIOptions
  ): BackupScheduleOptionsDaily {
    return {
      time: cliOptions.daily!,
      outputPath: cliOptions.output!,
    };
  }

  private parseWeeklyScheduleOptions(
    cliOptions: CLIOptions
  ): BackupScheduleOptionsWeekly {
    const [day, time] = cliOptions.weekly!.split("-");

    return {
      day: day as Day,
      time,
      outputPath: cliOptions.output!,
    };
  }

  private parseHourlyScheduleOptions(
    cliOptions: CLIOptions
  ): BackupScheduleOptionsHourly {
    return {
      hours: cliOptions.hourly!,
      outputPath: cliOptions.output!,
    };
  }
}

export default CommandMode;
