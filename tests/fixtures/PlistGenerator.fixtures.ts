import { BackupSchedule } from "../../src/types";

export const plistFilesForDailySchedule = [
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "daily",
      options: {
        time: "02:00",
        outputPath: "Users/tester/some_folder",
      },
    },
    expected: preparePlistForDailySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      2,
      0
    ),
  },
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "daily",
      options: {
        time: "08:25",
        outputPath: "Users/tester/some_folder",
      },
    },
    expected: preparePlistForDailySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      8,
      25
    ),
  },
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "daily",
      options: {
        time: "00:58",
        outputPath: "Users/tester/some_folder",
      },
    },
    expected: preparePlistForDailySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      0,
      58
    ),
  },
] as { schedule: BackupSchedule; expected: string }[];

function preparePlistForDailySchedule(
  label: string,
  scriptPath: string,
  hour: number,
  minute: number
): string {
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
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>${hour}</integer>
    <key>Minute</key><integer>${minute}</integer>
  </dict>
</dict>
</plist>
`;
}

export const plistFilesForWeeklySchedule = [
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "weekly",
      options: {
        day: "Monday",
        time: "02:00",
        outputPath: "Users/tester/some_folder",
      },
    },
    expected: preparePlistForWeeklySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      0,
      2,
      0
    ),
  },
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "weekly",
      options: {
        day: "Friday",
        time: "12:50",
        outputPath: "Users/tester/some_folder",
      },
    },
    expected: preparePlistForWeeklySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      4,
      12,
      50
    ),
  },
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "weekly",
      options: {
        day: "Sunday",
        time: "19:44",
        outputPath: "Users/tester/some_folder",
      },
    },
    expected: preparePlistForWeeklySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      6,
      19,
      44
    ),
  },
] as { schedule: BackupSchedule; expected: string }[];

function preparePlistForWeeklySchedule(
  label: string,
  scriptPath: string,
  day: number,
  hour: number,
  minute: number
): string {
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
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>${day}</integer>
    <key>Hour</key><integer>${hour}</integer>
    <key>Minute</key><integer>${minute}</integer>
  </dict>
</dict>
</plist>
`;
}

export const plistFilesForHourlySchedule = [
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "hourly",
      options: {
        hours: 10,
        outputPath: "Users/tester/some_folder",
      },
    },
    interval: generateIntervalDescription(10),
    expected: preparePlistForHourlySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      36000
    ),
  },
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "hourly",
      options: {
        hours: 1,
        outputPath: "Users/tester/some_folder",
      },
    },
    interval: generateIntervalDescription(1),
    expected: preparePlistForHourlySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      3600
    ),
  },
  {
    schedule: {
      name: "com.bearsistence.test",
      frequency: "hourly",
      options: {
        hours: 5,
        outputPath: "Users/tester/some_folder",
      },
    },
    interval: generateIntervalDescription(5),
    expected: preparePlistForHourlySchedule(
      "com.bearsistence.test",
      "/Users/dani/Documents/Development/GitHub/bearsistence/src/scripts/backup-all.applescript",
      18000
    ),
  },
] as { schedule: BackupSchedule; interval: string; expected: string }[];

function preparePlistForHourlySchedule(
  label: string,
  scriptPath: string,
  interval: number
): string {
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
  <key>StartInterval</key>
  <integer>${interval}</integer>
</dict>
</plist>
`;
}

function generateIntervalDescription(interval: number): string {
  const intervalDescription = interval > 1 ? `${interval} hours` : "hour";

  return `(every ${intervalDescription})`;
}
