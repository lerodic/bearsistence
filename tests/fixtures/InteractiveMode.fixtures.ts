import { BackupSchedule } from "../../src/types";

export const listSchedulesFixtures = [
  {
    schedules: [
      {
        name: "First schedule",
        frequency: "daily",
        options: {
          time: "02:00",
        },
      },
    ],
    expected: [
      {
        name: "First schedule",
        frequency: "daily",
        time: "02:00",
        day: "-",
        interval: "-",
      },
    ],
  },
  {
    schedules: [
      {
        name: "First schedule",
        frequency: "daily",
        options: {
          time: "02:00",
        },
      },
      {
        name: "Second schedule",
        frequency: "weekly",
        options: {
          time: "21:00",
          day: "Monday",
        },
      },
    ],
    expected: [
      {
        name: "First schedule",
        frequency: "daily",
        time: "02:00",
        day: "-",
        interval: "-",
      },
      {
        name: "Second schedule",
        frequency: "weekly",
        time: "21:00",
        day: "Monday",
        interval: "-",
      },
    ],
  },
  {
    schedules: [
      {
        name: "First schedule",
        frequency: "daily",
        options: {
          time: "02:00",
        },
      },
      {
        name: "Second schedule",
        frequency: "weekly",
        options: {
          time: "21:00",
          day: "Monday",
        },
      },
      {
        name: "Third schedule",
        frequency: "hourly",
        options: {
          hours: 20,
        },
      },
    ],
    expected: [
      {
        name: "First schedule",
        frequency: "daily",
        time: "02:00",
        day: "-",
        interval: "-",
      },
      {
        name: "Second schedule",
        frequency: "weekly",
        time: "21:00",
        day: "Monday",
        interval: "-",
      },
      {
        name: "Third schedule",
        frequency: "hourly",
        time: "-",
        day: "-",
        interval: 20,
      },
    ],
  },
] as { schedules: BackupSchedule[]; expected: Record<string, any>[] }[];

export const removeScheduleFixtures = [
  {
    name: "First schedule",
    schedules: [
      {
        name: "First schedule",
        frequency: "daily",
        options: {
          time: "02:00",
        },
      },
    ],
  },
] as {
  name: string;
  schedules: BackupSchedule[];
}[];

export const clearSchedulesFixtures = [
  {
    schedules: [
      {
        name: "First schedule",
        frequency: "daily",
        options: {
          time: "02:00",
        },
      },
    ],
  },
] as {
  schedules: BackupSchedule[];
}[];
