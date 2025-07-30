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

describe("Bearsistence", () => {
  let bearsistence: Bearsistence;
  let modeFactory: ModeFactory;
  let mode: Mode;

  beforeEach(() => {
    mode = {
      run: jest.fn(),
    } as unknown as Mode;

    modeFactory = {
      createInteractiveMode: jest.fn().mockReturnValueOnce(mode),
      createCommandMode: jest.fn().mockReturnValueOnce(mode),
    };

    bearsistence = new Bearsistence(modeFactory);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("run", () => {
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
        jest.replaceProperty(process, "argv", argv);

        await bearsistence.run();

        expect(modeFactory.createCommandMode).toHaveBeenCalled();
        expect(mode.run).toHaveBeenCalled();
      }
    );

    it("should run in inveractive mode if no arguments have been passed to program", async () => {
      jest.replaceProperty(process, "argv", ["totally", "irrelevant"]);

      await bearsistence.run();

      expect(modeFactory.createInteractiveMode).toHaveBeenCalled();
      expect(mode.run).toHaveBeenCalled();
    });
  });
});
