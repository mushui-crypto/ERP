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
        
        content = content.replace(".closest('.modal-overlay')", ".closest('.modal-overlay')")
        content = content.replace(".closest('.modal-dialog')", ".closest('.modal-dialog')")
        
        content, count = re.subn(r"confirm\(['\"](?!确认退出)[^'\"]*['\"]\)", "confirm('确认退出？')", content)
        if count > 0:
            modified = True
        
        if 'document.getElementById(\'confirmModal\')' in content and 'class="confirm-modal-overlay"' not in content and 'class="confirm-modal"' not in content:
            if '</body>' in content:
                confirm_html = '''
<div class="confirm-modal-overlay" id="confirmModal">
  <div class="confirm-modal-dialog">
    <div class="confirm-modal-header">
      <span class="confirm-modal-icon" id="confirmIcon">&#9888;</span>
      <span class="confirm-modal-title" id="confirmTitle">系统提示</span>
    </div>
    <div class="confirm-modal-body">
      <div class="confirm-modal-message" id="confirmMessage"></div>
    </div>
    <div class="confirm-modal-footer">
      <button class="btn-cancel" onclick="closeConfirmModal(false)">取消</button>
      <button class="btn-confirm" onclick="closeConfirmModal(true)">确定</button>
    </div>
  </div>
</div>
'''
                content = content.replace('</body>', confirm_html + '\n</body>')
                modified = True
        
        showToast_count = content.count('function showToast')
        if showToast_count > 1:
            content = re.sub(r'\nfunction showToast[^}]+}\n', '', content, showToast_count - 1)
            modified = True
        
        showConfirm_count = content.count('function showConfirm')
        if showConfirm_count > 1:
            content = re.sub(r'\nfunction showConfirm[^}]+}\n', '', content, showConfirm_count - 1)
            modified = True
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"Fixed: {filename}")
            
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print(f"\nTotal files modified: {fixed_count}")