import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

doc_list_pages = [
    'purchase-order.html',
    'purchase-inbound.html',
    'purchase-return.html',
    'sales-order.html',
    'sales-contract.html',
    'sales-quotation.html',
    'sales-delivery.html',
    'production-order.html',
    'inventory-in.html',
    'inventory-out.html'
]

for page in doc_list_pages:
    filepath = os.path.join(pages_dir, page)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "prompt('请选择方案：\n" not in content:
        content = content.replace("prompt('请选择方案：\n", "prompt('请选择方案：\\n")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Fixed loadFilterScheme in: {page}')
    else:
        print(f'Already fixed: {page}')

print('Done!')
