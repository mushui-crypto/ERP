import os

pages_dir = 'd:\\开发测试\\hub-erp-v0\\traewordp\\pages'

files_to_fix = [
    'sales-quotation.html',
    'sales-return.html',
    'sales-outbound.html',
    'sales-order.html',
    'sales-delivery.html',
    'sales-contract.html',
    'purchase-return.html',
    'purchase-return-request.html',
    'purchase-request.html',
    'purchase-receive.html',
    'purchase-order.html',
    'purchase-inspect.html',
    'purchase-inbound.html',
    'production-order.html',
    'production-material-return.html',
    'production-material-request.html',
    'production-inbound.html',
    'inventory-out.html',
    'inventory-in.html'
]

fixed_count = 0

for filename in files_to_fix:
    filepath = os.path.join(pages_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    
    if 'allColumns.forEach(function(col)' in content:
        content = content.replace('allColumns.forEach(function(col)', 'visibleColumns.forEach(function(col)')
        changed = True
    
    if 'allColumns.length + 1' in content:
        content = content.replace('allColumns.length + 1', 'visibleColumns.length + 1')
        changed = True
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'已修复 {filename}')
        fixed_count += 1

print(f'\n修复完成，共处理 {fixed_count} 个文件')
