import { Command } from "commander";

export interface ScriptExecutionOptions {
  script: string;
  handler: string;
  defaultValues: Record<string, any>;
}

export type Program = Command;
