import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import inquirer from "inquirer";
import type {
  Action,
  BackupSchedule,
  Day,
  ScheduleAction,
  ScheduleFrequency,
} from "../types";
import path from "path";
import os from "os";
import { DAYS_OF_WEEK } from "../config/constants";

@boundClass
@injectable()
class Prompt {
  async getAction(): Promise<Action> {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          {
            name: "⌛ Manage schedules",
            value: "schedule",
          },
          {
            name: "📊 View status",
            value: "status",
          },
          {
            name: "🐻 Test Bear Notes connection",
            value: "test",
          },
          {
            name: "Exit",
            value: "exit",
          },
        ],
      },
    ]);

    return action;
  }

  async getScheduleAction(): Promise<ScheduleAction> {
    const { scheduleAction } = await inquirer.prompt({
      type: "list",
      name: "scheduleAction",
      message: "What would you like to do?",
      choices: [
        {
          name: "Add new schedule",
          value: "add",
        },
        {
          name: "List schedules",
          value: "list",
        },
        {
          name: "Remove schedule",
          value: "remove",
        },
        {
          name: "Clear all schedules",
          value: "clear",
        },
      ],
    });

    return scheduleAction;
  }

  async getScheduleName(): Promise<string> {
    const { scheduleName } = await inquirer.prompt({
      type: "input",
      name: "scheduleName",
      message: "Schedule name:",
      validate: (input: string) =>
        input.trim() !== "" || "Please provide a valid schedule name",
    });

    return scheduleName;
  }

  async getScheduleFrequency(): Promise<ScheduleFrequency> {
    const { frequency } = await inquirer.prompt({
      type: "list",
      name: "frequency",
      message: "Schedule frequency:",
      choices: [
        {
          name: "Every X hours",
          value: "hourly",
        },
        {
          name: "Daily",
          value: "daily",
        },
        {
          name: "Weekly",
          value: "weekly",
        },
        {
          name: "Custom",
          value: "custom",
        },
      ],
    });

    return frequency;
  }

  async getBackupTime(): Promise<string> {
    const { backupTime } = await inquirer.prompt({
      type: "input",
      name: "backupTime",
      message: "Time (HH:MM)",
      default: "02:00",
      validate: (input: string) =>
        /^\d{1,2}:\d{2}$/.test(input) || "Please enter time in HH:MM format",
    });

    return backupTime;
  }

  async getBackupDayOfWeek(): Promise<Day> {
    const { dayOfWeek } = await inquirer.prompt({
      type: "list",
      name: "dayOfWeek",
      message: "Day of week:",
      choices: DAYS_OF_WEEK,
    });

    return dayOfWeek;
  }

  async getBackupInterval(): Promise<number> {
    const { hours } = await inquirer.prompt({
      type: "number",
      name: "hours",
      message: "Backup every X hours:",
      default: 6,
      validate: (input: number | undefined) =>
        (input && input > 0) || "Hours must be greater than 0",
    });

    return hours;
  }

  async getOutputPath(): Promise<string> {
    const { outputPath } = await inquirer.prompt({
      type: "input",
      name: "outputPath",
      message: "Where do you want to store the backup at?",
      default: path.join(
        process.env.BACKUP_DIRECTORY || os.homedir(),
        "BearBackups"
      ),
      validate: (input: string) =>
        input.trim() !== "" || "Please provide a valid path",
    });

    return outputPath;
  }

  async getScheduleToRemove(schedules: BackupSchedule[]): Promise<string> {
    const { schedule } = await inquirer.prompt({
      type: "list",
      name: "schedule",
      message: "Which schedule would you like to delete?",
      choices: schedules.map((s) => s.name),
    });

    return schedule;
  }

  async getConfirmation(message: string): Promise<boolean> {
    const { choice } = await inquirer.prompt({
      type: "list",
      name: "choice",
      message,
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
    });

    return choice;
  }
}

export default Prompt;
