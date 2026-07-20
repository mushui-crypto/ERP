import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

base_data_pages = [
    {'file': 'base-org.html', 'title': '组织架构', 'doc_type': 'base_org', 'columns': ['组织编码', '组织名称', '组织类型', '负责人', '状态', '创建时间']},
    {'file': 'base-department.html', 'title': '部门管理', 'doc_type': 'base_department', 'columns': ['部门编码', '部门名称', '所属组织', '负责人', '状态', '创建时间']},
    {'file': 'base-employee.html', 'title': '员工管理', 'doc_type': 'base_employee', 'columns': ['员工编码', '姓名', '部门', '岗位', '状态', '入职时间']},
    {'file': 'base-contact.html', 'title': '联系人管理', 'doc_type': 'base_contact', 'columns': ['联系人编码', '姓名', '所属单位', '电话', '状态', '创建时间']},
    {'file': 'base-category.html', 'title': '分类管理', 'doc_type': 'base_category', 'columns': ['分类编码', '分类名称', '上级分类', '排序', '状态', '创建时间']},
    {'file': 'base-unit.html', 'title': '计量单位', 'doc_type': 'base_unit', 'columns': ['单位编码', '单位名称', '单位类型', '换算系数', '状态', '创建时间']},
    {'file': 'base-currency.html', 'title': '币别管理', 'doc_type': 'base_currency', 'columns': ['币别编码', '币别名称', '符号', '汇率', '状态', '创建时间']},
    {'file': 'base-bank.html', 'title': '银行管理', 'doc_type': 'base_bank', 'columns': ['银行编码', '银行名称', '状态', '创建时间']},
    {'file': 'base-bank-account.html', 'title': '银行账户', 'doc_type': 'base_bank_account', 'columns': ['账户编码', '账户名称', '银行', '账号', '状态', '创建时间']},
    {'file': 'base-tax-type.html', 'title': '税种管理', 'doc_type': 'base_tax_type', 'columns': ['税种编码', '税种名称', '税率', '状态', '创建时间']},
    {'file': 'base-tax-rate.html', 'title': '税率管理', 'doc_type': 'base_tax_rate', 'columns': ['税率编码', '税率名称', '税种', '税率值', '状态', '生效日期']},
    {'file': 'base-doc-type.html', 'title': '单据类型', 'doc_type': 'base_doc_type', 'columns': ['单据类型编码', '单据类型名称', '业务模块', '状态', '创建时间']},
    {'file': 'base-code-rule.html', 'title': '编码规则', 'doc_type': 'base_code_rule', 'columns': ['规则编码', '规则名称', '前缀', '编号长度', '状态', '创建时间']},
    {'file': 'base-work-calendar.html', 'title': '工作日历', 'doc_type': 'base_work_calendar', 'columns': ['日历编码', '日历名称', '年度', '状态', '创建时间']},
    {'file': 'base-shift.html', 'title': '班次管理', 'doc_type': 'base_shift', 'columns': ['班次编码', '班次名称', '上班时间', '下班时间', '状态', '创建时间']},
    {'file': 'base-position.html', 'title': '岗位管理', 'doc_type': 'base_position', 'columns': ['岗位编码', '岗位名称', '所属部门', '级别', '状态', '创建时间']},
    {'file': 'base-salesperson.html', 'title': '销售人员', 'doc_type': 'base_salesperson', 'columns': ['人员编码', '姓名', '所属部门', '销售组', '状态', '创建时间']},
    {'file': 'base-sales-group.html', 'title': '销售组', 'doc_type': 'base_sales_group', 'columns': ['销售组编码', '销售组名称', '负责人', '状态', '创建时间']},
    {'file': 'base-settlement.html', 'title': '结算方式', 'doc_type': 'base_settlement', 'columns': ['结算编码', '结算名称', '结算类型', '状态', '创建时间']},
    {'file': 'base-payment-term.html', 'title': '付款条件', 'doc_type': 'base_payment_term', 'columns': ['条件编码', '条件名称', '付款天数', '折扣', '状态', '创建时间']},
    {'file': 'base-receipt-term.html', 'title': '收款条件', 'doc_type': 'base_receipt_term', 'columns': ['条件编码', '条件名称', '收款天数', '折扣', '状态', '创建时间']},
    {'file': 'base-cost-center.html', 'title': '成本中心', 'doc_type': 'base_cost_center', 'columns': ['成本中心编码', '成本中心名称', '所属组织', '状态', '创建时间']},
    {'file': 'base-exchange-rate.html', 'title': '汇率管理', 'doc_type': 'base_exchange_rate', 'columns': ['源币别', '目标币别', '汇率', '生效日期', '状态']},
    {'file': 'base-inventory-category.html', 'title': '库存分类', 'doc_type': 'base_inventory_category', 'columns': ['分类编码', '分类名称', '上级分类', '状态', '创建时间']},
    {'file': 'base-safety-stock.html', 'title': '安全库存', 'doc_type': 'base_safety_stock', 'columns': ['物料编码', '物料名称', '仓库', '安全库存', '最低库存', '最高库存']},
    {'file': 'base-unit-convert.html', 'title': '单位换算', 'doc_type': 'base_unit_convert', 'columns': ['源单位', '目标单位', '换算系数', '状态', '创建时间']},
    {'file': 'master-supplier.html', 'title': '供应商管理', 'doc_type': 'master_supplier', 'columns': ['供应商编码', '供应商名称', '联系人', '电话', '地址', '状态', '创建时间']},
]

def generate_base_data_page(config):
    columns_str = ', '.join(f'"{c}"' for c in config['columns'])
    code_prefix = config['doc_type'].upper()[:3]
    title_cn = config['title']
    doc_type = config['doc_type']
    
    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_cn} - 基础资料</title>
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
.badge-danger {{ background: #fff2f0; color: #f5222d; }}

.modal-overlay {{ display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:flex-start; padding-top:40px; }}
.modal-overlay.show {{ display:flex; }}
.modal-dialog {{ background:#fff; border:1px solid #e8e8e8; border-radius:4px; width:640px; max-height:85vh; overflow-y:auto; }}
.modal-header {{ display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #e8e8e8; position:sticky; top:0; background:#fff; z-index:2; }}
.modal-title {{ font-size:16px; font-weight:600; color:#333; }}
.modal-close {{ cursor:pointer; font-size:22px; color:#666; background:none; border:none; line-height:1; padding:0 4px; }}
.modal-close:hover {{ color:#f5222d; }}
.modal-body {{ padding:20px; }}
.modal-footer {{ display:flex; justify-content:flex-end; gap:8px; padding:12px 20px; border-top:1px solid #e8e8e8; }}

.form-grid {{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px 16px; }}
.form-grid .form-group {{ margin-bottom:0; }}
.form-grid .full-row {{ grid-column:1/-1; }}

.column-settings-modal {{ width:400px; }}
.column-settings-list {{ max-height:300px; overflow-y:auto; }}
.column-setting-item {{ display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #f0f0f0; }}
.column-setting-item:hover {{ background:#f5f5f5; }}
.column-setting-item label {{ font-size:13px; color:#333; cursor:pointer; flex:1; }}
.column-setting-item input[type="checkbox"] {{ width:16px; height:16px; }}

.btn {{ padding:6px 16px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; cursor:pointer; }}
.btn-primary {{ background:#1890ff; color:#fff; border:none; }}
.btn-primary:hover {{ background:#40a9ff; }}
.btn-danger {{ background:#f5222d; color:#fff; border:none; }}
.btn-danger:hover {{ background:#ff4d4f; }}
.btn-default {{ background:#fff; color:#666; }}
.btn-default:hover {{ background:#f5f5f5; }}

.pagination {{ padding:16px; display:flex; justify-content:center; align-items:center; gap:16px; border-top:1px solid #e8e8e8; }}
.pagination span {{ font-size:13px; color:#666; }}
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
          <h2>{title_cn}</h2>
          <div class="breadcrumb"><a href="../index.html">首页</a> <span>/</span> <span>基础资料</span></div>
        </div>
      </div>
    </div>
    <div class="page-actions"></div>
  </div>

  <div class="list-action-bar">
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
  </div>

  <div class="page-body">
    <div class="search-area">
      <div class="search-row">
        <div class="search-item"><label>编码</label><input type="text" id="filterCode" placeholder="请输入编码"></div>
        <div class="search-item"><label>名称</label><input type="text" id="filterName" placeholder="请输入名称"></div>
        <div class="search-item"><label>状态</label><select id="filterStatus"><option value="">全部状态</option><option value="active">已启用</option><option value="inactive">未启用</option><option value="pending">待审核</option><option value="approved">已审核</option></select></div>
      </div>
      <button class="search-btn" onclick="searchData()">查询</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" onclick="selectAll()"></th>
            <th>编码</th>
            <th>名称</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="dataBody"></tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="btn btn-default" onclick="prevPage()" id="prevBtn">上一页</button>
      <span id="pageInfo">第 1 页 / 共 0 页</span>
      <button class="btn btn-default" onclick="nextPage()" id="nextBtn">下一页</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="columnModal">
  <div class="modal-dialog column-settings-modal">
    <div class="modal-header">
      <div class="modal-title">列设置</div>
      <button class="modal-close" onclick="closeColumnSettings()">×</button>
    </div>
    <div class="modal-body column-settings-list" id="columnCheckboxes"></div>
    <div class="modal-footer">
      <button class="btn btn-default" onclick="closeColumnSettings()">取消</button>
      <button class="btn btn-primary" onclick="saveColumnSettings()">确定</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="addModal">
  <div class="modal-dialog">
    <div class="modal-header">
      <div class="modal-title" id="modalTitle">新增{title_cn}</div>
      <button class="modal-close" onclick="closeAddModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><label>编码</label><input type="text" id="formCode" class="form-input" placeholder="请输入编码"></div>
        <div class="form-group"><label>名称</label><input type="text" id="formName" class="form-input" placeholder="请输入名称"></div>
        <div class="form-group"><label>状态</label><select id="formStatus" class="form-select"><option value="active">已启用</option><option value="inactive">未启用</option></select></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-default" onclick="closeAddModal()">取消</button>
      <button class="btn btn-primary" onclick="saveData()">保存</button>
    </div>
  </div>
</div>

<script>
var currentPage = 1;
var pageSize = 10;
var totalPages = 0;
var docType = '{doc_type}';
var currentColumns = [{columns_str}];
var visibleColumns = JSON.parse(localStorage.getItem('visible_columns_' + docType) || '["编码", "名称", "状态", "创建时间"]');
var editingId = null;

function init() {{
  loadData();
}}

function loadData() {{
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  
  if (list.length === 0) {{
    var now = new Date().toISOString();
    list = [
      {{ id: '1', code: '{code_prefix}-001', name: '测试{title_cn}1', status: 'active', createdAt: now }},
      {{ id: '2', code: '{code_prefix}-002', name: '测试{title_cn}2', status: 'pending', createdAt: now }},
      {{ id: '3', code: '{code_prefix}-003', name: '测试{title_cn}3', status: 'approved', createdAt: now }}
    ];
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
  }}
  
  renderTable(list);
}}

function renderTable(list) {{
  var tbody = document.getElementById('dataBody');
  tbody.innerHTML = '';
  
  if (list.length === 0) {{
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
    return;
  }}
  
  var statusMap = {{ 'active': '已启用', 'inactive': '未启用', 'pending': '待审核', 'approved': '已审核' }};
  var statusClassMap = {{ 'active': 'badge-success', 'inactive': 'badge-warning', 'pending': 'badge-warning', 'approved': 'badge-success' }};
  
  list.forEach(function(item) {{
    var row = document.createElement('tr');
    row.innerHTML = '<td><input type="checkbox" class="data-checkbox" value="' + item.id + '"></td>' +
                    '<td>' + (item.code || '') + '</td>' +
                    '<td>' + (item.name || '') + '</td>' +
                    '<td><span class="badge ' + (statusClassMap[item.status] || '') + '">' + (statusMap[item.status] || item.status) + '</span></td>' +
                    '<td>' + (item.createdAt ? new Date(item.createdAt).toLocaleString() : '') + '</td>' +
                    '<td><button class="action-btn view" onclick="viewDetail(\'' + item.id + '\')">查看</button> ' +
                    '<button class="action-btn edit" onclick="editDetail(\'' + item.id + '\')">编辑</button> ' +
                    '<button class="action-btn delete" onclick="deleteDetail(\'' + item.id + '\')">删除</button></td>';
    tbody.appendChild(row);
  }});
}}

function searchData() {{
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var filterCode = document.getElementById('filterCode').value || '';
  var filterName = document.getElementById('filterName').value || '';
  var filterStatus = document.getElementById('filterStatus').value || '';
  
  var filtered = list.filter(function(item) {{
    if (filterCode && !item.code.includes(filterCode)) return false;
    if (filterName && !item.name.includes(filterName)) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  }});
  
  renderTable(filtered);
}}

function refreshData() {{
  loadData();
}}

function selectAll() {{
  var master = document.querySelector('.data-table th input');
  var checkboxes = document.querySelectorAll('.data-checkbox');
  checkboxes.forEach(function(cb) {{ cb.checked = master.checked; }});
}}

function getSelectedIds() {{
  var checkboxes = document.querySelectorAll('.data-checkbox:checked');
  return Array.from(checkboxes).map(function(cb) {{ return cb.value; }});
}}

function openAddModal() {{
  editingId = null;
  document.getElementById('modalTitle').innerText = '新增{title_cn}';
  document.getElementById('formCode').value = '';
  document.getElementById('formName').value = '';
  document.getElementById('formStatus').value = 'active';
  document.getElementById('addModal').classList.add('show');
}}

function closeAddModal() {{
  document.getElementById('addModal').classList.remove('show');
}}

function saveData() {{
  var code = document.getElementById('formCode').value;
  var name = document.getElementById('formName').value;
  var status = document.getElementById('formStatus').value;
  
  if (!code) {{ showToast('请输入编码', 'warning'); return; }}
  if (!name) {{ showToast('请输入名称', 'warning'); return; }}
  
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  
  if (editingId) {{
    list.forEach(function(item) {{
      if (item.id === editingId) {{
        item.code = code;
        item.name = name;
        item.status = status;
      }}
    }});
    showToast('编辑成功', 'success');
  }} else {{
    var newId = Date.now().toString();
    list.push({{ id: newId, code: code, name: name, status: status, createdAt: new Date().toISOString() }});
    showToast('新增成功', 'success');
  }}
  
  localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
  closeAddModal();
  loadData();
}}

function viewDetail(id) {{
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var item = list.find(function(i) {{ return i.id === id; }});
  if (item) {{
    showToast('查看: ' + item.name, 'info');
  }}
}}

function editDetail(id) {{
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var item = list.find(function(i) {{ return i.id === id; }});
  if (item) {{
    editingId = id;
    document.getElementById('modalTitle').innerText = '编辑{title_cn}';
    document.getElementById('formCode').value = item.code || '';
    document.getElementById('formName').value = item.name || '';
    document.getElementById('formStatus').value = item.status || 'active';
    document.getElementById('addModal').classList.add('show');
  }}
}}

function deleteDetail(id) {{
  showConfirm('确认删除此记录？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list = list.filter(function(item) {{ return item.id !== id; }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('删除成功', 'success');
    loadData();
  }});
}}

function editSelected() {{
  var ids = getSelectedIds();
  if (ids.length !== 1) {{
    showToast('请选择一条记录进行编辑', 'warning');
    return;
  }}
  editDetail(ids[0]);
}}

function deleteSelected() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要删除的记录', 'warning');
    return;
  }}
  showConfirm('确认删除选中的 ' + ids.length + ' 条记录？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list = list.filter(function(item) {{ return !ids.includes(item.id); }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已删除 ' + ids.length + ' 条记录', 'success');
    loadData();
  }});
}}

function auditSelected() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要审核的记录', 'warning');
    return;
  }}
  showConfirm('确认审核选中的 ' + ids.length + ' 条记录？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    var count = 0;
    list.forEach(function(item) {{
      if (ids.includes(item.id) && item.status === 'pending') {{
        item.status = 'approved';
        count++;
      }}
    }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已审核 ' + count + ' 条记录', 'success');
    loadData();
  }});
}}

function unAuditSelected() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要反审核的记录', 'warning');
    return;
  }}
  showConfirm('确认反审核选中的 ' + ids.length + ' 条记录？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    var count = 0;
    list.forEach(function(item) {{
      if (ids.includes(item.id) && item.status === 'approved') {{
        item.status = 'pending';
        count++;
      }}
    }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已反审核 ' + count + ' 条记录', 'success');
    loadData();
  }});
}}

function exportData() {{
  showToast('导出功能开发中', 'info');
}}

function importData() {{
  showToast('导入功能开发中', 'info');
}}

function openColumnSettings() {{
  var container = document.getElementById('columnCheckboxes');
  container.innerHTML = '';
  
  currentColumns.forEach(function(col) {{
    var item = document.createElement('div');
    item.className = 'column-setting-item';
    var checked = visibleColumns.includes(col) ? 'checked' : '';
    item.innerHTML = '<input type="checkbox" ' + checked + ' value="' + col + '" onchange="toggleColumn(this)">' +
                     '<label>' + col + '</label>';
    container.appendChild(item);
  }});
  
  document.getElementById('columnModal').classList.add('show');
}}

function closeColumnSettings() {{
  document.getElementById('columnModal').classList.remove('show');
}}

function toggleColumn(checkbox) {{
  var col = checkbox.value;
  if (checkbox.checked) {{
    if (!visibleColumns.includes(col)) {{ visibleColumns.push(col); }}
  }} else {{
    visibleColumns = visibleColumns.filter(function(c) {{ return c !== col; }});
  }}
}}

function saveColumnSettings() {{
  localStorage.setItem('visible_columns_' + docType, JSON.stringify(visibleColumns));
  showToast('列设置已保存', 'success');
  closeColumnSettings();
}}

function prevPage() {{
  if (currentPage > 1) {{ currentPage--; loadData(); }}
}}

function nextPage() {{
  if (currentPage < totalPages) {{ currentPage++; loadData(); }}
}}

document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>'''
    return html

for config in base_data_pages:
    filepath = os.path.join(pages_dir, config['file'])
    html = generate_base_data_page(config)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Generated: {config["file"]}')

print('All base data pages generated successfully!')
