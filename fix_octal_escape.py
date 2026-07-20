import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

files_to_fix = [
    'sales-split-delivery-create.html',
    'sales-return-notice-create.html',
    'purchase-inspect-notice-create.html'
]

fixed_count = 0

for filename in files_to_fix:
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_content = content
        
        content = re.sub(
            r'this\.closest\("\.\\\d+"\)',
            "this.closest('.modal-overlay')",
            content
        )
        
        if content != old_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复: {filename}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")