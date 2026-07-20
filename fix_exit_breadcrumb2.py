import os

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
        
        if '<button class="btn btn-ghost btn-sm" onclick="exitPage()" >✖️ 退出</button>' in content:
            content = content.replace(
                '<button class="btn btn-ghost btn-sm" onclick="exitPage()" >✖️ 退出</button>',
                ''
            )
            fixed_count += 1
            print(f"已修复: {filename}")
            
        elif '<button class="btn btn-ghost btn-sm" onclick="exitPage()">✖️ 退出</button>' in content:
            content = content.replace(
                '<button class="btn btn-ghost btn-sm" onclick="exitPage()">✖️ 退出</button>',
                ''
            )
            fixed_count += 1
            print(f"已修复: {filename}")
            
        elif 'btn btn-ghost btn-sm" onclick="exitPage()' in content and '退出' in content:
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                if 'btn btn-ghost btn-sm" onclick="exitPage()' in line and '退出' in line:
                    continue
                new_lines.append(line)
            content = '\n'.join(new_lines)
            fixed_count += 1
            print(f"已修复: {filename}")
            
        if content != old_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")