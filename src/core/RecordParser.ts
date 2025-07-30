import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import TYPES from "../config/inversify/inversify.types";
import Logger from "./Logger";

@boundClass
@injectable()
class RecordParser {
  constructor(@inject(TYPES.Logger) private logger: Logger) {}

  parse<T extends object>(output: string, defaultValues: T): T {
    try {
      const pairs = this.getRecordPairs(output);
      if (!this.isValidRecord(pairs, defaultValues)) {
        throw new Error("Failed to parse AppleScript record.");
      }

      return this.parseRecordPairs(pairs, defaultValues);
    } catch (error: any) {
      this.logger.warn(error.message);

      return defaultValues;
    }
  }

  private getRecordPairs(output: string) {
    return output.trim().split(", ");
  }

  private parseRecordPairs<T>(pairs: string[], defaultValues: T) {
    let result = { ...defaultValues } as any;

    pairs.forEach((pair) => {
      const colonIndex = pair.indexOf(":");
      if (colonIndex === -1) return;

      const key = pair.substring(0, colonIndex).trim();
      const value = pair.substring(colonIndex + 1).trim();

      result = this.getUpdatedResult(result, key, value);
    });

    return result;
  }

  private getUpdatedResult(result: any, key: string, value: string) {
    if (value === "true") {
      result[key] = true;
    } else if (value === "false") {
      result[key] = false;
    } else if (!isNaN(Number(value))) {
      result[key] = +value;
    } else {
      result[key] = value;
    }

    return result;
  }

  private isValidRecord<T extends object>(
    pairs: string[],
    defaultValues: T
  ): boolean {
    return pairs.length === Object.keys(defaultValues).length;
  }
}

export default RecordParser;
