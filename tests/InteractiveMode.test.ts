import "reflect-metadata";
import InteractiveMode from "../src/core/modes/InteractiveMode";
import Prompt from "../src/core/Prompt";
import Logger from "../src/core/Logger";
import RecordParser from "../src/core/RecordParser";
import ScriptRunner from "../src/core/ScriptRunner";
import { Day } from "../src/types";
import PlistGenerator from "../src/core/PlistGenerator";
import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import ScheduleService from "../src/core/ScheduleService";
import {
  addDailyScheduleFixtures,
  addHourlyScheduleFixtures,
  addWeeklyScheduleFixtures,
  listSchedulesFixtures,
  removeExistingScheduleFixtures,
  removeNonExistingScheduleFixtures,
  clearSchedulesFixtures,
  NEXT_BACKUP,
} from "./fixtures/Mode.fixtures";
import { getPlistLabel, getPlistPath } from "./utils/utils";

jest.mock("fs/promises");
jest.mock("child_process");
jest.mock("os");
jest.mock("path");
jest.mock("../src/core/ScriptRunner");
jest.mock("../src/core/PlistGenerator");

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
  const mockUnlink = fs.unlink as jest.Mock;
  const plistContent = "(* plist content *)";

  beforeEach(() => {
    prompt = {
      getAction: jest.fn(),
      getScheduleName: jest.fn(),
      getScheduleAction: jest.fn(),
      getScheduleFrequency: jest.fn(),
      getBackupDayOfWeek: jest.fn(),
      getBackupTime: jest.fn(),
      getBackupInterval: jest.fn(),
      getScheduleToRemove: jest.fn(),
      getConfirmation: jest.fn(),
      shouldContinue: jest.fn().mockReturnValue(false),
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
      init: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
      doesScheduleExist: jest.fn(),
      getNextBackup: jest.fn(),
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
    describe("continous execution loop", () => {
      it("should keep program alive for as long as user wants to perform another action", async () => {
        prompt.getAction.mockResolvedValue("test");
        prompt.shouldContinue.mockResolvedValueOnce(true);
        prompt.shouldContinue.mockResolvedValueOnce(false);
        mockCallHandler.mockResolvedValueOnce(
          'isRunning:true, isResponsive:true, errorMessage:""'
        );
        parser.parse.mockReturnValueOnce({
          isRunning: true,
          isResponsive: true,
          errorMessage: "",
        });

        await interactiveMode.run();

        expect(prompt.getAction).toHaveBeenCalledTimes(2);
      });

      it("should exit if user denies performing another action", async () => {
        prompt.getAction.mockResolvedValue("test");
        prompt.shouldContinue.mockResolvedValueOnce(false);
        mockCallHandler.mockResolvedValueOnce(
          'isRunning:true, isResponsive:true, errorMessage:""'
        );
        parser.parse.mockReturnValueOnce({
          isRunning: true,
          isResponsive: true,
          errorMessage: "",
        });

        await interactiveMode.run();

        expect(prompt.getAction).toHaveBeenCalledTimes(1);
      });
    });

    describe("action: schedule", () => {
      describe("action: add", () => {
        it.each(addDailyScheduleFixtures)(
          "should log an error if schedule can't be created",
          async ({ name, frequency, options }) => {
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupTime.mockResolvedValue(options.time as string);
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

        it.each(addDailyScheduleFixtures)(
          "should setup a new daily schedule to backup at $options.time",
          async ({ name, frequency, options }) => {
            const plistLabel = getPlistLabel(name);
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupTime.mockResolvedValue(options.time as string);
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
              `launchctl bootout gui/$(id -u)/${plistLabel}`
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              2,
              `launchctl bootstrap gui/$(id -u) ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );

        it.each(addWeeklyScheduleFixtures)(
          "should setup a new weekly schedule to backup every $options.day at $options.time",
          async ({ name, frequency, options }) => {
            const plistLabel = getPlistLabel(name);
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupDayOfWeek.mockResolvedValue(options.day as Day);
            prompt.getBackupTime.mockResolvedValue(options.time as string);
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
              `launchctl bootout gui/$(id -u)/${plistLabel}`
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              2,
              `launchctl bootstrap gui/$(id -u) ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );

        it.each(addHourlyScheduleFixtures)(
          "should setup a new schedule to backup every $options.hours hour(s)",
          async ({ name, frequency, options }) => {
            const plistLabel = getPlistLabel(name);
            const plistPath = getPlistPath(name);
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("add");
            prompt.getScheduleName.mockResolvedValue(name);
            prompt.getScheduleFrequency.mockResolvedValue(frequency);
            prompt.getBackupInterval.mockResolvedValue(options.hours as number);
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
              `launchctl bootout gui/$(id -u)/${plistLabel}`
            );
            expect(mockExec).toHaveBeenNthCalledWith(
              2,
              `launchctl bootstrap gui/$(id -u) ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );
      });

      describe("action: list", () => {
        it("should log 'You haven't set up any schedules yet.' if there are no schedules yet", async () => {
          Object.defineProperty(scheduleService, "schedules", {
            get: jest.fn(() => []),
          });
          prompt.getAction.mockResolvedValue("schedule");
          prompt.getScheduleAction.mockResolvedValue("list");

          await interactiveMode.run();

          expect(logger.info).toHaveBeenCalledWith(
            "🐻 Welcome to Bearsistence!\n"
          );
          expect(logger.warn).toHaveBeenCalledWith(
            "You haven't set up any schedules yet."
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
            scheduleService.getNextBackup.mockReturnValue(NEXT_BACKUP);

            await interactiveMode.run();

            expect(logger.table).toHaveBeenCalledWith(expected);
          }
        );
      });

      describe("action: remove", () => {
        it("should log warning message if no schedules have been created yet", async () => {
          Object.defineProperty(scheduleService, "schedules", {
            get: jest.fn(() => []),
          });
          prompt.getAction.mockResolvedValue("schedule");
          prompt.getScheduleAction.mockResolvedValue("remove");

          await interactiveMode.run();

          expect(logger.warn).toHaveBeenCalledWith(
            "You have not created any schedules yet."
          );
        });

        it.each(removeExistingScheduleFixtures)(
          "should successfully delete schedule '$name'",
          async ({ name, schedules }) => {
            const plistPath = getPlistPath(name);
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("remove");
            prompt.getScheduleToRemove.mockResolvedValue(name);
            prompt.getConfirmation.mockResolvedValue(true);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.doesScheduleExist.mockReturnValue(true);

            await interactiveMode.run();

            expect(mockUnlink).toHaveBeenCalledWith(plistPath);
            expect(scheduleService.remove).toHaveBeenCalledWith(name);
            expect(logger.success).toHaveBeenCalledWith(
              `Schedule '${name}' deleted successfully!'`
            );
          }
        );

        it.each(removeNonExistingScheduleFixtures)(
          "should log 'Schedule '$name' does not exist.' if schedule does not exist",
          async ({ name, schedules }) => {
            const plistPath = getPlistPath(name);
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("remove");
            prompt.getScheduleToRemove.mockResolvedValue(name);
            prompt.getConfirmation.mockResolvedValue(true);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.doesScheduleExist.mockReturnValue(false);

            await interactiveMode.run();

            expect(logger.error).toHaveBeenCalledWith(
              `Schedule '${name}' does not exist.`
            );
          }
        );

        it.each(removeExistingScheduleFixtures)(
          "should log error message if deletion of schedule '$name' failed",
          async ({ name, schedules }) => {
            const plistPath = getPlistPath(name);
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("remove");
            prompt.getScheduleToRemove.mockResolvedValue(name);
            prompt.getConfirmation.mockResolvedValue(true);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.doesScheduleExist.mockReturnValue(true);
            mockUnlink.mockImplementation(() => {
              throw new Error();
            });

            await interactiveMode.run();

            expect(logger.error).toHaveBeenCalledWith(
              `Failed to delete schedule '${name}'`
            );
            expect(scheduleService.remove).not.toHaveBeenCalled();
            expect(logger.success).not.toHaveBeenCalled();
          }
        );

        it.each(removeExistingScheduleFixtures)(
          "should abort if user does not confirm removal of schedule '$name'",
          async ({ name, schedules }) => {
            const plistPath = getPlistPath(name);
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("remove");
            prompt.getScheduleToRemove.mockResolvedValue(name);
            prompt.getConfirmation.mockResolvedValue(false);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.doesScheduleExist.mockReturnValue(true);

            await interactiveMode.run();

            expect(logger.warn).toHaveBeenCalledWith("Action aborted.");
            expect(mockUnlink).not.toHaveBeenCalled();
          }
        );
      });

      describe("action: clear", () => {
        it.each(clearSchedulesFixtures)(
          "should delete all existing schedules",
          async ({ schedules }) => {
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("clear");
            prompt.getConfirmation.mockResolvedValue(true);
            mockJoin.mockReturnValue("");
            mockUnlink.mockResolvedValue(undefined);

            await interactiveMode.run();

            schedules.forEach((schedule) => {
              expect(mockUnlink).toHaveBeenCalled();
              expect(scheduleService.remove).toHaveBeenCalledWith(
                schedule.name
              );
            });
            expect(logger.success).toHaveBeenCalledWith(
              "All schedules removed."
            );
          }
        );

        it.each(clearSchedulesFixtures)(
          "should not perform any action if user does not confirm deletion",
          async ({ schedules }) => {
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("clear");
            prompt.getConfirmation.mockResolvedValue(false);

            await interactiveMode.run();

            expect(logger.success).not.toHaveBeenCalled();
            expect(logger.error).not.toHaveBeenCalled();
          }
        );

        it.each(clearSchedulesFixtures)(
          "should log error message and abort if any schedule can't be deleted",
          async ({ schedules }) => {
            Object.defineProperty(scheduleService, "schedules", {
              get: jest.fn(() => schedules),
            });
            prompt.getAction.mockResolvedValue("schedule");
            prompt.getScheduleAction.mockResolvedValue("clear");
            prompt.getConfirmation.mockResolvedValue(true);
            mockJoin.mockReturnValue("");
            mockUnlink.mockImplementation(() => {
              throw new Error();
            });

            await interactiveMode.run();

            expect(logger.error).toHaveBeenCalledWith(
              `Failed to delete schedule '${schedules[0].name}. Aborting.'`
            );
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
