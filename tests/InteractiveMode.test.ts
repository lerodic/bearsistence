import "reflect-metadata";
import InteractiveMode from "../src/core/modes/InteractiveMode";
import Prompt from "../src/core/Prompt";
import Logger from "../src/core/Logger";
import RecordParser from "../src/core/RecordParser";
import ScriptRunner from "../src/core/ScriptRunner";

jest.mock("../src/core/ScriptRunner");

describe("InteractiveMode", () => {
  let interactiveMode: InteractiveMode;
  let prompt: jest.Mocked<Prompt>;
  let logger: jest.Mocked<Logger>;
  let parser: jest.Mocked<RecordParser>;
  let scriptRunner: jest.MockedClass<typeof ScriptRunner>;
  let mockCallHandler: jest.Mock;

  beforeEach(() => {
    prompt = {
      getAction: jest.fn(),
    };

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

    interactiveMode = new InteractiveMode(prompt, logger, parser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("run", () => {
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
        prompt.getAction.mockResolvedValueOnce("test");
        mockCallHandler.mockImplementationOnce(async () => {
          throw new Error();
        });

        await interactiveMode.run();

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

    describe("action: exit", () => {
      it("should log goodbye message and exit application", async () => {
        prompt.getAction.mockResolvedValueOnce("exit");

        await interactiveMode.run();

        expect(logger.info).toHaveBeenCalledWith("Goodbye!");
      });
    });
  });
});
