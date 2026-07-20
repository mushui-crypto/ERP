import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

base_data_pages = [
    'base-department.html', 'base-employee.html', 
    'base-contact.html', 'base-category.html', 'base-unit.html',
    'base-currency.html', 'base-bank.html', 'base-bank-account.html',
    'base-tax-type.html', 'base-tax-rate.html', 'base-doc-type.html',
    'base-code-rule.html', 'base-work-calendar.html', 'base-shift.html',
    'base-position.html', 'base-salesperson.html', 'base-sales-group.html',
    'base-settlement.html', 'base-payment-term.html', 'base-receipt-term.html',
    'base-cost-center.html', 'base-exchange-rate.html', 'base-inventory-category.html',
    'base-safety-stock.html', 'base-unit-convert.html', 'master-supplier.html',
]

for page in base_data_pages:
    filepath = os.path.join(pages_dir, page)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("onclick=\"viewDetail('' + item.id + '')\"", "onclick=\"viewDetail('\\'' + item.id + '\\'')\"")
    content = content.replace("onclick=\"editDetail('' + item.id + '')\"", "onclick=\"editDetail('\\'' + item.id + '\\'')\"")
    content = content.replace("onclick=\"deleteDetail('' + item.id + '')\"", "onclick=\"deleteDetail('\\'' + item.id + '\\'')\"")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Fixed JS quote escape in: {page}')

print('Done!')
