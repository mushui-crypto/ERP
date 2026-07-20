import os

pages_dir = 'D:\\开发测试\\hub-erp-v0\\traewordp\\pages'

list_pages = [
    'purchase-request.html',
    'purchase-order.html',
    'purchase-inbound.html',
    'purchase-return.html',
    'purchase-return-request.html',
    'purchase-inspect.html',
    'purchase-receive-inspect.html',
    'sales-order.html',
    'sales-contract.html',
    'sales-quotation.html',
    'sales-delivery.html',
    'sales-outbound.html',
    'sales-return.html',
    'sales-split-delivery.html',
    'production-order.html',
    'production-material-request.html',
    'production-material-return.html',
    'production-inbound.html',
    'production-inspect.html',
    'production-report-inspect.html',
    'inventory-in.html',
    'inventory-out.html'
]

for page in list_pages:
    filepath = os.path.join(pages_dir, page)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('<div class="column-modal" id="columnModal">')
    if len(parts) > 2:
        content = parts[0] + '<div class="column-modal" id="columnModal">' + parts[1]
    
    content = content.replace('</script>\n\n</script>', '</script>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Cleaned: {page}')

print('All pages cleaned!')
