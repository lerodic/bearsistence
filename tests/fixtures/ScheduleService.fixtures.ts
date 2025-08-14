import { BackupScheduleExtended } from "../../src/types";

interface AddScheduleFixture {
  schedule: BackupScheduleExtended;
  initialSchedules: BackupScheduleExtended[];
  expected: BackupScheduleExtended[];
}

interface RemoveScheduleFixtures {
  name: string;
  initialSchedules: BackupScheduleExtended[];
  expected: BackupScheduleExtended[];
}

export const addScheduleFixtures: AddScheduleFixture[] = [
  {
    schedule: {
      name: "Test schedule",
      frequency: "daily",
      options: {
        time: "02:00",
        outputPath: "/Users/test/BearBackup",
      },
      createdAt: 0,
    },
    initialSchedules: [],
    expected: [
      {
        name: "Test schedule",
        frequency: "daily",
        options: {
          time: "02:00",
          outputPath: "/Users/test/BearBackup",
        },
        createdAt: 0,
      },
    ],
  },
];

export const removeExistingScheduleFixtures: RemoveScheduleFixtures[] = [
  {
    name: "Test schedule",
    initialSchedules: [
      {
        name: "Test schedule",
        frequency: "daily",
        options: {
          time: "02:00",
          outputPath: "/Users/test/BearBackup",
        },
        createdAt: 0,
      },
    ],
    expected: [],
  },
];

export const removeNonExistingScheduleFixtures: RemoveScheduleFixtures[] = [
  {
    name: "test",
    initialSchedules: [],
    expected: [],
  },
];

export const doesScheduleExistTrueFixtures: {
  name: string;
  schedules: BackupScheduleExtended[];
}[] = [
  {
    name: "Test schedule",
    schedules: [
      {
        name: "Test schedule",
        frequency: "daily",
        options: {
          time: "02:00",
          outputPath: "/Users/test/BearBackup",
        },
        createdAt: 0,
      },
    ],
  },
  {
    name: "Third schedule",
    schedules: [
      {
        name: "First schedule",
        frequency: "daily",
        options: {
          time: "02:00",
          outputPath: "/Users/test/BearBackup",
        },
        createdAt: 0,
      },
      {
        name: "Second schedule",
        frequency: "daily",
        options: {
          time: "03:00",
          outputPath: "/Users/test/BearBackup",
        },
        createdAt: 0,
      },
      {
        name: "Third schedule",
        frequency: "daily",
        options: {
          time: "04:00",
          outputPath: "/Users/test/BearBackup",
        },
        createdAt: 0,
      },
    ],
  },
];

export const doesScheduleExistFalseFixtures: {
  name: string;
  schedules: BackupScheduleExtended[];
}[] = [
  {
    name: "Test_schedule",
    schedules: [
      {
        name: "Test schedule",
        frequency: "daily",
        options: {
          time: "02:00",
          outputPath: "/Users/test/BearBackup",
        },
        createdAt: 0,
      },
    ],
  },
  {
    name: "Fourth schedule",
    schedules: [
      {
        name: "First schedule",
        frequency: "daily",
        options: {
          time: "02:00",
        },
        createdAt: 0,
      },
      {
        name: "Second schedule",
        frequency: "daily",
        options: {
          time: "03:00",
        },
        createdAt: 0,
      },
      {
        name: "Third schedule",
        frequency: "daily",
        options: {
          time: "04:00",
        },
        createdAt: 0,
      },
    ],
  },
];

/* Thursday, 14 August 2025 @ 08:00 in UTC*/
export const CURRENT_TIMESTAMP = Date.UTC(2025, 7, 14, 8, 0, 0, 0);

export const getNextBackupFixtures = [
  {
    schedule: {
      name: "An hourly schedule",
      frequency: "hourly",
      options: {
        hours: 10,
      },
      createdAt: CURRENT_TIMESTAMP - 60 * 60 * 1000,
    },
    expected: "9h",
  },
  {
    schedule: {
      name: "Another hourly schedule",
      frequency: "hourly",
      options: {
        hours: 2,
      },
      createdAt: CURRENT_TIMESTAMP - 60 * 60 * 1000,
    },
    expected: "1h",
  },
  {
    schedule: {
      name: "A daily schedule",
      frequency: "daily",
      options: {
        time: "10:15",
      },
      createdAt: CURRENT_TIMESTAMP - 60 * 60 * 1000,
    },
    expected: "15m",
  },
  {
    schedule: {
      name: "Another daily schedule",
      frequency: "daily",
      options: {
        time: "09:23",
      },
      createdAt: CURRENT_TIMESTAMP - 60 * 60 * 1000,
    },
    expected: "23h 23m",
  },
  {
    schedule: {
      name: "A weekly schedule",
      frequency: "weekly",
      options: {
        time: "11:15",
        day: "Sunday",
      },
      createdAt: CURRENT_TIMESTAMP - 60 * 60 * 1000,
    },
    expected: "3d 1h 15m",
  },
  {
    schedule: {
      name: "Another weekly schedule",
      frequency: "weekly",
      options: {
        time: "09:30",
        day: "Thursday",
      },
      createdAt: CURRENT_TIMESTAMP - 60 * 60 * 1000,
    },
    expected: "6d 23h 30m",
  },
] as {
  schedule: BackupScheduleExtended;
  expected: string;
}[];
