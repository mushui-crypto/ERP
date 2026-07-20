import os
import re

pages_dir = 'd:\\开发测试\\hub-erp-v0\\traewordp\\pages'

doc_types = {
    'sales-quotation': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-contract': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-order': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-delivery': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-outbound': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-return': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-return-notice': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-split-delivery': {'main_field': '客户', 'person_field': '销售人员'},
    'sales-disassembly-shipment': {'main_field': '客户', 'person_field': '销售人员'},
    'purchase-request': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-order': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-receive': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-inbound': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-return': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-return-request': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-inspect': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-inspect-notice': {'main_field': '供应商', 'person_field': '采购人员'},
    'purchase-receive-inspect': {'main_field': '供应商', 'person_field': '采购人员'},
    'production-order': {'main_field': '产品编码', 'person_field': '生产部门'},
    'production-material-request': {'main_field': '生产订单', 'person_field': '领料部门'},
    'production-material-return': {'main_field': '生产订单', 'person_field': '退料部门'},
    'production-inbound': {'main_field': '生产订单', 'person_field': '生产部门'},
    'production-inspect': {'main_field': '生产订单', 'person_field': '质检人员'},
    'production-report-inspect': {'main_field': '生产订单', 'person_field': '质检人员'},
    'inventory-in': {'main_field': '仓库', 'person_field': '经办人'},
    'inventory-out': {'main_field': '仓库', 'person_field': '经办人'},
    'service-request': {'main_field': '服务类型', 'person_field': '服务人员'},
    'service-record': {'main_field': '服务类型', 'person_field': '服务人员'},
    'service-dispatch': {'main_field': '服务类型', 'person_field': '服务人员'},
    'service-return': {'main_field': '服务类型', 'person_field': '服务人员'},
    'crm-customer': {'main_field': '客户名称', 'person_field': '所属部门'},
    'hr-employee': {'main_field': '姓名', 'person_field': '部门'},
    'finance-voucher': {'main_field': '凭证类型', 'person_field': '制单人'},
    'equip-maintenance': {'main_field': '设备编号', 'person_field': '维护人员'},
    'equip-inspection': {'main_field': '设备编号', 'person_field': '检查人员'},
}

fixed_count = 0

for filename in os.listdir(pages_dir):
    if not filename.endswith('-create.html'):
        continue
    
    filepath = os.path.join(pages_dir, filename)
    doc_type_key = filename.replace('-create.html', '')
    
    if doc_type_key not in doc_types:
        print(f'跳过 {filename} - 未配置单据类型')
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "showToast('请输入日期'" in content:
        print(f'跳过 {filename} - 已包含表单验证')
        continue
    
    doc_info = doc_types[doc_type_key]
    
    validation_code = '''
  if (!document.getElementById('field_日期').value.trim()) {
    showToast('请输入日期', 'warning');
    return;
  }
  if (document.getElementById('field_''' + doc_info['main_field'] + '''') && !document.getElementById('field_''' + doc_info['main_field'] + '''').value.trim()) {
    showToast('请选择''' + doc_info['main_field'] + '''', 'warning');
    return;
  }
  if (document.getElementById('field_''' + doc_info['person_field'] + '''') && !document.getElementById('field_''' + doc_info['person_field'] + '''').value.trim()) {
    showToast('请选择''' + doc_info['person_field'] + '''', 'warning');
    return;
  }
  var detailRows = document.querySelectorAll('#detailBody tr');
  var hasValidDetail = false;
  detailRows.forEach(function(row) {
    var materialCode = row.querySelector('[data-field="物料编码"]');
    if (materialCode && materialCode.value.trim()) {
      hasValidDetail = true;
    }
  });
  if (!hasValidDetail) {
    showToast('请至少添加一条明细记录', 'warning');
    return;
  }
'''
    
    pattern = r'function saveDoc\(\)\s*{\s*logConversion\([\'"]saveDoc START[\'"],'
    replacement = 'function saveDoc() {' + validation_code + '  logConversion(\'saveDoc START\','
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'已修复 {filename}')
        fixed_count += 1
    else:
        print(f'修复失败 {filename} - 未找到匹配模式')

print(f'\n修复完成，共处理 {fixed_count} 个文件')
