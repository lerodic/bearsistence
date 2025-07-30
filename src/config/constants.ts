import { ScriptExecutionOptions } from "../types";

const SCRIPTS = {
  TEST_CONNECTION: {
    script: "connection",
    handler: "testConnection",
    defaultValues: {
      isRunning: false,
      isResponsive: false,
      errorMessage: "",
    },
  },
} as const satisfies Record<string, ScriptExecutionOptions>;

export default SCRIPTS;
