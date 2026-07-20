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
    return filename.replace('.html', '')

def generate_page(filepath):
    filename = os.path.basename(filepath)
    page_key = get_page_key(filename)
    columns = doc_columns.get(page_key, ['单据编号', '日期', '组织', '金额', '状态', '创建时间'])
    create_page = filename.replace('.html', '-create.html')
    
    html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>采购申请 — 磐枢工业智能平台</title>
<link rel="stylesheet" href="../common.css">
<script src="../common.js"></script>
<script src="../doc-data-store.js"></script>
<style>
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000;justify-content:center;align-items:flex-start;padding-top:36px;opacity:1;pointer-events:none;}
.modal-overlay.show{display:flex;pointer-events:all;}
.modal-dialog{background:#fff;border:1px solid #e8e8e8;border-radius:4px;width:920px;max-width:96vw;max-height:92vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.3);}
.modal-dialog .modal-header{padding:14px 20px;border-bottom:1px solid #e8e8e8;font-weight:600;font-size:15px;color:#333;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:2;}
.modal-dialog .modal-body{padding:20px;color:#333;}
.modal-dialog .modal-footer{padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;position:sticky;bottom:0;background:#f5f5f5;}
.modal-close{cursor:pointer;color:#666;font-size:20px;line-height:1;background:none;border:none;padding:0 4px;}
.modal-close:hover{color:#333;}
.form-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 16px;margin-bottom:12px;}
.form-row .form-group{margin-bottom:0;}
.form-group{margin-bottom:12px;}
.form-group label{display:block;font-size:12px;color:#666;margin-bottom:4px;font-weight:500;}
.form-group label .required{color:#f5222d;margin-right:4px;}
.form-input,.form-select,.form-textarea{width:100%;padding:6px 10px;border:1px solid #d9d9d9;border-radius:4px;font-size:13px;color:#333;background:#fff;}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:#1890ff;outline:none;box-shadow:0 0 0 2px rgba(24,144,255,0.1);}
.form-textarea{resize:vertical;min-height:60px;}
.btn{padding:6px 16px;border:1px solid #d9d9d9;border-radius:4px;font-size:13px;cursor:pointer;}
.btn-primary{background:#1890ff;color:#fff;border:none;}
.btn-primary:hover{background:#40a9ff;}
.btn-danger{background:#f5222d;color:#fff;border:none;}
.btn-danger:hover{background:#ff4d4f;}
.btn-default{background:#fff;color:#666;}
.btn-default:hover{background:#f5f5f5;}

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

.lookup-field { display:flex; align-items:center; }
.lookup-field input { flex:1; padding:6px 10px; border:1px solid #e8e8e8; border-radius:4px 0 0 4px; font-size:13px; }
.lookup-field button { width:28px; height:28px; border:1px solid #e8e8e8; border-left:none; border-radius:0 4px 4px 0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.lookup-field button:hover { background:#f5f5f5; }

.doc-page { display:flex; height:100vh; background:#f0f2f5; }
.doc-sidebar { width:220px; background:#fff; border-right:1px solid #e8e8e8; padding:16px 0; }
.doc-sidebar-title { font-size:12px; color:#999; padding:0 16px 8px; }
.doc-sidebar-menu { list-style:none; margin:0; padding:0; }
.doc-sidebar-menu li { margin-bottom:4px; }
.doc-sidebar-menu a { display:flex; align-items:center; gap:8px; padding:8px 16px; color:#666; font-size:13px; text-decoration:none; }
.doc-sidebar-menu a:hover { background:#f5f5f5; }
.doc-sidebar-menu a.active { background:#e6f7ff; color:#1890ff; }
.doc-sidebar-menu .menu-icon { font-size:14px; }
.doc-content { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.doc-header { background:#fff; border-bottom:1px solid #e8e8e8; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; }
.doc-header-title { font-size:14px; font-weight:600; color:#333; }
.doc-header-subtitle { font-size:13px; color:#666; }
.doc-toolbar { display:flex; align-items:center; gap:8px; }
.toolbar-btn { display:flex; align-items:center; gap:4px; padding:6px 14px; border:none; background:transparent; font-size:13px; color:#333; cursor:pointer; border-radius:4px; }
.toolbar-btn:hover { background:#e8e8e8; }
.toolbar-btn.primary { color:#1890ff; }
.toolbar-btn.danger { color:#f5222d; }
.toolbar-btn.success { color:#52c41a; }
.toolbar-separator { width:1px; height:20px; background:#ddd; margin:0 4px; }
.doc-body { flex:1; overflow-y:auto; background:#f0f2f5; padding:16px; }
.doc-card { background:#fff; border-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,0.06); overflow:hidden; margin-bottom:16px; }
.filter-bar { padding:16px; border-bottom:1px solid #e8e8e8; }
.filter-row { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:12px; }
.filter-item { display:flex; flex-direction:column; min-width:160px; }
.filter-item label { font-size:12px; color:#666; margin-bottom:4px; }
.filter-item input, .filter-item select { padding:6px 10px; border:1px solid #e8e8e8; border-radius:4px; font-size:13px; width:150px; }
.filter-actions { display:flex; gap:8px; }
.table-wrapper { padding:16px; overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table th { padding:10px 12px; text-align:left; background:#fafafa; color:#666; font-weight:600; border-bottom:1px solid #d9d9d9; white-space:nowrap; font-size:12px; }
.data-table td { padding:10px 12px; border-bottom:1px solid #e8e8e8; color:#333; }
.data-table tr:hover td { background:#f5f7fa; }
.pagination { padding:12px 16px; border-top:1px solid #e8e8e8; display:flex; justify-content:center; align-items:center; gap:16px; }
.btn-cancel { background:#fff; color:#666; border:1px solid #d9d9d9; }
.btn-cancel:hover { background:#f5f5f5; }

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
</style>
</head>
<body>

<div class="doc-page">
  <aside class="doc-sidebar">
    <div class="doc-sidebar-title">业务导航</div>
    <ul class="doc-sidebar-menu">
      <li><a href="#" class="active"><span class="menu-icon">&#128203;</span> 采购申请列表</a></li>
      <li><a href="''' + create_page + '''"><span class="menu-icon">&#10010;</span> 采购申请新增</a></li>
    </ul>
  </aside>

  <div class="doc-content">
    <header class="doc-header">
      <div>
        <div class="doc-header-title">采购申请</div>
        <div class="doc-header-subtitle">管理采购申请信息</div>
      </div>
      <div class="doc-toolbar">
        <button class="toolbar-btn primary" onclick="location.href=\''''' + create_page + '''\'"><span class="icon">+</span> 新增</button>
        <button class="toolbar-btn" onclick="toggleFilter()"><span class="icon">🔍</span> 过滤</button>
        <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 显示/隐藏列</button>
        <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 批量提交</button>
        <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 批量审核</button>
        <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 批量反审核</button>
        <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 批量关闭</button>
        <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 批量反关闭</button>
        <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>
        <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
      </div>
    </header>

    <div class="doc-body">
      <div class="doc-card">
        <div class="filter-bar">
          <div class="filter-row">
            <div class="filter-item">
              <label>单据编号</label>
              <input type="text" id="filterDocNo" class="form-input" placeholder="请输入单据编号" onkeydown="if(event.key===\'Enter\')searchData()">
            </div>
            <div class="filter-item">
              <label>客户/供应商</label>
              <input type="text" id="filterPartner" class="form-input" placeholder="请输入客户或供应商" onkeydown="if(event.key===\'Enter\')searchData()">
            </div>
            <div class="filter-item">
              <label>状态</label>
              <select id="filterStatus" class="form-select" onchange="searchData()">
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="pending">待审核</option>
                <option value="approved">已审核</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
            <div class="filter-item">
              <label>日期范围</label>
              <input type="date" id="filterStartDate" class="form-input">
              <input type="date" id="filterEndDate" class="form-input">
            </div>
          </div>
          <div class="filter-actions">
            <button class="btn btn-primary" onclick="searchData()">查询</button>
            <button class="btn btn-default" onclick="resetFilter()">重置</button>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" onclick="selectAll()"></th>
              <th>单据编号</th>
              <th>日期</th>
              <th>客户/供应商</th>
              <th>组织</th>
              <th>金额</th>
              <th>状态</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody id="dataBody">
          </tbody>
        </table>

        <div class="pagination">
          <button class="btn btn-default" onclick="prevPage()" id="prevBtn">上一页</button>
          <span id="pageInfo">第 1 页 / 共 0 页</span>
          <button class="btn btn-default" onclick="nextPage()" id="nextBtn">下一页</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="lookup-modal" id="lookupModal">
  <div class="lookup-dialog">
    <div class="lookup-header">
      <div class="lookup-title" id="lookupTitle">选择</div>
      <button class="lookup-close" onclick="closeLookup()">×</button>
    </div>
    <div class="lookup-body">
      <div class="lookup-search">
        <input type="text" id="lookupKeyword" placeholder="请输入编码或名称搜索" onkeydown="if(event.key===\'Enter\')filterLookup()">
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

<script>
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

var currentPage = 1;
var pageSize = 10;
var totalPages = 0;

function init() {
  loadData();
}

function loadData() {
  var list = JSON.parse(localStorage.getItem('erp_''' + page_key + '''_list') || '[]');
  
  if (list.length === 0) {
    list = [
      { id: '1', docNo: 'PR2607150001', docDate: '2026-07-15', partnerName: '', orgName: '磐枢工业集团(总部)', amount: 10000.00, status: 'approved', createdAt: new Date().toISOString() },
      { id: '2', docNo: 'PR2607140002', docDate: '2026-07-14', partnerName: '', orgName: '苏州智能制造有限公司', amount: 5000.00, status: 'pending', createdAt: new Date().toISOString() }
    ];
  }
  
  renderTable(list);
}

function renderTable(list) {
  var tbody = document.getElementById('dataBody');
  tbody.innerHTML = '';
  
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
    return;
  }
  
  var statusMap = { 'draft': '草稿', 'pending': '待审核', 'approved': '已审核', 'closed': '已关闭' };
  var statusColorMap = { 'draft': '#999', 'pending': '#faad14', 'approved': '#52c41a', 'closed': '#666' };
  
  list.forEach(function(item) {
    var row = document.createElement('tr');
    row.onclick = function(e) {
      if (!e.target.closest('input')) {
        var cb = this.querySelector('.data-checkbox');
        cb.checked = !cb.checked;
      }
    };
    row.innerHTML = '<td><input type="checkbox" class="data-checkbox" value="' + item.id + '"></td><td>' + item.docNo + '</td><td>' + item.docDate + '</td><td>' + (item.partnerName || '') + '</td><td>' + (item.orgName || '') + '</td><td style="color:#f5222d;font-weight:600;text-align:right;">' + parseFloat(item.amount || item.totalAmount || 0).toFixed(2) + '</td><td><span style="color:' + (statusColorMap[item.status] || '#666') + ';">' + (statusMap[item.status] || item.status) + '</span></td><td>' + (item.createdAt ? new Date(item.createdAt).toLocaleString() : '') + '</td>';
    tbody.appendChild(row);
  });
}

function searchData() {
  loadData();
}

function resetFilter() {
  document.getElementById('filterDocNo').value = '';
  document.getElementById('filterPartner').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterStartDate').value = '';
  document.getElementById('filterEndDate').value = '';
  loadData();
}

function selectAll() {
  var master = document.querySelector('.data-table th input');
  var checkboxes = document.querySelectorAll('.data-checkbox');
  checkboxes.forEach(function(cb) { cb.checked = master.checked; });
}

function getSelectedIds() {
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
    var list = JSON.parse(localStorage.getItem('erp_''' + page_key + '''_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'draft') {
        item.status = 'pending';
        count++;
      }
    });
    localStorage.setItem('erp_''' + page_key + '''_list', JSON.stringify(list));
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
    var list = JSON.parse(localStorage.getItem('erp_''' + page_key + '''_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'pending') {
        item.status = 'approved';
        count++;
      }
    });
    localStorage.setItem('erp_''' + page_key + '''_list', JSON.stringify(list));
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
    var list = JSON.parse(localStorage.getItem('erp_''' + page_key + '''_list') || '[]');
    list = list.filter(function(item) { return !ids.includes(item.id); });
    localStorage.setItem('erp_''' + page_key + '''_list', JSON.stringify(list));
    showToast('已删除 ' + ids.length + ' 条单据', 'success');
    loadData();
  });
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadData();
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    loadData();
  }
}

function showToast(message, type) {
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  var icons = { success: '✓', warning: '⚠️', error: '✗', info: 'ℹ️' };
  var titles = { success: '成功', warning: '警告', error: '错误', info: '提示' };
  toast.innerHTML = '<div class="toast-icon">' + icons[type] + '</div><div class="toast-content"><div class="toast-title">' + titles[type] + '</div><div class="toast-message">' + message + '</div></div><div class="toast-close" onclick="this.parentElement.remove()">×</div>';
  toast.style.background = '#fff';
  toast.style.borderLeft = '4px solid ' + (type === 'success' ? '#52c41a' : type === 'warning' ? '#faad14' : type === 'error' ? '#f5222d' : '#1890ff');
  toast.style.color = '#333';
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

function showConfirm(message, onConfirm) {
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.innerHTML = '<div class="modal-dialog"><div class="modal-header"><span>确认操作</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div><div class="modal-body">' + message + '</div><div class="modal-footer"><button class="btn btn-default" onclick="this.closest('.modal-overlay').remove()">取消</button><button class="btn btn-primary" onclick="onConfirm(); this.closest('.modal-overlay').remove()">确定</button></div></div>';
  document.body.appendChild(modal);
}

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
}

document.addEventListener('DOMContentLoaded', init);
</script>

</body>
</html>'''
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Generated: {filename}')

for page in list_pages:
    filepath = os.path.join(pages_dir, page)
    if os.path.exists(filepath):
        generate_page(filepath)

print('All pages regenerated successfully!')
