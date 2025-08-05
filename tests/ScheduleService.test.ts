import "reflect-metadata";
import ScheduleService from "../src/core/ScheduleService";
import fs from "fs/promises";
import path from "path";
import {
  addScheduleFixtures,
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
        mockReadFile.mockResolvedValue(JSON.stringify([...initialSchedules]));
        const mockParse = jest.spyOn(JSON, "parse");
        mockParse.mockReturnValue([...initialSchedules]);
        mockWriteFile.mockImplementation(() => {
          throw new Error();
        });
        const scheduleService = new ScheduleService([...initialSchedules]);

        const result = await scheduleService.add(schedule);

        expect(result).toBe(false);
        expect(scheduleService.schedules).not.toStrictEqual(expected);
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
});
