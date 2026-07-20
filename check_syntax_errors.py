import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

errors = []

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'meta http-equiv="refresh"' in content:
            continue
            
        script_pattern = r'<script[^>]*>(.*?)</script>'
        scripts = re.findall(script_pattern, content, re.DOTALL)
        
        for script in scripts:
            if 'javascript:' in script:
                continue
                
            if re.search(r"onclick=\"[^\"]*\"[^\"]*\"", script):
                errors.append(f"{filename}: 引号嵌套错误")
                break
                
            if re.search(r"onclick='[^']*'[^']*'", script):
                errors.append(f"{filename}: 单引号嵌套错误")
                break
                
            if re.search(r"this\.closest\(\".\\\d+\"\)", script):
                errors.append(f"{filename}: 八进制转义错误")
                break
                
            if re.search(r"executePushDown\([^)]+\)", script):
                if re.search(r"executePushDown\([^)]+,\s*[^)]+\)", script):
                    pass
                else:
                    errors.append(f"{filename}: executePushDown 参数错误")
                    break
                    
    except Exception as e:
        errors.append(f"{filename}: 读取错误 - {e}")

if errors:
    print("发现语法错误:")
    for err in errors[:20]:
        print(f"  - {err}")
    print(f"\n共发现 {len(errors)} 个文件有语法错误")
else:
    print("未发现语法错误")