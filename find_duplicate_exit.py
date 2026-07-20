import os

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

files_with_duplicates = []

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'meta http-equiv="refresh"' in content:
            continue
            
        start_idx = content.find('<div class="page-actions">')
        if start_idx == -1:
            continue
            
        end_idx = content.find('</div>', start_idx)
        if end_idx == -1:
            continue
            
        page_actions_content = content[start_idx:end_idx]
        
        exit_count = page_actions_content.count('退出')
        
        if exit_count >= 2:
            files_with_duplicates.append(filename)
            print(f"{filename}: 发现 {exit_count} 个退出按钮")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共发现 {len(files_with_duplicates)} 个文件有重复退出按钮")