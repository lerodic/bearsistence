import { Command } from "commander";
import { DAYS_OF_WEEK } from "./config/constants";

export interface ScriptExecutionOptions {
  script: string;
  handler: string;
  defaultValues: Record<string, any>;
}

export type Program = Command;

export type Action = "schedule" | "status" | "test" | "exit";

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

export type BackupScheduleOptionsDaily = Required<
  Omit<BackupScheduleOptions, "hours">
>;

export type BackupScheduleOptionsWeekly = Required<BackupScheduleOptions>;

export type BackupScheduleOptionsHourly = Pick<
  Required<BackupScheduleOptions>,
  "hours" | "outputPath"
>;

export type ScheduleOptions =
  | BackupScheduleOptionsDaily
  | BackupScheduleOptionsWeekly
  | BackupScheduleOptionsHourly;
