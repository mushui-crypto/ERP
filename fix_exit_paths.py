import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

fixed_count = 0

for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(pages_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            modified = False
            
            content, count = re.subn(r"<span>确认操作</span>", "<span>系统提示</span>", content)
            if count > 0:
                modified = True
                print(f"Fixed confirm modal title (span): {filename}")
            
            content, count = re.subn(r'<div class="confirm-modal-title">确认操作</div>', '<div class="confirm-modal-title">系统提示</div>', content)
            if count > 0:
                modified = True
                print(f"Fixed confirm modal title (div): {filename}")
            
            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print(f"\nTotal files modified: {fixed_count}")