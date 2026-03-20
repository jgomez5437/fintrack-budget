function toTitleCase(str) {
  const minorWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "of",
    "in",
    "on",
    "at",
    "to",
    "with",
  ]);

  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (!word) return word;
      if (index > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function cleanMerchant(raw) {
  if (!raw || typeof raw !== "string") return raw || "Unknown";

  let value = raw.trim();

  value = value.replace(
    /^(PURCHASE AUTHORIZED ON|RECURRING PAYMENT AUTHORIZED ON|BILL PAYMENT AUTHORIZED ON|CARD PURCHASE|NON-CHASE ATM WITHDRAW|ATM WITHDRAWAL|ONLINE TRANSFER\s+\w+\s+\w+\s+ON|ONLINE PAYMENT TO|WIRE TRANSFER TO|WIRE TRANSFER FROM|DIRECT DEPOSIT|ACH DEBIT|ACH CREDIT|ACH|OVERDRAFT|RETURNED|POS PURCHASE|DEBIT CARD PURCHASE)\s+/i,
    "",
  );
  value = value.replace(/^\d{1,2}\/\d{1,2}(\/\d{2,4})?\s+/, "");
  value = value.replace(/\s+(CARD\s+\d{4}|[SP]\d{10,}|\d{15,})\s*$/i, "");
  value = value.replace(/\s+\d{8,}\s*$/, "");
  value = value.replace(/\s+[A-Z]{2}\s+\d{5}(-\d{4})?\s*$/, "");
  value = value.replace(/\s+[A-Z]{2}\s*$/, "");
  value = value.replace(/\s+\d{3}[-.\s]\d{3}[-.\s]\d{4}\s*$/, "");
  value = value.replace(/\s+#\d+\s*$/, "");
  value = value.replace(/\s+\d{4,}\s*$/, "");
  value = value.replace(
    /\s+\d{1,5}\s+(ST|AVE|BLVD|RD|DR|LN|CT|HWY|FWY|PKWY|STE|WAY|PL|CIR)\b.*$/i,
    "",
  );

  const words = value.trim().split(/\s+/);

  if (/^(ZELLE|CHECK|ATM)/i.test(words[0])) {
    return toTitleCase(words.slice(0, 4).join(" "));
  }

  const streetSuffixes = new Set([
    "ST",
    "AVE",
    "BLVD",
    "RD",
    "DR",
    "LN",
    "CT",
    "HWY",
    "FWY",
    "PKWY",
    "STE",
    "WAY",
    "PL",
    "CIR",
  ]);

  let end = words.length;

  for (let index = 1; index < words.length; index += 1) {
    const word = words[index].replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (/^\d{4,}$/.test(word)) {
      end = index;
      break;
    }
    if (streetSuffixes.has(word) && index >= 2) {
      end = index;
      break;
    }
    if (/^[A-Z]{2}$/.test(word) && index >= 2) {
      end = index;
      break;
    }
  }

  end = Math.min(end, 3);
  const result = words.slice(0, end).join(" ").trim();
  const cleaned = result
    .replace(/\.COM$/i, "")
    .replace(/\.NET$/i, "")
    .replace(/\.ORG$/i, "")
    .replace(/\.CO$/i, "");
  const titled = toTitleCase(cleaned);

  return titled || toTitleCase(words[0]);
}
