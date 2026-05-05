import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const targetDir = path.join(rootDir, 'dist/app/ffwtool');
const sourceJson = path.join(rootDir, 'public/ffwtool/termine.json');
const sourceIcs = path.join(rootDir, 'public/ffwtool/termine.ics');

function copyFile(source, target) {
  const fileName = path.basename(source);
  const targetPath = path.join(target, fileName);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, targetPath);
    console.log(`Copied ${fileName} to ${targetPath}`);
  } else {
    console.warn(`Warning: Source file ${source} not found.`);
  }
}

try {
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }

  // Copy files
  copyFile(sourceJson, targetDir);
  copyFile(sourceIcs, targetDir);

  console.log('PWA post-build tasks completed successfully.');
} catch (error) {
  console.error('Error during PWA post-build tasks:', error);
  process.exit(1);
}
