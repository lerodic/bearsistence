import "reflect-metadata";
import ScriptRunner from "../src/core/ScriptRunner";
import fs from "fs/promises";
import { exec } from "child_process";

jest.mock("fs/promises");
jest.mock("child_process");

describe("ScriptRunner", () => {
  let scriptRunner: ScriptRunner;
  const mockReadFile = fs.readFile as jest.Mock;
  const mockExec = exec as unknown as jest.Mock;
  const scriptContent = "(* AppleScript content *)";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("callHandler", () => {
    it.each([
      {
        scriptName: "testScript",
        handlerName: "testHandler",
        args: ["first", "second"],
      },
      {
        scriptName: "anotherTestScript",
        handlerName: "anotherTestHandler",
        args: ["first", "second"],
      },
    ])(
      "should append call to '$handlerName' to '$scriptName' and execute the script",
      async ({ scriptName, handlerName, args }) => {
        scriptRunner = new ScriptRunner(scriptName);
        mockReadFile.mockResolvedValue(scriptContent);
        mockExec.mockImplementation((cmd, callback) => {
          callback(null, "result", "");
        });

        const result = await scriptRunner.callHandler(handlerName, ...args);

        expect(mockReadFile).toHaveBeenCalledWith(
          expect.stringMatching(`${scriptName}.applescript`),
          {
            encoding: "utf-8",
          }
        );
        expect(mockExec).toHaveBeenCalledWith(
          expect.stringContaining("osascript -e"),
          expect.any(Function)
        );
        expect(result).toBe("result");
      }
    );

    it("should reject if script execution fails", async () => {
      mockReadFile.mockResolvedValue(scriptContent);
      mockExec.mockImplementation((cmd, cb) =>
        cb(new Error("failed"), "", "stderr")
      );
      scriptRunner = new ScriptRunner("malfunctioningScript");

      await expect(scriptRunner.callHandler("shouldThrow")).rejects.toEqual(
        "stderr"
      );
    });

    it("should throw an error if call to handler failed", async () => {
      scriptRunner = new ScriptRunner("somePath");
      (fs.readFile as jest.Mock).mockImplementation(async () => {
        throw new Error();
      });

      await expect(scriptRunner.callHandler("shouldThrow")).rejects.toThrow(
        "Failed to call shouldThrow"
      );
    });
  });
});
