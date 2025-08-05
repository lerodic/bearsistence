import { boundClass } from "autobind-decorator";
import CliTable3 from "cli-table3";
import { injectable } from "inversify";

@boundClass
@injectable()
class TableService {
  generate(rows: Record<string, any>): string {
    const columns = Object.keys(rows[0]);

    const table = new CliTable3({
      head: columns,
      style: { "padding-left": 1, "padding-right": 1, head: [], border: [] },
      wordWrap: true,
    });

    rows.forEach((row: any) => table.push(columns.map((col) => row[col])));

    return table.toString();
  }
}

export default TableService;
