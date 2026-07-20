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
    
    if '</div>\n\n<div class="filter-modal" id="advancedFilterModal"' not in content:
        content = content.replace('</div>\n\n<div class="filter-modal" id="advancedFilterModal"', '</div>\n</div>\n\n<div class="filter-modal" id="advancedFilterModal"')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Fixed modal structure in: {page}')
    else:
        print(f'Already fixed: {page}')

print('Done!')
