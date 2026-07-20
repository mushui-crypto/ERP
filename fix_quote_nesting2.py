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
        
        old_content = content
        
        content = content.replace("this.closest('.modal-overlay')", 'this.closest(".modal-overlay")')
        content = content.replace("this.closest('.modal-dialog')", 'this.closest(".modal-dialog")')
        content = content.replace("this.closest('.modal-body')", 'this.closest(".modal-body")')
        content = content.replace("this.closest('.modal-content')", 'this.closest(".modal-content")')
        content = content.replace("this.closest('.modal-header')", 'this.closest(".modal-header")')
        content = content.replace("this.closest('.modal-footer')", 'this.closest(".modal-footer")')
        content = content.replace("this.closest('.modal-tab')", 'this.closest(".modal-tab")')
        content = content.replace("this.closest('.modal-tab-pane')", 'this.closest(".modal-tab-pane")')
        content = content.replace("this.closest('.modal-form')", 'this.closest(".modal-form")')
        
        content = content.replace("el.closest('.modal-overlay')", 'el.closest(".modal-overlay")')
        content = content.replace("el.closest('.modal-dialog')", 'el.closest(".modal-dialog")')
        content = content.replace("el.closest('.modal-body')", 'el.closest(".modal-body")')
        content = content.replace("el.closest('.modal-content')", 'el.closest(".modal-content")')
        content = content.replace("el.closest('.modal-header')", 'el.closest(".modal-header")')
        content = content.replace("el.closest('.modal-footer')", 'el.closest(".modal-footer")')
        content = content.replace("el.closest('.modal-tab')", 'el.closest(".modal-tab")')
        content = content.replace("el.closest('.modal-tab-pane')", 'el.closest(".modal-tab-pane")')
        content = content.replace("el.closest('.modal-form')", 'el.closest(".modal-form")')
        
        if content != old_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复: {filename}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")