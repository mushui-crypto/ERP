import os

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

issues = []

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'meta http-equiv="refresh"' in content:
            continue
            
        if 'doc-header' in content:
            if 'position:sticky' not in content and 'position: fixed' not in content:
                header_pos = content.find('<header class="doc-header"')
                body_pos = content.find('<div class="doc-body"')
                if header_pos > body_pos:
                    issues.append(f"[布局问题] {filename}: doc-header在doc-body之后")
                    
        if 'page-header' in content:
            if 'position:sticky' not in content and 'position: fixed' not in content:
                if 'btn-ghost btn-sm' in content and '退出' in content:
                    pass
                    
    except Exception as e:
        pass

print(f"共发现 {len(issues)} 个布局问题:\n")
for i, issue in enumerate(issues, 1):
    print(f"{i}. {issue}")

if len(issues) == 0:
    print("没有发现布局问题")