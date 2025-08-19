# Bearsistence

[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Built with Node.js](https://img.shields.io/badge/Built%20with-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tested with Jest](https://img.shields.io/badge/Tested%20with-Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Bearsistence** is a Node.js CLI tool that automates backups for **Bear**, a fantastic notes application for macOS.  
It allows users to create different backup schedules—daily, weekly, or at custom intervals—and automatically backup their entire library.

The application offers **two modes of interaction**:

- **Interactive Mode** – a guided mode that helps you set up schedules step by step.
- **Command Mode** – a flexible mode where you can issue commands directly via the CLI.

---

## Features

- Automated backups of your Bear notes library
- Flexible scheduling: daily, weekly, or every X hours
- Two modes: Interactive (guided) and Command (manual CLI)

---

## Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)

## Installation

```bash
# Clone the repository
git clone https://github.com/lerodic/bearsistence.git

# Navigate into the project
cd bearsistence

# Install dependencies
npm install

# Build the project
npm run build

# Make 'bearsistence' command available globally
npm link

# You can invoke bearsistence using the 'bearsistence' command
```

---

## Command Mode

As an alternative to using Interactive Mode, you can use predefined commands to interact with Bearsistence.  
It offers the exact same capabilities as Interactive Mode, so you're not missing out on any of its core features.

Here you can learn what each command and flag does:

| Command    | Subcommand / Option       | Description                            | Example                                        |
| ---------- | ------------------------- | -------------------------------------- | ---------------------------------------------- |
| `test`     | —                         | Test the connection to Bear Notes      | `bearsistence test`                            |
| `schedule` | `add <name>`              | Add a new backup schedule              | `bearsistence schedule add my-backup -d 14:00` |
|            | `-d, --daily <time>`      | Daily backup at specified time         | `-d 14:00`                                     |
|            | `-w, --weekly <day-time>` | Weekly backup on specific day and time | `-w monday-14:00`                              |
|            | `-h, --hourly <hours>`    | Backup every X hours                   | `-h 6`                                         |
| `schedule` | `list`                    | List all active schedules              | `bearsistence schedule list`                   |
| `schedule` | `remove <name>`           | Remove a specific schedule             | `bearsistence schedule remove my-backup`       |
| `schedule` | `clear`                   | Remove all active schedules            | `bearsistence schedule clear`                  |

---

### Schedule Options

#### Daily Backups

- Option: `-d, --daily <time>`
- Description: Run the backup once every day at the specified time.
- Time Format: `HH:MM` (24-hour clock)
- Example: `bearsistence schedule add daily-backup -d 14:00`

#### Weekly Backups

- Option: `-w, --weekly <day-time>`
- Description: Run the backup once a week on a specific day and time.
- Format: `<day>-<time>`
  - `<day>`: one of `monday, tuesday, wednesday, thursday, friday, saturday, sunday`
  - `<time>`: `HH:MM` (24-hour clock)
- Example: `bearsistence schedule add weekly-backup -w monday-14:00`

#### Hourly Backups

- Option: `-h, --hourly <hours>`
- Description: Run the backup every X hours.
- Example: `bearsistence schedule add hourly-backup -h 6`

---

### Tips & Notes

- For daily and weekly schedules, always use 24-hour `HH:MM` format to avoid ambiguity.
- Weekly schedule days are case-insensitive (`Monday` or `monday`).
- Hourly backups accept any positive integer for hours (e.g., 1, 6, 12, 40).
- When removing schedules, use the exact name you provided when adding it.
- All backups will be stored in `~/.bearsistence`
- You need to whitelist `osascript`, as well as your terminal of choice in `Privacy & Security -> Accessibility`

---

## License

This project is licensed under the MIT License.  
See [LICENSE](LICENSE) for details.

---
