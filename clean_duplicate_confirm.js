const fs = require('fs');
const path = require('path');

const pagesDir = 'd:\\开发测试\\hub-erp-v0\\traewordp\\pages';

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  let changed = false;
  
  const duplicateFunctions = /\nvar confirmCallback = null;\nfunction closeConfirm\(\) \{[\s\S]*?\}\nfunction confirmOk\(\) \{[\s\S]*?\}\n/g;
  
  if (duplicateFunctions.test(content)) {
    content = content.replace(duplicateFunctions, '\n');
    changed = true;
  }
  
  const inlineFunctions = /\nfunction closeConfirm\(\) \{[\s\S]*?closeConfirmModal\(false\);[\s\S]*?\}\nfunction confirmOk\(\) \{[\s\S]*?closeConfirmModal\(true\);[\s\S]*?\}\n/g;
  
  if (inlineFunctions.test(content)) {
    content = content.replace(inlineFunctions, '\n');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('已修复:', file);
    fixedCount++;
  }
});

console.log('\n修复完成，共处理', fixedCount, '个文件');
