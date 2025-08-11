jest.mock("../src/config/inversify/inversify.config", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    bind: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
  },
}));

import "reflect-metadata";
import Bearsistence from "../src/core/Bearsistence";
import Mode from "../src/core/modes/Mode";
import ModeFactory from "../src/factories/ModeFactory";
import fs from "fs/promises";
import path from "path";

jest.mock("fs/promises");
jest.mock("path");
jest.mock("os");

describe("Bearsistence", () => {
  let bearsistence: Bearsistence;
  let modeFactory: jest.Mocked<ModeFactory>;
  let mode: jest.Mocked<Mode>;
  let mockJoin = path.join as jest.Mock;
  let mockStat = fs.stat as jest.Mock;

  beforeEach(() => {
    mode = {
      run: jest.fn(),
      init: jest.fn(),
      exit: jest.fn(),
    } as unknown as jest.Mocked<Mode>;

    modeFactory = {
      create: jest.fn().mockReturnValue(mode),
      createCommandMode: jest.fn().mockReturnValue(mode),
      createInteractiveMode: jest.fn().mockReturnValue(mode),
    } as unknown as jest.Mocked<ModeFactory>;

    bearsistence = new Bearsistence(modeFactory);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("run", () => {
    it("should initialize Bearsistence correctly (existing schedules.json)", async () => {
      const bearsistenceFolderPath = "Users/test/BearBackup/.bearsistence";
      const schedulesFilePath =
        "Users/test/BearBackup/.bearsistence/schedules.json";
      const mockJoin = jest.spyOn(path, "join");
      mockJoin.mockReturnValueOnce(bearsistenceFolderPath);
      mockJoin.mockReturnValueOnce(schedulesFilePath);

      await bearsistence.run();

      expect(fs.mkdir).toHaveBeenCalledWith(bearsistenceFolderPath, {
        recursive: true,
      });
      expect(fs.stat).toHaveBeenCalledWith(schedulesFilePath);
    });

    it("should initialize Bearsistence correctly (non-existing schedules.json)", async () => {
      const bearsistenceFolderPath = "Users/test/BearBackup/.bearsistence";
      const schedulesFilePath =
        "Users/test/BearBackup/.bearsistence/schedules.json";
      mockStat.mockImplementation(() => {
        throw new Error();
      });
      mockJoin.mockReturnValueOnce(bearsistenceFolderPath);
      mockJoin.mockReturnValueOnce(schedulesFilePath);
      mockJoin.mockReturnValueOnce(schedulesFilePath);

      await bearsistence.run();

      expect(fs.mkdir).toHaveBeenCalledWith(bearsistenceFolderPath, {
        recursive: true,
      });
      expect(fs.stat).toHaveBeenCalledWith(schedulesFilePath);
      expect(fs.writeFile).toHaveBeenCalledWith(
        schedulesFilePath,
        JSON.stringify([]),
        { encoding: "utf-8" }
      );
    });

    it.each([
      {
        argv: ["don't", "care", "-doCare"],
      },
      {
        argv: ["don't", "care", "-e"],
      },
      {
        argv: ["don't", "care", "-a"],
      },
      {
        argv: ["don't", "care", "-this", "-works", "-with", "-many", "-flags"],
      },
    ])(
      "should run in command mode if arguments have been passed to program",
      async ({ argv }) => {
        modeFactory.create.mockImplementation(() => {
          return (modeFactory as any).createCommandMode();
        });
        jest.replaceProperty(process, "argv", argv);

        await bearsistence.run();

        expect((modeFactory as any).createCommandMode).toHaveBeenCalled();
        expect(mode.run).toHaveBeenCalled();
      }
    );

    it("should run in inveractive mode if no arguments have been passed to program", async () => {
      modeFactory.create.mockImplementation(() => {
        return (modeFactory as any).createInteractiveMode();
      });
      jest.replaceProperty(process, "argv", ["totally", "irrelevant"]);

      await bearsistence.run();

      expect((modeFactory as any).createInteractiveMode).toHaveBeenCalled();
      expect(mode.run).toHaveBeenCalled();
    });

    it("should exit gracefully on error", async () => {
      mode.run.mockImplementation(() => {
        throw new Error();
      });

      await bearsistence.run();

      expect(mode.exit).toHaveBeenCalled();
    });
  });
});
