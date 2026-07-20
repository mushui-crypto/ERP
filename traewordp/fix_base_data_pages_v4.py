#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

PAGES_DIR = r"D:\开发测试\hub-erp-v0\traewordp\pages"

BASE_TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<link rel="stylesheet" href="../common.css">
<script src="../common.js"></script>
<style>
.page-header {{ margin-bottom: 0; }}
.search-area {{ background: #fff; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px; }}
.search-row {{ display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }}
.search-item {{ display: flex; align-items: center; gap: 8px; }}
.search-item label {{ font-size: 13px; color: #666; }}
.search-item input, .search-item select {{ padding: 6px 10px; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 13px; }}
.search-btn {{ padding: 6px 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }}
.search-btn:hover {{ background: #40a9ff; }}
.table-wrapper {{ background: #fff; border-radius: 6px; overflow: hidden; }}
.data-table {{ width: 100%; border-collapse: collapse; }}
.data-table th, .data-table td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid #e8e8e8; font-size: 13px; }}
.data-table th {{ background: #fafafa; font-weight: 600; color: #333; }}
.data-table tr:hover {{ background: #f5f5f5; }}
.badge {{ padding: 2px 8px; border-radius: 4px; font-size: 12px; }}
.badge-success {{ background: #f6ffed; color: #52c41a; }}
.badge-warning {{ background: #fffbe6; color: #faad14; }}

.modal-overlay {{ display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:flex-start; padding-top:40px; }}
.modal-overlay.show {{ display:flex; }}
.modal-dialog {{ background:#fff; border:1px solid #e8e8e8; border-radius:4px; width:640px; max-height:85vh; overflow-y:auto; }}
.modal-header {{ display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #e8e8e8; position:sticky; top:0; background:#fff; z-index:2; }}
.modal-title {{ font-size:16px; font-weight:600; color:#333; }}
.modal-close {{ cursor:pointer; font-size:22px; color:#666; background:none; border:none; line-height:1; padding:0 4px; }}
.modal-close:hover {{ color:#f5222d; }}
.modal-body {{ padding:20px; }}
.modal-footer {{ display:flex; justify-content:flex-end; gap:8px; padding:12px 20px; border-top:1px solid #e8e8e8; }}

.modal-toolbar {{ display:flex; align-items:center; gap:0; padding:6px 20px; background:#f5f5f5; border-bottom:1px solid #e8e8e8; }}
.modal-tool-btn {{ display:flex; align-items:center; gap:4px; padding:6px 14px; border:none; background:transparent; font-size:13px; color:#333; cursor:pointer; border-radius:4px; transition:all 0.2s; white-space:nowrap; }}
.modal-tool-btn:hover {{ background:#e8e8e8; }}
.modal-tool-btn.primary {{ color:#1890ff; font-weight:500; }}
.modal-tool-btn.danger {{ color:#f5222d; }}
.modal-tool-separator {{ width:1px; height:20px; background:#e8e8e8; margin:0 4px; }}

.form-grid {{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px 16px; }}
.form-grid .form-group {{ margin-bottom:0; }}
.form-grid .full-row {{ grid-column:1/-1; }}

.column-settings-modal {{ width:400px; }}
.column-settings-list {{ max-height:300px; overflow-y:auto; }}
.column-setting-item {{ display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #f0f0f0; }}
.column-setting-item:hover {{ background:#f5f5f5; }}
.column-setting-item label {{ font-size:13px; color:#333; cursor:pointer; flex:1; }}
.column-setting-item input[type="checkbox"] {{ width:16px; height:16px; }}
</style>
</head>
<body>
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <img src="../images/logo.png" alt="磐枢工业智能平台" style="width: 100%; max-width: 200px; margin-bottom: 8px;">
    <h1 style="font-size: 16px; margin: 0;">磐枢HubPang</h1>
  </div>
  <nav class="sidebar-menu"></nav>
  <div class="sidebar-user"><div class="avatar">管理员</div></div>
</aside>
<div class="main-content" id="mainContent">
  <div class="page-header">
    <div>
      <div class="flex items-center gap-8">
        <button class="sidebar-toggle" onclick="toggleSidebar()">&#9776;</button>
        <div>
          <h2>{page_title}</h2>
          <div class="breadcrumb"><a href="../index.html">首页</a> <span>/</span> <span>基础资料</span></div>
        </div>
      </div>
    </div>
    <div class="page-actions"></div>
  </div>

  <div class="list-action-bar">
    <button class="action-btn primary-action" onclick="open{entity_name_camel}Modal('add')">+ 新增</button>
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
  </div>

  <div class="page-body">
    <div class="search-area">
      <div class="search-row">
        {search_fields}
      </div>
      <button class="search-btn" onclick="searchData()">查询</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" onclick="selectAll()"></th>
            {table_headers}
          </tr>
        </thead>
        <tbody>
          {table_body}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 新增/编辑弹窗 -->
  <div class="modal-overlay" id="{modal_id}">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title" id="{modal_id}Title">新增{entity_name}</div>
        <button class="modal-close" onclick="closeModal('{modal_id}')">×</button>
      </div>
      <div class="modal-toolbar">
        <button class="modal-tool-btn" onclick="resetForm()">↺ 重置</button>
        <button class="modal-tool-btn primary" onclick="saveItem()">✓ 保存</button>
        <button class="modal-tool-btn" onclick="submitItem()">提交</button>
        <button class="modal-tool-btn" onclick="auditItem()">审核</button>
        <button class="modal-tool-btn" onclick="unAuditItem()">反审核</button>
        <div class="modal-tool-separator"></div>
        <button class="modal-tool-btn" onclick="closeModal('{modal_id}')">关闭</button>
      </div>
      <div class="modal-body">
        <form id="{modal_id}Form">
          <input type="hidden" id="{modal_id}Id">
          <div class="form-grid">
            {form_fields}
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="closeModal('{modal_id}')">取消</button>
        <button class="btn btn-primary btn-sm" onclick="saveItem()">确认保存</button>
      </div>
    </div>
  </div>

  <!-- 列显示/隐藏设置弹窗 -->
  <div class="modal-overlay" id="columnSettingsModal">
    <div class="modal-dialog column-settings-modal">
      <div class="modal-header">
        <div class="modal-title">列显示设置</div>
        <button class="modal-close" onclick="closeModal('columnSettingsModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="column-settings-list" id="columnSettingsList">
          {column_settings}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="closeModal('columnSettingsModal')">取消</button>
        <button class="btn btn-primary btn-sm" onclick="applyColumnSettings()">应用</button>
      </div>
    </div>
  </div>
</div>
<script>
var {modal_id}Mode = 'add';
var visibleColumns = {visible_columns};

function openModal(id) {{
  document.getElementById(id).classList.add('show');
}}

function closeModal(id) {{
  document.getElementById(id).classList.remove('show');
}}

function open{entity_name_camel}Modal(mode) {{
  {modal_id}Mode = mode;
  document.getElementById('{modal_id}Title').textContent = mode === 'add' ? '新增{entity_name}' : '编辑{entity_name}';
  {reset_form_code}
  openModal('{modal_id}');
}}

function resetForm() {{
  document.getElementById('{modal_id}Form').reset();
  document.getElementById('{modal_id}Id').value = '';
}}

function validateForm() {{
  {validate_code}
  return true;
}}

function saveItem() {{
  if (!validateForm()) return;
  showToast('{entity_name}' + ({modal_id}Mode === 'add' ? '新增成功' : '编辑成功'), 'success');
  closeModal('{modal_id}');
  refreshData();
}}

function submitItem() {{
  showConfirm('确认提交审核？', 'warning', function(result) {{
    if (result) {{
      showToast('已提交审核', 'success');
      closeModal('{modal_id}');
      refreshData();
    }}
  }});
}}

function auditItem() {{
  showConfirm('确认审核通过？', 'warning', function(result) {{
    if (result) showToast('审核通过', 'success');
  }});
}}

function unAuditItem() {{
  showConfirm('确认反审核？', 'warning', function(result) {{
    if (result) showToast('反审核成功', 'success');
  }});
}}

function selectAll() {{
  var master = document.querySelector('.data-table th input');
  var checkboxes = document.querySelectorAll('.data-table tbody input[type="checkbox"]');
  checkboxes.forEach(function(cb) {{ cb.checked = master.checked; }});
}}

function getSelectedIds() {{
  var ids = [];
  document.querySelectorAll('.data-table tbody input[type="checkbox"]:checked').forEach(function(cb) {{
    ids.push(cb.value);
  }});
  return ids;
}}

function editSelected() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要编辑的{entity_name}', 'warning');
    return;
  }}
  if (ids.length > 1) {{
    showToast('只能选择一条记录进行编辑', 'warning');
    return;
  }}
  open{entity_name_camel}Modal('edit');
}}

function deleteSelected() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要删除的{entity_name}', 'warning');
    return;
  }}
  showConfirm('确认删除选中的{entity_name}？', 'error', function(result) {{
    if (result) {{
      showToast('删除成功', 'success');
      refreshData();
    }}
  }});
}}

function auditSelected() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要审核的{entity_name}', 'warning');
    return;
  }}
  showConfirm('确认审核通过？', 'warning', function(result) {{
    if (result) showToast('审核通过', 'success');
  }});
}}

function unAuditSelected() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要反审核的{entity_name}', 'warning');
    return;
  }}
  showConfirm('确认反审核？', 'warning', function(result) {{
    if (result) showToast('反审核成功', 'success');
  }});
}}

function openColumnSettings() {{
  openModal('columnSettingsModal');
}}

function applyColumnSettings() {{
  var checkboxes = document.querySelectorAll('#columnSettingsList input[type="checkbox"]');
  checkboxes.forEach(function(cb) {{
    var colIndex = parseInt(cb.value);
    var cells = document.querySelectorAll('.data-table th:nth-child(' + (colIndex + 1) + '), .data-table td:nth-child(' + (colIndex + 1) + ')');
    cells.forEach(function(cell) {{
      cell.style.display = cb.checked ? '' : 'none';
    }});
    visibleColumns[colIndex - 1] = cb.checked;
  }});
  localStorage.setItem('{local_storage_key}_visible_columns', JSON.stringify(visibleColumns));
  closeModal('columnSettingsModal');
  showToast('列设置已保存', 'success');
}}

function loadColumnSettings() {{
  var saved = localStorage.getItem('{local_storage_key}_visible_columns');
  if (saved) {{
    visibleColumns = JSON.parse(saved);
    var checkboxes = document.querySelectorAll('#columnSettingsList input[type="checkbox"]');
    checkboxes.forEach(function(cb) {{
      var colIndex = parseInt(cb.value);
      cb.checked = visibleColumns[colIndex - 1];
      if (!visibleColumns[colIndex - 1]) {{
        var cells = document.querySelectorAll('.data-table th:nth-child(' + (colIndex + 1) + '), .data-table td:nth-child(' + (colIndex + 1) + ')');
        cells.forEach(function(cell) {{
          cell.style.display = 'none';
        }});
      }}
    }});
  }}
}}

function searchData() {{
  showToast('查询成功', 'success');
}}

function refreshData() {{
  location.reload();
}}

function exportData() {{
  showToast('导出功能开发中', 'info');
}}

function importData() {{
  showToast('导入功能开发中', 'info');
}}

document.addEventListener('keydown', function(e) {{
  if (e.key === 'Escape') {{
    document.querySelectorAll('.modal-overlay.show').forEach(function(m) {{
      m.classList.remove('show');
    }});
  }}
}});

document.addEventListener('DOMContentLoaded', loadColumnSettings);
</script>
</body>
</html>
'''

def generate_search_fields(fields):
    html = ''
    for field in fields[:3]:
        label = field['label']
        html += f'<div class="search-item"><label>{label}</label><input type="text" placeholder="请输入{label}"></div>'
    html += '<div class="search-item"><label>状态</label><select><option>全部状态</option><option>已启用</option><option>未启用</option></select></div>'
    return html

def generate_table_headers(columns):
    html = ''
    for col in columns:
        html += f'<th>{col}</th>'
    return html

def generate_table_body(sample_data, columns):
    html = ''
    for row in sample_data:
        html += '<tr>'
        html += f'<td><input type="checkbox" value="{row.get("id", "")}"></td>'
        for col in columns:
            key = col.replace(' ', '').replace('/', '')
            value = row.get(key, row.get(col, ''))
            if isinstance(value, bool):
                value = '是' if value else '否'
            elif isinstance(value, int):
                value = str(value)
            html += f'<td>{value}</td>'
        html += '</tr>'
    return html

def generate_form_fields(fields):
    html = ''
    for field in fields:
        name = field['name']
        label = field['label']
        required = field.get('required', False)
        field_type = field.get('type', 'text')
        placeholder = field.get('placeholder', f'请输入{label}')
        options = field.get('options', [])
        
        required_mark = ' <span style="color:#f5222d;">*</span>' if required else ''
        
        if field_type == 'select':
            options_html = ''.join([f'<option value="{opt}">{opt}</option>' for opt in options])
            html += f'<div class="form-group"><label class="form-label">{label}{required_mark}</label><select class="form-select" id="{name}">{options_html}</select></div>'
        elif field_type == 'number':
            html += f'<div class="form-group"><label class="form-label">{label}{required_mark}</label><input type="number" class="form-input" id="{name}" placeholder="{placeholder}"></div>'
        elif field_type == 'textarea':
            html += f'<div class="form-group full-row"><label class="form-label">{label}{required_mark}</label><textarea class="form-textarea" id="{name}" placeholder="{placeholder}"></textarea></div>'
        else:
            html += f'<div class="form-group"><label class="form-label">{label}{required_mark}</label><input type="text" class="form-input" id="{name}" placeholder="{placeholder}"></div>'
    return html

def generate_reset_form_code(fields):
    code = ''
    for field in fields:
        name = field['name']
        field_type = field.get('type', 'text')
        if field_type == 'select':
            code += f"document.getElementById('{name}').selectedIndex = 0;\n"
        else:
            code += f"document.getElementById('{name}').value = '';\n"
    return code

def generate_validate_code(fields):
    code = ''
    for field in fields:
        if field.get('required', False):
            name = field['name']
            label = field['label']
            code += f"""
    var {name} = document.getElementById('{name}').value.trim();
    if (!{name}) {{
      showToast('请输入{label}', 'warning');
      document.getElementById('{name}').focus();
      return false;
    }}
"""
    return code

def generate_column_settings(columns):
    html = ''
    for i, col in enumerate(columns, start=2):
        html += f'<div class="column-setting-item"><input type="checkbox" id="col{i}" value="{i}" checked><label for="col{i}">{col}</label></div>'
    return html

def generate_visible_columns(columns):
    return '[' + ','.join(['true'] * len(columns)) + ']'

def generate_page(page_name, template):
    html = BASE_TEMPLATE.format(
        title=template['title'],
        page_title=template['page_title'],
        modal_id=template['modal_id'],
        entity_name=template['entity_name'],
        entity_name_camel=template['entity_name_camel'],
        local_storage_key=template.get('local_storage_key', page_name.replace('.html', '')),
        search_fields=generate_search_fields(template['search_fields']),
        table_headers=generate_table_headers(template['table_columns']),
        table_body=generate_table_body(template['sample_data'], template['table_columns']),
        form_fields=generate_form_fields(template['form_fields']),
        reset_form_code=generate_reset_form_code(template['form_fields']),
        validate_code=generate_validate_code(template['form_fields']),
        column_settings=generate_column_settings(template['table_columns']),
        visible_columns=generate_visible_columns(template['table_columns'])
    )
    return html

BASE_DATA_TEMPLATES = {
    'base-org.html': {
        'title': '组织架构管理 - 基础资料',
        'page_title': '组织架构管理',
        'modal_id': 'orgModal',
        'entity_name': '组织',
        'entity_name_camel': 'Org',
        'search_fields': [
            {'label': '组织编码', 'name': 'orgCode'},
            {'label': '组织名称', 'name': 'orgName'},
            {'label': '组织类型', 'name': 'orgType'},
        ],
        'table_columns': ['组织编码', '组织名称', '简称', '形态', '上级组织', '负责人', '组织状态'],
        'form_fields': [
            {'name': 'orgCode', 'label': '组织编码', 'required': True, 'type': 'text', 'placeholder': '请输入组织编码'},
            {'name': 'orgName', 'label': '组织名称', 'required': True, 'type': 'text', 'placeholder': '请输入组织名称'},
            {'name': 'orgShortName', 'label': '简称', 'required': False, 'type': 'text', 'placeholder': '请输入简称'},
            {'name': 'orgForm', 'label': '形态', 'required': True, 'type': 'select', 'options': ['集团', '公司', '部门', '车间', '班组']},
            {'name': 'orgParent', 'label': '上级组织', 'required': False, 'type': 'select', 'options': ['无', '磐枢工业集团', '磐枢智能制造有限公司']},
            {'name': 'orgContact', 'label': '联系人', 'required': False, 'type': 'text', 'placeholder': '请输入联系人'},
            {'name': 'orgAddress', 'label': '地址', 'required': False, 'type': 'text', 'placeholder': '请输入地址'},
            {'name': 'orgTel', 'label': '联系电话', 'required': False, 'type': 'text', 'placeholder': '请输入联系电话'},
            {'name': 'orgManager', 'label': '负责人', 'required': False, 'type': 'text', 'placeholder': '请输入负责人'},
            {'name': 'orgIsCalc', 'label': '是否核算', 'required': False, 'type': 'select', 'options': ['是', '否']},
            {'name': 'orgStatus', 'label': '组织状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'orgDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','组织编码': 'ORG-HQ', '组织名称': '磐枢工业集团', '简称': '磐枢集团', '形态': '集团', '上级组织': '无', '负责人': '张总', '组织状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','组织编码': 'ORG-SM', '组织名称': '磐枢智能制造有限公司', '简称': '磐枢智能', '形态': '公司', '上级组织': '磐枢工业集团', '负责人': '李总', '组织状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','组织编码': 'ORG-SM-PD', '组织名称': '生产制造部', '简称': '生产部', '形态': '部门', '上级组织': '磐枢智能制造有限公司', '负责人': '王经理', '组织状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'4','组织编码': 'ORG-SM-FA', '组织名称': '财务部', '简称': '财务部', '形态': '部门', '上级组织': '磐枢智能制造有限公司', '负责人': '赵经理', '组织状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'5','组织编码': 'ORG-SM-SD', '组织名称': '销售部', '简称': '销售部', '形态': '部门', '上级组织': '磐枢智能制造有限公司', '负责人': '钱经理', '组织状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
    'base-department.html': {
        'title': '部门管理 - 基础资料',
        'page_title': '部门管理',
        'modal_id': 'deptModal',
        'entity_name': '部门',
        'entity_name_camel': 'Dept',
        'search_fields': [
            {'label': '部门编码', 'name': 'deptCode'},
            {'label': '部门名称', 'name': 'deptName'},
            {'label': '所属组织', 'name': 'deptOrg'},
        ],
        'table_columns': ['部门编码', '部门名称', '创建组织', '使用组织', '上级部门', '部门属性', '状态'],
        'form_fields': [
            {'name': 'deptCode', 'label': '部门编码', 'required': True, 'type': 'text', 'placeholder': '请输入部门编码'},
            {'name': 'deptName', 'label': '部门名称', 'required': True, 'type': 'text', 'placeholder': '请输入部门名称'},
            {'name': 'deptCreateOrg', 'label': '创建组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'deptUseOrg', 'label': '使用组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'deptParent', 'label': '上级部门', 'required': False, 'type': 'select', 'options': ['无', '生产制造部', '财务部', '销售部']},
            {'name': 'deptProperty', 'label': '部门属性', 'required': False, 'type': 'select', 'options': ['生产', '财务', '销售', '管理', '研发']},
            {'name': 'deptStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'deptDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','部门编码': 'DEPT-PD', '部门名称': '生产制造部', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '上级部门': '无', '部门属性': '生产', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','部门编码': 'DEPT-FA', '部门名称': '财务部', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '上级部门': '无', '部门属性': '财务', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','部门编码': 'DEPT-SD', '部门名称': '销售部', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '上级部门': '无', '部门属性': '销售', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'4','部门编码': 'DEPT-PD-AS', '部门名称': '装配车间', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '上级部门': '生产制造部', '部门属性': '生产', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'5','部门编码': 'DEPT-PD-QC', '部门名称': '质检车间', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '上级部门': '生产制造部', '部门属性': '生产', '状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
    'base-employee.html': {
        'title': '员工管理 - 基础资料',
        'page_title': '员工管理',
        'modal_id': 'empModal',
        'entity_name': '员工',
        'entity_name_camel': 'Emp',
        'search_fields': [
            {'label': '员工编号', 'name': 'empCode'},
            {'label': '员工姓名', 'name': 'empName'},
            {'label': '所属部门', 'name': 'empDept'},
        ],
        'table_columns': ['员工编号', '员工姓名', '创建组织', '使用组织', '所属部门', '岗位', '移动电话', '状态'],
        'form_fields': [
            {'name': 'empCode', 'label': '员工编号', 'required': True, 'type': 'text', 'placeholder': '请输入员工编号'},
            {'name': 'empName', 'label': '员工姓名', 'required': True, 'type': 'text', 'placeholder': '请输入员工姓名'},
            {'name': 'empCreateOrg', 'label': '创建组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'empUseOrg', 'label': '使用组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'empDept', 'label': '所属部门', 'required': True, 'type': 'select', 'options': ['生产制造部', '财务部', '销售部', '装配车间', '质检车间']},
            {'name': 'empPost', 'label': '岗位', 'required': True, 'type': 'select', 'options': ['经理', '工程师', '会计', '销售', '检验员']},
            {'name': 'empMobile', 'label': '移动电话', 'required': False, 'type': 'text', 'placeholder': '请输入移动电话'},
            {'name': 'empEmail', 'label': '电子邮箱', 'required': False, 'type': 'text', 'placeholder': '请输入电子邮箱'},
            {'name': 'empAddress', 'label': '联系地址', 'required': False, 'type': 'text', 'placeholder': '请输入联系地址'},
            {'name': 'empStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['在职', '离职', '休假']},
            {'name': 'empDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','员工编号': 'EMP-001', '员工姓名': '张三', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '生产制造部', '岗位': '经理', '移动电话': '13800138001', '状态': '<span class="badge badge-success">在职</span>'},
            {'id':'2','员工编号': 'EMP-002', '员工姓名': '李四', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '生产制造部', '岗位': '工程师', '移动电话': '13800138002', '状态': '<span class="badge badge-success">在职</span>'},
            {'id':'3','员工编号': 'EMP-003', '员工姓名': '王五', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '财务部', '岗位': '会计', '移动电话': '13800138003', '状态': '<span class="badge badge-success">在职</span>'},
            {'id':'4','员工编号': 'EMP-004', '员工姓名': '赵六', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '销售部', '岗位': '销售', '移动电话': '13800138004', '状态': '<span class="badge badge-success">在职</span>'},
            {'id':'5','员工编号': 'EMP-005', '员工姓名': '钱七', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '质检车间', '岗位': '检验员', '移动电话': '13800138005', '状态': '<span class="badge badge-success">在职</span>'},
        ]
    },
    'base-position.html': {
        'title': '岗位管理 - 基础资料',
        'page_title': '岗位管理',
        'modal_id': 'posModal',
        'entity_name': '岗位',
        'entity_name_camel': 'Pos',
        'search_fields': [
            {'label': '岗位编码', 'name': 'posCode'},
            {'label': '岗位名称', 'name': 'posName'},
            {'label': '所属部门', 'name': 'posDept'},
        ],
        'table_columns': ['岗位编码', '岗位名称', '创建组织', '使用组织', '所属部门', '生效日期', '失效日期', '状态'],
        'form_fields': [
            {'name': 'posCode', 'label': '岗位编码', 'required': True, 'type': 'text', 'placeholder': '请输入岗位编码'},
            {'name': 'posName', 'label': '岗位名称', 'required': True, 'type': 'text', 'placeholder': '请输入岗位名称'},
            {'name': 'posCreateOrg', 'label': '创建组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'posUseOrg', 'label': '使用组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'posDept', 'label': '所属部门', 'required': True, 'type': 'select', 'options': ['生产制造部', '财务部', '销售部', '装配车间', '质检车间']},
            {'name': 'posEffectDate', 'label': '生效日期', 'required': True, 'type': 'text', 'placeholder': '请输入生效日期'},
            {'name': 'posLapseDate', 'label': '失效日期', 'required': True, 'type': 'text', 'placeholder': '请输入失效日期'},
            {'name': 'posStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'posDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','岗位编码': 'POS-MGR', '岗位名称': '经理', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '生产制造部', '生效日期': '2024-01-01', '失效日期': '2025-12-31', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','岗位编码': 'POS-ENG', '岗位名称': '工程师', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '生产制造部', '生效日期': '2024-01-01', '失效日期': '2025-12-31', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','岗位编码': 'POS-ACC', '岗位名称': '会计', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '财务部', '生效日期': '2024-01-01', '失效日期': '2025-12-31', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'4','岗位编码': 'POS-SAL', '岗位名称': '销售', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '销售部', '生效日期': '2024-01-01', '失效日期': '2025-12-31', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'5','岗位编码': 'POS-QC', '岗位名称': '检验员', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '所属部门': '质检车间', '生效日期': '2024-01-01', '失效日期': '2025-12-31', '状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
    'base-category.html': {
        'title': '存货类别管理 - 基础资料',
        'page_title': '存货类别管理',
        'modal_id': 'catModal',
        'entity_name': '存货类别',
        'entity_name_camel': 'Cat',
        'search_fields': [
            {'label': '类别编码', 'name': 'catCode'},
            {'label': '类别名称', 'name': 'catName'},
            {'label': '上级类别', 'name': 'catParent'},
        ],
        'table_columns': ['类别编码', '类别名称', '上级类别', '创建组织', '使用组织', '状态'],
        'form_fields': [
            {'name': 'catCode', 'label': '类别编码', 'required': True, 'type': 'text', 'placeholder': '请输入类别编码'},
            {'name': 'catName', 'label': '类别名称', 'required': True, 'type': 'text', 'placeholder': '请输入类别名称'},
            {'name': 'catCreateOrg', 'label': '创建组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'catUseOrg', 'label': '使用组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'catParent', 'label': '上级类别', 'required': False, 'type': 'select', 'options': ['无', '原材料', '半成品', '成品']},
            {'name': 'catStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'catDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','类别编码': 'CAT-RM', '类别名称': '原材料', '上级类别': '无', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','类别编码': 'CAT-SFG', '类别名称': '半成品', '上级类别': '无', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','类别编码': 'CAT-FG', '类别名称': '成品', '上级类别': '无', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'4','类别编码': 'CAT-RM-MT', '类别名称': '金属材料', '上级类别': '原材料', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'5','类别编码': 'CAT-RM-PL', '类别名称': '塑料原料', '上级类别': '原材料', '创建组织': '磐枢智能制造有限公司', '使用组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
    'base-unit.html': {
        'title': '计量单位管理 - 基础资料',
        'page_title': '计量单位管理',
        'modal_id': 'unitModal',
        'entity_name': '计量单位',
        'entity_name_camel': 'Unit',
        'search_fields': [
            {'label': '单位编码', 'name': 'unitCode'},
            {'label': '单位名称', 'name': 'unitName'},
            {'label': '所属组别', 'name': 'unitGroup'},
        ],
        'table_columns': ['单位编码', '单位名称', '所属组别', '精度', '舍入类型', '基准单位', '状态'],
        'form_fields': [
            {'name': 'unitCode', 'label': '单位编码', 'required': True, 'type': 'text', 'placeholder': '请输入单位编码'},
            {'name': 'unitName', 'label': '单位名称', 'required': True, 'type': 'text', 'placeholder': '请输入单位名称'},
            {'name': 'unitGroup', 'label': '所属组别', 'required': True, 'type': 'select', 'options': ['数量', '重量', '长度', '面积', '体积']},
            {'name': 'unitPrecision', 'label': '精度', 'required': False, 'type': 'number', 'placeholder': '请输入精度'},
            {'name': 'unitRoundType', 'label': '舍入类型', 'required': True, 'type': 'select', 'options': ['四舍五入', '向上取整', '向下取整']},
            {'name': 'unitIsBase', 'label': '基准单位', 'required': False, 'type': 'select', 'options': ['是', '否']},
            {'name': 'unitStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'unitDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','单位编码': 'UNIT-PC', '单位名称': '个', '所属组别': '数量', '精度': '0', '舍入类型': '四舍五入', '基准单位': '是', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','单位编码': 'UNIT-BOX', '单位名称': '件', '所属组别': '数量', '精度': '0', '舍入类型': '四舍五入', '基准单位': '否', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','单位编码': 'UNIT-KG', '单位名称': '千克', '所属组别': '重量', '精度': '2', '舍入类型': '四舍五入', '基准单位': '是', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'4','单位编码': 'UNIT-M', '单位名称': '米', '所属组别': '长度', '精度': '2', '舍入类型': '四舍五入', '基准单位': '是', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'5','单位编码': 'UNIT-L', '单位名称': '升', '所属组别': '体积', '精度': '2', '舍入类型': '四舍五入', '基准单位': '是', '状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
    'base-salesperson.html': {
        'title': '业务员管理 - 基础资料',
        'page_title': '业务员管理',
        'modal_id': 'salesModal',
        'entity_name': '业务员',
        'entity_name_camel': 'Sales',
        'search_fields': [
            {'label': '业务员编码', 'name': 'salesCode'},
            {'label': '业务员姓名', 'name': 'salesName'},
            {'label': '所属部门', 'name': 'salesDept'},
        ],
        'table_columns': ['业务员编码', '业务员姓名', '职员', '所属部门', '业务组织', '业务员类型', '状态'],
        'form_fields': [
            {'name': 'salesCode', 'label': '业务员编码', 'required': True, 'type': 'text', 'placeholder': '请输入业务员编码'},
            {'name': 'salesName', 'label': '业务员姓名', 'required': True, 'type': 'text', 'placeholder': '请输入业务员姓名'},
            {'name': 'salesStaff', 'label': '职员', 'required': True, 'type': 'select', 'options': ['张三', '李四', '王五', '赵六', '钱七']},
            {'name': 'salesDept', 'label': '所属部门', 'required': False, 'type': 'select', 'options': ['销售部', '生产制造部']},
            {'name': 'salesOrg', 'label': '业务组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'salesType', 'label': '业务员类型', 'required': True, 'type': 'select', 'options': ['销售', '采购', '售后']},
            {'name': 'salesStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'salesDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','业务员编码': 'SP-001', '业务员姓名': '赵销售', '职员': '赵六', '所属部门': '销售部', '业务组织': '磐枢智能制造有限公司', '业务员类型': '销售', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','业务员编码': 'SP-002', '业务员姓名': '钱销售', '职员': '钱七', '所属部门': '销售部', '业务组织': '磐枢智能制造有限公司', '业务员类型': '销售', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','业务员编码': 'SP-003', '业务员姓名': '孙销售', '职员': '孙八', '所属部门': '销售部', '业务组织': '磐枢智能制造有限公司', '业务员类型': '销售', '状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
    'base-payment-term.html': {
        'title': '付款条件管理 - 基础资料',
        'page_title': '付款条件管理',
        'modal_id': 'payModal',
        'entity_name': '付款条件',
        'entity_name_camel': 'Pay',
        'search_fields': [
            {'label': '付款条件编码', 'name': 'payCode'},
            {'label': '付款条件名称', 'name': 'payName'},
            {'label': '付款方式', 'name': 'payMethod'},
        ],
        'table_columns': ['付款条件编码', '付款条件名称', '付款方式', '到期日计算日期', '天数', '创建组织', '状态'],
        'form_fields': [
            {'name': 'payCode', 'label': '付款条件编码', 'required': True, 'type': 'text', 'placeholder': '请输入付款条件编码'},
            {'name': 'payName', 'label': '付款条件名称', 'required': True, 'type': 'text', 'placeholder': '请输入付款条件名称'},
            {'name': 'payCreateOrg', 'label': '创建组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'payUseOrg', 'label': '使用组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'payMethod', 'label': '付款方式', 'required': True, 'type': 'select', 'options': ['月结', '款到发货', '预付', '货到付款']},
            {'name': 'payDueDate', 'label': '到期日计算日期', 'required': True, 'type': 'select', 'options': ['单据日期', '审核日期', '开票日期']},
            {'name': 'payDays', 'label': '天数', 'required': False, 'type': 'number', 'placeholder': '请输入天数'},
            {'name': 'payIsInstallment', 'label': '是否分期付款', 'required': False, 'type': 'select', 'options': ['是', '否']},
            {'name': 'payStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'payDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','付款条件编码': 'PAY-001', '付款条件名称': '月结30天', '付款方式': '月结', '到期日计算日期': '单据日期', '天数': '30', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','付款条件编码': 'PAY-002', '付款条件名称': '月结60天', '付款方式': '月结', '到期日计算日期': '单据日期', '天数': '60', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','付款条件编码': 'PAY-003', '付款条件名称': '款到发货', '付款方式': '款到发货', '到期日计算日期': '单据日期', '天数': '0', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'4','付款条件编码': 'PAY-004', '付款条件名称': '预付30%', '付款方式': '预付', '到期日计算日期': '单据日期', '天数': '0', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
    'base-receipt-term.html': {
        'title': '收款条件管理 - 基础资料',
        'page_title': '收款条件管理',
        'modal_id': 'receiptModal',
        'entity_name': '收款条件',
        'entity_name_camel': 'Receipt',
        'search_fields': [
            {'label': '收款条件编码', 'name': 'receiptCode'},
            {'label': '收款条件名称', 'name': 'receiptName'},
            {'label': '收款方式', 'name': 'receiptMethod'},
        ],
        'table_columns': ['收款条件编码', '收款条件名称', '收款方式', '到期日计算日期', '天数', '创建组织', '状态'],
        'form_fields': [
            {'name': 'receiptCode', 'label': '收款条件编码', 'required': True, 'type': 'text', 'placeholder': '请输入收款条件编码'},
            {'name': 'receiptName', 'label': '收款条件名称', 'required': True, 'type': 'text', 'placeholder': '请输入收款条件名称'},
            {'name': 'receiptCreateOrg', 'label': '创建组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'receiptUseOrg', 'label': '使用组织', 'required': True, 'type': 'select', 'options': ['磐枢智能制造有限公司']},
            {'name': 'receiptMethod', 'label': '收款方式', 'required': True, 'type': 'select', 'options': ['月结', '预收', '款到发货', '货到付款']},
            {'name': 'receiptDueDate', 'label': '到期日计算日期', 'required': True, 'type': 'select', 'options': ['单据日期', '审核日期', '开票日期']},
            {'name': 'receiptDays', 'label': '天数', 'required': False, 'type': 'number', 'placeholder': '请输入天数'},
            {'name': 'receiptIsInstallment', 'label': '是否分期付款', 'required': False, 'type': 'select', 'options': ['是', '否']},
            {'name': 'receiptStatus', 'label': '状态', 'required': False, 'type': 'select', 'options': ['已启用', '未启用']},
            {'name': 'receiptDesc', 'label': '描述', 'required': False, 'type': 'textarea', 'placeholder': '请输入描述'},
        ],
        'sample_data': [
            {'id':'1','收款条件编码': 'REC-001', '收款条件名称': '月结30天', '收款方式': '月结', '到期日计算日期': '单据日期', '天数': '30', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'2','收款条件编码': 'REC-002', '收款条件名称': '月结60天', '收款方式': '月结', '到期日计算日期': '单据日期', '天数': '60', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'3','收款条件编码': 'REC-003', '收款条件名称': '预收30%', '收款方式': '预收', '到期日计算日期': '单据日期', '天数': '0', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
            {'id':'4','收款条件编码': 'REC-004', '收款条件名称': '款到发货', '收款方式': '款到发货', '到期日计算日期': '单据日期', '天数': '0', '创建组织': '磐枢智能制造有限公司', '状态': '<span class="badge badge-success">已启用</span>'},
        ]
    },
}

def main():
    for filename, template in BASE_DATA_TEMPLATES.items():
        filepath = os.path.join(PAGES_DIR, filename)
        html_content = generate_page(filename, template)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f'已生成: {filename}')

if __name__ == '__main__':
    main()