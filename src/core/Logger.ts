import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import chalk from "chalk";

@boundClass
@injectable()
class Logger {
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
}

export default Logger;
