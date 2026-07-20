#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

PAGES_DIR = r"D:\开发测试\hub-erp-v0\traewordp\pages"

LOOKUP_MODAL_CSS = '''
.lookup-modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center; }
.lookup-modal.show { display:flex; }
.lookup-dialog { background:#fff; border:1px solid #e8e8e8; border-radius:4px; width:720px; max-height:70vh; overflow:hidden; }
.lookup-header { padding:14px 20px; border-bottom:1px solid #e8e8e8; display:flex; align-items:center; justify-content:space-between; }
.lookup-title { font-size:15px; font-weight:600; color:#333; }
.lookup-close { font-size:20px; color:#666; cursor:pointer; background:none; border:none; }
.lookup-close:hover { color:#333; }
.lookup-body { padding:16px; }
.lookup-search { display:flex; gap:8px; margin-bottom:12px; }
.lookup-search input { flex:1; padding:6px 10px; border:1px solid #e8e8e8; border-radius:4px; font-size:13px; }
.lookup-search button { padding:6px 16px; background:#1890ff; color:#fff; border:none; border-radius:4px; cursor:pointer; }
.lookup-table { width:100%; border-collapse:collapse; font-size:13px; }
.lookup-table th, .lookup-table td { padding:10px 12px; text-align:left; border-bottom:1px solid #e8e8e8; }
.lookup-table th { background:#fafafa; font-weight:600; color:#333; }
.lookup-table tr:hover { background:#f5f5f5; }
.lookup-table .checkbox-cell { width:40px; }
.lookup-footer { padding:12px 20px; border-top:1px solid #e8e8e8; display:flex; justify-content:flex-end; gap:8px; }

.lookup-field { display:flex; align-items:center; }
.lookup-field input { flex:1; padding:6px 10px; border:1px solid #e8e8e8; border-radius:4px 0 0 4px; font-size:13px; }
.lookup-field button { width:28px; height:28px; border:1px solid #e8e8e8; border-left:none; border-radius:0 4px 4px 0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.lookup-field button:hover { background:#f5f5f5; }
'''

LOOKUP_MODAL_HTML = '''
<div class="lookup-modal" id="lookupModal">
  <div class="lookup-dialog">
    <div class="lookup-header">
      <div class="lookup-title" id="lookupTitle">选择</div>
      <button class="lookup-close" onclick="closeLookup()">×</button>
    </div>
    <div class="lookup-body">
      <div class="lookup-search">
        <input type="text" id="lookupKeyword" placeholder="请输入编码或名称搜索" onkeydown="if(event.key==='Enter')filterLookup()">
        <button onclick="filterLookup()">搜索</button>
      </div>
      <table class="lookup-table">
        <thead id="lookupTableHead"></thead>
        <tbody id="lookupTableBody"></tbody>
      </table>
    </div>
    <div class="lookup-footer">
      <button class="btn btn-cancel" onclick="closeLookup()">取消</button>
      <button class="btn btn-primary" onclick="confirmLookup()">确定</button>
    </div>
  </div>
</div>
'''

LOOKUP_MODAL_JS = '''
var currentLookupField = null;
var currentLookupType = null;
var lookupData = [];
var lookupColumns = [];

function openLookup(fieldId, type) {
  currentLookupField = fieldId;
  currentLookupType = type;
  
  if (type === 'org') {
    lookupColumns = ['编码', '名称', '形态', '上级组织'];
    lookupData = JSON.parse(localStorage.getItem('erp_orgs') || '[]').map(function(o) {
      return { id: o.id, code: o.code, name: o.name, form: o.form || '', parent: o.parentName || '' };
    });
    document.getElementById('lookupTitle').textContent = '选择组织';
  } else if (type === 'department') {
    lookupColumns = ['编码', '名称', '创建组织', '上级部门'];
    lookupData = JSON.parse(localStorage.getItem('erp_departments_cache') || '[]').map(function(d) {
      return { id: d.id, code: d.code, name: d.name, org: '磐枢智能制造有限公司', parent: '' };
    });
    document.getElementById('lookupTitle').textContent = '选择部门';
  } else if (type === 'employee') {
    lookupColumns = ['编号', '姓名', '所属部门', '岗位'];
    lookupData = JSON.parse(localStorage.getItem('erp_employees_cache') || '[]').map(function(e) {
      return { id: e.id, code: e.code, name: e.name, dept: e.department || '', post: '' };
    });
    document.getElementById('lookupTitle').textContent = '选择员工';
  } else if (type === 'supplier') {
    lookupColumns = ['编码', '名称', '联系人', '联系电话'];
    lookupData = JSON.parse(localStorage.getItem('erp_suppliers_cache') || '[]').map(function(s) {
      return { id: s.id, code: s.code, name: s.name, contact: '', phone: '' };
    });
    document.getElementById('lookupTitle').textContent = '选择供应商';
  } else if (type === 'customer') {
    lookupColumns = ['编码', '名称', '联系人', '联系电话'];
    lookupData = JSON.parse(localStorage.getItem('erp_customers_cache') || '[]').map(function(c) {
      return { id: c.id, code: c.code, name: c.name, contact: '', phone: '' };
    });
    document.getElementById('lookupTitle').textContent = '选择客户';
  } else if (type === 'material') {
    lookupColumns = ['物料编码', '物料名称', '规格型号', '基本单位'];
    lookupData = JSON.parse(localStorage.getItem('erp_materials_cache') || '[]').map(function(m) {
      return { id: m.id, code: m.code, name: m.name, spec: m.specification || '', unit: m.unit || '' };
    });
    document.getElementById('lookupTitle').textContent = '选择物料';
  } else if (type === 'warehouse') {
    lookupColumns = ['编码', '名称', '类型'];
    lookupData = JSON.parse(localStorage.getItem('erp_warehouses_cache') || '[]').map(function(w) {
      return { id: w.id, code: w.code, name: w.name, type: '' };
    });
    document.getElementById('lookupTitle').textContent = '选择仓库';
  }
  
  renderLookupTable(lookupData);
  document.getElementById('lookupModal').classList.add('show');
}

function closeLookup() {
  document.getElementById('lookupModal').classList.remove('show');
}

function filterLookup() {
  var keyword = document.getElementById('lookupKeyword').value.trim().toLowerCase();
  var filtered = lookupData.filter(function(item) {
    var code = item.code || '';
    var name = item.name || '';
    return code.toLowerCase().includes(keyword) || name.toLowerCase().includes(keyword);
  });
  renderLookupTable(filtered);
}

function renderLookupTable(data) {
  var head = document.getElementById('lookupTableHead');
  var body = document.getElementById('lookupTableBody');
  
  head.innerHTML = '<tr><th class="checkbox-cell"><input type="checkbox" onclick="selectAllLookup()"></th>' + lookupColumns.map(function(col) { return '<th>' + col + '</th>'; }).join('') + '</tr>';
  
  body.innerHTML = '';
  data.forEach(function(item) {
    var row = document.createElement('tr');
    row.onclick = function() { selectLookupRow(this); };
    var cells = ['<td class="checkbox-cell"><input type="checkbox" class="lookup-checkbox" value="' + item.id + '"></td>'];
    if (currentLookupType === 'org') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + item.form + '</td><td>' + item.parent + '</td>');
    } else if (currentLookupType === 'department') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + item.org + '</td><td>' + item.parent + '</td>');
    } else if (currentLookupType === 'employee') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + item.dept + '</td><td>' + item.post + '</td>');
    } else if (currentLookupType === 'supplier' || currentLookupType === 'customer') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + item.contact + '</td><td>' + item.phone + '</td>');
    } else if (currentLookupType === 'material') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + item.spec + '</td><td>' + item.unit + '</td>');
    } else if (currentLookupType === 'warehouse') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + item.type + '</td>');
    }
    row.innerHTML = cells.join('');
    body.appendChild(row);
  });
  
  if (data.length === 0) {
    body.innerHTML = '<tr><td colspan="' + (lookupColumns.length + 1) + '" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
  }
}

function selectAllLookup() {
  var master = document.querySelector('.lookup-table th input');
  var checkboxes = document.querySelectorAll('.lookup-checkbox');
  checkboxes.forEach(function(cb) { cb.checked = master.checked; });
}

function selectLookupRow(row) {
  var checkbox = row.querySelector('.lookup-checkbox');
  checkbox.checked = !checkbox.checked;
}

function confirmLookup() {
  var checkboxes = document.querySelectorAll('.lookup-checkbox:checked');
  if (checkboxes.length === 0) {
    showToast('请选择一条记录', 'warning');
    return;
  }
  
  var item = lookupData.find(function(d) { return d.id === checkboxes[0].value; });
  if (item) {
    var field = document.getElementById(currentLookupField);
    field.value = item.name;
    field.setAttribute('data-id', item.id);
    field.setAttribute('data-code', item.code);
    
    if (currentLookupType === 'material') {
      var row = field.closest('tr');
      if (row) {
        row.querySelector('.material-name').value = item.name;
        row.querySelector('.material-spec').value = item.spec || '';
        row.querySelector('.material-unit').value = item.unit || '';
      }
    }
  }
  
  closeLookup();
}
'''

def fix_list_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'lookup-modal' in content:
        return
    
    content = content.replace(
        '</style>',
        LOOKUP_MODAL_CSS + '\n</style>'
    )
    
    content = content.replace(
        '</body>',
        LOOKUP_MODAL_HTML + '\n</body>'
    )
    
    content = content.replace(
        '<script>',
        '<script>\n' + LOOKUP_MODAL_JS
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'已修复列表页: {os.path.basename(filepath)}')

def fix_create_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'lookup-modal' in content:
        return
    
    content = content.replace(
        '</style>',
        LOOKUP_MODAL_CSS + '\n</style>'
    )
    
    content = content.replace(
        '</body>',
        LOOKUP_MODAL_HTML + '\n</body>'
    )
    
    content = content.replace(
        '<script>',
        '<script>\n' + LOOKUP_MODAL_JS
    )
    
    content = content.replace(
        '<select id="orgId">\n                <option value="">请选择组织</option>\n              </select>',
        '<div class="lookup-field"><input type="text" id="orgId" readonly placeholder="请选择组织"><button onclick="openLookup(\'orgId\', \'org\')">...</button></div>'
    )
    
    content = content.replace(
        '<select id="deptId">\n                <option value="">请选择部门</option>\n              </select>',
        '<div class="lookup-field"><input type="text" id="deptId" readonly placeholder="请选择部门"><button onclick="openLookup(\'deptId\', \'department\')">...</button></div>'
    )
    
    content = content.replace(
        '<select id="applicantId">\n                <option value="">请选择申请人</option>\n              </select>',
        '<div class="lookup-field"><input type="text" id="applicantId" readonly placeholder="请选择申请人"><button onclick="openLookup(\'applicantId\', \'employee\')">...</button></div>'
    )
    
    content = content.replace(
        '<select id="requireOrgId">\n                <option value="">请选择需求组织</option>\n              </select>',
        '<div class="lookup-field"><input type="text" id="requireOrgId" readonly placeholder="请选择需求组织"><button onclick="openLookup(\'requireOrgId\', \'org\')">...</button></div>'
    )
    
    content = content.replace(
        '<select id="receiveOrgId">\n                <option value="">请选择收料组织</option>\n              </select>',
        '<div class="lookup-field"><input type="text" id="receiveOrgId" readonly placeholder="请选择收料组织"><button onclick="openLookup(\'receiveOrgId\', \'org\')">...</button></div>'
    )
    
    content = content.replace(
        '<input type="text" class="material-code" onblur="lookupMaterial(this)">',
        '<div class="lookup-field"><input type="text" class="material-code" readonly placeholder="请选择物料"><button onclick="openMaterialLookup(this)">...</button></div>'
    )
    
    content = content.replace(
        '<select class="supplier"><option value="">请选择</option></select>',
        '<div class="lookup-field"><input type="text" class="supplier" readonly placeholder="请选择供应商"><button onclick="openSupplierLookup(this)">...</button></div>'
    )
    
    content = content.replace(
        '<select class="warehouse"><option value="">请选择</option></select>',
        '<div class="lookup-field"><input type="text" class="warehouse" readonly placeholder="请选择仓库"><button onclick="openLookup(\'warehouse\', \'warehouse\')">...</button></div>'
    )
    
    content = content.replace(
        '<select class="purchaseOrg"><option value="">请选择</option></select>',
        '<div class="lookup-field"><input type="text" class="purchaseOrg" readonly placeholder="请选择采购组织"><button onclick="openLookup(\'purchaseOrg\', \'org\')">...</button></div>'
    )
    
    content = content.replace(
        '<select class="requireOrg"><option value="">请选择</option></select>',
        '<div class="lookup-field"><input type="text" class="requireOrg" readonly placeholder="请选择需求组织"><button onclick="openLookup(\'requireOrg\', \'org\')">...</button></div>'
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'已修复创建页: {os.path.basename(filepath)}')

def main():
    list_pages = [
        'purchase-request.html',
        'sales-order.html',
        'purchase-order.html',
        'sales-delivery.html',
        'sales-outbound.html',
        'purchase-inbound.html',
    ]
    
    create_pages = [
        'purchase-request-create.html',
        'sales-order-create.html',
        'purchase-order-create.html',
        'sales-delivery-create.html',
        'sales-outbound-create.html',
        'purchase-inbound-create.html',
    ]
    
    for page in list_pages:
        filepath = os.path.join(PAGES_DIR, page)
        if os.path.exists(filepath):
            fix_list_page(filepath)
    
    for page in create_pages:
        filepath = os.path.join(PAGES_DIR, page)
        if os.path.exists(filepath):
            fix_create_page(filepath)

if __name__ == '__main__':
    main()