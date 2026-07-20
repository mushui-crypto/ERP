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
        
        if 'meta http-equiv="refresh"' in content:
            continue
            
        old_content = content
        
        content = re.sub(
            r'function deleteDetail\([^)]*\)\s*\{\s*if\s*\(\s*showConfirm\s*\(\s*["\']确认退出\？["\']\s*\)\s*\)\s*\{',
            r'function deleteDetail(id) { if (showConfirm("确认删除？")) {',
            content
        )
        
        content = re.sub(
            r'function deleteDetail\([^)]*\)\s*\{\s*showConfirm\s*\(\s*["\']确认退出\？["\']',
            r'function deleteDetail(id) { showConfirm("确认删除？"',
            content
        )
        
        content = re.sub(
            r'if\s*\(\s*showConfirm\s*\(\s*["\']确认退出\？["\']\s*\)\s*\)\s*\{[^}]*localStorage',
            r'if (showConfirm("确认删除？")) { localStorage',
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