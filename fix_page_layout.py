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
        
        modified = False
        
        if '<span>确认操作</span>' in content:
            content = content.replace('<span>确认操作</span>', '<span>系统提示</span>')
            modified = True
        
        if '<div class="confirm-modal-title">确认操作</div>' in content:
            content = content.replace('<div class="confirm-modal-title">确认操作</div>', '<div class="confirm-modal-title">系统提示</div>')
            modified = True
        
        if 'list-action-bar' in content and 'action-btn' in content and 'doc-toolbar' not in content:
            content = content.replace(
                '<div class="list-action-bar">',
                '<div class="list-action-bar" style="display:none;">'
            )
            modified = True
        
        if 'page-header' in content and 'doc-header' not in content:
            content = re.sub(
                r'<div class="page-header">([\s\S]*?)</div>',
                r'<div class="page-header">\1</div>\n\n<div class="doc-header" style="background:#fff;border-bottom:1px solid #e8e8e8;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;">\n  <div style="font-size:14px;color:#666;">快捷操作</div>\n  <div class="doc-toolbar" style="display:flex;gap:8px;flex-wrap:wrap;">\n    <button class="toolbar-btn" style="padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;display:flex;align-items:center;gap:6px;transition:all 0.3s;" onclick="showToast(\'刷新功能开发中...\', \'info\')"><span>🔄</span> 刷新</button>\n    <button class="toolbar-btn" style="padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;display:flex;align-items:center;gap:6px;transition:all 0.3s;" onclick="showToast(\'列设置功能开发中...\', \'info\')"><span>⚙️</span> 显示/隐藏列</button>\n    <button class="toolbar-btn" style="padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;display:flex;align-items:center;gap:6px;transition:all 0.3s;" onclick="showToast(\'导出功能开发中...\', \'info\')"><span>📤</span> 导出</button>\n    <button class="toolbar-btn danger" style="padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #f5222d;background:#f5222d;color:#fff;display:flex;align-items:center;gap:6px;transition:all 0.3s;" onclick="if(confirm(\'确认退出？\')){location.href=\'../index.html\';}"><span>✖️</span> 退出</button>\n  </div>\n</div>',
                content
            )
            modified = True
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"Modified file: {filename}")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print(f"\nTotal files modified: {fixed_count}")