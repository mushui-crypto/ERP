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
            r'<div class="breadcrumb">([^<]+)<button class="btn btn-ghost btn-sm" onclick="exitPage\(\)" style="position:absolute;right:16px;top:50%;transform:translateY\(-50%\);">✖️ 退出<\/button><\/div>',
            r'<div class="breadcrumb">\1</div>',
            content
        )
        
        content = re.sub(
            r'<div class="breadcrumb">([^<]+)<button class="btn btn-ghost btn-sm" onclick="exitPage\(\)" style="position:absolute;right:16px;top:50%;transform:translateY\(-50%\);">× 退出<\/button><\/div>',
            r'<div class="breadcrumb">\1</div>',
            content
        )
        
        content = content.replace(
            '<div class="page-header">\n\n\n    <div>\n\n\n      <div class="flex items-center gap-8">',
            '<div class="page-header">\n    <div class="flex items-center gap-8">'
        )
        
        content = content.replace(
            '    </div>\n\n\n\n\n\n\n\n  </div>',
            '    </div>\n  </div>'
        )
        
        content = content.replace(
            '      <button class="action-btn">退出</button>\n\n\n\n    </div>',
            '    </div>'
        )
        
        content = content.replace(
            '      <button class="action-btn">退出</button>\n\n\n    </div>',
            '    </div>'
        )
        
        content = content.replace(
            '      <button class="action-btn">退出</button>\n\n    </div>',
            '    </div>'
        )
        
        content = content.replace(
            '      <button class="action-btn">退出</button>\n    </div>',
            '    </div>'
        )
        
        if content != old_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复: {filename}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")