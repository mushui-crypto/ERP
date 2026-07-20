import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

files_to_fix = [
    'base-bank-account.html',
    'base-bank.html',
    'base-category.html',
    'base-code-rule.html',
    'base-contact.html',
    'base-cost-center.html',
    'base-currency.html',
    'base-department.html',
    'base-doc-type.html',
    'base-employee.html',
    'base-exchange-rate.html',
    'base-inventory-category.html',
    'base-org.html',
    'base-payment-term.html',
    'base-position.html',
    'base-receipt-term.html',
    'base-safety-stock.html',
    'base-sales-group.html',
    'base-salesperson.html',
    'base-settlement.html',
    'base-shift.html',
    'base-tax-rate.html',
    'base-tax-type.html',
    'base-unit-convert.html',
    'base-unit.html',
    'base-work-calendar.html',
    'master-supplier.html'
]

fixed_count = 0

for filename in files_to_fix:
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'common.js' in content:
            continue
            
        content = content.replace(
            '<script src="../common.css"></script>',
            '<script src="../common.css"></script>\n    <script src="../common.js"></script>'
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        fixed_count += 1
        print(f"已添加 common.js: {filename}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

print(f"\n共修复 {fixed_count} 个文件")
