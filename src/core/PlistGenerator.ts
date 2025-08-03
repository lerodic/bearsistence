import { boundClass } from "autobind-decorator";
import {
  BackupSchedule,
  BackupScheduleOptionsDaily,
  BackupScheduleOptionsHourly,
  BackupScheduleOptionsWeekly,
  Day,
  ScheduleFrequency,
} from "../types";
import { DAYS_OF_WEEK } from "../config/constants";
import path from "path";

@boundClass
class PlistGenerator {
  private basePlist: string;

  constructor(label: string) {
    this.basePlist = this.createBasePlist(label);
  }

  private createBasePlist(label: string) {
    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "backup-all.applescript"
    );

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
"http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>

  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/osascript</string>
    <string>${scriptPath}</string>
  </array>

  <key>StandardOutPath</key>
  <string>/tmp/bearbackup.out</string>
  <key>StandardErrorPath</key>
  <string>/tmp/bearbackup.err</string>
`;
  }

  generate(frequency: ScheduleFrequency, schedule: BackupSchedule): string {
    switch (frequency) {
      case "daily":
        this.generateForDailySchedule(
          schedule.options as BackupScheduleOptionsDaily
        );
        break;
      case "weekly":
        this.generateForWeeklySchedule(
          schedule.options as BackupScheduleOptionsWeekly
        );
        break;
      case "hourly":
        this.generateForHourlySchedule(
          schedule.options as BackupScheduleOptionsHourly
        );
    }

    this.addEndOfFile();

    return this.basePlist;
  }

  private generateForDailySchedule(options: BackupScheduleOptionsDaily) {
    const [hours, minutes] = this.extractHoursAndMinutes(options.time);

    this.basePlist += `  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>${hours}</integer>
    <key>Minute</key><integer>${minutes}</integer>
  </dict>\n`;
  }

  private extractHoursAndMinutes(time: string): number[] {
    return time.split(":").map((str) => +str);
  }

  private generateForWeeklySchedule(options: BackupScheduleOptionsWeekly) {
    const [hours, minutes] = this.extractHoursAndMinutes(options.time);
    const day = this.getIndexOfDay(options.day);

    this.basePlist += `  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>${day}</integer>
    <key>Hour</key><integer>${hours}</integer>
    <key>Minute</key><integer>${minutes}</integer>
  </dict>\n`;
  }

  private getIndexOfDay(day: Day): number {
    return DAYS_OF_WEEK.indexOf(day);
  }

  private generateForHourlySchedule(options: BackupScheduleOptionsHourly) {
    const seconds = options.hours * 3600;

    this.basePlist += `  <key>StartInterval</key>\n  <integer>${seconds}</integer>\n`;
  }

  private addEndOfFile() {
    this.basePlist += `</dict>\n</plist>\n`;
  }
}

export default PlistGenerator;
