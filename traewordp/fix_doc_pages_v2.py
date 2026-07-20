#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

PAGES_DIR = r"D:\开发测试\hub-erp-v0\traewordp\pages"

def add_lookup_functionality(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'lookup-modal' in content:
        return
    
    css = '''
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
    
    modal = '''
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
    
    js = '''
var currentLookupField = null;
var currentLookupType = null;
var lookupData = [];
var lookupColumns = [];

function initLookupData() {
  if (!localStorage.getItem('erp_orgs')) {
    localStorage.setItem('erp_orgs', JSON.stringify([
      { id: 'org-001', code: 'ORG-HQ', name: '磐枢工业集团', form: '集团', parentName: '' },
      { id: 'org-002', code: 'ORG-SM', name: '磐枢智能制造有限公司', form: '公司', parentName: '磐枢工业集团' },
      { id: 'org-003', code: 'ORG-SM-PD', name: '生产制造部', form: '部门', parentName: '磐枢智能制造有限公司' },
      { id: 'org-004', code: 'ORG-SM-FA', name: '财务部', form: '部门', parentName: '磐枢智能制造有限公司' },
      { id: 'org-005', code: 'ORG-SM-SD', name: '销售部', form: '部门', parentName: '磐枢智能制造有限公司' }
    ]));
  }
  if (!localStorage.getItem('erp_departments_cache')) {
    localStorage.setItem('erp_departments_cache', JSON.stringify([
      { id: 'dept-001', code: 'DEPT-PD', name: '生产制造部', status: 1 },
      { id: 'dept-002', code: 'DEPT-FA', name: '财务部', status: 1 },
      { id: 'dept-003', code: 'DEPT-SD', name: '销售部', status: 1 },
      { id: 'dept-004', code: 'DEPT-AS', name: '装配车间', status: 1 },
      { id: 'dept-005', code: 'DEPT-QC', name: '质检车间', status: 1 }
    ]));
  }
  if (!localStorage.getItem('erp_employees_cache')) {
    localStorage.setItem('erp_employees_cache', JSON.stringify([
      { id: 'emp-001', code: 'EMP-001', name: '张三', department: '生产制造部', status: 1 },
      { id: 'emp-002', code: 'EMP-002', name: '李四', department: '生产制造部', status: 1 },
      { id: 'emp-003', code: 'EMP-003', name: '王五', department: '财务部', status: 1 },
      { id: 'emp-004', code: 'EMP-004', name: '赵六', department: '销售部', status: 1 },
      { id: 'emp-005', code: 'EMP-005', name: '钱七', department: '质检车间', status: 1 }
    ]));
  }
  if (!localStorage.getItem('erp_suppliers_cache')) {
    localStorage.setItem('erp_suppliers_cache', JSON.stringify([
      { id: 'sup-001', code: 'S-001', name: '深圳电子元器件有限公司', status: 1 },
      { id: 'sup-002', code: 'S-002', name: '杭州精密机械加工厂', status: 1 },
      { id: 'sup-003', code: 'S-003', name: '上海材料科技有限公司', status: 1 },
      { id: 'sup-004', code: 'S-004', name: '东莞五金制品厂', status: 1 }
    ]));
  }
  if (!localStorage.getItem('erp_materials_cache')) {
    localStorage.setItem('erp_materials_cache', JSON.stringify([
      { id: 'mat-001', code: 'P-001', name: '高频传感器模块', specification: 'HT-2026', unit: '个', status: 1 },
      { id: 'mat-002', code: 'P-002', name: '控制电路板', specification: 'CB-2026', unit: '块', status: 1 },
      { id: 'mat-003', code: 'P-003', name: '智能控制器', specification: 'IC-V3', unit: '台', status: 1 },
      { id: 'mat-004', code: 'P-004', name: '电源模块', specification: 'PM-500W', unit: '个', status: 1 },
      { id: 'mat-005', code: 'M-001', name: 'PCB电路板', specification: 'FR-4双层', unit: '块', status: 1 },
      { id: 'mat-006', code: 'M-002', name: '贴片电阻', specification: '10KΩ 0603', unit: '个', status: 1 },
      { id: 'mat-007', code: 'M-003', name: '贴片电容', specification: '100μF 0805', unit: '个', status: 1 },
      { id: 'mat-008', code: 'M-004', name: '螺丝', specification: 'M4x10', unit: '包', status: 1 }
    ]));
  }
  if (!localStorage.getItem('erp_warehouses_cache')) {
    localStorage.setItem('erp_warehouses_cache', JSON.stringify([
      { id: 'wh-001', code: 'WH-001', name: '成品仓', status: 1 },
      { id: 'wh-002', code: 'WH-002', name: '原料仓', status: 1 },
      { id: 'wh-003', code: 'WH-003', name: '半成品仓', status: 1 },
      { id: 'wh-004', code: 'WH-004', name: '辅料仓', status: 1 }
    ]));
  }
}

function openLookup(fieldId, type) {
  initLookupData();
  currentLookupField = fieldId;
  currentLookupType = type;
  
  if (type === 'org') {
    lookupColumns = ['编码', '名称', '形态', '上级组织'];
    lookupData = JSON.parse(localStorage.getItem('erp_orgs') || '[]');
    document.getElementById('lookupTitle').textContent = '选择组织';
  } else if (type === 'department') {
    lookupColumns = ['编码', '名称'];
    lookupData = JSON.parse(localStorage.getItem('erp_departments_cache') || '[]');
    document.getElementById('lookupTitle').textContent = '选择部门';
  } else if (type === 'employee') {
    lookupColumns = ['编号', '姓名', '所属部门'];
    lookupData = JSON.parse(localStorage.getItem('erp_employees_cache') || '[]');
    document.getElementById('lookupTitle').textContent = '选择员工';
  } else if (type === 'supplier') {
    lookupColumns = ['编码', '名称'];
    lookupData = JSON.parse(localStorage.getItem('erp_suppliers_cache') || '[]');
    document.getElementById('lookupTitle').textContent = '选择供应商';
  } else if (type === 'customer') {
    lookupColumns = ['编码', '名称'];
    lookupData = JSON.parse(localStorage.getItem('erp_customers_cache') || '[]');
    document.getElementById('lookupTitle').textContent = '选择客户';
  } else if (type === 'material') {
    lookupColumns = ['物料编码', '物料名称', '规格型号', '基本单位'];
    lookupData = JSON.parse(localStorage.getItem('erp_materials_cache') || '[]');
    document.getElementById('lookupTitle').textContent = '选择物料';
  } else if (type === 'warehouse') {
    lookupColumns = ['编码', '名称'];
    lookupData = JSON.parse(localStorage.getItem('erp_warehouses_cache') || '[]');
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
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + (item.form || '') + '</td><td>' + (item.parentName || '') + '</td>');
    } else if (currentLookupType === 'department') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td>');
    } else if (currentLookupType === 'employee') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + (item.department || '') + '</td>');
    } else if (currentLookupType === 'supplier' || currentLookupType === 'customer') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td>');
    } else if (currentLookupType === 'material') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td><td>' + (item.specification || '') + '</td><td>' + (item.unit || '') + '</td>');
    } else if (currentLookupType === 'warehouse') {
      cells.push('<td>' + item.code + '</td><td>' + item.name + '</td>');
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
    alert('请选择一条记录');
    return;
  }
  
  var item = lookupData.find(function(d) { return d.id === checkboxes[0].value; });
  if (item) {
    var field = document.getElementById(currentLookupField);
    if (!field) {
      field = document.querySelector('[data-lookup-id="' + currentLookupField + '"]');
    }
    if (field) {
      field.value = item.name;
      field.setAttribute('data-id', item.id);
      field.setAttribute('data-code', item.code);
      
      if (currentLookupType === 'material') {
        var row = field.closest('tr');
        if (row) {
          row.querySelector('.material-name').value = item.name;
          row.querySelector('.material-spec').value = item.specification || '';
          row.querySelector('.material-unit').value = item.unit || '';
        }
      }
    }
  }
  
  closeLookup();
}
'''
    
    content = content.replace('</style>', css + '\n</style>')
    content = content.replace('</body>', modal + '\n</body>')
    
    script_pos = content.find('<script>')
    if script_pos != -1:
        content = content[:script_pos + 8] + js + content[script_pos + 8:]
    
    content = content.replace(
        '<select id="orgId">',
        '<div class="lookup-field"><input type="text" id="orgId" readonly placeholder="请选择组织"><button onclick="openLookup(\'orgId\', \'org\')">...</button></div>'
    )
    content = content.replace(
        '<option value="">请选择组织</option>',
        ''
    )
    
    content = content.replace(
        '<select id="deptId">',
        '<div class="lookup-field"><input type="text" id="deptId" readonly placeholder="请选择部门"><button onclick="openLookup(\'deptId\', \'department\')">...</button></div>'
    )
    content = content.replace(
        '<option value="">请选择部门</option>',
        ''
    )
    
    content = content.replace(
        '<select id="applicantId">',
        '<div class="lookup-field"><input type="text" id="applicantId" readonly placeholder="请选择申请人"><button onclick="openLookup(\'applicantId\', \'employee\')">...</button></div>'
    )
    content = content.replace(
        '<option value="">请选择申请人</option>',
        ''
    )
    
    content = content.replace(
        '<select id="requireOrgId">',
        '<div class="lookup-field"><input type="text" id="requireOrgId" readonly placeholder="请选择需求组织"><button onclick="openLookup(\'requireOrgId\', \'org\')">...</button></div>'
    )
    content = content.replace(
        '<option value="">请选择需求组织</option>',
        ''
    )
    
    content = content.replace(
        '<select id="receiveOrgId">',
        '<div class="lookup-field"><input type="text" id="receiveOrgId" readonly placeholder="请选择收料组织"><button onclick="openLookup(\'receiveOrgId\', \'org\')">...</button></div>'
    )
    content = content.replace(
        '<option value="">请选择收料组织</option>',
        ''
    )
    
    content = content.replace(
        '<input type="text" class="material-code" onblur="lookupMaterial(this)">',
        '<div class="lookup-field"><input type="text" class="material-code" readonly placeholder="请选择物料"><button onclick="openLookup(\'materialCode\', \'material\')">...</button></div>'
    )
    
    content = content.replace(
        '<select class="supplier"><option value="">请选择</option></select>',
        '<div class="lookup-field"><input type="text" class="supplier" readonly placeholder="请选择供应商"><button onclick="openLookup(\'supplier\', \'supplier\')">...</button></div>'
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
    print(f'已修复: {os.path.basename(filepath)}')

def main():
    pages = [
        'purchase-request-create.html',
        'sales-order-create.html',
        'purchase-order-create.html',
        'sales-delivery-create.html',
        'sales-outbound-create.html',
        'purchase-inbound-create.html',
    ]
    
    for page in pages:
        filepath = os.path.join(PAGES_DIR, page)
        if os.path.exists(filepath):
            add_lookup_functionality(filepath)

if __name__ == '__main__':
    main()