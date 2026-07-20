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
        
        if '<script src="../common.js">' in content and '</script>' in content:
            content = content.replace(
                '<script src="../common.js">',
                '<script src="../common.js"></script>\n<script>'
            )
            fixed_count += 1
            print(f"Fixed script tag in {filename}")
        
        if fixed_count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print(f"\nTotal files modified: {fixed_count}")