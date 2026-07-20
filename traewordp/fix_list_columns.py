import os
import re

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

doc_columns = {
    'purchase-request': ['单据编号', '日期', '客户/供应商', '组织', '金额', '状态', '创建时间', '申请类型', '单据类型', '申请部门', '申请人', '币别', '需求组织', '采购组', '收料组织', '验收方式', '价外税', '汇率类型', '备注'],
    'purchase-order': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '订单类型', '采购组织', '收料组织', '币别', '税率', '付款条件', '交货日期', '备注'],
    'purchase-inbound': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '入库类型', '仓库', '收料组织', '验收方式', '备注'],
    'purchase-return': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '退货类型', '仓库', '退货原因', '备注'],
    'purchase-return-request': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '退货类型', '仓库', '退货原因', '备注'],
    'purchase-inspect': ['单据编号', '日期', '供应商', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注'],
    'purchase-receive-inspect': ['单据编号', '日期', '供应商', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注'],
    'sales-order': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '订单类型', '销售组织', '发货组织', '币别', '税率', '付款条件', '交货日期', '备注'],
    'sales-contract': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '合同类型', '销售组织', '币别', '签订日期', '有效期至', '备注'],
    'sales-quotation': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '报价类型', '销售组织', '币别', '有效期至', '备注'],
    'sales-delivery': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '发货类型', '仓库', '发货组织', '备注'],
    'sales-outbound': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '出库类型', '仓库', '发货组织', '备注'],
    'sales-return': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '退货类型', '仓库', '退货原因', '备注'],
    'sales-split-delivery': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '发货类型', '仓库', '备注'],
    'production-order': ['单据编号', '日期', '组织', '状态', '创建时间', '生产类型', '产品编码', '产品名称', '生产数量', '计划开工', '计划完工', '备注'],
    'production-material-request': ['单据编号', '日期', '组织', '状态', '创建时间', '领料类型', '仓库', '生产订单', '备注'],
    'production-material-return': ['单据编号', '日期', '组织', '状态', '创建时间', '退料类型', '仓库', '生产订单', '备注'],
    'production-inbound': ['单据编号', '日期', '组织', '状态', '创建时间', '入库类型', '仓库', '生产订单', '备注'],
    'production-inspect': ['单据编号', '日期', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注'],
    'production-report-inspect': ['单据编号', '日期', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注'],
    'inventory-in': ['单据编号', '日期', '组织', '金额', '状态', '创建时间', '入库类型', '仓库', '备注'],
    'inventory-out': ['单据编号', '日期', '组织', '金额', '状态', '创建时间', '出库类型', '仓库', '备注'],
}

def get_page_key(filename):
    name = filename.replace('.html', '')
    return name

column_settings_html = '''
<div class="column-modal" id="columnModal">
  <div class="column-dialog">
    <div class="column-header">
      <div class="column-title">列设置</div>
      <button class="column-close" onclick="closeColumnSettings()">×</button>
    </div>
    <div class="column-body">
      <div id="columnCheckboxes"></div>
    </div>
    <div class="column-footer">
      <button class="btn btn-cancel" onclick="closeColumnSettings()">取消</button>
      <button class="btn btn-primary" onclick="saveColumnSettings()">确定</button>
    </div>
  </div>
</div>
'''

column_css = '''
.column-modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:2000; justify-content:center; align-items:center; }
.column-modal.show { display:flex; }
.column-dialog { background:#fff; border:1px solid #e8e8e8; border-radius:4px; width:480px; max-height:60vh; overflow:hidden; }
.column-header { padding:14px 20px; border-bottom:1px solid #e8e8e8; display:flex; align-items:center; justify-content:space-between; }
.column-title { font-size:15px; font-weight:600; color:#333; }
.column-close { font-size:20px; color:#666; cursor:pointer; background:none; border:none; }
.column-close:hover { color:#333; }
.column-body { padding:16px; overflow-y:auto; }
.column-footer { padding:12px 20px; border-top:1px solid #e8e8e8; display:flex; justify-content:flex-end; gap:8px; }
.column-item { display:flex; align-items:center; gap:8px; padding:6px 0; }
.column-item label { font-size:13px; color:#333; cursor:pointer; }
.column-item input[type="checkbox"] { width:16px; height:16px; }
'''

def fix_list_page(filepath):
    filename = os.path.basename(filepath)
    page_key = get_page_key(filename)
    columns = doc_columns.get(page_key, ['单据编号', '日期', '组织', '金额', '状态', '创建时间'])
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        '<button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>\n      </div>',
        '<button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>\n        <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>\n      </div>'
    )
    
    if 'column-modal' not in content:
        content = content.replace('</style>', column_css + '\n</style>')
        content = content.replace('</body>', column_settings_html + '\n</body>')
    
    content = re.sub(r'function openColumnSettings\(\)\s*\{\s*showToast\(.*?\);\s*\}', '', content)
    
    column_settings_js = '''
var currentColumns = ''' + str(columns) + ''';
var visibleColumns = JSON.parse(localStorage.getItem('visible_columns_''' + page_key + '''') || '["单据编号", "日期", "组织", "金额", "状态", "创建时间"]');

function openColumnSettings() {
  var container = document.getElementById('columnCheckboxes');
  container.innerHTML = '';
  
  currentColumns.forEach(function(col) {
    var item = document.createElement('div');
    item.className = 'column-item';
    var checked = visibleColumns.includes(col) ? 'checked' : '';
    item.innerHTML = '<input type="checkbox" ' + checked + ' value="' + col + '" onchange="toggleColumn(this)">' +
                     '<label>' + col + '</label>';
    container.appendChild(item);
  });
  
  document.getElementById('columnModal').classList.add('show');
}

function closeColumnSettings() {
  document.getElementById('columnModal').classList.remove('show');
}

function toggleColumn(checkbox) {
  var col = checkbox.value;
  if (checkbox.checked) {
    if (!visibleColumns.includes(col)) {
      visibleColumns.push(col);
    }
  } else {
    visibleColumns = visibleColumns.filter(function(c) { return c !== col; });
  }
}

function saveColumnSettings() {
  localStorage.setItem('visible_columns_''' + page_key + '''', JSON.stringify(visibleColumns));
  showToast('列设置已保存', 'success');
  closeColumnSettings();
  loadData();
}

function exitPage() {
  showConfirm('确认退出当前页面？', function() {
    window.location.href = '../index.html';
  });
}
'''
    
    if 'function exitPage()' not in content:
        content = content.replace('</script>', column_settings_js + '\n</script>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed list page: {filename}')

for page in list_pages:
    filepath = os.path.join(pages_dir, page)
    if os.path.exists(filepath):
        fix_list_page(filepath)

print('All list pages fixed successfully!')
