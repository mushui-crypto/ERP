import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

all_pages = [
    'base-org.html', 'base-department.html', 'base-employee.html', 
    'base-contact.html', 'base-category.html', 'base-unit.html',
    'base-currency.html', 'base-bank.html', 'base-bank-account.html',
    'base-tax-type.html', 'base-tax-rate.html', 'base-doc-type.html',
    'base-code-rule.html', 'base-work-calendar.html', 'base-shift.html',
    'base-position.html', 'base-salesperson.html', 'base-sales-group.html',
    'base-settlement.html', 'base-payment-term.html', 'base-receipt-term.html',
    'base-cost-center.html', 'base-exchange-rate.html', 'base-inventory-category.html',
    'base-safety-stock.html', 'base-unit-convert.html', 'master-supplier.html',
    'purchase-request.html', 'purchase-order.html', 'purchase-inbound.html',
    'purchase-return.html', 'purchase-return-request.html', 'purchase-inspect.html',
    'purchase-receive-inspect.html', 'sales-order.html', 'sales-contract.html',
    'sales-quotation.html', 'sales-delivery.html', 'sales-outbound.html',
    'sales-return.html', 'sales-split-delivery.html', 'production-order.html',
    'production-material-request.html', 'production-material-return.html',
    'production-inbound.html', 'production-inspect.html', 'production-report-inspect.html',
    'inventory-in.html', 'inventory-out.html'
]

for page in all_pages:
    filepath = os.path.join(pages_dir, page)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        "function exitPage() {\n  showConfirm('确认退出当前页面？', 'warning', function(result) {\n    if (result) window.location.href = '../index.html';\n  });\n}",
        "function exitPage() {\n  if (confirm('确认退出当前页面？')) {\n    window.location.href = '../index.html';\n  }\n}"
    )
    
    content = content.replace(
        "function exitDoc() {\n  showConfirm('确认退出当前单据编辑？', 'warning', function(result) {\n    if (!result) return;\n    var listPage = window.location.pathname.replace('-create.html', '.html');\n    window.location.href = listPage;\n  });\n}",
        "function exitDoc() {\n  if (confirm('确认退出当前单据编辑？')) {\n    var listPage = window.location.pathname.replace('-create.html', '.html');\n    window.location.href = listPage;\n  }\n}"
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Fixed exit button in: {page}')

print('Done!')
