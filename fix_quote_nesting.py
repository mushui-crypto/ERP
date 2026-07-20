import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

fixed_count = 0

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        content, count = re.subn(
            r"this\.closest\('\.([^']+)'\)",
            r'this.closest(".\\1")',
            content
        )
        if count > 0:
            modified = True
            print(f"Fixed quote nesting in {filename}: {count} occurrences")
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print(f"\nTotal files modified: {fixed_count}")