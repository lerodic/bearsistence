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

export const removeExistingScheduleFixtures: {
  name: string;
  schedules: BackupSchedule[];
}[] = [
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
  {
    name: "Second schedule",
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
        frequency: "daily",
        options: {
          time: "03:00",
        },
      },
      {
        name: "Third schedule",
        frequency: "daily",
        options: {
          time: "04:00",
        },
      },
    ],
  },
];

export const removeNonExistingScheduleFixtures: {
  name: string;
  schedules: BackupSchedule[];
}[] = [
  {
    name: "Nope",
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
  {
    name: "Still nope",
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
        frequency: "daily",
        options: {
          time: "03:00",
        },
      },
      {
        name: "Third schedule",
        frequency: "daily",
        options: {
          time: "04:00",
        },
      },
    ],
  },
];

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
          time: "02:00",
          day: "Tuesday",
        },
      },
      {
        name: "Third schedule",
        frequency: "daily",
        options: {
          time: "10:00",
        },
      },
    ],
  },
] as {
  schedules: BackupSchedule[];
}[];
