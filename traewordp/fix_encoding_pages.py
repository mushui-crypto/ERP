import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

def regenerate_sales_quotation():
    html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>销售报价 — 磐枢工业智能平台</title>
<link rel="stylesheet" href="../common.css">
<style>
.page-header { margin-bottom: 16px; }
.main-content { margin-left: 220px; padding: 20px; }
.doc-toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.toolbar-btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer; font-size: 13px; }
.toolbar-btn:hover { background: #f5f5f5; }
.toolbar-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.toolbar-btn.danger { background: #f5222d; color: #fff; border-color: #f5222d; }
.filter-area { background: #fff; padding: 16px; border-radius: 6px; margin-bottom: 16px; }
.table-wrapper { background: #fff; border-radius: 6px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e8e8e8; }
.data-table th { background: #fafafa; font-weight: 600; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.badge-success { background: #f6ffed; color: #52c41a; }
.badge-warning { background: #fffbe6; color: #faad14; }
.badge-danger { background: #fff2f0; color: #f5222d; }
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center; }
.modal-overlay.show { display:flex; }
.modal-dialog { background:#fff; border-radius:6px; width:600px; padding:20px; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.modal-title { font-size:16px; font-weight:600; }
.modal-close { font-size:20px; cursor:pointer; color:#666; }
.toast { position:fixed; top:20px; right:20px; padding:12px 20px; border-radius:4px; color:#fff; font-size:13px; z-index:9999; }
.toast-success { background:#52c41a; }
.toast-warning { background:#faad14; }
</style>
</head>
<body>
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <img src="../images/logo.png" alt="磐枢工业智能平台" style="width: 100%; max-width: 200px;">
    <h1>磐枢HubPang</h1>
  </div>
  <nav class="sidebar-menu"></nav>
</aside>
<div class="main-content">
  <div class="page-header">
    <h2>销售报价</h2>
    <div class="breadcrumb"><a href="../index.html">首页</a> / 销售管理</div>
  </div>
  <div class="doc-toolbar">
    <button class="toolbar-btn primary" onclick="location.href='sales-quotation-create.html'"><span class="icon">+</span> 新增</button>
    <button class="toolbar-btn" onclick="openFilterModal()"><span class="icon">🔍</span> 过滤</button>
    <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 列设置</button>
    <div style="width:1px;background:#e8e8e8;margin:0 8px;"></div>
    <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 提交</button>
    <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 审核</button>
    <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 反审核</button>
    <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 关闭</button>
    <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 反关闭</button>
    <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 删除</button>
    <div style="width:1px;background:#e8e8e8;margin:0 8px;"></div>
    <button class="toolbar-btn" onclick="exportData()"><span class="icon">📤</span> 导出</button>
    <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
  </div>
  <div class="filter-area">
    <input type="text" id="filterDocNo" placeholder="单据编号" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;margin-right:8px;">
    <input type="text" id="filterPartner" placeholder="客户" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;margin-right:8px;">
    <select id="filterStatus" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;margin-right:8px;">
      <option value="">全部状态</option><option value="draft">草稿</option><option value="submitted">待审核</option><option value="approved">已审核</option><option value="closed">已关闭</option>
    </select>
    <button onclick="searchData()" style="padding:6px 16px;background:#1890ff;color:#fff;border:none;border-radius:4px;cursor:pointer;">查询</button>
    <button onclick="refreshData()" style="padding:6px 16px;background:#fff;color:#666;border:1px solid #d9d9d9;border-radius:4px;cursor:pointer;">刷新</button>
  </div>
  <div class="table-wrapper">
    <table class="data-table">
      <thead><tr><th><input type="checkbox" onclick="selectAll()"></th><th>单据编号</th><th>客户</th><th>日期</th><th>金额</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
      <tbody id="dataBody"></tbody>
    </table>
  </div>
</div>
<div class="modal-overlay" id="columnModal">
  <div class="modal-dialog">
    <div class="modal-header"><div class="modal-title">列设置</div><span class="modal-close" onclick="closeColumnSettings()">×</span></div>
    <div id="columnCheckboxes"></div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
      <button class="toolbar-btn" onclick="closeColumnSettings()">取消</button>
      <button class="toolbar-btn primary" onclick="saveColumnSettings()">确定</button>
    </div>
  </div>
</div>
<script>
var docType = 'sales_quotation';
var visibleColumns = ['单据编号', '客户', '日期', '金额', '状态', '创建时间'];

function init() { loadData(); }
function loadData() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  if (list.length === 0) {
    var now = new Date().toISOString();
    list = [{ id: '1', docNo: 'SQ202607160001', partnerName: '上海宏远电子科技有限公司', docDate: '2026-07-16', amount: 36160, status: 'approved', createdAt: now },
            { id: '2', docNo: 'SQ202607160003', partnerName: '上海宏远电子科技有限公司', docDate: '2026-07-16', amount: 36160, status: 'approved', createdAt: now }];
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
  }
  renderTable(list);
}
function renderTable(list) {
  var tbody = document.getElementById('dataBody');
  tbody.innerHTML = '';
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">暂无数据</td></tr>'; return; }
  var statusMap = { 'draft': '草稿', 'submitted': '待审核', 'approved': '已审核', 'closed': '已关闭' };
  var statusClassMap = { 'draft': 'badge-warning', 'submitted': 'badge-warning', 'approved': 'badge-success', 'closed': 'badge-danger' };
  list.forEach(function(item) {
    var row = document.createElement('tr');
    row.innerHTML = '<td><input type="checkbox" class="data-checkbox" value="' + item.id + '"></td>' +
                    '<td><a href="sales-quotation-create.html?id=' + item.id + '">' + item.docNo + '</a></td>' +
                    '<td>' + (item.partnerName || '') + '</td>' +
                    '<td>' + (item.docDate || '') + '</td>' +
                    '<td>' + (item.amount || 0) + '</td>' +
                    '<td><span class="badge ' + statusClassMap[item.status] + '">' + statusMap[item.status] + '</span></td>' +
                    '<td>' + (item.createdAt ? new Date(item.createdAt).toLocaleString() : '') + '</td>' +
                    '<td><button onclick="viewDetail(\'' + item.id + '\')">查看</button> <button onclick="deleteDetail(\'' + item.id + '\')">删除</button></td>';
    tbody.appendChild(row);
  });
}
function searchData() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var filtered = list.filter(function(item) {
    if (document.getElementById('filterDocNo').value && !item.docNo.includes(document.getElementById('filterDocNo').value)) return false;
    if (document.getElementById('filterPartner').value && !item.partnerName.includes(document.getElementById('filterPartner').value)) return false;
    if (document.getElementById('filterStatus').value && item.status !== document.getElementById('filterStatus').value) return false;
    return true;
  });
  renderTable(filtered);
}
function refreshData() { loadData(); }
function selectAll() {
  var master = document.querySelector('.data-table th input');
  document.querySelectorAll('.data-checkbox').forEach(function(cb) { cb.checked = master.checked; });
}
function getSelectedIds() {
  return Array.from(document.querySelectorAll('.data-checkbox:checked')).map(function(cb) { return cb.value; });
}
function openColumnSettings() {
  var container = document.getElementById('columnCheckboxes');
  container.innerHTML = '';
  ['单据编号', '客户', '日期', '金额', '状态', '创建时间', '币别', '汇率'].forEach(function(col) {
    var item = document.createElement('div');
    item.style.marginBottom = '8px';
    var checked = visibleColumns.includes(col) ? 'checked' : '';
    item.innerHTML = '<input type="checkbox" ' + checked + ' value="' + col + '" onchange="toggleColumn(this)"> ' + col;
    container.appendChild(item);
  });
  document.getElementById('columnModal').classList.add('show');
}
function closeColumnSettings() { document.getElementById('columnModal').classList.remove('show'); }
function toggleColumn(cb) {
  var idx = visibleColumns.indexOf(cb.value);
  if (cb.checked && idx === -1) visibleColumns.push(cb.value);
  else if (!cb.checked && idx !== -1) visibleColumns.splice(idx, 1);
}
function saveColumnSettings() {
  localStorage.setItem('visible_columns_' + docType, JSON.stringify(visibleColumns));
  showToast('列设置已保存', 'success');
  closeColumnSettings();
  loadData();
}
function openFilterModal() { showToast('高级过滤功能开发中', 'info'); }
function viewDetail(id) { location.href = 'sales-quotation-create.html?id=' + id; }
function deleteDetail(id) {
  if (confirm('确认删除此单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list = list.filter(function(item) { return item.id !== id; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('删除成功', 'success');
    loadData();
  }
}
function batchSubmit() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要提交的单据', 'warning'); return; }
  if (confirm('确认提交选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'draft') item.status = 'submitted'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已提交 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchApprove() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要审核的单据', 'warning'); return; }
  if (confirm('确认审核选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'submitted') item.status = 'approved'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已审核 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchReverseApprove() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要反审核的单据', 'warning'); return; }
  if (confirm('确认反审核选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'approved') item.status = 'submitted'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已反审核 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要关闭的单据', 'warning'); return; }
  if (confirm('确认关闭选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'approved') item.status = 'closed'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已关闭 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchReverseClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要反关闭的单据', 'warning'); return; }
  if (confirm('确认反关闭选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'closed') item.status = 'approved'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已反关闭 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchDelete() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要删除的单据', 'warning'); return; }
  if (confirm('确认删除选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list = list.filter(function(item) { return !ids.includes(item.id); });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已删除 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function exportData() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var csv = '单据编号,客户,日期,金额,状态,创建时间\n';
  list.forEach(function(item) { csv += item.docNo + ',' + (item.partnerName || '') + ',' + (item.docDate || '') + ',' + (item.amount || 0) + ',' + item.status + ',' + item.createdAt + '\n'; });
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '销售报价.csv';
  link.click();
  showToast('导出成功', 'success');
}
function exitPage() { if (confirm('确认退出？')) { window.location.href = '../index.html'; } }
function showToast(msg, type) {
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 2000);
}
document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>'''
    
    filepath = os.path.join(pages_dir, 'sales-quotation.html')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Regenerated: sales-quotation.html')

def regenerate_sales_contract():
    html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>销售合同 — 磐枢工业智能平台</title>
<link rel="stylesheet" href="../common.css">
<style>
.page-header { margin-bottom: 16px; }
.main-content { margin-left: 220px; padding: 20px; }
.doc-toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.toolbar-btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer; font-size: 13px; }
.toolbar-btn:hover { background: #f5f5f5; }
.toolbar-btn.primary { background: #1890ff; color: #fff; border-color: #1890ff; }
.toolbar-btn.danger { background: #f5222d; color: #fff; border-color: #f5222d; }
.filter-area { background: #fff; padding: 16px; border-radius: 6px; margin-bottom: 16px; }
.table-wrapper { background: #fff; border-radius: 6px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e8e8e8; }
.data-table th { background: #fafafa; font-weight: 600; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.badge-success { background: #f6ffed; color: #52c41a; }
.badge-warning { background: #fffbe6; color: #faad14; }
.badge-danger { background: #fff2f0; color: #f5222d; }
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center; }
.modal-overlay.show { display:flex; }
.modal-dialog { background:#fff; border-radius:6px; width:600px; padding:20px; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.modal-title { font-size:16px; font-weight:600; }
.modal-close { font-size:20px; cursor:pointer; color:#666; }
.toast { position:fixed; top:20px; right:20px; padding:12px 20px; border-radius:4px; color:#fff; font-size:13px; z-index:9999; }
.toast-success { background:#52c41a; }
.toast-warning { background:#faad14; }
</style>
</head>
<body>
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <img src="../images/logo.png" alt="磐枢工业智能平台" style="width: 100%; max-width: 200px;">
    <h1>磐枢HubPang</h1>
  </div>
  <nav class="sidebar-menu"></nav>
</aside>
<div class="main-content">
  <div class="page-header">
    <h2>销售合同</h2>
    <div class="breadcrumb"><a href="../index.html">首页</a> / 销售管理</div>
  </div>
  <div class="doc-toolbar">
    <button class="toolbar-btn primary" onclick="location.href='sales-contract-create.html'"><span class="icon">+</span> 新增</button>
    <button class="toolbar-btn" onclick="openFilterModal()"><span class="icon">🔍</span> 过滤</button>
    <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 列设置</button>
    <div style="width:1px;background:#e8e8e8;margin:0 8px;"></div>
    <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 提交</button>
    <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 审核</button>
    <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 反审核</button>
    <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 关闭</button>
    <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 反关闭</button>
    <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 删除</button>
    <div style="width:1px;background:#e8e8e8;margin:0 8px;"></div>
    <button class="toolbar-btn" onclick="exportData()"><span class="icon">📤</span> 导出</button>
    <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
  </div>
  <div class="filter-area">
    <input type="text" id="filterDocNo" placeholder="单据编号" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;margin-right:8px;">
    <input type="text" id="filterPartner" placeholder="客户" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;margin-right:8px;">
    <select id="filterStatus" style="padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;margin-right:8px;">
      <option value="">全部状态</option><option value="draft">草稿</option><option value="submitted">待审核</option><option value="approved">已审核</option><option value="closed">已关闭</option>
    </select>
    <button onclick="searchData()" style="padding:6px 16px;background:#1890ff;color:#fff;border:none;border-radius:4px;cursor:pointer;">查询</button>
    <button onclick="refreshData()" style="padding:6px 16px;background:#fff;color:#666;border:1px solid #d9d9d9;border-radius:4px;cursor:pointer;">刷新</button>
  </div>
  <div class="table-wrapper">
    <table class="data-table">
      <thead><tr><th><input type="checkbox" onclick="selectAll()"></th><th>单据编号</th><th>客户</th><th>日期</th><th>金额</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
      <tbody id="dataBody"></tbody>
    </table>
  </div>
</div>
<div class="modal-overlay" id="columnModal">
  <div class="modal-dialog">
    <div class="modal-header"><div class="modal-title">列设置</div><span class="modal-close" onclick="closeColumnSettings()">×</span></div>
    <div id="columnCheckboxes"></div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
      <button class="toolbar-btn" onclick="closeColumnSettings()">取消</button>
      <button class="toolbar-btn primary" onclick="saveColumnSettings()">确定</button>
    </div>
  </div>
</div>
<script>
var docType = 'sales_contract';
var visibleColumns = ['单据编号', '客户', '日期', '金额', '状态', '创建时间'];

function init() { loadData(); }
function loadData() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  if (list.length === 0) {
    var now = new Date().toISOString();
    list = [{ id: '1', docNo: 'HT202607160001', partnerName: '上海宏远电子科技有限公司', docDate: '2026-07-16', amount: 50000, status: 'approved', createdAt: now },
            { id: '2', docNo: 'HT202607160002', partnerName: '北京华创科技有限公司', docDate: '2026-07-15', amount: 80000, status: 'submitted', createdAt: now }];
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
  }
  renderTable(list);
}
function renderTable(list) {
  var tbody = document.getElementById('dataBody');
  tbody.innerHTML = '';
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">暂无数据</td></tr>'; return; }
  var statusMap = { 'draft': '草稿', 'submitted': '待审核', 'approved': '已审核', 'closed': '已关闭' };
  var statusClassMap = { 'draft': 'badge-warning', 'submitted': 'badge-warning', 'approved': 'badge-success', 'closed': 'badge-danger' };
  list.forEach(function(item) {
    var row = document.createElement('tr');
    row.innerHTML = '<td><input type="checkbox" class="data-checkbox" value="' + item.id + '"></td>' +
                    '<td><a href="sales-contract-create.html?id=' + item.id + '">' + item.docNo + '</a></td>' +
                    '<td>' + (item.partnerName || '') + '</td>' +
                    '<td>' + (item.docDate || '') + '</td>' +
                    '<td>' + (item.amount || 0) + '</td>' +
                    '<td><span class="badge ' + statusClassMap[item.status] + '">' + statusMap[item.status] + '</span></td>' +
                    '<td>' + (item.createdAt ? new Date(item.createdAt).toLocaleString() : '') + '</td>' +
                    '<td><button onclick="viewDetail(\'' + item.id + '\')">查看</button> <button onclick="deleteDetail(\'' + item.id + '\')">删除</button></td>';
    tbody.appendChild(row);
  });
}
function searchData() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var filtered = list.filter(function(item) {
    if (document.getElementById('filterDocNo').value && !item.docNo.includes(document.getElementById('filterDocNo').value)) return false;
    if (document.getElementById('filterPartner').value && !item.partnerName.includes(document.getElementById('filterPartner').value)) return false;
    if (document.getElementById('filterStatus').value && item.status !== document.getElementById('filterStatus').value) return false;
    return true;
  });
  renderTable(filtered);
}
function refreshData() { loadData(); }
function selectAll() {
  var master = document.querySelector('.data-table th input');
  document.querySelectorAll('.data-checkbox').forEach(function(cb) { cb.checked = master.checked; });
}
function getSelectedIds() {
  return Array.from(document.querySelectorAll('.data-checkbox:checked')).map(function(cb) { return cb.value; });
}
function openColumnSettings() {
  var container = document.getElementById('columnCheckboxes');
  container.innerHTML = '';
  ['单据编号', '客户', '日期', '金额', '状态', '创建时间', '币别', '汇率'].forEach(function(col) {
    var item = document.createElement('div');
    item.style.marginBottom = '8px';
    var checked = visibleColumns.includes(col) ? 'checked' : '';
    item.innerHTML = '<input type="checkbox" ' + checked + ' value="' + col + '" onchange="toggleColumn(this)"> ' + col;
    container.appendChild(item);
  });
  document.getElementById('columnModal').classList.add('show');
}
function closeColumnSettings() { document.getElementById('columnModal').classList.remove('show'); }
function toggleColumn(cb) {
  var idx = visibleColumns.indexOf(cb.value);
  if (cb.checked && idx === -1) visibleColumns.push(cb.value);
  else if (!cb.checked && idx !== -1) visibleColumns.splice(idx, 1);
}
function saveColumnSettings() {
  localStorage.setItem('visible_columns_' + docType, JSON.stringify(visibleColumns));
  showToast('列设置已保存', 'success');
  closeColumnSettings();
  loadData();
}
function openFilterModal() { showToast('高级过滤功能开发中', 'info'); }
function viewDetail(id) { location.href = 'sales-contract-create.html?id=' + id; }
function deleteDetail(id) {
  if (confirm('确认删除此单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list = list.filter(function(item) { return item.id !== id; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('删除成功', 'success');
    loadData();
  }
}
function batchSubmit() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要提交的单据', 'warning'); return; }
  if (confirm('确认提交选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'draft') item.status = 'submitted'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已提交 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchApprove() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要审核的单据', 'warning'); return; }
  if (confirm('确认审核选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'submitted') item.status = 'approved'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已审核 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchReverseApprove() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要反审核的单据', 'warning'); return; }
  if (confirm('确认反审核选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'approved') item.status = 'submitted'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已反审核 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要关闭的单据', 'warning'); return; }
  if (confirm('确认关闭选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'approved') item.status = 'closed'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已关闭 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchReverseClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要反关闭的单据', 'warning'); return; }
  if (confirm('确认反关闭选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list.forEach(function(item) { if (ids.includes(item.id) && item.status === 'closed') item.status = 'approved'; });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已反关闭 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function batchDelete() {
  var ids = getSelectedIds();
  if (ids.length === 0) { showToast('请选择要删除的单据', 'warning'); return; }
  if (confirm('确认删除选中的 ' + ids.length + ' 条单据？')) {
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list = list.filter(function(item) { return !ids.includes(item.id); });
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已删除 ' + ids.length + ' 条单据', 'success');
    loadData();
  }
}
function exportData() {
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  var csv = '单据编号,客户,日期,金额,状态,创建时间\n';
  list.forEach(function(item) { csv += item.docNo + ',' + (item.partnerName || '') + ',' + (item.docDate || '') + ',' + (item.amount || 0) + ',' + item.status + ',' + item.createdAt + '\n'; });
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '销售合同.csv';
  link.click();
  showToast('导出成功', 'success');
}
function exitPage() { if (confirm('确认退出？')) { window.location.href = '../index.html'; } }
function showToast(msg, type) {
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 2000);
}
document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>'''
    
    filepath = os.path.join(pages_dir, 'sales-contract.html')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Regenerated: sales-contract.html')

regenerate_sales_quotation()
regenerate_sales_contract()
print('Done!')
