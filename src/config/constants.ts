import { ScriptExecutionOptions } from "../types";
import path from "path";
import os from "os";

export const SCRIPTS = {
  TEST_CONNECTION: {
    script: "connection",
    handler: "testConnection",
    defaultValues: {
      isRunning: false,
      isResponsive: false,
      errorMessage: "",
    },
  },
} as const satisfies Record<string, ScriptExecutionOptions>;

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const PLIST_LABEL = "com.bearsistence.backup";

export const PLIST_PATH = path.join(
  os.homedir(),
  "Library",
  "LaunchAgents",
  `${PLIST_LABEL}.plist`
);

export const enum TimeUnits {
  MS_PER_MINUTE = 60_000,
  MINUTES_PER_DAY = 24 * 60,
  MINUTES_PER_HOUR = 60,
  SECONDS_PER_MINUTE = 60,
}
