import "reflect-metadata";
import PlistGenerator from "../src/core/PlistGenerator";
import {
  plistFilesForDailySchedule,
  plistFilesForHourlySchedule,
  plistFilesForWeeklySchedule,
} from "./fixtures/PlistGenerator.fixtures";

describe("PlistGenerator", () => {
  let plistGenerator: PlistGenerator;

  describe("generate", () => {
    it.each(plistFilesForWeeklySchedule)(
      "should generate plist for weekly schedule (day: $schedule.options.day, time: $schedule.options.time)",
      async ({ schedule, expected }) => {
        plistGenerator = new PlistGenerator(schedule.name);

        const result = plistGenerator.generate(schedule.frequency, schedule);

        expect(result).toStrictEqual(expected);
      }
    );

    it.each(plistFilesForDailySchedule)(
      "should generate plist for daily schedule (time: $schedule.options.time)",
      async ({ schedule, expected }) => {
        plistGenerator = new PlistGenerator(schedule.name);

        const result = plistGenerator.generate(schedule.frequency, schedule);

        expect(result).toStrictEqual(expected);
      }
    );

    it.each(plistFilesForHourlySchedule)(
      "should generate plist for hourly schedule $interval",
      async ({ schedule, expected }) => {
        plistGenerator = new PlistGenerator(schedule.name);

        const result = plistGenerator.generate(schedule.frequency, schedule);

        expect(result).toStrictEqual(expected);
      }
    );
  });
});
