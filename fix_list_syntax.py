import os

pages_dir = 'd:\\开发测试\\hub-erp-v0\\traewordp\\pages'

error_pattern1 = """function exitPage() { showConfirm("确认退出？", function(result) { if(result) { window.location.href = '../index.html'; } }); }
, 2000);
}
document.addEventListener('DOMContentLoaded', init);"""

fix_pattern1 = """function exitPage() { showConfirm("确认退出？", function(result) { if(result) { window.location.href = '../index.html'; } }); }
document.addEventListener('DOMContentLoaded', init);"""

error_pattern2 = """function exitPage() { showConfirm('确认退出？', function() { window.location.href = '../index.html'; }); }
, 2000);
}
var confirmCallback = null;
);
function closeConfirm() {
  closeConfirmModal(false);
}
function confirmOk() {
  closeConfirmModal(true);
}"""

fix_pattern2 = """function exitPage() { showConfirm('确认退出？', function() { window.location.href = '../index.html'; }); }
var confirmCallback = null;
function closeConfirm() {
  closeConfirmModal(false);
}
function confirmOk() {
  closeConfirmModal(true);
}"""

fixed_count = 0

for filename in os.listdir(pages_dir):
    if not (filename.endswith('.html') and not filename.endswith('-create.html')):
        continue
    
    filepath = os.path.join(pages_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    if error_pattern1 in content:
        content = content.replace(error_pattern1, fix_pattern1)
        changed = True
    elif error_pattern2 in content:
        content = content.replace(error_pattern2, fix_pattern2)
        changed = True
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'已修复 {filename}')
        fixed_count += 1

print(f'\n修复完成，共处理 {fixed_count} 个文件')
