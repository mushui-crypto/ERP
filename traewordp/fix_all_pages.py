import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

def fix_base_data_pages():
    base_data_pages = [
        {'file': 'base-org.html', 'title': '组织架构', 'doc_type': 'base_org'},
        {'file': 'base-department.html', 'title': '部门管理', 'doc_type': 'base_department'},
        {'file': 'base-employee.html', 'title': '员工管理', 'doc_type': 'base_employee'},
        {'file': 'base-contact.html', 'title': '联系人管理', 'doc_type': 'base_contact'},
        {'file': 'base-category.html', 'title': '分类管理', 'doc_type': 'base_category'},
        {'file': 'base-unit.html', 'title': '计量单位', 'doc_type': 'base_unit'},
        {'file': 'base-currency.html', 'title': '币别管理', 'doc_type': 'base_currency'},
        {'file': 'base-bank.html', 'title': '银行管理', 'doc_type': 'base_bank'},
        {'file': 'base-bank-account.html', 'title': '银行账户', 'doc_type': 'base_bank_account'},
        {'file': 'base-tax-type.html', 'title': '税种管理', 'doc_type': 'base_tax_type'},
        {'file': 'base-tax-rate.html', 'title': '税率管理', 'doc_type': 'base_tax_rate'},
        {'file': 'base-doc-type.html', 'title': '单据类型', 'doc_type': 'base_doc_type'},
        {'file': 'base-code-rule.html', 'title': '编码规则', 'doc_type': 'base_code_rule'},
        {'file': 'base-work-calendar.html', 'title': '工作日历', 'doc_type': 'base_work_calendar'},
        {'file': 'base-shift.html', 'title': '班次管理', 'doc_type': 'base_shift'},
        {'file': 'base-position.html', 'title': '岗位管理', 'doc_type': 'base_position'},
        {'file': 'base-salesperson.html', 'title': '销售人员', 'doc_type': 'base_salesperson'},
        {'file': 'base-sales-group.html', 'title': '销售组', 'doc_type': 'base_sales_group'},
        {'file': 'base-settlement.html', 'title': '结算方式', 'doc_type': 'base_settlement'},
        {'file': 'base-payment-term.html', 'title': '付款条件', 'doc_type': 'base_payment_term'},
        {'file': 'base-receipt-term.html', 'title': '收款条件', 'doc_type': 'base_receipt_term'},
        {'file': 'base-cost-center.html', 'title': '成本中心', 'doc_type': 'base_cost_center'},
        {'file': 'base-exchange-rate.html', 'title': '汇率管理', 'doc_type': 'base_exchange_rate'},
        {'file': 'base-inventory-category.html', 'title': '库存分类', 'doc_type': 'base_inventory_category'},
        {'file': 'base-safety-stock.html', 'title': '安全库存', 'doc_type': 'base_safety_stock'},
        {'file': 'base-unit-convert.html', 'title': '单位换算', 'doc_type': 'base_unit_convert'},
        {'file': 'master-supplier.html', 'title': '供应商管理', 'doc_type': 'master_supplier'},
    ]
    
    for config in base_data_pages:
        filepath = os.path.join(pages_dir, config['file'])
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_toolbar = '''<div class="list-action-bar">
    <button class="action-btn primary-action" onclick="openAddModal()">+ 新增</button>
    <button class="action-btn" onclick="editSelected()">编辑</button>
    <button class="action-btn danger-action" onclick="deleteSelected()">删除</button>
    <button class="action-btn success-action" onclick="auditSelected()">审核</button>
    <button class="action-btn" onclick="unAuditSelected()">反审核</button>
    <div class="action-separator"></div>
    <button class="action-btn" onclick="searchData()">查询</button>
    <button class="action-btn" onclick="refreshData()">刷新</button>
    <button class="action-btn" onclick="exportData()">导出</button>
    <button class="action-btn" onclick="importData()">导入</button>
    <button class="action-btn" onclick="openColumnSettings()">显示/隐藏</button>
  </div>'''
        
        new_toolbar = '''<div class="list-action-bar">
    <button class="action-btn primary-action" onclick="openAddModal()">+ 新增</button>
    <button class="action-btn" onclick="editSelected()">编辑</button>
    <button class="action-btn danger-action" onclick="deleteSelected()">删除</button>
    <button class="action-btn success-action" onclick="auditSelected()">审核</button>
    <button class="action-btn" onclick="unAuditSelected()">反审核</button>
    <div class="action-separator"></div>
    <button class="action-btn" onclick="searchData()">查询</button>
    <button class="action-btn" onclick="refreshData()">刷新</button>
    <button class="action-btn" onclick="openColumnSettings()">显示/隐藏</button>
    <div class="action-separator"></div>
    <button class="action-btn" onclick="exportData()">导出</button>
    <button class="action-btn" onclick="importData()">导入</button>
    <button class="action-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
  </div>'''
        
        content = content.replace(old_toolbar, new_toolbar)
        
        if 'function exitPage()' not in content:
            content = content.replace('function exportData()', 
                'function exitPage() {\n  showConfirm(\'确认退出当前页面？\', function() {\n    window.location.href = \'../index.html\';\n  });\n}\n\nfunction exportData()')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Fixed base data: {config["file"]}')

def fix_document_list_pages():
    doc_list_pages = [
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
    
    for page in doc_list_pages:
        filepath = os.path.join(pages_dir, page)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        create_page = page.replace('.html', '-create.html')
        old_toolbar = '''<div class="doc-toolbar">
        <button class="toolbar-btn primary" onclick="location.href=\'' + create_page + '\'"><span class="icon">+</span> 新增</button>
        <button class="toolbar-btn" onclick="openFilterModal()"><span class="icon">🔍</span> 过滤</button>
        <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 显示/隐藏列</button>
        <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 批量提交</button>
        <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 批量审核</button>
        <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 批量反审核</button>
        <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 批量关闭</button>
        <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 批量反关闭</button>
        <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>
        <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
      </div>'''
        
        new_toolbar = '''<div class="doc-toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn primary" onclick="location.href=\'' + create_page + '\'"><span class="icon">+</span> 新增</button>
          <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 提交</button>
          <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 审核</button>
          <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 反审核</button>
        </div>
        <div class="toolbar-group">
          <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 关闭</button>
          <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 反关闭</button>
          <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 删除</button>
        </div>
        <div class="toolbar-group">
          <button class="toolbar-btn" onclick="openAdvancedFilter()"><span class="icon">🔍</span> 过滤</button>
          <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 列设置</button>
          <button class="toolbar-btn" onclick="exportData()"><span class="icon">📤</span> 导出</button>
          <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
        </div>
      </div>'''
        
        content = content.replace(old_toolbar, new_toolbar)
        
        if 'function exportData()' not in content:
            export_js = '''
function exportData() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var headers = ['单据编号', '日期', '客户/供应商', '组织', '金额', '状态', '创建时间'];
  var csv = headers.join(',') + '\\n';
  list.forEach(function(item) {
    csv += [item.docNo || '', item.docDate || '', item.partnerName || '', item.orgName || '', item.amount || '', item.status || '', item.createdAt || ''].join(',') + '\\n';
  });
  var blob = new Blob(['\\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = ''' + '"' + page.replace('.html', '') + '_export.csv"' + ''';
  link.click();
  showToast('导出成功', 'success');
}
'''
            content = content.replace('function exitPage()', export_js + 'function exitPage()')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Fixed doc list: {page}')

def fix_purchase_request_create():
    filepath = os.path.join(pages_dir, 'purchase-request-create.html')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        '<button class="toolbar-btn" onclick="goToList()">列表</button>\n        <button class="toolbar-btn" onclick="exitDoc()">退出</button>',
        '<button class="toolbar-btn" onclick="goToList()">列表</button>\n        <button class="toolbar-btn" onclick="printDoc()"><span class="icon">🖨️</span> 打印</button>\n        <button class="toolbar-btn" onclick="exitDoc()">退出</button>'
    )
    
    content = content.replace(
        '</script>\n</body>\n</html>',
        '''<script>
function printDoc() {
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.innerHTML = '<div class="modal-dialog" style="width:400px;"><div class="modal-header"><div class="modal-title">选择打印模板</div><button class="modal-close" onclick="this.closest(\\'.modal-overlay\\').remove()">×</button></div><div class="modal-body"><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="standard" checked> 标准模板</label></div><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="detailed"> 详细模板</label></div><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="simple"> 简洁模板</label></div></div><div class="modal-footer"><button class="btn btn-default" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" onclick="confirmPrint()">确定打印</button></div></div>';
  document.body.appendChild(modal);
}

function confirmPrint() {
  var template = document.querySelector('input[name="printTemplate"]:checked').value;
  document.querySelector('.modal-overlay').remove();
  showToast('正在打印... (模板: ' + {'standard':'标准', 'detailed':'详细', 'simple':'简洁'}[template] + ')', 'info');
  setTimeout(function() { window.print(); }, 500);
}

function updateTotalAmount() {
  var rows = document.querySelectorAll('#detailBody tr');
  var total = 0;
  rows.forEach(function(row) {
    var amount = parseFloat(row.querySelector('.amount').value) || 0;
    total += amount;
  });
  var totalEl = document.getElementById('totalAmount');
  if (totalEl) totalEl.innerText = total.toFixed(2);
}
</script>
</body>
</html>'''
    )
    
    content = content.replace(
        '<tbody id="detailBody"></tbody>\n          </table>',
        '''<tbody id="detailBody"></tbody>
            <tfoot>
              <tr style="background:#fafafa;font-weight:600;">
                <td colspan="6" style="text-align:right;">合计金额</td>
                <td id="totalAmount" style="color:#f5222d;">0.00</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>'''
    )
    
    content = content.replace(
        'row.querySelector(\'.amount\').value = amount;\n    detailBody.appendChild(row);',
        'row.querySelector(\'.amount\').value = amount;\n    detailBody.appendChild(row);\n    updateTotalAmount();'
    )
    
    content = content.replace(
        'detailBody.removeChild(row);',
        'detailBody.removeChild(row);\n    updateTotalAmount();'
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Fixed purchase-request-create.html')

def fix_document_create_pages():
    create_pages = [
        'purchase-order-create.html',
        'purchase-inbound-create.html',
        'purchase-return-create.html',
        'sales-order-create.html',
        'sales-contract-create.html',
        'sales-quotation-create.html',
        'sales-delivery-create.html',
        'sales-outbound-create.html',
        'production-order-create.html',
        'production-material-request-create.html',
        'production-material-return-create.html',
        'production-inbound-create.html',
        'inventory-in-create.html',
        'inventory-out-create.html'
    ]
    
    for page in create_pages:
        filepath = os.path.join(pages_dir, page)
        if not os.path.exists(filepath):
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'printDoc' not in content:
            content = content.replace(
                '<button class="toolbar-btn" onclick="exitDoc()">退出</button>',
                '<button class="toolbar-btn" onclick="printDoc()"><span class="icon">🖨️</span> 打印</button>\n        <button class="toolbar-btn" onclick="exitDoc()">退出</button>'
            )
            
            content = content.replace(
                '</script>\n</body>\n</html>',
                '''<script>
function printDoc() {
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.innerHTML = '<div class="modal-dialog" style="width:400px;"><div class="modal-header"><div class="modal-title">选择打印模板</div><button class="modal-close" onclick="this.closest(\\'.modal-overlay\\').remove()">×</button></div><div class="modal-body"><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="standard" checked> 标准模板</label></div><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="detailed"> 详细模板</label></div><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="simple"> 简洁模板</label></div></div><div class="modal-footer"><button class="btn btn-default" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" onclick="confirmPrint()">确定打印</button></div></div>';
  document.body.appendChild(modal);
}

function confirmPrint() {
  var template = document.querySelector('input[name="printTemplate"]:checked').value;
  document.querySelector('.modal-overlay').remove();
  showToast('正在打印... (模板: ' + {'standard':'标准', 'detailed':'详细', 'simple':'简洁'}[template] + ')', 'info');
  setTimeout(function() { window.print(); }, 500);
}
</script>
</body>
</html>'''
            )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Fixed doc create: {page}')

def add_advanced_filter():
    doc_list_pages = [
        'purchase-request.html',
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
        
        if 'advancedFilterModal' not in content:
            filter_html = '''
<div class="filter-modal" id="advancedFilterModal">
  <div class="filter-dialog" style="width:700px;">
    <div class="filter-header">
      <div class="filter-title">高级过滤</div>
      <button class="filter-close" onclick="closeAdvancedFilter()">×</button>
    </div>
    <div class="filter-body">
      <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-default" onclick="addFilterRow()">+ 添加条件</button>
        <button class="btn btn-default" onclick="saveFilterScheme()">保存方案</button>
        <button class="btn btn-default" onclick="loadFilterScheme()">加载方案</button>
      </div>
      <div id="filterRows"></div>
    </div>
    <div class="filter-footer">
      <button class="btn btn-cancel" onclick="closeAdvancedFilter()">取消</button>
      <button class="btn btn-default" onclick="resetAdvancedFilter()">重置</button>
      <button class="btn btn-primary" onclick="executeAdvancedFilter()">确定</button>
    </div>
  </div>
</div>
'''
            content = content.replace('</div>\n\n<script>', filter_html + '\n</div>\n\n<script>')
            
            filter_js = '''
var filterRows = [];

function addFilterRow() {
  var container = document.getElementById('filterRows');
  var rowIndex = filterRows.length;
  var row = document.createElement('div');
  row.className = 'filter-row-item';
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.marginBottom = '12px';
  row.innerHTML = '<select onchange="updateFilterOperators(this)" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;">' +
    '<option value="docNo">单据编号</option><option value="partnerName">客户/供应商</option><option value="orgName">组织</option>' +
    '<option value="status">状态</option><option value="docDate">日期</option><option value="amount">金额</option>' +
    '</select>' +
    '<select id="op_' + rowIndex + '" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;">' +
    '<option value="eq">等于</option><option value="like">包含</option><option value="gt">大于</option><option value="lt">小于</option>' +
    '<option value="gte">大于等于</option><option value="lte">小于等于</option><option value="between">区间</option>' +
    '</select>' +
    '<input type="text" id="val_' + rowIndex + '" placeholder="请输入值" style="flex:1;padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;">' +
    '<input type="text" id="val2_' + rowIndex + '" placeholder="至" style="display:none;padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;width:100px;">' +
    '<select style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;width:80px;">' +
    '<option value="and">并且</option><option value="or">或者</option>' +
    '</select>' +
    '<button class="btn btn-danger" onclick="removeFilterRow(this)" style="padding:4px 10px;">删除</button>';
  container.appendChild(row);
  filterRows.push(row);
}

function updateFilterOperators(select) {
  var rowIndex = Array.from(select.parentElement.parentElement.children).indexOf(select.parentElement);
  var opSelect = document.getElementById('op_' + rowIndex);
  var field = select.value;
  if (field === 'status') {
    opSelect.innerHTML = '<option value="eq">等于</option>';
  } else if (field === 'docDate') {
    opSelect.innerHTML = '<option value="eq">等于</option><option value="gt">大于</option><option value="lt">小于</option><option value="between">区间</option>';
  } else if (field === 'amount') {
    opSelect.innerHTML = '<option value="eq">等于</option><option value="gt">大于</option><option value="lt">小于</option><option value="between">区间</option>';
  }
}

function removeFilterRow(btn) {
  btn.parentElement.remove();
}

function closeAdvancedFilter() {
  document.getElementById('advancedFilterModal').classList.remove('show');
}

function resetAdvancedFilter() {
  document.getElementById('filterRows').innerHTML = '';
  filterRows = [];
}

function executeAdvancedFilter() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var filtered = list;
  
  var rows = document.querySelectorAll('.filter-row-item');
  rows.forEach(function(row) {
    var field = row.querySelector('select:first-child').value;
    var op = row.querySelectorAll('select')[1].value;
    var val = row.querySelector('input:first-child').value;
    var val2 = row.querySelectorAll('input')[1] ? row.querySelectorAll('input')[1].value : '';
    
    filtered = filtered.filter(function(item) {
      var itemVal = item[field] || '';
      if (op === 'eq') return String(itemVal) === String(val);
      if (op === 'like') return String(itemVal).includes(String(val));
      if (op === 'gt') return parseFloat(itemVal) > parseFloat(val);
      if (op === 'lt') return parseFloat(itemVal) < parseFloat(val);
      if (op === 'gte') return parseFloat(itemVal) >= parseFloat(val);
      if (op === 'lte') return parseFloat(itemVal) <= parseFloat(val);
      if (op === 'between') return itemVal >= val && itemVal <= val2;
      return true;
    });
  });
  
  closeAdvancedFilter();
  renderTable(filtered);
}

function saveFilterScheme() {
  var schemeName = prompt('请输入方案名称：');
  if (!schemeName) return;
  
  var scheme = { name: schemeName, filters: [] };
  var rows = document.querySelectorAll('.filter-row-item');
  rows.forEach(function(row) {
    scheme.filters.push({
      field: row.querySelector('select:first-child').value,
      op: row.querySelectorAll('select')[1].value,
      val: row.querySelector('input:first-child').value,
      val2: row.querySelectorAll('input')[1] ? row.querySelectorAll('input')[1].value : '',
      logic: row.querySelectorAll('select')[2].value
    });
  });
  
  var schemes = JSON.parse(localStorage.getItem('filter_schemes_' + docType) || '[]');
  schemes.push(scheme);
  localStorage.setItem('filter_schemes_' + docType, JSON.stringify(schemes));
  showToast('方案保存成功', 'success');
}

function loadFilterScheme() {
  var schemes = JSON.parse(localStorage.getItem('filter_schemes_' + docType) || '[]');
  if (schemes.length === 0) {
    showToast('暂无保存的方案', 'warning');
    return;
  }
  
  var names = schemes.map(function(s) { return s.name; }).join(',');
  var selected = prompt('请选择方案：\n' + names);
  if (!selected) return;
  
  var scheme = schemes.find(function(s) { return s.name === selected; });
  if (!scheme) return;
  
  resetAdvancedFilter();
  scheme.filters.forEach(function(filter) {
    addFilterRow();
    var row = filterRows[filterRows.length - 1];
    row.querySelector('select:first-child').value = filter.field;
    row.querySelectorAll('select')[1].value = filter.op;
    row.querySelector('input:first-child').value = filter.val;
  });
  
  showToast('方案加载成功', 'success');
}
'''
            content = content.replace('document.addEventListener(\'DOMContentLoaded\', init);', filter_js + '\ndocument.addEventListener(\'DOMContentLoaded\', init);')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Added advanced filter: {page}')

fix_base_data_pages()
fix_document_list_pages()
fix_purchase_request_create()
fix_document_create_pages()
add_advanced_filter()

print('All pages fixed successfully!')
