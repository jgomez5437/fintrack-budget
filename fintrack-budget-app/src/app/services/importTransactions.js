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

function buildDateInfo(date) {
  return {
    label: formatImportDate(date),
    sortValue: date.getTime(),
  };
}

function parseTransactionDate(rawDate) {
  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return buildDateInfo(rawDate);
  }

  if (typeof rawDate === "number" && Number.isFinite(rawDate)) {
    const parsedDate = parseExcelSerialDate(rawDate);
    return parsedDate
      ? buildDateInfo(parsedDate)
      : { label: todayLabel(), sortValue: Date.now() };
  }

  if (typeof rawDate === "string") {
    const value = rawDate.trim();
    if (!value) return { label: todayLabel(), sortValue: Date.now() };

    const matchedDate = value.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (matchedDate) {
      const month = Number(matchedDate[1]) - 1;
      const day = Number(matchedDate[2]);
      const year = matchedDate[3]
        ? Number(matchedDate[3].length === 2 ? `20${matchedDate[3]}` : matchedDate[3])
        : new Date().getFullYear();
      const parsedDate = new Date(year, month, day);

      if (!Number.isNaN(parsedDate.getTime())) {
        return buildDateInfo(parsedDate);
      }
    }

    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return buildDateInfo(parsedDate);
    }
  }

  return { label: todayLabel(), sortValue: Date.now() };
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

        let dateIdx = 0;
        let amountIdx = 1;
        let descIdx = 4;
        
        if (rows.length > 0) {
          const header = rows[0].map(h => String(h).toLowerCase().trim());
          const foundDate = header.findIndex(h => h.includes('date'));
          const foundAmount = header.findIndex(h => h.includes('amount'));
          const foundDesc = header.findIndex(h => h.includes('description') || h.includes('name') || h.includes('payee') || h.includes('merchant'));
          
          if (foundAmount !== -1 && foundDesc !== -1) {
            dateIdx = foundDate !== -1 ? foundDate : 0;
            amountIdx = foundAmount;
            descIdx = foundDesc;
          }
        }

        const parsedRows = [];
        for (const row of rows) {
          const rawDate = row[dateIdx];
          const rawAmount = row[amountIdx];
          const rawDesc = row[descIdx];

          if (rawDesc === "" && rawAmount === "") continue;
          if (String(rawAmount).toLowerCase().trim() === 'amount') continue;

          const amount = parseFloat(String(rawAmount).replace(/[^0-9.\-]/g, ""));
          if (Number.isNaN(amount) || amount === 0) continue;
          const parsedDate = parseTransactionDate(rawDate);

          parsedRows.push({
            id: Date.now() + Math.random(),
            name: cleanMerchant(String(rawDesc)),
            rawDesc: String(rawDesc),
            amount: (amount * -1).toFixed(2), // Invert so spending is positive, income is negative
            categoryId: "",
            date: parsedDate.label,
            importDateValue: parsedDate.sortValue,
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
