import { BackupSchedule } from "../../src/types";

interface AddScheduleFixture {
  schedule: BackupSchedule;
  initialSchedules: BackupSchedule[];
  expected: BackupSchedule[];
}

interface RemoveScheduleFixtures {
  name: string;
  initialSchedules: BackupSchedule[];
  expected: BackupSchedule[];
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
  schedules: BackupSchedule[];
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
      },
      {
        name: "Second schedule",
        frequency: "daily",
        options: {
          time: "03:00",
          outputPath: "/Users/test/BearBackup",
        },
      },
      {
        name: "Third schedule",
        frequency: "daily",
        options: {
          time: "04:00",
          outputPath: "/Users/test/BearBackup",
        },
      },
    ],
  },
];

export const doesScheduleExistFalseFixtures: {
  name: string;
  schedules: BackupSchedule[];
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
