import "reflect-metadata";
import ScheduleService from "../src/core/ScheduleService";
import fs from "fs/promises";
import path from "path";
import {
  addScheduleFixtures,
  CURRENT_TIMESTAMP,
  doesScheduleExistFalseFixtures,
  doesScheduleExistTrueFixtures,
  getNextBackupFixtures,
  removeExistingScheduleFixtures,
  removeNonExistingScheduleFixtures,
} from "./fixtures/ScheduleService.fixtures";

jest.mock("fs/promises");
jest.mock("path");
jest.mock("os");

describe("ScheduleService", () => {
  const mockReadFile = fs.readFile as jest.Mock;
  const mockWriteFile = fs.writeFile as jest.Mock;
  const mockJoin = path.join as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    it.each([
      {
        jsonContent: `[
  {
    "name": "Test schedule",
    "frequency": "weekly",
    "options": {
      "day": "Monday",
      "time": "02:00",
      "outputPath": "/Users/test/BearBackups"
    }
  }
]`,
        parsedContent: [
          {
            name: "Test schedule",
            frequency: "weekly",
            options: {
              day: "Monday",
              time: "02:00",
              outputPath: "/Users/test/BearBackups",
            },
          },
        ],
      },
    ])(
      "should load locally stored schedules from JSON config",
      async ({ jsonContent, parsedContent }) => {
        mockJoin.mockResolvedValue("/Users/test/.bearsistence/schedules.json");
        mockReadFile.mockResolvedValue(jsonContent);
        const mockParse = jest.spyOn(JSON, "parse");
        mockParse.mockReturnValue(parsedContent);
        const scheduleService = new ScheduleService();

        await scheduleService.init();

        expect(mockParse).toHaveBeenCalledWith(jsonContent);
        expect(scheduleService.schedules).toStrictEqual(parsedContent);
      }
    );

    it("should use default value on error", async () => {
      mockJoin.mockResolvedValue("/Users/test/.bearsistence/schedules.json");
      mockReadFile.mockResolvedValue("");
      const mockParse = jest.spyOn(JSON, "parse");
      mockParse.mockImplementation(() => {
        throw new Error();
      });
      const scheduleService = new ScheduleService();

      await scheduleService.init();

      expect(scheduleService.schedules).toStrictEqual([]);
    });
  });

  describe("add", () => {
    it.each(addScheduleFixtures)(
      "should add new schedule: '$schedule.name', persist locally, and return true",
      async ({ schedule, initialSchedules, expected }) => {
        jest.spyOn(Date, "now").mockReturnValue(schedule.createdAt);
        mockReadFile.mockResolvedValue(JSON.stringify([...initialSchedules]));
        const mockParse = jest.spyOn(JSON, "parse");
        mockParse.mockReturnValue([...initialSchedules]);
        const scheduleService = new ScheduleService([...initialSchedules]);

        const result = await scheduleService.add(schedule);

        expect(mockWriteFile).toHaveBeenCalled();
        expect(result).toBe(true);
        expect(scheduleService.schedules).toStrictEqual(expected);
      }
    );

    it.each(addScheduleFixtures)(
      "should not add new schedule and instead return false on error",
      async ({ schedule, initialSchedules, expected }) => {
        jest.spyOn(Date, "now").mockReturnValue(schedule.createdAt);
        mockReadFile.mockResolvedValue(JSON.stringify([...initialSchedules]));
        const mockParse = jest.spyOn(JSON, "parse");
        mockParse.mockReturnValue([...initialSchedules]);
        mockWriteFile.mockImplementationOnce(() => {
          throw new Error();
        });
        const scheduleService = new ScheduleService([...initialSchedules]);

        const result = await scheduleService.add(schedule);

        expect(result).toBe(false);
        expect(scheduleService.schedules).not.toStrictEqual(expected);
      }
    );

    it.each(addScheduleFixtures)(
      "should overwrite already existing schedule and return true",
      async ({ schedule }) => {
        jest.spyOn(Date, "now").mockReturnValue(schedule.createdAt);
        const schedulesJsonPath = "/Users/test/.bearsistence/schedules.json";
        mockJoin.mockReturnValue(schedulesJsonPath);
        mockReadFile.mockResolvedValue(JSON.stringify([]));
        const mockParse = jest.spyOn(JSON, "parse");
        mockParse.mockReturnValueOnce([]);
        const scheduleService = new ScheduleService([schedule]);

        const result = await scheduleService.add(schedule);

        expect(mockWriteFile).toHaveBeenNthCalledWith(
          1,
          schedulesJsonPath,
          JSON.stringify([]),
          { encoding: "utf-8" }
        );
        expect(mockWriteFile).toHaveBeenNthCalledWith(
          2,
          schedulesJsonPath,
          JSON.stringify([schedule]),
          { encoding: "utf-8" }
        );
        expect(result).toBe(true);
        expect(scheduleService.schedules).toStrictEqual([schedule]);
      }
    );
  });

  describe("remove", () => {
    it.each(removeExistingScheduleFixtures)(
      "should remove schedule '$name'",
      ({ name, initialSchedules, expected }) => {
        const scheduleService = new ScheduleService([...initialSchedules]);

        scheduleService.remove(name);

        expect(scheduleService.schedules).toStrictEqual(expected);
      }
    );

    it.each(removeNonExistingScheduleFixtures)(
      "should perform no action if schedule '$name' does not exist",
      ({ name, initialSchedules, expected }) => {
        const scheduleService = new ScheduleService([...initialSchedules]);

        scheduleService.remove(name);

        expect(scheduleService.schedules).toStrictEqual(expected);
      }
    );
  });

  describe("doesScheduleExist", () => {
    it.each(doesScheduleExistTrueFixtures)(
      "should return true if schedule '$name' does exist",
      async ({ name, schedules }) => {
        const scheduleService = new ScheduleService(schedules);

        const result = scheduleService.doesScheduleExist(name);

        expect(result).toBe(true);
      }
    );

    it.each(doesScheduleExistFalseFixtures)(
      "should return false if schedule '$name' does not exist",
      async ({ name, schedules }) => {
        const scheduleService = new ScheduleService(schedules);

        const result = scheduleService.doesScheduleExist(name);

        expect(result).toBe(false);
      }
    );
  });

  describe("getNextBackup", () => {
    it.each(getNextBackupFixtures)(
      "should return '$expected' for $schedule.frequency schedule '$schedule.name'",
      ({ schedule, expected }) => {
        jest.spyOn(Date, "now").mockReturnValue(CURRENT_TIMESTAMP);

        const scheduleService = new ScheduleService();

        const result = scheduleService.getNextBackup(schedule);

        expect(result).toStrictEqual(expected);
      }
    );
  });
});
