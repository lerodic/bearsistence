import "reflect-metadata";
import InteractiveMode from "../src/core/modes/InteractiveMode";
import Prompt from "../src/core/Prompt";
import Logger from "../src/core/Logger";
import RecordParser from "../src/core/RecordParser";
import ScriptRunner from "../src/core/ScriptRunner";
import { BackupSchedule, Day } from "../src/types";
import PlistGenerator from "../src/core/PlistGenerator";
import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import ScheduleService from "../src/core/ScheduleService";
import { listSchedulesFixtures } from "./fixtures/InteractiveMode.fixtures";

jest.mock("fs/promises");
jest.mock("child_process");
jest.mock("os");
jest.mock("path");
jest.mock("../src/core/ScriptRunner");
jest.mock("../src/core/PlistGenerator");

function getPlistPath(scheduleName: string): string {
  const name = scheduleName.toLowerCase().replace(" ", "-");

  return `/Users/test/Library/LaunchAgents/com.bearsistence.${name}.plist`;
}

describe("InteractiveMode", () => {
  let interactiveMode: InteractiveMode;
  let prompt: jest.Mocked<Prompt>;
  let logger: jest.Mocked<Logger>;
  let parser: jest.Mocked<RecordParser>;
  let scheduleService: jest.Mocked<ScheduleService>;
  let scriptRunner: jest.MockedClass<typeof ScriptRunner>;
  let mockCallHandler: jest.Mock;
  let plistGenerator: jest.MockedClass<typeof PlistGenerator>;
  let mockGenerate: jest.Mock;
  const mockWriteFile = fs.writeFile as jest.Mock;
  const mockExec = exec as unknown as jest.Mock;
  const mockJoin = path.join as jest.Mock;
  const plistContent = "(* plist content *)";

  beforeEach(() => {
    prompt = {
      getAction: jest.fn(),
      getScheduleName: jest.fn(),
      getScheduleAction: jest.fn(),
      getScheduleFrequency: jest.fn(),
      getOutputPath: jest.fn(),
      getBackupDayOfWeek: jest.fn(),
      getBackupTime: jest.fn(),
      getBackupInterval: jest.fn(),
    } as unknown as jest.Mocked<Prompt>;

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      table: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    parser = {
      parse: jest.fn(),
    } as unknown as jest.Mocked<RecordParser>;

    scheduleService = {
      add: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ScheduleService>;

    mockCallHandler = jest.fn();
    scriptRunner = ScriptRunner as jest.MockedClass<typeof ScriptRunner>;
    scriptRunner.mockImplementation(
      () =>
        ({
          callHandler: mockCallHandler,
        } as unknown as ScriptRunner)
    );

    mockGenerate = jest.fn();
    plistGenerator = PlistGenerator as jest.MockedClass<typeof PlistGenerator>;
    plistGenerator.mockImplementation(
      () =>
        ({
          generate: mockGenerate,
        } as unknown as PlistGenerator)
    );

    interactiveMode = new InteractiveMode(
      prompt,
      logger,
      parser,
      scheduleService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    describe("action: schedule", () => {
      describe("action: add", () => {
        it.each([
          {
            name: "Test schedule",
            frequency: "daily",
            options: {
              time: "02:00",
              outputPath: "/Users/test/someFolder",
            },
          },
        ] as BackupSchedule[])(
          "should log an error if schedule can't be created",
          async ({ name, frequency, options }) => {
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupTime.mockResolvedValue(options.time as string);
            prompt.getOutputPath.mockResolvedValue(
              options.outputPath as string
            );
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);

            scheduleService.add.mockResolvedValue(false);

            await interactiveMode.run();

            expect(mockWriteFile).toHaveBeenCalledWith(
              plistPath,
              plistContent,
              {
                encoding: "utf-8",
              }
            );
            expect(logger.error).toHaveBeenCalledWith(
              `Schedule '${name}' could not be created.`
            );
          }
        );

        it.each([
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
        ] as BackupSchedule[])(
          "should setup a new daily schedule to backup at $options.time",
          async ({ name, frequency, options }) => {
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupTime.mockResolvedValue(options.time as string);
            prompt.getOutputPath.mockResolvedValue(
              options.outputPath as string
            );
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.add.mockResolvedValue(true);

            await interactiveMode.run();

            expect(mockWriteFile).toHaveBeenCalledWith(
              plistPath,
              plistContent,
              { encoding: "utf-8" }
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              1,
              `launchctl unload ${plistPath}`
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              2,
              `launchctl load ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );

        it.each([
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
        ] as BackupSchedule[])(
          "should setup a new weekly schedule to backup every $options.day at $options.time",
          async ({ name, frequency, options }) => {
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupDayOfWeek.mockResolvedValue(options.day as Day);
            prompt.getBackupTime.mockResolvedValue(options.time as string);
            prompt.getOutputPath.mockResolvedValue(
              options.outputPath as string
            );
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.add.mockResolvedValue(true);

            await interactiveMode.run();

            expect(mockWriteFile).toHaveBeenCalledWith(
              plistPath,
              plistContent,
              { encoding: "utf-8" }
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              1,
              `launchctl unload ${plistPath}`
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              2,
              `launchctl load ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );

        it.each([
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
        ] as BackupSchedule[])(
          "should setup a new schedule to backup every $options.hours hour(s)",
          async ({ name, frequency, options }) => {
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupInterval.mockResolvedValue(options.hours as number);
            prompt.getOutputPath.mockResolvedValue(
              options.outputPath as string
            );
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.add.mockResolvedValue(true);

            await interactiveMode.run();

            expect(mockWriteFile).toHaveBeenCalledWith(
              plistPath,
              plistContent,
              { encoding: "utf-8" }
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              1,
              `launchctl unload ${plistPath}`
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              2,
              `launchctl load ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );
      });

      describe("action: list", () => {
        it("should log 'You haven't set up a schedule yet.' if there are no schedules yet", async () => {
          Object.defineProperty(scheduleService, "schedules", {
            get: jest.fn(() => []),
          });
          prompt.getAction.mockResolvedValue("schedule");
          prompt.getScheduleAction.mockResolvedValue("list");

          await interactiveMode.run();

          expect(logger.info).toHaveBeenCalledWith(
            "You haven't set up a schedule yet."
          );
        });

        it.each(listSchedulesFixtures)(
          "should defer to 'Logger' for printing table from schedule",
          async ({ schedules, expected }) => {
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("list");

            await interactiveMode.run();

            expect(logger.table).toHaveBeenCalledWith(expected);
          }
        );
      });
    });

    describe("action: test", () => {
      it("should log success message if Bear Notes is accessible", async () => {
        prompt.getAction.mockResolvedValueOnce("test");
        mockCallHandler.mockResolvedValueOnce(
          'isRunning:true, isResponsive:true, errorMessage:""'
        );
        parser.parse.mockReturnValueOnce({
          isRunning: true,
          isResponsive: true,
          errorMessage: "",
        });

        await interactiveMode.run();

        expect(logger.info).toHaveBeenNthCalledWith(
          1,
          "🐻 Welcome to Bearsistence!\n"
        );
        expect(logger.info).toHaveBeenNthCalledWith(
          2,
          "Testing Bear Notes connection..."
        );
        expect(logger.success).toHaveBeenCalledWith(
          "Bear Notes is accessible!"
        );
      });

      it("should log error message if Bear Notes is inaccessible", async () => {
        prompt.getAction.mockResolvedValueOnce("test");
        mockCallHandler.mockResolvedValueOnce(
          'isRunning:false, isResponsive:false, errorMessage:"Bear Notes is not running"'
        );
        parser.parse.mockReturnValueOnce({
          isRunning: false,
          isResponsive: false,
          errorMessage: "Bear Notes is not running",
        });

        await interactiveMode.run();

        expect(logger.info).toHaveBeenNthCalledWith(
          1,
          "🐻 Welcome to Bearsistence!\n"
        );
        expect(logger.info).toHaveBeenNthCalledWith(
          2,
          "Testing Bear Notes connection..."
        );
        expect(logger.error).toHaveBeenCalledWith(
          "Bear Notes is inaccessible. Are you sure it's up and running?"
        );
      });

      it("should log error message if script evaluation fails", async () => {
        prompt.getAction.mockResolvedValueOnce("test");
        mockCallHandler.mockImplementationOnce(async () => {
          throw new Error();
        });

        await interactiveMode.run();

        expect(logger.info).toHaveBeenNthCalledWith(
          1,
          "🐻 Welcome to Bearsistence!\n"
        );
        expect(logger.info).toHaveBeenNthCalledWith(
          2,
          "Testing Bear Notes connection..."
        );
        expect(logger.error).toHaveBeenCalledWith(
          "There was an error while assessing the status of Bear Notes."
        );
      });
    });

    describe("action: exit", () => {
      it("should log goodbye message and exit application", async () => {
        prompt.getAction.mockResolvedValueOnce("exit");

        await interactiveMode.run();

        expect(logger.info).toHaveBeenCalledWith("Goodbye!");
      });
    });
  });
});
