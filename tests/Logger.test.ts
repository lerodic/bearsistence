import "reflect-metadata";
import Logger from "../src/core/Logger";
import chalk from "chalk";

jest.mock("chalk", () => {
  const fn = jest.fn((msg) => msg);

  const mock = {
    redBright: Object.assign(fn, { bold: fn }),
    yellowBright: Object.assign(fn, { bold: fn }),
    greenBright: Object.assign(fn, { bold: fn }),
    whiteBright: Object.assign(fn, { bold: fn }),
    bold: {
      redBright: fn,
      yellowBright: fn,
      greenBright: fn,
      whiteBright: fn,
    },
  };

  return { __esModule: true, default: mock };
});

describe("Logger", () => {
  let logger: Logger;
  let log: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger();

    log = jest.spyOn(console, "log");
    log.mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("info", () => {
    it.each(["This is a test", "Another test", "Yet another one"])(
      "should log message[INFO]: '%s'",
      (message: string) => {
        const log = jest.spyOn(console, "log");

        logger.info(message);

        expect(log).toHaveBeenCalledWith(chalk.whiteBright(message));
      }
    );
  });

  describe("warn", () => {
    it.each(["This is a test", "Another test", "Yet another one"])(
      "should log message[WARN]: '%s'",
      (message: string) => {
        const log = jest.spyOn(console, "log");

        logger.warn(message);

        expect(log).toHaveBeenCalledWith(chalk.yellowBright(message));
      }
    );
  });

  describe("success", () => {
    it.each(["This is a test", "Another test", "Yet another one"])(
      "should log message[SUCCESS]: '%s'",
      (message: string) => {
        const log = jest.spyOn(console, "log");

        logger.success(message);

        expect(log).toHaveBeenCalledWith(chalk.greenBright.bold(message));
      }
    );
  });

  describe("error", () => {
    it.each(["This is a test", "Another test", "Yet another one"])(
      "should log message[ERROR]: '%s'",
      (message: string) => {
        const log = jest.spyOn(console, "log");

        logger.error(message);

        expect(log).toHaveBeenCalledWith(chalk.redBright.bold(message));
      }
    );
  });
});
