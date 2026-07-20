import os
import re

pages_dir = 'D:\\开发测试\\hub-erp-v0\\traewordp\\pages'

create_pages = [
    'purchase-request-create.html',
    'purchase-order-create.html',
    'purchase-inbound-create.html',
    'purchase-return-create.html',
    'purchase-return-request-create.html',
    'purchase-inspect-create.html',
    'purchase-inspect-notice-create.html',
    'purchase-receive-inspect-create.html',
    'sales-order-create.html',
    'sales-contract-create.html',
    'sales-quotation-create.html',
    'sales-delivery-create.html',
    'sales-outbound-create.html',
    'sales-return-create.html',
    'sales-return-notice-create.html',
    'sales-split-delivery-create.html',
    'sales-disassembly-shipment-create.html',
    'production-order-create.html',
    'production-material-request-create.html',
    'production-material-return-create.html',
    'production-inbound-create.html',
    'production-inspect-create.html',
    'production-report-inspect-create.html',
    'inventory-in-create.html',
    'inventory-out-create.html'
]

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

def fix_create_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'<div class="doc-tabs">.*?</div>\n\n', '', content, flags=re.DOTALL)
    content = content.replace('id="tab-main" class="doc-form"', 'class="doc-form"')
    content = content.replace('<div id="tab-detail" style="display:none;">', '<div class="doc-section-title">明细信息</div>\n        <div>')
    
    if 'doc-section-title' not in content:
        content = content.replace('</style>', '''.doc-section-title { font-size: 14px; font-weight: 600; color: #333; padding: 16px 20px 12px; border-top: 1px solid #e8e8e8; margin-top: 16px; }
</style>''')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed create page: {os.path.basename(filepath)}')

def fix_list_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        '<button class="toolbar-btn primary" onclick="location.href=',
        '''<button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 批量提交</button>
        <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 批量审核</button>
        <button class="toolbar-btn" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>
        <button class="toolbar-btn primary" onclick="location.href='''
    )
    
    content = content.replace('<th>操作</th>', '')
    
    content = re.sub(r'<td>\s*<button[^>]*>查看</button>.*?</td>', '', content)
    
    content = content.replace(
        'function deleteDoc(id) {',
        '''function getSelectedIds() {
  var checkboxes = document.querySelectorAll('.data-checkbox:checked');
  return Array.from(checkboxes).map(function(cb) { return cb.value; });
}

function batchSubmit() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要提交的单据', 'warning');
    return;
  }
  showConfirm('确认提交选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'draft') {
        item.status = 'pending';
        count++;
      }
    });
    localStorage.setItem('erp_list', JSON.stringify(list));
    showToast('已提交 ' + count + ' 条单据', 'success');
    loadData();
  });
}

function batchApprove() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要审核的单据', 'warning');
    return;
  }
  showConfirm('确认审核通过选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'pending') {
        item.status = 'approved';
        count++;
      }
    });
    localStorage.setItem('erp_list', JSON.stringify(list));
    showToast('已审核通过 ' + count + ' 条单据', 'success');
    loadData();
  });
}

function batchDelete() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要删除的单据', 'warning');
    return;
  }
  showConfirm('确认删除选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_list') || '[]');
    list = list.filter(function(item) { return !ids.includes(item.id); });
    localStorage.setItem('erp_list', JSON.stringify(list));
    showToast('已删除 ' + ids.length + ' 条单据', 'success');
    loadData();
  });
}

function deleteDoc(id) {''')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed list page: {os.path.basename(filepath)}')

for page in create_pages:
    filepath = os.path.join(pages_dir, page)
    if os.path.exists(filepath):
        fix_create_page(filepath)

for page in list_pages:
    filepath = os.path.join(pages_dir, page)
    if os.path.exists(filepath):
        fix_list_page(filepath)

print('All pages fixed successfully!')
