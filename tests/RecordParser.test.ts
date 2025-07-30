import "reflect-metadata";
import RecordParser from "../src/core/RecordParser";
import Logger from "../src/core/Logger";

describe("RecordParser", () => {
  let parser: RecordParser;
  let logger: Logger;

  beforeEach(() => {
    logger = {
      warn: jest.fn(),
    } as unknown as Logger;
    parser = new RecordParser(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("parse", () => {
    it.each([
      {
        output: "",
        defaultValues: {
          isRunning: false,
          isResponsive: false,
        },
      },
      {
        output: "isRunning:true, isResponsive:false",
        defaultValues: {
          isRunning: false,
          isResponsive: false,
          errorMessage: "",
        },
      },
    ])(
      "should log warning message and return default values if record is invalid",
      ({ output, defaultValues }) => {
        const result = parser.parse(output, defaultValues);

        expect(logger.warn).toHaveBeenCalledWith(
          "Failed to parse AppleScript record."
        );
        expect(result).toStrictEqual(defaultValues);
      }
    );

    it.each([
      {
        output: "isRunning:true, isResponsive:false",
        defaultValues: {
          isRunning: false,
          isResponsive: false,
        },
        expected: {
          isRunning: true,
          isResponsive: false,
        },
      },
      {
        output: "isRunning:false, isResponsive:false",
        defaultValues: {
          isRunning: false,
          isResponsive: false,
        },
        expected: {
          isRunning: false,
          isResponsive: false,
        },
      },
      {
        output: "isRunning:true, isResponsive:true",
        defaultValues: {
          isRunning: false,
          isResponsive: false,
        },
        expected: {
          isRunning: true,
          isResponsive: true,
        },
      },
    ])(
      "should parse $output into -> $expected",
      ({ output, defaultValues, expected }) => {
        const result = parser.parse(output, defaultValues);

        expect(result).toStrictEqual(expected);
      }
    );
  });
});
