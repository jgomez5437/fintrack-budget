import { cleanMerchant } from "../utils/merchant";
import { todayLabel } from "../utils/formatters";

let sheetJsPromise;

async function loadSheetJs() {
  if (!sheetJsPromise) {
    sheetJsPromise = import(
      /* @vite-ignore */
      "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs"
    );
  }

  return sheetJsPromise;
}

function formatImportDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function parseExcelSerialDate(value) {
  const excelEpoch = new Date(1899, 11, 30);
  const parsedDate = new Date(excelEpoch);
  parsedDate.setDate(excelEpoch.getDate() + Math.floor(value));

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
}

function parseTransactionDate(rawDate) {
  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return formatImportDate(rawDate);
  }

  if (typeof rawDate === "number" && Number.isFinite(rawDate)) {
    const parsedDate = parseExcelSerialDate(rawDate);
    return parsedDate ? formatImportDate(parsedDate) : todayLabel();
  }

  if (typeof rawDate === "string") {
    const value = rawDate.trim();
    if (!value) return todayLabel();

    const matchedDate = value.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (matchedDate) {
      const month = Number(matchedDate[1]) - 1;
      const day = Number(matchedDate[2]);
      const year = matchedDate[3]
        ? Number(matchedDate[3].length === 2 ? `20${matchedDate[3]}` : matchedDate[3])
        : new Date().getFullYear();
      const parsedDate = new Date(year, month, day);

      if (!Number.isNaN(parsedDate.getTime())) {
        return formatImportDate(parsedDate);
      }
    }

    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return formatImportDate(parsedDate);
    }
  }

  return todayLabel();
}

export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const { read, utils } = await loadSheetJs();
        const fileData = event.target.result;
        const workbook = read(fileData, {
          type: file.name.toLowerCase().endsWith("csv") ? "string" : "array",
          raw: true,
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        const parsedRows = [];
        for (const row of rows) {
          const rawDate = row[0];
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
            date: parseTransactionDate(rawDate),
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
