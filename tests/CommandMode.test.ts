import "reflect-metadata";
import CommandMode from "../src/core/modes/CommandMode";
import Logger from "../src/core/Logger";
import RecordParser from "../src/core/RecordParser";
import ScriptRunner from "../src/core/ScriptRunner";
import { Program } from "../src/types";

jest.mock("commander");
jest.mock("../src/core/ScriptRunner");

describe("CommandMode", () => {
  let commandMode: CommandMode;
  let program: jest.Mocked<Program>;
  let logger: jest.Mocked<Logger>;
  let parser: jest.Mocked<RecordParser>;
  let scriptRunner: jest.MockedClass<typeof ScriptRunner>;
  let mockCallHandler: jest.Mock;
  let actionCallback: () => Promise<void>;
  let commandChain: any;

  beforeEach(() => {
    commandChain = {
      description: jest.fn().mockReturnThis(),
      action: jest.fn((cb: () => Promise<void>) => {
        actionCallback = cb;

        return commandChain;
      }),
    };

    program = {
      command: jest.fn().mockReturnValue(commandChain),
      parseAsync: jest.fn().mockImplementation(async () => {
        await actionCallback();
      }),
    } as any;

    logger = {
      info: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
    };

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

    commandMode = new CommandMode(program, logger, parser);
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
          "🐻 Welcome to Bearup!\n"
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
          "🐻 Welcome to Bearup!\n"
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
          "🐻 Welcome to Bearup!\n"
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
  });
});
