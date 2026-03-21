const fs = require('fs');
const file = 'src/app/services/storage.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /transactions: Array\.isArray\(record\?\._?\w+\) \? record\._?\w+ : \[\],|transactions: Array\.isArray\(record\?\.transactions\) \? record\.transactions : \[\],/,
  'transactions: Array.isArray(record?.transactions) ? record.transactions : [],\n    bills: Array.isArray(record?.bills) ? record.bills : [],'
);

code = code.replace(
  /\.select\("income, categories, transactions"\)/,
  '.select("income, categories, transactions, bills")'
);

code = code.replace(
  /transactions: parsedValue\.transactions,(\r?\n)\s*\}/,
  'transactions: parsedValue.transactions,$1              bills: parsedValue.bills,$1            }'
);

fs.writeFileSync(file, code);
