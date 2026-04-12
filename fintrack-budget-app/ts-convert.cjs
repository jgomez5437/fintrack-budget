const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

const arch = {
  budget: {
    components: ['BudgetTab.jsx', 'AddCategoryModal.jsx', 'CategoryEditModal.jsx', 'AddIncomeModal.jsx', 'MonthPickerModal.jsx'],
    pages: ['Budget.jsx']
  },
  debt: {
    components: ['DebtTab.jsx', 'DebtDashboardModal.jsx'],
    pages: ['ToolsDebt.jsx']
  },
  transactions: {
    components: ['TransactionsTab.jsx', 'TransactionDetailsModal.jsx', 'ImportReviewModal.jsx'],
    pages: ['Transactions.jsx']
  },
  bills: {
    components: ['BillsTab.jsx'],
    pages: ['Bills.jsx']
  },
  recurring: {
    components: ['RecurringTab.jsx']
  },
  tools: {
    components: [],
    pages: ['Tools.jsx', 'ToolsMortgage.jsx', 'ToolsRetirement.jsx', 'ToolsEmergency.jsx']
  },
  dashboard: {
    components: ['Home.jsx', 'SummaryCards.jsx', 'SpendProgress.jsx', 'SkeletonDashboard.jsx', 'CategoryAlertBanner.jsx', 'BottomNav.jsx', 'Header.jsx']
  },
  ai: {
    components: ['WeeklySummaryModal.jsx'],
    services: ['weeklySummary.js', 'aiRecurring.js']
  },
  common: {
    components: ['AuthScreen.jsx', 'GlobalStyles.jsx', 'DeleteConfirmModal.jsx', 'NamePromptModal.jsx', 'NextMonthPromptModal.jsx', 'SettingsModal.jsx'],
    utils: ['formatters.js', 'importCategoryRules.js', 'importTransactions.js'],
    services: ['storage.js']
  }
};

const featuresDir = path.join(srcDir, 'features');
if (!fs.existsSync(featuresDir)) fs.mkdirSync(featuresDir);

const fileMap = {}; // mapping from basenames to new absolute paths

// 1. Setup Feature Directories & calculate new paths
for (const [featureName, structure] of Object.entries(arch)) {
  const featPath = path.join(featuresDir, featureName);
  if (!fs.existsSync(featPath)) fs.mkdirSync(featPath);

  // We add 'types.ts' and 'index.ts' for "Production Grade" structure (empty for now)
  fs.writeFileSync(path.join(featPath, 'types.ts'), `// Type definitions for ${featureName} feature\nexport {};\n`);
  fs.writeFileSync(path.join(featPath, 'index.ts'), `// Public API for ${featureName} feature\nexport * from './types';\n`);

  for (const [subfolder, files] of Object.entries(structure)) {
    const subFolderPath = path.join(featPath, subfolder);
    if (!fs.existsSync(subFolderPath)) fs.mkdirSync(subFolderPath);
    // Extra folders for standard architecture:
    if (!fs.existsSync(path.join(featPath, 'hooks'))) fs.mkdirSync(path.join(featPath, 'hooks'));

    for (const file of files) {
      // Find old file path recursively
      function findOriginalPath(dir, filename) {
        if (!fs.existsSync(dir)) return null;
        let p = null;
        for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
          if (e.isDirectory()) {
            p = findOriginalPath(path.join(dir, e.name), filename);
            if (p) return p;
          } else if (e.name === filename) {
            return path.join(dir, e.name);
          }
        }
        return p;
      }
      
      const oldPath = findOriginalPath(srcDir, file);
      if (oldPath) {
        let newExt = file.endsWith('.jsx') ? '.tsx' : '.ts';
        let newName = file.replace('.jsx', '.tsx').replace('.js', '.ts');
        fileMap[oldPath] = path.join(subFolderPath, newName);
      }
    }
  }
}

// Map root level stragglers like budget-app.jsx, constants.js, main.jsx
const coreFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
for (const f of coreFiles) {
   fileMap[path.join(srcDir, f)] = path.join(srcDir, f.replace('.jsx', '.tsx').replace('.js', '.ts'));
}
const appConstants = path.join(srcDir, 'app', 'constants.js');
if (fs.existsSync(appConstants)) {
  fileMap[appConstants] = path.join(srcDir, 'app', 'constants.ts');
}

// 2. Read contents of all mapped files into memory
const fileContents = {};
for (const [oldPath, newPath] of Object.entries(fileMap)) {
  fileContents[oldPath] = fs.readFileSync(oldPath, 'utf8');
}

// Helper: resolve relative imports dynamically
function updateContentImports(content, oldFilePath, newFilePath) {
  // Regex to find all relative imports starting with ./ or ../
  // E.g. import { C } from "../../constants";
  const regex = /from\s+['"]([\.\/][^'"]+)['"]/g;
  
  return content.replace(regex, (match, importPath) => {
    // 1. Resolve absolute path of the target it WAS importing
    let targetAbsPath = path.resolve(path.dirname(oldFilePath), importPath);
    
    // It might be implicitly resolving .jsx or .js
    // We try to match targetAbsPath to a key in fileMap loosely
    let targetFound = false;
    let targetNewAbsPath = '';
    
    for (const [oldP, newP] of Object.entries(fileMap)) {
      if (oldP.replace(/\.tsx?|\.jsx?$/, '') === targetAbsPath.replace(/\.tsx?|\.jsx?$/, '')) {
         targetNewAbsPath = newP;
         targetFound = true;
         break;
      }
    }

    if (!targetFound) {
      // Unmapped file, ignore
      return match;
    }

    // 2. Compute new relative path from NEW file location to NEW target location
    let newRel = path.relative(path.dirname(newFilePath), targetNewAbsPath).replace(/\\/g, '/');
    if (!newRel.startsWith('.')) newRel = './' + newRel;
    
    // Strip extension
    newRel = newRel.replace(/\.tsx?$|\.jsx?$/, '');

    return `from "${newRel}"`;
  });
}

// 3. Move files and write updated contents
for (const [oldPath, newPath] of Object.entries(fileMap)) {
  let content = updateContentImports(fileContents[oldPath], oldPath, newPath);
  fs.writeFileSync(newPath, content);

  if (oldPath !== newPath) {
    try {
      fs.unlinkSync(oldPath);
    } catch(e) {}
  }
}

console.log("TypeScript conversion and strict Feature directory refactor complete.");
