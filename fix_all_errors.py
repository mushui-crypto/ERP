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
        
        content = re.sub(r"onclick=\"([^\"]*)''([^\"]*)\"", lambda m: 'onclick="' + m.group(1).replace("''", "\\'") + m.group(2).replace("''", "\\'") + '"', content)
        
        content = content.replace("this.closest(\"..1\")", "this.closest('.modal-overlay')")
        content = content.replace("this.closest(\"..2\")", "this.closest('.modal-dialog')")
        content = content.replace("this.closest(\"..3\")", "this.closest('.modal-content')")
        
        content = content.replace("this.closest('..1')", "this.closest('.modal-overlay')")
        content = content.replace("this.closest('..2')", "this.closest('.modal-dialog')")
        content = content.replace("this.closest('..3')", "this.closest('.modal-content')")
        
        content = content.replace("el.closest(\"..1\")", "el.closest('.modal-overlay')")
        content = content.replace("el.closest(\"..2\")", "el.closest('.modal-dialog')")
        content = content.replace("el.closest(\"..3\")", "el.closest('.modal-content')")
        
        content = content.replace("el.closest('..1')", "el.closest('.modal-overlay')")
        content = content.replace("el.closest('..2')", "el.closest('.modal-dialog')")
        content = content.replace("el.closest('..3')", "el.closest('.modal-content')")
        
        if content != old_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复: {filename}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")