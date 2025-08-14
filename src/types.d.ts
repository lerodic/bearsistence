import { Command } from "commander";
import { DAYS_OF_WEEK } from "./config/constants";

export interface ScriptExecutionOptions {
  script: string;
  handler: string;
  defaultValues: Record<string, any>;
}

export type Program = Command;

export type Action = "schedule" | "test" | "exit";

export type ScheduleAction = "add" | "list" | "remove" | "clear";

export type ScheduleFrequency = "hourly" | "daily" | "weekly";

export type Day = (typeof DAYS_OF_WEEK)[number];

export interface BackupSchedule {
  name: string;
  frequency: ScheduleFrequency;
  options: BackupScheduleOptions;
}

export interface BackupScheduleOptions {
  time?: string;
  day?: Day;
  hours?: number;
  outputPath?: string;
}

export interface BackupScheduleExtended extends BackupSchedule {
  createdAt: number;
}

export type BackupScheduleOptionsDaily = Required<
  Omit<BackupScheduleOptions, "hours" | "day">
>;

export type BackupScheduleOptionsWeekly = Required<
  Omit<BackupScheduleOptions, "hours">
>;

export type BackupScheduleOptionsHourly = Pick<
  Required<BackupScheduleOptions>,
  "hours" | "outputPath"
>;

export type ScheduleOptions =
  | BackupScheduleOptionsDaily
  | BackupScheduleOptionsWeekly
  | BackupScheduleOptionsHourly;

export interface PlistInfo {
  id: string;
  path: string;
  content: string;
}

export interface CLIOptions {
  daily?: string;
  weekly?: string;
  hourly?: number;
  output?: string;
}
