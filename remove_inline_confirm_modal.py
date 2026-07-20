import os

pages_dir = 'd:\\开发测试\\hub-erp-v0\\traewordp\\pages'

confirm_modal_pattern = """<div class="confirm-modal" id="confirmModal">
  <div class="confirm-dialog">
    <div class="confirm-header">
      <div class="confirm-title" id="confirmTitle">系统提示</div>
      <button class="confirm-close" onclick="closeConfirm()">×</button>
    </div>
    <div class="confirm-body" id="confirmBody"></div>
    <div class="confirm-footer" id="confirmFooter">
      <button class="btn btn-cancel" onclick="closeConfirm()">取消</button>
      <button class="btn btn-primary" id="confirmOkBtn" onclick="confirmOk()">确定</button>
    </div>
  </div>
</div>"""

fixed_count = 0

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(pages_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if confirm_modal_pattern in content:
        new_content = content.replace(confirm_modal_pattern, '')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'已修复 {filename}')
        fixed_count += 1

print(f'\n修复完成，共处理 {fixed_count} 个文件')
