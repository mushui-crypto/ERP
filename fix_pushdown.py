import os

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

files_to_fix = [
    'sales-return-create.html',
    'sales-quotation-create.html',
    'sales-outbound-create.html',
    'sales-delivery-create.html',
    'sales-contract-create.html',
    'purchase-return-create.html',
    'purchase-return-request-create.html',
    'purchase-request-create.html',
    'purchase-receive-create.html',
    'purchase-order-create.html',
    'purchase-inbound-create.html',
    'production-order-create.html',
    'production-material-request-create.html',
    'production-material-return-create.html',
    'production-inbound-create.html',
    'inventory-out-create.html',
    'inventory-in-create.html'
]

fixed_count = 0

for filename in files_to_fix:
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if "executePushDown" not in content:
            continue
            
        lines = content.split('\n')
        new_lines = []
        changed = False
        
        for line in lines:
            if "executePushDown" in line and "r.name + )" in line:
                idx = line.find("r.name + )")
                if idx != -1:
                    line = line[:idx] + "r.name + ')" + line[idx + 8:]
                    changed = True
            new_lines.append(line)
        
        if changed:
            content = '\n'.join(new_lines)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f"已修复: {filename}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")