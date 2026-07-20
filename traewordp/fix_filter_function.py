import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

doc_list_pages = [
    'purchase-request.html',
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
    
    content = content.replace('onclick="openFilterModal()"', 'onclick="openAdvancedFilter()"')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Fixed filter function in: {page}')

print('Done!')
