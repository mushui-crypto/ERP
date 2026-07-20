import os
import re

pages_dir = 'd:\\开发测试\\hub-erp-v0\\traewordp\\pages'

files_to_fix = [
    'production-inspect-create.html',
    'production-report-inspect-create.html',
    'purchase-receive-inspect-create.html',
    'sales-disassembly-shipment-create.html',
    'sales-disassembly-shipment.html'
]

fixed_count = 0

for filename in files_to_fix:
    filepath = os.path.join(pages_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'\}\s*\n\s*\);\s*\n\s*document\.addEventListener'
    replacement = '}\ndocument.addEventListener'
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content == content:
        pattern2 = r'\n\s*\);\s*\n\s*document\.getElementById'
        replacement2 = '\ndocument.getElementById'
        new_content = re.sub(pattern2, replacement2, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'已修复 {filename}')
        fixed_count += 1

print(f'\n修复完成，共处理 {fixed_count} 个文件')
