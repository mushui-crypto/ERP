import os
import re

pages_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pages')

reverse_fields = ['收料数量', '检验数量', '入库数量', '未到货数量', '未入库数量', 
                  '发货数量', '出库数量', '未发货数量', '未出库数量', 
                  '领料数量', '退料数量', '未领料数量', '合格数量', '不合格数量', 
                  '未检验数量', '订单数量', '送检数量', '入库上限', '入库下限', '成品率']

lookup_fields = ['组织', '部门', '员工', '供应商', '客户', '物料', '仓库', 
                 '生产部门', '采购部门', '销售部门', '申请部门', '退货部门', '检验部门', 
                 '收货仓库', '发料仓库', '退料仓库', '入库仓库', '出库仓库', '发货仓库', 
                 '采购人员', '销售人员', '申请人', '检验人员', '收货人员', '领料人员', 
                 '退料人员', '入库人员', '出库人员', '发货人员', '产品编码', '产品名称', 
                 '产品BOM', '工艺路线']

lookup_types = {
    '组织': 'org',
    '部门': 'department',
    '员工': 'employee',
    '供应商': 'supplier',
    '客户': 'customer',
    '物料': 'material',
    '仓库': 'warehouse',
    '生产部门': 'department',
    '采购部门': 'department',
    '销售部门': 'department',
    '申请部门': 'department',
    '退货部门': 'department',
    '检验部门': 'department',
    '收货仓库': 'warehouse',
    '发料仓库': 'warehouse',
    '退料仓库': 'warehouse',
    '入库仓库': 'warehouse',
    '出库仓库': 'warehouse',
    '发货仓库': 'warehouse',
    '采购人员': 'employee',
    '销售人员': 'employee',
    '申请人': 'employee',
    '检验人员': 'employee',
    '收货人员': 'employee',
    '领料人员': 'employee',
    '退料人员': 'employee',
    '入库人员': 'employee',
    '出库人员': 'employee',
    '发货人员': 'employee',
    '产品编码': 'material',
    '产品名称': 'material',
    '产品BOM': 'material',
    '工艺路线': 'material'
}

doc_codes = [
    'purchase_request', 'purchase_order', 'purchase_receive', 'purchase_inbound',
    'purchase_return_request', 'purchase_return', 'purchase_inspect',
    'sales_quotation', 'sales_contract', 'sales_order', 'sales_delivery',
    'sales_outbound', 'sales_return', 'production_order',
    'production_material_request', 'production_material_return', 'production_inbound',
    'inventory_in', 'inventory_out'
]

doc_names = {
    'purchase_request': '采购申请单',
    'purchase_order': '采购订单',
    'purchase_receive': '收料通知单',
    'purchase_inbound': '采购入库单',
    'purchase_return_request': '采购退货申请单',
    'purchase_return': '采购退货单',
    'purchase_inspect': '检验单',
    'sales_quotation': '销售报价单',
    'sales_contract': '销售合同',
    'sales_order': '销售订单',
    'sales_delivery': '销售发货单',
    'sales_outbound': '销售出库单',
    'sales_return': '销售退货单',
    'production_order': '生产订单',
    'production_material_request': '生产领料单',
    'production_material_return': '生产退料单',
    'production_inbound': '生产入库单',
    'inventory_in': '其他入库单',
    'inventory_out': '其他出库单'
}

all_results = []

for doc_code in doc_codes:
    result = {
        'doc_code': doc_code,
        'doc_name': doc_names[doc_code],
        'errors': [],
        'warnings': []
    }
    
    create_file = doc_code.replace('_', '-') + '-create.html'
    file_path = os.path.join(pages_dir, create_file)
    
    if not os.path.exists(file_path):
        result['errors'].append(f'文件不存在: {create_file}')
        all_results.append(result)
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for field in lookup_fields:
        if f'openLookup(\'{field}\'' in content:
            expected_type = lookup_types[field]
            if f'openLookup(\'{field}\', \'{expected_type}\')' in content:
                pass
            else:
                result['errors'].append(f'弹窗调用类型错误: {field}')
        elif f'open{lookup_types[field].capitalize()}Lookup()' in content:
            result['errors'].append(f'使用了旧的弹窗函数: {field}')
        elif f'id="field_{field}"' in content:
            result['errors'].append(f'缺少弹窗按钮: {field}')
    
    for field in reverse_fields:
        if f'<label>{field}</label>' in content and f'id="field_{field}"' in content:
            if 'readonly' not in content.split(f'<label>{field}</label>')[1].split('</div>')[0]:
                result['errors'].append(f'反写字段未隐藏: {field}')
    
    if 'function openLookup(field, type)' not in content:
        result['errors'].append('缺少通用弹窗函数 openLookup')
    
    if 'currentLookupField = field' not in content:
        result['errors'].append('弹窗函数中未正确设置 currentLookupField')
    
    if 'document.getElementById(\'field_\' + currentLookupField)' not in content:
        result['errors'].append('确认弹窗时未正确回填字段')
    
    all_results.append(result)

print('=' * 80)
print('单据页面检查报告')
print('=' * 80)
print()

total_errors = 0
total_warnings = 0

for result in all_results:
    print(f"【{result['doc_name']}】")
    if result['errors']:
        for error in result['errors']:
            print(f"  ❌ {error}")
            total_errors += 1
    else:
        print(f"  ✅ 检查通过")
    if result['warnings']:
        for warning in result['warnings']:
            print(f"  ⚠️ {warning}")
            total_warnings += 1
    print()

print('=' * 80)
print(f'总计: {len(all_results)} 个单据, {total_errors} 个错误, {total_warnings} 个警告')
print('=' * 80)

if total_errors > 0:
    print('\n存在错误，请修复后重新生成页面')
else:
    print('\n所有单据页面检查通过！')
