import os
import shutil

CREATE_FILES = [
    'inventory-in-create.html',
    'inventory-out-create.html',
    'production-inbound-create.html',
    'production-inspect-create.html',
    'production-material-request-create.html',
    'production-material-return-create.html',
    'production-order-create.html',
    'production-report-inspect-create.html',
    'purchase-inbound-create.html',
    'purchase-inspect-create.html',
    'purchase-order-create.html',
    'purchase-receive-inspect-create.html',
    'purchase-request-create.html',
    'purchase-return-create.html',
    'sales-contract-create.html',
    'sales-delivery-create.html',
    'sales-disassembly-shipment-create.html',
    'sales-order-create.html',
    'sales-outbound-create.html',
    'sales-quotation-create.html',
    'sales-return-create.html',
]

def create_template_create_file(filepath, title, doc_type):
    template = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TITLE_PLACEHOLDER — 磐枢工业智能平台</title>
<link rel="stylesheet" href="../common.css">
<script src="../common.js"></script>
<script src="../doc-data-store.js"></script>
<style>
.doc-page { display: flex; height: 100vh; background: #f0f2f5; }
.doc-sidebar { width: 220px; background: #fff; border-right: 1px solid #e8e8e8; padding: 16px 0; }
.doc-sidebar-title { font-size: 12px; color: #999; padding: 0 16px 8px; }
.doc-sidebar-menu { list-style: none; margin: 0; padding: 0; }
.doc-sidebar-menu li { margin-bottom: 4px; }
.doc-sidebar-menu a { display: flex; align-items: center; gap: 8px; padding: 8px 16px; color: #666; font-size: 13px; text-decoration: none; }
.doc-sidebar-menu a:hover { background: #f5f5f5; }
.doc-sidebar-menu a.active { background: #e6f7ff; color: #1890ff; }
.doc-sidebar-menu .menu-icon { font-size: 14px; }
.doc-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.doc-header { background: #fff; border-bottom: 1px solid #e8e8e8; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
.doc-header-title { font-size: 14px; font-weight: 600; color: #333; }
.doc-header-subtitle { font-size: 13px; color: #666; }
.doc-toolbar { display: flex; align-items: center; gap: 8px; }
.toolbar-btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; border: none; background: transparent; font-size: 13px; color: #333; cursor: pointer; border-radius: 4px; }
.toolbar-btn:hover { background: #e8e8e8; }
.toolbar-btn.primary { color: #1890ff; }
.toolbar-btn.danger { color: #f5222d; }
.toolbar-btn.success { color: #52c41a; }
.toolbar-separator { width: 1px; height: 20px; background: #ddd; margin: 0 4px; }
.doc-body { flex: 1; overflow-y: auto; background: #f0f2f5; padding: 16px; }
.doc-card { background: #fff; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.doc-tabs { display: flex; border-bottom: 2px solid #e8e8e8; background: #fafafa; }
.doc-tab { padding: 10px 24px; font-size: 13px; color: #666; cursor: pointer; }
.doc-tab:hover { color: #333; }
.doc-tab.active { color: #1890ff; border-bottom: 2px solid #1890ff; font-weight: 500; background: #fff; }
.doc-form { padding: 16px 20px; }
.form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.form-item { display: flex; flex-direction: column; }
.form-item label { font-size: 12px; color: #666; margin-bottom: 4px; font-weight: 500; }
.form-item label .required { color: #f5222d; margin-right: 4px; }
.form-item input, .form-item select, .form-item textarea { padding: 6px 10px; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 13px; color: #333; background: #fff; }
.form-item input:focus, .form-item select:focus, .form-item textarea:focus { border-color: #1890ff; outline: none; }
.form-item textarea { resize: vertical; min-height: 60px; }
.form-item .readonly { background: #fafafa; color: #999; }
.form-item .lookup-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid #e8e8e8; border-left: none; border-radius: 0 4px 4px 0; cursor: pointer; background: #fff; }
.form-item .lookup-btn:hover { background: #f5f5f5; }
.form-item .lookup-row { display: flex; align-items: center; }
.form-item .lookup-row input { flex: 1; border-radius: 4px 0 0 4px; }
.doc-detail-card { background: #fff; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.detail-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #fafafa; border-bottom: 1px solid #e8e8e8; }
.detail-toolbar-left { display: flex; align-items: center; gap: 12px; }
.detail-toolbar-left span { font-size: 13px; font-weight: 500; color: #333; }
.detail-toolbar-right { display: flex; gap: 4px; }
.detail-btn { display: flex; align-items: center; gap: 4px; padding: 4px 12px; border: none; background: transparent; font-size: 12px; color: #666; cursor: pointer; border-radius: 4px; }
.detail-btn:hover { background: #e8e8e8; color: #333; }
.detail-btn.primary { color: #1890ff; }
.detail-btn.danger { color: #f5222d; }
.detail-table { width: 100%; border-collapse: collapse; }
.detail-table th { background: #fafafa; padding: 8px 12px; text-align: left; font-size: 12px; font-weight: 500; color: #666; border-bottom: 1px solid #e8e8e8; }
.detail-table td { padding: 8px 12px; font-size: 13px; color: #333; border-bottom: 1px solid #e8e8e8; }
.detail-table tr:hover td { background: #fafafa; }
.detail-table input, .detail-table select { padding: 4px 8px; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 12px; width: 100%; max-width: 120px; background: #fff; }
.detail-table input:focus, .detail-table select:focus { border-color: #1890ff; outline: none; }
.doc-footer { background: #fff; border-top: 1px solid #e8e8e8; padding: 12px 20px; display: flex; justify-content: flex-end; gap: 24px; align-items: center; }
.footer-item { display: flex; align-items: center; gap: 8px; }
.footer-item label { font-size: 12px; color: #666; }
.footer-item value { font-size: 14px; font-weight: 600; color: #333; }
.footer-item value.important { color: #f5222d; }
.toast { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 4px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); position: fixed; top: 20px; right: 20px; z-index: 9999; animation: slideIn 0.3s ease; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.toast .toast-icon { font-size: 20px; }
.toast .toast-content { flex: 1; }
.toast .toast-title { font-weight: 600; margin-bottom: 2px; color: #333; }
.toast .toast-message { font-size: 13px; color: #666; }
.toast .toast-close { cursor: pointer; font-size: 18px; color: #999; }
.toast-success { border-left: 4px solid #52c41a; }
.toast-success .toast-title { color: #52c41a; }
.toast-warning { border-left: 4px solid #faad14; }
.toast-warning .toast-title { color: #faad14; }
.toast-error { border-left: 4px solid #f5222d; }
.toast-error .toast-title { color: #f5222d; }
.toast-info { border-left: 4px solid #1890ff; }
.toast-info .toast-title { color: #1890ff; }
.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: flex-start; padding-top: 40px; }
.modal-overlay.active { display: flex; }
.modal-dialog, .modal { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; width: 520px; max-height: 80vh; overflow-y: auto; }
.modal-header { padding: 14px 18px; border-bottom: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 15px; font-weight: 600; color: #333; }
.modal-close { font-size: 18px; color: #999; cursor: pointer; }
.modal-body { padding: 16px 18px; }
.modal-footer { padding: 12px 18px; border-top: 1px solid #e8e8e8; display: flex; justify-content: flex-end; gap: 8px; }
.btn { padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; cursor: pointer; }
.btn-primary { background: #1890ff; color: #fff; border: none; }
.btn-primary:hover { background: #40a9ff; }
.btn-danger { background: #f5222d; color: #fff; border: none; }
.btn-danger:hover { background: #ff4d4f; }
.btn-cancel { background: #fff; color: #666; }
.btn-cancel:hover { background: #f5f5f5; }
.confirm-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1001; justify-content: center; align-items: center; }
.confirm-modal.active { display: flex; }
.confirm-modal-dialog { background: #fff; border: 1px solid #d9d9d9; border-radius: 4px; width: 420px; overflow: hidden; }
.confirm-modal-header { padding: 16px 20px; border-bottom: 1px solid #e8e8e8; display: flex; align-items: center; gap: 10px; }
.confirm-modal-icon { font-size: 20px; }
.confirm-modal-title { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.confirm-modal-body { padding: 20px; }
.confirm-modal-message { font-size: 14px; color: #374151; line-height: 1.6; }
.confirm-modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid #e8e8e8; background: #f9fafb; }
.confirm-modal-footer .btn-cancel { padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; background: #fff; color: #6b7280; cursor: pointer; }
.confirm-modal-footer .btn-confirm { padding: 6px 16px; border: none; border-radius: 4px; font-size: 13px; background: #1890ff; color: #fff; cursor: pointer; }
.relation-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1002; }
.relation-modal.active { display: flex; }
.relation-modal-dialog { width: 600px; height: 500px; background: #fff; border-radius: 4px; margin: auto; display: flex; flex-direction: column; }
.relation-modal-header { padding: 12px 16px; border-bottom: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; }
.relation-modal-title { font-size: 14px; font-weight: 600; color: #333; }
.relation-modal-close { font-size: 18px; color: #666; cursor: pointer; }
.relation-modal-body { flex: 1; overflow-y: auto; padding: 16px; }
.relation-modal-footer { padding: 12px 16px; border-top: 1px solid #e8e8e8; display: flex; justify-content: flex-end; gap: 8px; }
.relation-tree { font-size: 13px; }
.relation-node { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e8e8e8; }
.relation-node:last-child { border-bottom: none; }
.relation-node .node-icon { font-size: 16px; }
.relation-node .node-info { flex: 1; }
.relation-node .node-title { font-weight: 500; color: #333; }
.relation-node .node-subtitle { font-size: 12px; color: #666; }
.relation-node .node-actions { display: flex; gap: 4px; }
.relation-node .node-action { font-size: 12px; color: #1890ff; cursor: pointer; padding: 2px 6px; border-radius: 3px; }
.relation-node .node-action:hover { text-decoration: underline; background: #e6f7ff; }
.relation-node .node-action.disabled { color: #ccc; cursor: not-allowed; }
.relation-node .node-action.disabled:hover { background: transparent; }
.relation-arrow { text-align: center; color: #666; font-size: 12px; padding: 4px 0; }
.relation-indent { margin-left: 24px; }
</style>
</head>
<body>

<div class="doc-page">
  <aside class="doc-sidebar">
    <div class="doc-sidebar-title">业务导航</div>
    <ul class="doc-sidebar-menu">
      <li><a href="DOCTYPE_PLACEHOLDER.html"><span class="menu-icon">&#128203;</span> TITLE_PLACEHOLDER列表</a></li>
      <li><a href="#" class="active"><span class="menu-icon">&#10010;</span> TITLE_PLACEHOLDER新增</a></li>
    </ul>
  </aside>

  <div class="doc-content">
    <header class="doc-header">
      <div>
        <div class="doc-header-title">TITLE_PLACEHOLDER</div>
        <div class="doc-header-subtitle">新建TITLE_PLACEHOLDER</div>
      </div>
      <div class="doc-toolbar">
        <button class="toolbar-btn" onclick="saveDraft()"><span class="icon">💾</span> 保存草稿</button>
        <button class="toolbar-btn primary" onclick="submitDoc()"><span class="icon">✓</span> 提交审核</button>
        <button class="toolbar-btn danger" onclick="deleteDoc()"><span class="icon">🗑️</span> 删除</button>
      </div>
    </header>

    <div class="doc-body">
      <div class="doc-card">
        <div class="doc-tabs">
          <div class="doc-tab active" onclick="switchTab('main')">基本信息</div>
          <div class="doc-tab" onclick="switchTab('detail')">明细信息</div>
        </div>

        <div id="tab-main" class="doc-form">
          <div class="form-row">
            <div class="form-item">
              <label><span class="required">*</span>单据编号</label>
              <input type="text" id="docNo" readonly class="readonly" placeholder="自动生成">
            </div>
            <div class="form-item">
              <label><span class="required">*</span>日期</label>
              <input type="date" id="docDate">
            </div>
            <div class="form-item">
              <label><span class="required">*</span>组织</label>
              <select id="orgId">
                <option value="">请选择组织</option>
              </select>
            </div>
            <div class="form-item">
              <label>备注</label>
              <textarea id="remark" placeholder="请输入备注"></textarea>
            </div>
          </div>
        </div>

        <div id="tab-detail" style="display:none;">
          <div class="doc-detail-card">
            <div class="detail-toolbar">
              <div class="detail-toolbar-left">
                <span>TITLE_PLACEHOLDER明细</span>
                <span style="color:#999;">共 <span id="detailCount">0</span> 行</span>
              </div>
              <div class="detail-toolbar-right">
                <button class="detail-btn primary" onclick="addDetailRow()"><span class="icon">+</span> 添加行</button>
                <button class="detail-btn danger" onclick="removeDetailRow()"><span class="icon">−</span> 删除行</button>
              </div>
            </div>
            <table class="detail-table" id="detailTable">
              <thead>
                <tr>
                  <th><input type="checkbox" onclick="selectAllDetails()"></th>
                  <th>序号</th>
                  <th>物料编码</th>
                  <th>物料名称</th>
                  <th>规格型号</th>
                  <th>单位</th>
                  <th>数量</th>
                  <th>单价</th>
                  <th>金额</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody id="detailBody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <footer class="doc-footer">
      <div class="footer-item">
        <label>合计数量:</label>
        <value id="totalQty">0</value>
      </div>
      <div class="footer-item">
        <label>合计金额:</label>
        <value id="totalAmount" class="important">0.00</value>
      </div>
    </footer>
  </div>
</div>

<script>
var currentTab = 'main';
var docData = {};

function init() {
  loadOrgs();
  generateDocNo();
  document.getElementById('docDate').valueAsDate = new Date();
}

function generateDocNo() {
  var prefix = 'DOCTYPE_PLACEHOLDER'.toUpperCase().replace('-', '');
  var date = new Date();
  var year = date.getFullYear().toString().slice(-2);
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  var seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  document.getElementById('docNo').value = prefix + year + month + day + seq;
}

function loadOrgs() {
  var orgs = JSON.parse(localStorage.getItem('erp_orgs') || '[]');
  var select = document.getElementById('orgId');
  orgs.forEach(function(org) {
    if (org.status === 1) {
      var option = document.createElement('option');
      option.value = org.id;
      option.textContent = org.name;
      select.appendChild(option);
    }
  });
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.doc-tab').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.doc-tab').forEach(function(el) {
    if (el.textContent.includes(tab === 'main' ? '基本' : '明细')) {
      el.classList.add('active');
    }
  });
  document.getElementById('tab-main').style.display = tab === 'main' ? 'block' : 'none';
  document.getElementById('tab-detail').style.display = tab === 'detail' ? 'block' : 'none';
}

function addDetailRow() {
  var tbody = document.getElementById('detailBody');
  var rowCount = tbody.children.length + 1;
  var row = document.createElement('tr');
  row.innerHTML = '<td><input type="checkbox" class="detail-checkbox"></td><td>' + rowCount + '</td><td><input type="text" class="material-code" onblur="lookupMaterial(this)"></td><td><input type="text" class="material-name" readonly></td><td><input type="text" class="material-spec" readonly></td><td><select class="material-unit"><option value="个">个</option><option value="件">件</option><option value="kg">kg</option><option value="m">m</option></select></td><td><input type="number" class="qty" value="0" oninput="calcRowAmount(this)"></td><td><input type="number" class="price" value="0" oninput="calcRowAmount(this)"></td><td><input type="text" class="amount" readonly></td><td><input type="text" class="remark"></td>';
  tbody.appendChild(row);
  updateDetailCount();
  calcTotal();
}

function removeDetailRow() {
  var checkboxes = document.querySelectorAll('.detail-checkbox:checked');
  if (checkboxes.length === 0) {
    showToast('请选择要删除的行', 'warning');
    return;
  }
  checkboxes.forEach(function(cb) { cb.closest('tr').remove(); });
  renumberRows();
  updateDetailCount();
  calcTotal();
}

function renumberRows() {
  var rows = document.getElementById('detailBody').children;
  for (var i = 0; i < rows.length; i++) {
    rows[i].querySelector('td:nth-child(2)').textContent = i + 1;
  }
}

function selectAllDetails() {
  var master = document.querySelector('.detail-table th input');
  var checkboxes = document.querySelectorAll('.detail-checkbox');
  checkboxes.forEach(function(cb) { cb.checked = master.checked; });
}

function lookupMaterial(input) {
  var code = input.value.trim();
  if (!code) return;
  
  var materials = JSON.parse(localStorage.getItem('erp_materials') || '[]');
  var material = materials.find(function(m) { return m.code === code; });
  
  if (material) {
    var row = input.closest('tr');
    row.querySelector('.material-name').value = material.name || '';
    row.querySelector('.material-spec').value = material.spec || '';
    row.querySelector('.material-unit').value = material.unit || '个';
    row.querySelector('.price').value = material.price || '0';
    calcRowAmount(row.querySelector('.qty'));
  } else {
    showToast('未找到物料', 'warning');
  }
}

function calcRowAmount(input) {
  var row = input.closest('tr');
  var qty = parseFloat(row.querySelector('.qty').value) || 0;
  var price = parseFloat(row.querySelector('.price').value) || 0;
  var amount = (qty * price).toFixed(2);
  row.querySelector('.amount').value = amount;
  calcTotal();
}

function calcTotal() {
  var rows = document.getElementById('detailBody').children;
  var totalQty = 0;
  var totalAmount = 0;
  
  for (var i = 0; i < rows.length; i++) {
    totalQty += parseFloat(rows[i].querySelector('.qty').value) || 0;
    totalAmount += parseFloat(rows[i].querySelector('.amount').value) || 0;
  }
  
  document.getElementById('totalQty').textContent = totalQty;
  document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
}

function updateDetailCount() {
  document.getElementById('detailCount').textContent = document.getElementById('detailBody').children.length;
}

function validateForm() {
  var docNo = document.getElementById('docNo').value;
  var docDate = document.getElementById('docDate').value;
  var orgId = document.getElementById('orgId').value;
  
  if (!docDate) {
    showToast('请选择日期', 'warning');
    return false;
  }
  if (!orgId) {
    showToast('请选择组织', 'warning');
    return false;
  }
  
  var detailCount = document.getElementById('detailBody').children.length;
  if (detailCount === 0) {
    showToast('请添加明细行', 'warning');
    return false;
  }
  
  return true;
}

function saveDraft() {
  if (!validateForm()) return;
  
  docData = collectDocData();
  docData.status = 'draft';
  
  localStorage.setItem('draft_DOCTYPE_PLACEHOLDER', JSON.stringify(docData));
  showToast('草稿已保存', 'success');
}

function submitDoc() {
  if (!validateForm()) return;
  
  docData = collectDocData();
  docData.status = 'pending';
  
  showConfirm('确认提交审核？', function() {
    localStorage.setItem('submitted_DOCTYPE_PLACEHOLDER', JSON.stringify(docData));
    
    var list = JSON.parse(localStorage.getItem('erp_DOCTYPE_PLACEHOLDER_list') || '[]');
    list.unshift(docData);
    localStorage.setItem('erp_DOCTYPE_PLACEHOLDER_list', JSON.stringify(list));
    
    showToast('提交成功，等待审核', 'success');
    setTimeout(function() { window.location.href = 'DOCTYPE_PLACEHOLDER.html'; }, 1500);
  });
}

function collectDocData() {
  var rows = document.getElementById('detailBody').children;
  var details = [];
  
  for (var i = 0; i < rows.length; i++) {
    details.push({
      code: rows[i].querySelector('.material-code').value,
      name: rows[i].querySelector('.material-name').value,
      spec: rows[i].querySelector('.material-spec').value,
      unit: rows[i].querySelector('.material-unit').value,
      qty: parseFloat(rows[i].querySelector('.qty').value) || 0,
      price: parseFloat(rows[i].querySelector('.price').value) || 0,
      amount: parseFloat(rows[i].querySelector('.amount').value) || 0,
      remark: rows[i].querySelector('.remark').value
    });
  }
  
  return {
    id: 'doc-' + Date.now(),
    docNo: document.getElementById('docNo').value,
    docDate: document.getElementById('docDate').value,
    orgId: document.getElementById('orgId').value,
    orgName: document.getElementById('orgId').options[document.getElementById('orgId').selectedIndex].text,
    remark: document.getElementById('remark').value,
    details: details,
    totalQty: parseFloat(document.getElementById('totalQty').textContent) || 0,
    totalAmount: parseFloat(document.getElementById('totalAmount').textContent) || 0,
    createdAt: new Date().toISOString()
  };
}

function deleteDoc() {
  showConfirm('确认删除此单据？', function() {
    localStorage.removeItem('draft_DOCTYPE_PLACEHOLDER');
    showToast('已删除', 'success');
    setTimeout(function() { window.location.href = 'DOCTYPE_PLACEHOLDER.html'; }, 1500);
  });
}

function showToast(message, type) {
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  var icons = { success: '✓', warning: '⚠️', error: '✗', info: 'ℹ️' };
  toast.innerHTML = '<div class="toast-icon">' + icons[type] + '</div><div class="toast-content"><div class="toast-title">' + (type === 'success' ? '成功' : type === 'warning' ? '警告' : type === 'error' ? '错误' : '提示') + '</div><div class="toast-message">' + message + '</div></div><div class="toast-close" onclick="this.parentElement.remove()">×</div>';
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

function showConfirm(message, onConfirm) {
  var modal = document.createElement('div');
  modal.className = 'confirm-modal active';
  modal.innerHTML = '<div class="confirm-modal-dialog"><div class="confirm-modal-header"><div class="confirm-modal-icon">⚠️</div><div class="confirm-modal-title">确认操作</div></div><div class="confirm-modal-body"><div class="confirm-modal-message">' + message + '</div></div><div class="confirm-modal-footer"><button class="btn-cancel" onclick="this.closest(\'.confirm-modal\').remove()">取消</button><button class="btn-confirm" onclick="onConfirm(); this.closest(\'.confirm-modal\').remove()">确定</button></div></div>';
  document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', init);
</script>

</body>
</html>
'''
    
    content = template.replace('TITLE_PLACEHOLDER', title).replace('DOCTYPE_PLACEHOLDER', doc_type)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Created: {filepath}")

def main():
    pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'
    
    title_map = {
        'inventory-in-create.html': ('入库单', 'inventory-in'),
        'inventory-out-create.html': ('出库单', 'inventory-out'),
        'production-inbound-create.html': ('生产入库单', 'production-inbound'),
        'production-inspect-create.html': ('生产质检单', 'production-inspect'),
        'production-material-request-create.html': ('生产领料申请单', 'production-material-request'),
        'production-material-return-create.html': ('生产退料单', 'production-material-return'),
        'production-order-create.html': ('生产订单', 'production-order'),
        'production-report-inspect-create.html': ('生产报检单', 'production-report-inspect'),
        'purchase-inbound-create.html': ('采购入库单', 'purchase-inbound'),
        'purchase-inspect-create.html': ('采购质检单', 'purchase-inspect'),
        'purchase-order-create.html': ('采购订单', 'purchase-order'),
        'purchase-receive-inspect-create.html': ('采购收料质检单', 'purchase-receive-inspect'),
        'purchase-request-create.html': ('采购申请单', 'purchase-request'),
        'purchase-return-create.html': ('采购退货单', 'purchase-return'),
        'sales-contract-create.html': ('销售合同', 'sales-contract'),
        'sales-delivery-create.html': ('发货通知单', 'sales-delivery'),
        'sales-disassembly-shipment-create.html': ('拆分明细发货单', 'sales-disassembly-shipment'),
        'sales-order-create.html': ('销售订单', 'sales-order'),
        'sales-outbound-create.html': ('销售出库单', 'sales-outbound'),
        'sales-quotation-create.html': ('销售报价单', 'sales-quotation'),
        'sales-return-create.html': ('销售退货单', 'sales-return'),
    }
    
    for filename in CREATE_FILES:
        filepath = os.path.join(pages_dir, filename)
        if os.path.exists(filepath):
            title, doc_type = title_map.get(filename, ('单据', 'doc'))
            create_template_create_file(filepath, title, doc_type)
    
    print(f"\n✅ Restored {len(CREATE_FILES)} files")

if __name__ == '__main__':
    main()