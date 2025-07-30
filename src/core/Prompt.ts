import { boundClass } from "autobind-decorator";
import { injectable } from "inversify";
import inquirer from "inquirer";

@boundClass
@injectable()
class Prompt {
  async getAction() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          {
            name: "📦 Create backup now",
            value: "backup",
          },
          {
            name: "⌛ Manage schedules",
            value: "schedule",
          },
          {
            name: "📊 View status",
            value: "status",
          },
          {
            name: "🐻 Test Bear Notes connection",
            value: "test",
          },
          {
            name: "Exit",
            value: "exit",
          },
        ],
      },
    ]);

    return action;
  }
}

export default Prompt;
