const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const componentsDir = path.join(srcDir, 'app', 'components');

const architecture = {
  modals: [
    "AddCategoryModal.jsx",
    "AddIncomeModal.jsx",
    "CategoryEditModal.jsx",
    "DebtDashboardModal.jsx",
    "DeleteConfirmModal.jsx",
    "ImportReviewModal.jsx",
    "MonthPickerModal.jsx",
    "NamePromptModal.jsx",
    "NextMonthPromptModal.jsx",
    "SettingsModal.jsx",
    "TransactionDetailsModal.jsx",
    "WeeklySummaryModal.jsx"
  ],
  layout: [
    "BottomNav.jsx",
    "CategoryAlertBanner.jsx",
    "GlobalStyles.jsx",
    "Header.jsx",
    "SkeletonDashboard.jsx"
  ],
  tabs: [
    "BillsTab.jsx",
    "BudgetTab.jsx",
    "DebtTab.jsx",
    "RecurringTab.jsx",
    "TransactionsTab.jsx"
  ],
  common: [
    "AuthScreen.jsx",
    "SpendProgress.jsx",
    "SummaryCards.jsx"
  ]
};

// Create dirs
["modals", "layout", "tabs", "common"].forEach(dir => {
  const p = path.join(componentsDir, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const fileMap = {};

// Move files
for (const [folder, files] of Object.entries(architecture)) {
  for (const file of files) {
    fileMap[file] = folder;
    const oldPath = path.join(componentsDir, file);
    const newPath = path.join(componentsDir, folder, file);
    if (fs.existsSync(oldPath)) {
      console.log(`Moving ${file} to ${folder}/...`);
      fs.renameSync(oldPath, newPath);
    }
  }
}

// 2. Update all imports in .jsx / .js files
function getAllFiles(dir, activeFiles = []) {
  if (!fs.existsSync(dir)) return activeFiles;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, activeFiles);
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      activeFiles.push(fullPath);
    }
  }
  return activeFiles;
}

const allFiles = getAllFiles(srcDir);

for (const fullPath of allFiles) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // We look for any import from components
  // It could be import X from "./components/X"
  // import X from "../components/X"
  // import X from "./X" (if we are inside components)

  for (const [file, folder] of Object.entries(fileMap)) {
    const basename = file.replace('.jsx', '');

    // Pattern 1: budget-app.jsx -> import X from "./app/components/X"
    content = content.replace(new RegExp(`"\\./app/components/${basename}"`, 'g'), `"./app/components/${folder}/${basename}"`);
    
    // Pattern 2: nested pages -> import X from "../components/X"
    content = content.replace(new RegExp(`"\\.\\./components/${basename}"`, 'g'), `"../components/${folder}/${basename}"`);

    // Pattern 3: inside components folder logic
    // If the file replacing is now inside components/tabs, and it imports a modal: it was "./AddCategoryModal" now it's "../modals/AddCategoryModal"
    // Wait, let's just dynamically figure it out based on relative path.
    const fileRelDir = path.dirname(fullPath);
    const targetFilePath = path.join(componentsDir, folder, basename);
    let relToTarget = path.relative(fileRelDir, targetFilePath).replace(/\\/g, '/');
    if (!relToTarget.startsWith('.')) relToTarget = './' + relToTarget;
    
    // So any import from "./X" or "../X" that originally targeted the old path
    // Let's just find the exact occurrences of the import name if it was a generic import. This is tricky.
    // Instead, let's specifically fix cross-component imports manually or using strict rules.
  }

  // Cross-component fixes:
  if (fullPath.includes(path.join('components', 'tabs'))) {
     content = content.replace(/'\.\/AddCategoryModal'/g, "'../modals/AddCategoryModal'")
                      .replace(/"\.\/DebtDashboardModal"/g, '"../modals/DebtDashboardModal"')
                      .replace(/"\.\/TransactionDetailsModal"/g, '"../modals/TransactionDetailsModal"')
                      .replace(/"\.\/CategoryEditModal"/g, '"../modals/CategoryEditModal"')
                      .replace(/"\.\/SpendProgress"/g, '"../common/SpendProgress"');
  }
  if (fullPath.includes(path.join('components', 'layout'))) {
     // skeleton, header, etc.
     content = content.replace(/"\.\/SummaryCards"/g, '"../common/SummaryCards"');
  }

  // Fixing imports going out of components (like constants, services)
  // If the file is now in a subdirectory of components, it needs an extra '../'
  const isMovedComponent = Object.values(fileMap).some(folder => fullPath.includes(path.join('components', folder)));
  
  if (isMovedComponent && !fullPath.includes('GlobalStyles.jsx')) { // GlobalStyles doesn't have many imports but let's be careful.
    // Before: import { C } from "../constants"
    // After: import { C } from "../../constants"
    content = content.replace(/"\.\.\/constants"/g, '"../../constants"');
    content = content.replace(/"\.\.\/utils/g, '"../../utils');
    content = content.replace(/"\.\.\/services/g, '"../../services');
  }

  // GlobalStyles explicitly
  if (fullPath.includes('GlobalStyles.jsx')) {
     content = content.replace(/"\.\.\/constants"/g, '"../../constants"');
  }

  if (content !== originalContent) {
    console.log(`Updated imports in ${path.relative(rootDir, fullPath)}`);
    fs.writeFileSync(fullPath, content);
  }
}
