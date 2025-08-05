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
