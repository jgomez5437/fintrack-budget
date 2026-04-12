const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

// 1. Gather all files and build an absolute map by basename
const allFiles = [];
function getAllFiles(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) getAllFiles(full);
    else if (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js') || full.endsWith('.jsx')) {
      allFiles.push(full);
    }
  }
}
getAllFiles(srcDir);

const fileByBase = {};
for (const file of allFiles) {
  const base = path.basename(file).replace(/\.[^/.]+$/, "");
  fileByBase[base] = file;
}

// 2. Read each file and resolve imports
for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  const importRegex = /(import.*?from\s+['"])([\.\/][^'"]+)(['"])/g;
  
  content = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    // Calculate expected absolute path
    const resolvedPath = path.resolve(path.dirname(file), importPath);
    
    // Check if it natively exists (with .ts, .tsx, .js, .jsx)
    if (
      fs.existsSync(resolvedPath + '.ts') || 
      fs.existsSync(resolvedPath + '.tsx') || 
      fs.existsSync(resolvedPath + '.js') || 
      fs.existsSync(resolvedPath + '.jsx') ||
      fs.existsSync(resolvedPath)
    ) {
      return match; // It's fine
    }

    // It is broken. Let's find the intended file by basename
    const baseName = path.basename(importPath);
    const intendedFileAbs = fileByBase[baseName];

    if (intendedFileAbs) {
      let newRel = path.relative(path.dirname(file), intendedFileAbs).replace(/\\/g, '/');
      if (!newRel.startsWith('.')) newRel = './' + newRel;
      // strip extension
      newRel = newRel.replace(/\.[^/.]+$/, "");
      return `${prefix}${newRel}${suffix}`;
    }

    return match; // Can't resolve automatically
  });

  if (content !== original) {
    console.log(`Auto-fixed imports in ${path.relative(rootDir, file)}`);
    fs.writeFileSync(file, content);
  }
}
