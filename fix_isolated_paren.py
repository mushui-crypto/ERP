import os

pages_dir = 'd:\\开发测试\\hub-erp-v0\\traewordp\\pages'

error_pattern = """
);

document.addEventListener('DOMContentLoaded', init);"""

fix_pattern = """
document.addEventListener('DOMContentLoaded', init);"""

fixed_count = 0

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(pages_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if error_pattern in content:
        new_content = content.replace(error_pattern, fix_pattern)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'已修复 {filename}')
        fixed_count += 1

print(f'\n修复完成，共处理 {fixed_count} 个文件')
