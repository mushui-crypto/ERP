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

def clean_and_fix_page(filepath):
    filename = os.path.basename(filepath)
    page_key = get_page_key(filename)
    columns = doc_columns.get(page_key, ['单据编号', '日期', '组织', '金额', '状态', '创建时间'])
    create_page = filename.replace('.html', '-create.html')
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'<script src="../common.js">.*?</script>', '<script src="../common.js"></script>', content, flags=re.DOTALL)
    content = re.sub(r'<script src="../doc-data-store.js">.*?</script>', '<script src="../doc-data-store.js"></script>', content, flags=re.DOTALL)
    
    content = re.sub(r'<div class="doc-toolbar">.*?</div>', '''<div class="doc-toolbar">
        <button class="toolbar-btn primary" onclick="location.href='''' + create_page + ''''"><span class="icon">+</span> 新增</button>
        <button class="toolbar-btn" onclick="toggleFilter()"><span class="icon">🔍</span> 过滤</button>
        <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 显示/隐藏列</button>
        <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 批量提交</button>
        <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 批量审核</button>
        <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 批量反审核</button>
        <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 批量关闭</button>
        <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 批量反关闭</button>
        <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>
        <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
      </div>''', content, flags=re.DOTALL)
    
    content = re.sub(r'<script>\s*var currentLookupField = null;', '<script>\n\nvar currentLookupField = null;', content)
    
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

function toggleFilter() {
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    filterBar.style.display = filterBar.style.display === 'none' ? 'block' : 'none';
  }
}

function batchReverseApprove() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要反审核的单据', 'warning');
    return;
  }
  showConfirm('确认反审核选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_''' + page_key + '''_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'approved') {
        item.status = 'pending';
        count++;
      }
    });
    localStorage.setItem('erp_''' + page_key + '''_list', JSON.stringify(list));
    showToast('已反审核 ' + count + ' 条单据', 'success');
    loadData();
  });
}

function batchClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要关闭的单据', 'warning');
    return;
  }
  showConfirm('确认关闭选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_''' + page_key + '''_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'approved') {
        item.status = 'closed';
        count++;
      }
    });
    localStorage.setItem('erp_''' + page_key + '''_list', JSON.stringify(list));
    showToast('已关闭 ' + count + ' 条单据', 'success');
    loadData();
  });
}

function batchReverseClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要反关闭的单据', 'warning');
    return;
  }
  showConfirm('确认反关闭选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_''' + page_key + '''_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'closed') {
        item.status = 'approved';
        count++;
      }
    });
    localStorage.setItem('erp_''' + page_key + '''_list', JSON.stringify(list));
    showToast('已反关闭 ' + count + ' 条单据', 'success');
    loadData();
  });
}'''
    
    content = content.replace('document.addEventListener(\'DOMContentLoaded\', init);', column_settings_js + '\n\ndocument.addEventListener(\'DOMContentLoaded\', init);')
    
    content = content.replace('</style>', '''
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
</style>''')
    
    content = content.replace('</body>', '''
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
</body>''')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Cleaned and fixed: {filename}')

for page in list_pages:
    filepath = os.path.join(pages_dir, page)
    if os.path.exists(filepath):
        clean_and_fix_page(filepath)

print('All pages cleaned and fixed successfully!')
