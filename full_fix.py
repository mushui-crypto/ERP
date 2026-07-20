import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

fixed_count = 0
total_files = 0

print("=" * 80)
print("全面修复脚本")
print("=" * 80)

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'meta http-equiv="refresh"' in content:
            continue
            
        total_files += 1
        old_content = content
        changes = []
        
        if 'alert(' in content:
            content = re.sub(r"alert\('([^']+)'\)", r'showToast("\1", "info")', content)
            content = re.sub(r'alert\("([^"]+)"\)', r'showToast("\1", "info")', content)
            content = re.sub(r"alert\('成功|alert\('保存|alert\('提交", r'showToast("保存成功", "success")', content)
            content = re.sub(r"alert\('失败|alert\('错误", r'showToast("操作失败", "error")', content)
            changes.append("alert → showToast")
            
        if 'confirm(' in content:
            content = re.sub(r"confirm\('([^']+)'\)", r'showConfirm("\1")', content)
            content = re.sub(r'confirm\("([^"]+)"\)', r'showConfirm("\1")', content)
            changes.append("confirm → showConfirm")
            
        if '.\\1' in content or '.\\2' in content or '.\\3' in content:
            content = content.replace('.\\1', '.modal-overlay')
            content = content.replace('.\\2', '.modal-overlay')
            content = content.replace('.\\3', '.modal-overlay')
            changes.append("八进制转义修复")
            
        if 'style="position:absolute;right:16px;top:50%;transform:translateY(-50%);"' in content:
            content = content.replace(
                'style="position:absolute;right:16px;top:50%;transform:translateY(-50%);"',
                ''
            )
            changes.append("布局修复")
            
        if 'class="page-header"' in content and 'position: sticky' not in content and 'position:sticky' not in content:
            content = content.replace(
                '<div class="page-header">',
                '<div class="page-header" style="position:sticky;top:0;z-index:100;">'
            )
            changes.append("sticky header")
            
        if re.search(r'<button[^>]*>\s*</button>', content):
            content = re.sub(r'<button([^>]*)>\s*</button>', r'', content)
            changes.append("空按钮移除")
            
        if content != old_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复: {filename}")
            for ch in changes:
                print(f"  - {ch}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print("=" * 80)
print(f"检查 {total_files} 个文件")
print(f"修复 {fixed_count} 个文件")
print("=" * 80)