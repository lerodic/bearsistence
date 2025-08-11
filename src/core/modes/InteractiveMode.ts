import { boundClass } from "autobind-decorator";
import { inject, injectable } from "inversify";
import Mode from "./Mode";
import TYPES from "../../config/inversify/inversify.types";
import Logger from "../Logger";
import RecordParser from "../RecordParser";
import Prompt from "../Prompt";
import {
  Action,
  BackupSchedule,
  BackupScheduleOptions,
  ScheduleAction,
  ScheduleFrequency,
} from "../../types";
import ScheduleService from "../ScheduleService";

@boundClass
@injectable()
class InteractiveMode extends Mode {
  constructor(
    @inject(TYPES.Prompt) private prompt: Prompt,
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.RecordParser) parser: RecordParser,
    @inject(TYPES.ScheduleService) scheduleService: ScheduleService
  ) {
    super(logger, parser, scheduleService);
  }

  async run() {
    this.greet();

    await this.processNextAction();
  }

  private greet() {
    this.logger.info("🐻 Welcome to Bearsistence!\n");
  }

  private async processNextAction() {
    const action = await this.prompt.getAction();

    await this.handleAction(action);
  }

  private async handleAction(action: Action) {
    switch (action) {
      case "schedule":
        await this.manageSchedules();
        break;
      case "test":
        await this.testConnection();
        break;
      case "exit":
        this.logger.info("Goodbye!");
        return;
    }

    await this.shouldContinue();
  }

  private async shouldContinue() {
    const shouldContinue = await this.prompt.shouldContinue();
    if (!shouldContinue) return;

    await this.processNextAction();
  }

  private async manageSchedules() {
    const action = await this.prompt.getScheduleAction();

    await this.handleScheduleAction(action);
  }

  private async handleScheduleAction(action: ScheduleAction) {
    switch (action) {
      case "add":
        await this.setupSchedule();
        break;
      case "list":
        await this.listSchedules();
        break;
      case "remove":
        await this.removeSchedule();
        break;
      case "clear":
        await this.removeAllSchedules();
        break;
    }
  }

  private async setupSchedule() {
    const schedule = await this.prepareScheduleCreation();

    await this.addSchedule(schedule);
  }

  private async prepareScheduleCreation(): Promise<BackupSchedule> {
    const name = await this.prompt.getScheduleName();
    const frequency = await this.prompt.getScheduleFrequency();
    const options = await this.getScheduleCreationOptions(frequency);

    return {
      name,
      frequency,
      options,
    };
  }

  private async getScheduleCreationOptions(
    frequency: ScheduleFrequency
  ): Promise<BackupScheduleOptions> {
    const options = await this.getFrequencyRelatedOptions(frequency);
    options.outputPath = await this.prompt.getOutputPath();

    return options;
  }

  private async getFrequencyRelatedOptions(frequency: ScheduleFrequency) {
    const options: BackupScheduleOptions = {};

    switch (frequency) {
      case "weekly":
        options.day = await this.prompt.getBackupDayOfWeek();
      case "daily":
        options.time = await this.prompt.getBackupTime();
        break;
      case "hourly":
        options.hours = await this.prompt.getBackupInterval();
        break;
    }

    return options;
  }

  private async removeSchedule() {
    if (!this.doAnySchedulesExist()) {
      return this.logger.warn("You have not created any schedules yet.");
    }

    this.listSchedules();
    const scheduleToRemove = await this.prompt.getScheduleToRemove(
      this.scheduleService.schedules
    );

    await this.deleteSchedule(scheduleToRemove);
  }

  private doAnySchedulesExist(): boolean {
    return this.scheduleService.schedules.length !== 0;
  }

  private async removeAllSchedules() {
    const isConfirmed = await this.prompt.getConfirmation(
      "Are you sure you want to remove all schedules? This action is irreversible."
    );
    if (!isConfirmed) {
      return;
    }

    await this.clearSchedules();
  }
}

export default InteractiveMode;
