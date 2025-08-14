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
import { withNewLines } from "../decorators/withNewlines";

@boundClass
@injectable()
class Prompt {
  @withNewLines
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

  @withNewLines
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

  @withNewLines
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

  @withNewLines
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
      ],
    });

    return frequency;
  }

  @withNewLines
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

  @withNewLines
  async getBackupDayOfWeek(): Promise<Day> {
    const { dayOfWeek } = await inquirer.prompt({
      type: "list",
      name: "dayOfWeek",
      message: "Day of week:",
      choices: DAYS_OF_WEEK,
    });

    return dayOfWeek;
  }

  @withNewLines
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

  @withNewLines
  async getScheduleToRemove(schedules: BackupSchedule[]): Promise<string> {
    const { schedule } = await inquirer.prompt({
      type: "list",
      name: "schedule",
      message: "Which schedule would you like to delete?",
      choices: schedules.map((s) => s.name),
    });

    return schedule;
  }

  @withNewLines
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

  async shouldContinue(): Promise<boolean> {
    return this.getConfirmation("Do you want to do anything else?");
  }
}

export default Prompt;
