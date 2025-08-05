import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import chalk from "chalk";
import TYPES from "../config/inversify/inversify.types";
import TableService from "./TableService";

@boundClass
@injectable()
class Logger {
  constructor(@inject(TYPES.TableService) private tableService: TableService) {}

  info(message: string) {
    console.log(chalk.whiteBright(message));
  }

  warn(message: string) {
    console.log(chalk.yellowBright(message));
  }

  success(message: string) {
    console.log(chalk.greenBright(message));
  }

  error(message: string) {
    console.log(chalk.redBright(message));
  }

  table(rows: Record<string, any>) {
    const table = this.tableService.generate(rows);

    this.info(table);
  }
}

export default Logger;
