import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";
import { cleanMerchant } from "../utils/merchant";
import { todayLabel } from "../utils/formatters";

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileData = event.target.result;
        const workbook = XLSX.read(fileData, {
          type: file.name.toLowerCase().endsWith("csv") ? "string" : "array",
          raw: true,
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        const parsedRows = [];
        for (const row of rows) {
          const rawAmount = row[1];
          const rawDesc = row[4];

          if (rawDesc === "" && rawAmount === "") continue;

          const amount = parseFloat(String(rawAmount).replace(/[^0-9.\-]/g, ""));
          if (Number.isNaN(amount) || amount >= 0) continue;

          parsedRows.push({
            id: Date.now() + Math.random(),
            name: cleanMerchant(String(rawDesc)),
            rawDesc: String(rawDesc),
            amount: Math.abs(amount).toFixed(2),
            categoryId: "",
            date: todayLabel(),
            include: true,
          });
        }

        if (parsedRows.length === 0) {
          reject(
            new Error(
              "No debit transactions found. Make sure column B has amounts and column E has descriptions.",
            ),
          );
          return;
        }

        resolve(parsedRows);
      } catch {
        reject(
          new Error(
            "Couldn't read the file. Make sure it's a valid .xlsx, .xls, or .csv file.",
          ),
        );
      }
    };

    if (file.name.toLowerCase().endsWith("csv")) {
      reader.readAsText(file);
      return;
    }

    reader.readAsArrayBuffer(file);
  });
}
