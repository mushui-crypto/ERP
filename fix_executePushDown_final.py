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
        
        # Fix all variations of executePushDown
        # Pattern: executePushDown(\' + r.target_doc + \',\' + r.name + ...)
        # Target: executePushDown(\'' + r.target_doc + '\',\'' + r.name + '\')
        
        content = re.sub(
            r'executePushDown\(\\\'\s*\+\s*r\.target_doc\s*\+\s*\\\',\\\'\s*\+\s*r\.name\s*\+\s*\\\'\s*\)\s*\)',
            r'executePushDown(\'\' + r.target_doc + \'\',\'\' + r.name + \'\')',
            content
        )
        
        content = re.sub(
            r'executePushDown\(\\\'\s*\+\s*r\.target_doc\s*\+\s*\\\',\\\'\s*\+\s*r\.name\s*\+\s*\\\'\s*\)',
            r'executePushDown(\'\' + r.target_doc + \'\',\'\' + r.name + \'\')',
            content
        )
        
        content = re.sub(
            r'executePushDown\(\\\'\s*\+\s*r\.target_doc\s*\+\s*\\\',\\\'\s*\+\s*r\.name\s*\+\s*\'\s*\)\s*\)',
            r'executePushDown(\'\' + r.target_doc + \'\',\'\' + r.name + \'\')',
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