import os

LIST_PAGES = {
    'purchase-order.html': ('采购订单', 'purchase-order'),
    'sales-order.html': ('销售订单', 'sales-order'),
    'production-order.html': ('生产订单', 'production-order'),
    'purchase-request.html': ('采购申请', 'purchase-request'),
    'purchase-inbound.html': ('采购入库', 'purchase-inbound'),
    'purchase-inspect.html': ('采购质检', 'purchase-inspect'),
    'purchase-return.html': ('采购退货', 'purchase-return'),
    'sales-contract.html': ('销售合同', 'sales-contract'),
    'sales-quotation.html': ('销售报价', 'sales-quotation'),
    'sales-delivery.html': ('发货通知', 'sales-delivery'),
    'sales-outbound.html': ('销售出库', 'sales-outbound'),
    'sales-return.html': ('销售退货', 'sales-return'),
    'inventory-in.html': ('入库单', 'inventory-in'),
    'inventory-out.html': ('出库单', 'inventory-out'),
    'production-material-request.html': ('生产领料', 'production-material-request'),
    'production-inbound.html': ('生产入库', 'production-inbound'),
    'production-inspect.html': ('生产质检', 'production-inspect'),
    'production-report-inspect.html': ('生产报检', 'production-report-inspect'),
    'crm-customer.html': ('客户管理', 'crm-customer'),
    'master-supplier.html': ('供应商管理', 'master-supplier'),
    'master-material.html': ('物料管理', 'master-material'),
    'equip-maintenance.html': ('设备维保', 'equip-maintenance'),
    'equip-inspection.html': ('设备巡检', 'equip-inspection'),
    'hr-employee.html': ('员工管理', 'hr-employee'),
    'finance-voucher.html': ('凭证管理', 'finance-voucher'),
    'service-request.html': ('服务请求', 'service-request'),
    'service-dispatch.html': ('服务派工', 'service-dispatch'),
    'service-record.html': ('服务记录', 'service-record'),
    'service-return.html': ('服务退货', 'service-return'),
}

def generate_list_page(filepath, title, doc_type):
    content = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — 磐枢工业智能平台</title>
<link rel="stylesheet" href="../common.css">
<script src="../common.js"></script>
<script src="../doc-data-store.js"></script>
<style>
.modal-overlay{{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000;justify-content:center;align-items:flex-start;padding-top:36px;opacity:1;pointer-events:none;}}
.modal-overlay.show{{display:flex;pointer-events:all;}}
.modal-dialog{{background:#fff;border:1px solid #e8e8e8;border-radius:4px;width:920px;max-width:96vw;max-height:92vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.3);}}
.modal-dialog .modal-header{{padding:14px 20px;border-bottom:1px solid #e8e8e8;font-weight:600;font-size:15px;color:#333;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:2;}}
.modal-dialog .modal-body{{padding:20px;color:#333;}}
.modal-dialog .modal-footer{{padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;position:sticky;bottom:0;background:#f5f5f5;}}
.modal-close{{cursor:pointer;color:#666;font-size:20px;line-height:1;background:none;border:none;padding:0 4px;}}
.modal-close:hover{{color:#333;}}
.form-row{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 16px;margin-bottom:12px;}}
.form-row .form-group{{margin-bottom:0;}}
.form-group{{margin-bottom:12px;}}
.form-group label{{display:block;font-size:12px;color:#666;margin-bottom:4px;font-weight:500;}}
.form-group label .required{{color:#f5222d;margin-right:4px;}}
.form-input,.form-select,.form-textarea{{width:100%;padding:6px 10px;border:1px solid #d9d9d9;border-radius:4px;font-size:13px;color:#333;background:#fff;}}
.form-input:focus,.form-select:focus,.form-textarea:focus{{border-color:#1890ff;outline:none;box-shadow:0 0 0 2px rgba(24,144,255,0.1);}}
.form-textarea{{resize:vertical;min-height:60px;}}
.btn{{padding:6px 16px;border:1px solid #d9d9d9;border-radius:4px;font-size:13px;cursor:pointer;}}
.btn-primary{{background:#1890ff;color:#fff;border:none;}}
.btn-primary:hover{{background:#40a9ff;}}
.btn-danger{{background:#f5222d;color:#fff;border:none;}}
.btn-danger:hover{{background:#ff4d4f;}}
.btn-default{{background:#fff;color:#666;}}
.btn-default:hover{{background:#f5f5f5;}}
</style>
</head>
<body>

<div class="doc-page">
  <aside class="doc-sidebar">
    <div class="doc-sidebar-title">业务导航</div>
    <ul class="doc-sidebar-menu">
      <li><a href="#" class="active"><span class="menu-icon">&#128203;</span> {title}列表</a></li>
      <li><a href="{doc_type}-create.html"><span class="menu-icon">&#10010;</span> {title}新增</a></li>
    </ul>
  </aside>

  <div class="doc-content">
    <header class="doc-header">
      <div>
        <div class="doc-header-title">{title}</div>
        <div class="doc-header-subtitle">管理{title}信息</div>
      </div>
      <div class="doc-toolbar">
        <button class="toolbar-btn primary" onclick="location.href='{doc_type}-create.html'"><span class="icon">+</span> 新增</button>
      </div>
    </header>

    <div class="doc-body">
      <div class="doc-card">
        <div class="filter-bar">
          <div class="filter-row">
            <div class="filter-item">
              <label>单据编号</label>
              <input type="text" id="filterDocNo" class="form-input" placeholder="请输入单据编号" onkeydown="if(event.key==='Enter')searchData()">
            </div>
            <div class="filter-item">
              <label>客户/供应商</label>
              <input type="text" id="filterPartner" class="form-input" placeholder="请输入客户或供应商" onkeydown="if(event.key==='Enter')searchData()">
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
              <th>操作</th>
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

<script>
var currentPage = 1;
var pageSize = 10;
var totalPages = 0;

function init() {{
  loadData();
}}

function loadData() {{
  var list = JSON.parse(localStorage.getItem('erp_{{doc_type}}_list') || '[]');
  
  if (list.length === 0) {{
    list = [
      {{ id: '1', docNo: 'TEST001', docDate: '2026-07-15', partnerName: '测试客户', orgName: '磐枢集团', amount: 10000.00, status: 'approved', createdAt: new Date().toISOString() }},
      {{ id: '2', docNo: 'TEST002', docDate: '2026-07-14', partnerName: '测试供应商', orgName: '苏州公司', amount: 5000.00, status: 'pending', createdAt: new Date().toISOString() }}
    ];
  }}
  
  renderTable(list);
}}

function renderTable(list) {{
  var tbody = document.getElementById('dataBody');
  tbody.innerHTML = '';
  
  if (list.length === 0) {{
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
    return;
  }}
  
  var statusMap = {{ 'draft': '草稿', 'pending': '待审核', 'approved': '已审核', 'closed': '已关闭' }};
  var statusColorMap = {{ 'draft': '#999', 'pending': '#faad14', 'approved': '#52c41a', 'closed': '#666' }};
  
  list.forEach(function(item) {{
    var row = document.createElement('tr');
    row.innerHTML = '<td><input type="checkbox" class="data-checkbox"></td><td>' + item.docNo + '</td><td>' + item.docDate + '</td><td>' + (item.partnerName || '') + '</td><td>' + (item.orgName || '') + '</td><td style="color:#f5222d;font-weight:600;">' + (item.amount || '0.00') + '</td><td><span style="color:' + (statusColorMap[item.status] || '#666') + ';">' + (statusMap[item.status] || item.status) + '</span></td><td>' + (item.createdAt ? new Date(item.createdAt).toLocaleString() : '') + '</td><td><button class="btn btn-sm btn-primary" onclick="viewDetail(\\'' + item.id + '\\')">查看</button> <button class="btn btn-sm btn-default" onclick="editDoc(\\'' + item.id + '\\')">编辑</button> <button class="btn btn-sm btn-danger" onclick="deleteDoc(\\'' + item.id + '\\')">删除</button></td>';
    tbody.appendChild(row);
  }});
}}

function searchData() {{
  loadData();
}}

function resetFilter() {{
  document.getElementById('filterDocNo').value = '';
  document.getElementById('filterPartner').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterStartDate').value = '';
  document.getElementById('filterEndDate').value = '';
  loadData();
}}

function selectAll() {{
  var master = document.querySelector('.data-table th input');
  var checkboxes = document.querySelectorAll('.data-checkbox');
  checkboxes.forEach(function(cb) {{ cb.checked = master.checked; }});
}}

function viewDetail(id) {{
  showToast('查看单据详情: ' + id, 'info');
}}

function editDoc(id) {{
  showToast('编辑单据: ' + id, 'info');
}}

function deleteDoc(id) {{
  showConfirm('确认删除此单据？', function() {{
    showToast('删除成功', 'success');
    loadData();
  }});
}}

function prevPage() {{
  if (currentPage > 1) {{
    currentPage--;
    loadData();
  }}
}}

function nextPage() {{
  if (currentPage < totalPages) {{
    currentPage++;
    loadData();
  }}
}}

function showToast(message, type) {{
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  var icons = {{ success: '✓', warning: '⚠️', error: '✗', info: 'ℹ️' }};
  var titles = {{ success: '成功', warning: '警告', error: '错误', info: '提示' }};
  toast.innerHTML = '<div class="toast-icon">' + icons[type] + '</div><div class="toast-content"><div class="toast-title">' + titles[type] + '</div><div class="toast-message">' + message + '</div></div><div class="toast-close" onclick="this.parentElement.remove()">×</div>';
  toast.style.background = '#fff';
  toast.style.borderLeft = '4px solid ' + (type === 'success' ? '#52c41a' : type === 'warning' ? '#faad14' : type === 'error' ? '#f5222d' : '#1890ff');
  toast.style.color = '#333';
  document.body.appendChild(toast);
  setTimeout(function() {{ toast.remove(); }}, 3000);
}}

function showConfirm(message, onConfirm) {{
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.innerHTML = '<div class="modal-dialog"><div class="modal-header"><span>确认操作</span><button class="modal-close" onclick="this.closest(\\'.modal-overlay\\').remove()">×</button></div><div class="modal-body">' + message + '</div><div class="modal-footer"><button class="btn btn-default" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" onclick="onConfirm(); this.closest(\\'.modal-overlay\\').remove()">确定</button></div></div>';
  document.body.appendChild(modal);
}}

document.addEventListener('DOMContentLoaded', init);
</script>

</body>
</html>
'''
    
    content = content.replace('{{doc_type}}', doc_type)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Regenerated: {filepath}")

def main():
    pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'
    
    for filename, (title, doc_type) in LIST_PAGES.items():
        filepath = os.path.join(pages_dir, filename)
        if os.path.exists(filepath):
            generate_list_page(filepath, title, doc_type)
    
    print(f"\n✅ Regenerated {len(LIST_PAGES)} pages")

if __name__ == '__main__':
    main()