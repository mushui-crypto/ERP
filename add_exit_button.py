import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

fixed_count = 0

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
    
    if 'create' in filename or 'detail' in filename or 'index' in filename or 'dashboard' in filename:
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'exitPage()' in content or 'onclick="location.href=' in content:
            continue
            
        if '<div class="doc-toolbar">' in content:
            content = content.replace(
                '<div class="doc-toolbar">',
                '<div class="doc-toolbar">\n        <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>'
            )
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复(doc-toolbar): {filename}")
            continue
            
        if '<div class="page-actions">' in content:
            content = content.replace(
                '<div class="page-actions">',
                '<div class="page-actions">\n      <button class="btn btn-ghost btn-sm" onclick="exitPage()">✖️ 退出</button>'
            )
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复(page-actions): {filename}")
            continue
            
        match = re.search(r'<div class="page-header"[^>]*>(.*?)</div>', content, re.DOTALL)
        if match:
            header_content = match.group(1)
            if '退出' not in header_content:
                new_header = '<div class="page-header">' + header_content + '<button class="btn btn-ghost btn-sm" onclick="exitPage()" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);">✖️ 退出</button></div>'
                content = content[:match.start()] + new_header + content[match.end():]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
                print(f"已修复(page-header): {filename}")
                continue
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")