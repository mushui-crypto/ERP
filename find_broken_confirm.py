import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

broken_files = []

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'meta http-equiv="refresh"' in content:
            continue
            
        matches = re.findall(r'showConfirm\(([^)]+)\)\s*\{', content)
        for match in matches:
            if 'function' not in match:
                broken_files.append(filename)
                break
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"发现 {len(broken_files)} 个文件有 showConfirm 语法错误")
for f in broken_files:
    print(f"  - {f}")