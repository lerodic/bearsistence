import "reflect-metadata";
import TableService from "../src/core/TableService";

describe("TableService", () => {
  let tableService: TableService;

  beforeEach(() => {
    tableService = new TableService();
  });

  describe("generate", () => {
    it.each([
      {
        rows: [
          {
            name: "First schedule",
            frequency: "daily",
            time: "10:00",
            day: "-",
            interval: "-",
          },
        ],
        expected: `
┌────────────────┬───────────┬───────┬─────┬──────────┐
│ name           │ frequency │ time  │ day │ interval │
├────────────────┼───────────┼───────┼─────┼──────────┤
│ First schedule │ daily     │ 10:00 │ -   │ -        │
└────────────────┴───────────┴───────┴─────┴──────────┘`,
      },
      {
        rows: [
          {
            name: "First schedule",
            frequency: "daily",
            time: "10:00",
            day: "-",
            interval: "-",
          },
          {
            name: "Second schedule",
            frequency: "weekly",
            time: "02:35",
            day: "Monday",
            interval: "-",
          },
        ],
        expected: `
┌─────────────────┬───────────┬───────┬────────┬──────────┐
│ name            │ frequency │ time  │ day    │ interval │
├─────────────────┼───────────┼───────┼────────┼──────────┤
│ First schedule  │ daily     │ 10:00 │ -      │ -        │
├─────────────────┼───────────┼───────┼────────┼──────────┤
│ Second schedule │ weekly    │ 02:35 │ Monday │ -        │
└─────────────────┴───────────┴───────┴────────┴──────────┘`,
      },
      {
        rows: [
          {
            name: "First schedule",
            frequency: "daily",
            time: "10:00",
            day: "-",
            interval: "-",
          },
          {
            name: "Second schedule",
            frequency: "weekly",
            time: "02:35",
            day: "Monday",
            interval: "-",
          },
          {
            name: "Third schedule",
            frequency: "hourly",
            time: "-",
            day: "-",
            interval: "18",
          },
        ],
        expected: `
┌─────────────────┬───────────┬───────┬────────┬──────────┐
│ name            │ frequency │ time  │ day    │ interval │
├─────────────────┼───────────┼───────┼────────┼──────────┤
│ First schedule  │ daily     │ 10:00 │ -      │ -        │
├─────────────────┼───────────┼───────┼────────┼──────────┤
│ Second schedule │ weekly    │ 02:35 │ Monday │ -        │
├─────────────────┼───────────┼───────┼────────┼──────────┤
│ Third schedule  │ hourly    │ -     │ -      │ 18       │
└─────────────────┴───────────┴───────┴────────┴──────────┘`,
      },
    ])("should generate a valid table from rows", ({ rows, expected }) => {
      const table = tableService.generate(rows);

      expect(table).toStrictEqual(expected.trim());
    });
  });
});
