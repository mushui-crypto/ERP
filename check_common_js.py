import os

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

has_common = []
no_common = []

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'meta http-equiv="refresh"' in content:
            continue
            
        if 'common.js' in content:
            has_common.append(filename)
        else:
            no_common.append(filename)
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"引入了 common.js 的文件: {len(has_common)}")
print(f"\n没有引入 common.js 的文件: {len(no_common)}")
for f in no_common:
    print(f"  {f}")
