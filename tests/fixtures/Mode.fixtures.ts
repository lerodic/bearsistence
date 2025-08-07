import { BackupSchedule } from "../../src/types";

export const addDailyScheduleFixtures: BackupSchedule[] = [
  {
    name: "Test schedule",
    frequency: "daily",
    options: {
      time: "02:00",
      outputPath: "/Users/test/someFolder",
    },
  },
  {
    name: "Test schedule",
    frequency: "daily",
    options: {
      time: "13:01",
      outputPath: "/Users/test/someFolder",
    },
  },
];

export const addWeeklyScheduleFixtures: BackupSchedule[] = [
  {
    name: "Test schedule",
    frequency: "weekly",
    options: {
      day: "Monday",
      time: "02:00",
      outputPath: "/Users/test/someFolder",
    },
  },
  {
    name: "Test schedule",
    frequency: "weekly",
    options: {
      day: "Friday",
      time: "19:35",
      outputPath: "/Users/test/someFolder",
    },
  },
];

export const addHourlyScheduleFixtures: BackupSchedule[] = [
  {
    name: "Test schedule",
    frequency: "hourly",
    options: {
      hours: 12,
      outputPath: "/Users/test/someFolder",
    },
  },
  {
    name: "Test schedule",
    frequency: "hourly",
    options: {
      hours: 3,
      outputPath: "/Users/test/someFolder",
    },
  },
];
