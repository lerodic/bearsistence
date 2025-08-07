import "reflect-metadata";
import CommandMode from "../src/core/modes/CommandMode";
import Logger from "../src/core/Logger";
import RecordParser from "../src/core/RecordParser";
import ScriptRunner from "../src/core/ScriptRunner";
import { Program } from "../src/types";
import ScheduleService from "../src/core/ScheduleService";
import {
  addDailyScheduleFixtures,
  addHourlyScheduleFixtures,
  addWeeklyScheduleFixtures,
  listSchedulesFixtures,
} from "./fixtures/Mode.fixtures";
import { getPlistLabel, getPlistPath } from "./utils/utils";
import PlistGenerator from "../src/core/PlistGenerator";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";

jest.mock("commander");
jest.mock("fs/promises");
jest.mock("path");
jest.mock("child_process");
jest.mock("../src/core/ScriptRunner");
jest.mock("../src/core/PlistGenerator");

describe("CommandMode", () => {
  let commandMode: CommandMode;
  let program: jest.Mocked<Program>;
  let logger: jest.Mocked<Logger>;
  let scheduleService: jest.Mocked<ScheduleService>;
  let parser: jest.Mocked<RecordParser>;
  let scriptRunner: jest.MockedClass<typeof ScriptRunner>;
  let mockCallHandler: jest.Mock;
  let plistGenerator: jest.MockedClass<typeof PlistGenerator>;
  let mockGenerate: jest.Mock;
  const mockWriteFile = fs.writeFile as jest.Mock;
  const mockExec = exec as unknown as jest.Mock;
  const mockJoin = path.join as jest.Mock;
  const plistContent = "(* plist content *)";
  let testActionCallback: () => Promise<void>;
  let listActionCallback: () => Promise<void>;
  let addActionCallback: (name: string, options: any) => Promise<void>;
  let commandChain: any;
  let scheduleCommandChain: any;
  let addCommandChain: any;
  let listCommandChain: any;

  beforeEach(() => {
    commandChain = {
      description: jest.fn().mockReturnThis(),
      action: jest.fn((cb: () => Promise<void>) => {
        testActionCallback = cb;

        return commandChain;
      }),
    };

    addCommandChain = {
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn((cb: (name: string, options: any) => Promise<void>) => {
        addActionCallback = cb;

        return addCommandChain;
      }),
    };

    listCommandChain = {
      description: jest.fn().mockReturnThis(),
      action: jest.fn((cb: () => Promise<void>) => {
        listActionCallback = cb;

        return listCommandChain;
      }),
    };

    scheduleCommandChain = {
      description: jest.fn().mockReturnThis(),
      command: jest.fn().mockImplementation((commandName: string) => {
        if (commandName === "list") {
          return listCommandChain;
        }
        return addCommandChain;
      }),
    };

    program = {
      command: jest.fn().mockImplementation((commandName: string) => {
        if (commandName === "schedule") {
          return scheduleCommandChain;
        }

        return commandChain;
      }),
      parseAsync: jest.fn().mockImplementation(async () => {
        const args = process.argv;

        if (args.includes("test")) {
          await testActionCallback();
        } else if (args.includes("list")) {
          await listActionCallback();
        } else if (args.includes("add")) {
          const addIndex = args.indexOf("add");
          const name = args[addIndex + 1];

          const options: any = {};

          const dailyIndex = args.indexOf("--daily");
          if (dailyIndex !== -1 && dailyIndex + 1 < args.length) {
            options.daily = args[dailyIndex + 1];
          }

          const weeklyIndex = args.indexOf("--weekly");
          if (weeklyIndex !== -1 && weeklyIndex + 1 < args.length) {
            options.weekly = args[weeklyIndex + 1];
          }

          const hourlyIndex = args.indexOf("--hourly");
          if (hourlyIndex !== -1 && hourlyIndex + 1 < args.length) {
            options.hourly = parseInt(args[hourlyIndex + 1]);
          }

          const outputIndex = Math.max(
            args.indexOf("-o"),
            args.indexOf("--output")
          );
          if (outputIndex !== -1 && outputIndex + 1 < args.length) {
            options.output = args[outputIndex + 1];
          }

          await addActionCallback(name, options);
        }
      }),
    } as any;

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      table: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    scheduleService = {
      init: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ScheduleService>;

    parser = {
      parse: jest.fn(),
    } as unknown as jest.Mocked<RecordParser>;

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

    commandMode = new CommandMode(program, logger, parser, scheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
    it("should register '$command' command", async () => {
      const commands = [
        {
          command: "test",
          description: "Test Bear Notes connection",
        },
      ];

      await commandMode.run();

      for (const command of commands) {
        expect(program.command).toHaveBeenCalledWith(command.command);
        expect(commandChain.description).toHaveBeenCalledWith(
          command.description
        );
      }

      expect(program.parseAsync).toHaveBeenCalled();
    });

    describe("command: test", () => {
      it("should log success message if Bear Notes is accessible", async () => {
        jest.replaceProperty(process, "argv", ["don't", "care", "test"]);
        mockCallHandler.mockResolvedValueOnce(
          'isRunning:true, isResponsive:true, errorMessage:""'
        );
        parser.parse.mockReturnValueOnce({
          isRunning: true,
          isResponsive: true,
          errorMessage: "",
        });

        await commandMode.run();

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
        jest.replaceProperty(process, "argv", ["don't", "care", "test"]);
        mockCallHandler.mockResolvedValueOnce(
          'isRunning:false, isResponsive:false, errorMessage:"Bear Notes is not running"'
        );
        parser.parse.mockReturnValueOnce({
          isRunning: false,
          isResponsive: false,
          errorMessage: "Bear Notes is not running",
        });

        await commandMode.run();

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
        jest.replaceProperty(process, "argv", ["don't", "care", "test"]);
        mockCallHandler.mockImplementationOnce(async () => {
          throw new Error();
        });

        await commandMode.run();

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

    describe("command: schedule", () => {
      describe("command: add", () => {
        it.each(addDailyScheduleFixtures)(
          "should log an error if schedule can't be created",
          async ({ name, options }) => {
            jest.replaceProperty(process, "argv", [
              "don't",
              "care",
              "schedule",
              "add",
              name,
              "--daily",
              options.time!.toString(),
              "-o",
              options.outputPath!,
            ]);
            const plistPath = getPlistPath(name);
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.add.mockResolvedValue(false);

            await commandMode.run();

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
          async ({ name, options }) => {
            jest.replaceProperty(process, "argv", [
              "don't",
              "care",
              "schedule",
              "add",
              name,
              "--daily",
              options.time!.toString(),
              "-o",
              options.outputPath!,
            ]);
            const plistLabel = getPlistLabel(name);
            const plistPath = getPlistPath(name);
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.add.mockResolvedValue(true);

            await commandMode.run();

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
              `launchctl load ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );

        it.each(addWeeklyScheduleFixtures)(
          "should setup a new weekly schedule to backup every $options.day at $options.time",
          async ({ name, options }) => {
            jest.replaceProperty(process, "argv", [
              "don't",
              "care",
              "schedule",
              "add",
              name,
              "--weekly",
              `${options.day}-${options.time}`,
              "-o",
              options.outputPath!,
            ]);
            const plistLabel = getPlistLabel(name);
            const plistPath = getPlistPath(name);
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.add.mockResolvedValue(true);

            await commandMode.run();

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
              `launchctl load ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );

        it.each(addHourlyScheduleFixtures)(
          "should setup a new schedule to backup every $options.hours hour(s)",
          async ({ name, options }) => {
            jest.replaceProperty(process, "argv", [
              "don't",
              "care",
              "schedule",
              "add",
              name,
              "--hourly",
              options.hours!.toString(),
              "-o",
              options.outputPath!,
            ]);
            const plistLabel = getPlistLabel(name);
            const plistPath = getPlistPath(name);
            mockGenerate.mockReturnValue(plistContent);
            mockJoin.mockReturnValue(plistPath);
            scheduleService.add.mockResolvedValue(true);

            await commandMode.run();

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
              `launchctl load ${plistPath}`
            );
            expect(logger.success).toHaveBeenCalledWith(
              "Backup task scheduled successfully!"
            );
          }
        );
      });

      describe("command: list", () => {
        it("should log 'You haven't set up any schedule yet.' if there are no schedules yet", async () => {
          jest.replaceProperty(process, "argv", [
            "don't",
            "care",
            "schedule",
            "list",
          ]);
          Object.defineProperty(scheduleService, "schedules", {
            get: jest.fn(() => []),
          });

          await commandMode.run();

          expect(logger.info).toHaveBeenNthCalledWith(
            1,
            "🐻 Welcome to Bearsistence!\n"
          );
          expect(logger.info).toHaveBeenNthCalledWith(
            2,
            "You haven't set up any schedules yet."
          );
        });

        it.each(listSchedulesFixtures)("", async ({ schedules, expected }) => {
          Object.defineProperty(scheduleService, "schedules", {
            get: jest.fn(() => schedules),
          });
          jest.replaceProperty(process, "argv", [
            "don't",
            "care",
            "schedule",
            "list",
          ]);

          await commandMode.run();

          expect(logger.table).toHaveBeenCalledWith(expected);
        });
      });
    });
  });
});
