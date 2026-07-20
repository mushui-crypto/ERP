import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

pages_config = [
    {'file': 'purchase-request.html', 'title': '采购申请', 'doc_type': 'purchase_request', 'show_close': True, 'columns': ['单据编号', '日期', '客户/供应商', '组织', '金额', '状态', '创建时间', '申请类型', '单据类型', '申请部门', '申请人', '币别', '需求组织', '采购组', '收料组织', '验收方式', '价外税', '汇率类型', '备注']},
    {'file': 'purchase-order.html', 'title': '采购订单', 'doc_type': 'purchase_order', 'show_close': True, 'columns': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '订单类型', '采购组织', '收料组织', '币别', '税率', '付款条件', '交货日期', '备注']},
    {'file': 'purchase-inbound.html', 'title': '采购入库', 'doc_type': 'purchase_inbound', 'show_close': True, 'columns': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '入库类型', '仓库', '收料组织', '验收方式', '备注']},
    {'file': 'purchase-return.html', 'title': '采购退货', 'doc_type': 'purchase_return', 'show_close': True, 'columns': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '退货类型', '仓库', '退货原因', '备注']},
    {'file': 'purchase-return-request.html', 'title': '采购退货申请', 'doc_type': 'purchase_return_request', 'show_close': True, 'columns': ['单据编号', '日期', '供应商', '组织', '金额', '状态', '创建时间', '退货类型', '仓库', '退货原因', '备注']},
    {'file': 'purchase-inspect.html', 'title': '采购检验', 'doc_type': 'purchase_inspect', 'show_close': True, 'columns': ['单据编号', '日期', '供应商', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注']},
    {'file': 'purchase-receive-inspect.html', 'title': '采购收货检验', 'doc_type': 'purchase_receive_inspect', 'show_close': True, 'columns': ['单据编号', '日期', '供应商', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注']},
    {'file': 'sales-order.html', 'title': '销售订单', 'doc_type': 'sales_order', 'show_close': True, 'columns': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '订单类型', '销售组织', '发货组织', '币别', '税率', '付款条件', '交货日期', '备注']},
    {'file': 'sales-contract.html', 'title': '销售合同', 'doc_type': 'sales_contract', 'show_close': True, 'columns': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '合同类型', '销售组织', '币别', '签订日期', '有效期至', '备注']},
    {'file': 'sales-quotation.html', 'title': '销售报价', 'doc_type': 'sales_quotation', 'show_close': True, 'columns': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '报价类型', '销售组织', '币别', '有效期至', '备注']},
    {'file': 'sales-delivery.html', 'title': '销售发货', 'doc_type': 'sales_delivery', 'show_close': True, 'columns': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '发货类型', '仓库', '发货组织', '备注']},
    {'file': 'sales-outbound.html', 'title': '销售出库', 'doc_type': 'sales_outbound', 'show_close': False, 'columns': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '出库类型', '仓库', '发货组织', '备注']},
    {'file': 'sales-return.html', 'title': '销售退货', 'doc_type': 'sales_return', 'show_close': True, 'columns': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '退货类型', '仓库', '退货原因', '备注']},
    {'file': 'sales-split-delivery.html', 'title': '销售分次发货', 'doc_type': 'sales_split_delivery', 'show_close': True, 'columns': ['单据编号', '日期', '客户', '组织', '金额', '状态', '创建时间', '发货类型', '仓库', '备注']},
    {'file': 'production-order.html', 'title': '生产订单', 'doc_type': 'production_order', 'show_close': True, 'columns': ['单据编号', '日期', '组织', '状态', '创建时间', '生产类型', '产品编码', '产品名称', '生产数量', '计划开工', '计划完工', '备注']},
    {'file': 'production-material-request.html', 'title': '生产领料', 'doc_type': 'production_material_request', 'show_close': False, 'columns': ['单据编号', '日期', '组织', '状态', '创建时间', '领料类型', '仓库', '生产订单', '备注']},
    {'file': 'production-material-return.html', 'title': '生产退料', 'doc_type': 'production_material_return', 'show_close': False, 'columns': ['单据编号', '日期', '组织', '状态', '创建时间', '退料类型', '仓库', '生产订单', '备注']},
    {'file': 'production-inbound.html', 'title': '生产入库', 'doc_type': 'production_inbound', 'show_close': False, 'columns': ['单据编号', '日期', '组织', '状态', '创建时间', '入库类型', '仓库', '生产订单', '备注']},
    {'file': 'production-inspect.html', 'title': '生产检验', 'doc_type': 'production_inspect', 'show_close': True, 'columns': ['单据编号', '日期', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注']},
    {'file': 'production-report-inspect.html', 'title': '生产报检', 'doc_type': 'production_report_inspect', 'show_close': True, 'columns': ['单据编号', '日期', '组织', '状态', '创建时间', '检验类型', '检验单号', '检验员', '备注']},
    {'file': 'inventory-in.html', 'title': '库存入库', 'doc_type': 'inventory_in', 'show_close': False, 'columns': ['单据编号', '日期', '组织', '金额', '状态', '创建时间', '入库类型', '仓库', '备注']},
    {'file': 'inventory-out.html', 'title': '库存出库', 'doc_type': 'inventory_out', 'show_close': False, 'columns': ['单据编号', '日期', '组织', '金额', '状态', '创建时间', '出库类型', '仓库', '备注']},
]

def generate_html(config):
    create_page = config['file'].replace('.html', '-create.html')
    close_buttons = ''
    if config['show_close']:
        close_buttons = '''
        <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 批量关闭</button>
        <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 批量反关闭</button>'''
    
    columns_str = ', '.join(f'"{c}"' for c in config['columns'])
    
    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{config['title']} — 磐枢工业智能平台</title>
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
.form-row .form-group label{{font-size:13px;color:#666;display:block;margin-bottom:4px;}}
.form-row .form-group input,.form-row .form-group select{{width:100%;padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;box-sizing:border-box;}}
.form-row .form-group input:focus,.form-row .form-group select:focus{{outline:none;border-color:#1890ff;}}
.btn{{padding:6px 16px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;transition:all 0.3s;}}
.btn:hover{{border-color:#1890ff;color:#1890ff;}}
.btn-primary{{background:#1890ff;color:#fff;border-color:#1890ff;}}
.btn-primary:hover{{background:#40a9ff;}}
.btn-cancel{{border-color:#d9d9d9;color:#666;}}
.btn-danger{{background:#f5222d;color:#fff;border-color:#f5222d;}}
.btn-danger:hover{{background:#ff4d4f;}}
.doc-page{{display:flex;height:100vh;background:#f0f2f5;}}
.doc-sidebar{{width:200px;background:#001529;color:#fff;display:flex;flex-direction:column;}}
.doc-sidebar-title{{padding:16px 20px;font-size:15px;font-weight:600;border-bottom:1px solid #002140;background:#001529;}}
.doc-sidebar-menu{{list-style:none;padding:0;margin:0;flex:1;}}
.doc-sidebar-menu li{{padding:0;}}
.doc-sidebar-menu li a{{display:flex;align-items:center;padding:12px 20px;color:#bfbfbf;text-decoration:none;font-size:13px;transition:all 0.3s;}}
.doc-sidebar-menu li a:hover{{background:#002140;color:#fff;}}
.doc-sidebar-menu li a.active{{background:#1890ff;color:#fff;}}
.doc-sidebar-menu li a .menu-icon{{margin-right:8px;font-size:14px;}}
.doc-content{{flex:1;display:flex;flex-direction:column;overflow:hidden;}}
.doc-header{{background:#fff;border-bottom:1px solid #e8e8e8;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;}}
.doc-header-title{{font-size:20px;font-weight:600;color:#333;margin-bottom:4px;}}
.doc-header-subtitle{{font-size:13px;color:#999;}}
.doc-toolbar{{display:flex;gap:8px;}}
.toolbar-btn{{padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;display:flex;align-items:center;gap:6px;transition:all 0.3s;}}
.toolbar-btn:hover{{border-color:#1890ff;color:#1890ff;}}
.toolbar-btn.primary{{background:#1890ff;color:#fff;border-color:#1890ff;}}
.toolbar-btn.primary:hover{{background:#40a9ff;}}
.toolbar-btn.danger{{background:#f5222d;color:#fff;border-color:#f5222d;}}
.toolbar-btn.danger:hover{{background:#ff4d4f;}}
.toolbar-btn .icon{{font-size:14px;}}
.doc-body{{flex:1;padding:16px;overflow-y:auto;}}
.doc-card{{background:#fff;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);overflow:hidden;}}
.data-table{{width:100%;border-collapse:collapse;}}
.data-table th{{background:#fafafa;padding:12px 16px;text-align:left;font-weight:600;font-size:13px;color:#333;border-bottom:2px solid #e8e8e8;}}
.data-table td{{padding:12px 16px;border-bottom:1px solid #e8e8e8;font-size:13px;color:#333;}}
.data-table tr:hover{{background:#f5f5f5;}}
.data-table input[type="checkbox"]{{width:16px;height:16px;}}
.pagination{{padding:16px;display:flex;justify-content:center;align-items:center;gap:16px;border-top:1px solid #e8e8e8;}}
.pagination span{{font-size:13px;color:#666;}}
.lookup-modal{{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;justify-content:center;align-items:center;}}
.lookup-modal.show{{display:flex;}}
.lookup-dialog{{background:#fff;border:1px solid #e8e8e8;border-radius:4px;width:720px;max-height:70vh;overflow:hidden;}}
.lookup-header{{padding:14px 20px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;}}
.lookup-title{{font-size:15px;font-weight:600;color:#333;}}
.lookup-close{{font-size:20px;color:#666;cursor:pointer;background:none;border:none;}}
.lookup-close:hover{{color:#333;}}
.lookup-body{{padding:16px;overflow-y:auto;}}
.lookup-search{{display:flex;gap:8px;margin-bottom:12px;}}
.lookup-search input{{flex:1;padding:8px 12px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;}}
.lookup-search button{{padding:8px 16px;border:none;background:#1890ff;color:#fff;border-radius:4px;cursor:pointer;font-size:13px;}}
.lookup-search button:hover{{background:#40a9ff;}}
.lookup-table{{width:100%;border-collapse:collapse;}}
.lookup-table th,.lookup-table td{{padding:10px 12px;text-align:left;border-bottom:1px solid #e8e8e8;}}
.lookup-table th{{background:#fafafa;font-weight:600;color:#333;}}
.lookup-table tr:hover{{background:#f5f5f5;}}
.lookup-footer{{padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;}}
.column-modal{{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;justify-content:center;align-items:center;}}
.column-modal.show{{display:flex;}}
.column-dialog{{background:#fff;border:1px solid #e8e8e8;border-radius:4px;width:480px;max-height:60vh;overflow:hidden;}}
.column-header{{padding:14px 20px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;}}
.column-title{{font-size:15px;font-weight:600;color:#333;}}
.column-close{{font-size:20px;color:#666;cursor:pointer;background:none;border:none;}}
.column-close:hover{{color:#333;}}
.column-body{{padding:16px;overflow-y:auto;}}
.column-footer{{padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;}}
.column-item{{display:flex;align-items:center;gap:8px;padding:6px 0;}}
.column-item label{{font-size:13px;color:#333;cursor:pointer;}}
.column-item input[type="checkbox"]{{width:16px;height:16px;}}
.filter-modal{{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;justify-content:center;align-items:center;}}
.filter-modal.show{{display:flex;}}
.filter-dialog{{background:#fff;border:1px solid #e8e8e8;border-radius:4px;width:560px;max-height:70vh;overflow:hidden;}}
.filter-header{{padding:14px 20px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;}}
.filter-title{{font-size:15px;font-weight:600;color:#333;}}
.filter-close{{font-size:20px;color:#666;cursor:pointer;background:none;border:none;}}
.filter-close:hover{{color:#333;}}
.filter-body{{padding:20px;overflow-y:auto;}}
.filter-footer{{padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;}}
</style>
</head>
<body>

<div class="doc-page">
  <aside class="doc-sidebar">
    <div class="doc-sidebar-title">业务导航</div>
    <ul class="doc-sidebar-menu">
      <li><a href="#" class="active"><span class="menu-icon">&#128203;</span> {config['title']}列表</a></li>
      <li><a href="{create_page}"><span class="menu-icon">&#10010;</span> {config['title']}新增</a></li>
    </ul>
  </aside>

  <div class="doc-content">
    <header class="doc-header">
      <div>
        <div class="doc-header-title">{config['title']}</div>
        <div class="doc-header-subtitle">管理{config['title']}信息</div>
      </div>
      <div class="doc-toolbar">
        <button class="toolbar-btn primary" onclick="location.href='{create_page}'"><span class="icon">+</span> 新增</button>
        <button class="toolbar-btn" onclick="openFilterModal()"><span class="icon">🔍</span> 过滤</button>
        <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 显示/隐藏列</button>
        <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 批量提交</button>
        <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 批量审核</button>
        <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 批量反审核</button>
        {close_buttons}
        <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>
        <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>
      </div>
    </header>

    <div class="doc-body">
      <div class="doc-card">
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

<div class="filter-modal" id="filterModal">
  <div class="filter-dialog">
    <div class="filter-header">
      <div class="filter-title">过滤条件</div>
      <button class="filter-close" onclick="closeFilterModal()">×</button>
    </div>
    <div class="filter-body">
      <div class="form-row">
        <div class="form-group">
          <label>单据编号</label>
          <input type="text" id="filterDocNo" placeholder="请输入单据编号">
        </div>
        <div class="form-group">
          <label>客户/供应商</label>
          <input type="text" id="filterPartner" placeholder="请输入客户或供应商">
        </div>
        <div class="form-group">
          <label>组织</label>
          <input type="text" id="filterOrg" placeholder="请输入组织">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>状态</label>
          <select id="filterStatus">
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待审核</option>
            <option value="approved">已审核</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
        <div class="form-group">
          <label>开始日期</label>
          <input type="date" id="filterStartDate">
        </div>
        <div class="form-group">
          <label>结束日期</label>
          <input type="date" id="filterEndDate">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>最小金额</label>
          <input type="number" id="filterMinAmount" placeholder="最小金额">
        </div>
        <div class="form-group">
          <label>最大金额</label>
          <input type="number" id="filterMaxAmount" placeholder="最大金额">
        </div>
      </div>
    </div>
    <div class="filter-footer">
      <button class="btn btn-cancel" onclick="closeFilterModal()">取消</button>
      <button class="btn btn-default" onclick="resetFilter()">重置</button>
      <button class="btn btn-primary" onclick="searchData()">确定</button>
    </div>
  </div>
</div>

<script>
var currentPage = 1;
var pageSize = 10;
var totalPages = 0;
var docType = '{config["doc_type"]}';

var currentColumns = [{columns_str}];
var visibleColumns = JSON.parse(localStorage.getItem('visible_columns_' + docType) || '["单据编号", "日期", "组织", "金额", "状态", "创建时间"]');

function init() {{
  loadData();
}}

function loadData() {{
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  
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
    row.innerHTML = '<td><input type="checkbox" class="data-checkbox" value="' + item.id + '"></td><td>' + item.docNo + '</td><td>' + item.docDate + '</td><td>' + (item.partnerName || '') + '</td><td>' + (item.orgName || '') + '</td><td style="color:#f5222d;font-weight:600;">' + (item.amount || '0.00') + '</td><td><span style="color:' + (statusColorMap[item.status] || '#666') + ';">' + (statusMap[item.status] || item.status) + '</span></td><td>' + (item.createdAt ? new Date(item.createdAt).toLocaleString() : '') + '</td>';
    tbody.appendChild(row);
  }});
}}

function openFilterModal() {{
  document.getElementById('filterModal').classList.add('show');
}}

function closeFilterModal() {{
  document.getElementById('filterModal').classList.remove('show');
}}

function searchData() {{
  var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
  
  var filterDocNo = document.getElementById('filterDocNo').value || '';
  var filterPartner = document.getElementById('filterPartner').value || '';
  var filterOrg = document.getElementById('filterOrg').value || '';
  var filterStatus = document.getElementById('filterStatus').value || '';
  var filterStartDate = document.getElementById('filterStartDate').value || '';
  var filterEndDate = document.getElementById('filterEndDate').value || '';
  var filterMinAmount = document.getElementById('filterMinAmount').value || '';
  var filterMaxAmount = document.getElementById('filterMaxAmount').value || '';
  
  var filtered = list.filter(function(item) {{
    if (filterDocNo && !item.docNo.includes(filterDocNo)) return false;
    if (filterPartner && !item.partnerName.includes(filterPartner)) return false;
    if (filterOrg && !item.orgName.includes(filterOrg)) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterStartDate && item.docDate < filterStartDate) return false;
    if (filterEndDate && item.docDate > filterEndDate) return false;
    if (filterMinAmount && (item.amount || 0) < parseFloat(filterMinAmount)) return false;
    if (filterMaxAmount && (item.amount || 0) > parseFloat(filterMaxAmount)) return false;
    return true;
  }});
  
  closeFilterModal();
  renderTable(filtered);
}}

function resetFilter() {{
  document.getElementById('filterDocNo').value = '';
  document.getElementById('filterPartner').value = '';
  document.getElementById('filterOrg').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterStartDate').value = '';
  document.getElementById('filterEndDate').value = '';
  document.getElementById('filterMinAmount').value = '';
  document.getElementById('filterMaxAmount').value = '';
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

function batchSubmit() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要提交的单据', 'warning');
    return;
  }}
  showConfirm('确认提交选中的 ' + ids.length + ' 条单据？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    var count = 0;
    list.forEach(function(item) {{
      if (ids.includes(item.id) && item.status === 'draft') {{
        item.status = 'pending';
        count++;
      }}
    }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已提交 ' + count + ' 条单据', 'success');
    loadData();
  }});
}}

function batchApprove() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要审核的单据', 'warning');
    return;
  }}
  showConfirm('确认审核选中的 ' + ids.length + ' 条单据？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    var count = 0;
    list.forEach(function(item) {{
      if (ids.includes(item.id) && item.status === 'pending') {{
        item.status = 'approved';
        count++;
      }}
    }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已审核 ' + count + ' 条单据', 'success');
    loadData();
  }});
}}

function batchReverseApprove() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要反审核的单据', 'warning');
    return;
  }}
  showConfirm('确认反审核选中的 ' + ids.length + ' 条单据？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    var count = 0;
    list.forEach(function(item) {{
      if (ids.includes(item.id) && item.status === 'approved') {{
        item.status = 'pending';
        count++;
      }}
    }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已反审核 ' + count + ' 条单据', 'success');
    loadData();
  }});
}}

function batchClose() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要关闭的单据', 'warning');
    return;
  }}
  showConfirm('确认关闭选中的 ' + ids.length + ' 条单据？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    var count = 0;
    list.forEach(function(item) {{
      if (ids.includes(item.id) && item.status === 'approved') {{
        item.status = 'closed';
        count++;
      }}
    }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已关闭 ' + count + ' 条单据', 'success');
    loadData();
  }});
}}

function batchReverseClose() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要反关闭的单据', 'warning');
    return;
  }}
  showConfirm('确认反关闭选中的 ' + ids.length + ' 条单据？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    var count = 0;
    list.forEach(function(item) {{
      if (ids.includes(item.id) && item.status === 'closed') {{
        item.status = 'approved';
        count++;
      }}
    }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已反关闭 ' + count + ' 条单据', 'success');
    loadData();
  }});
}}

function batchDelete() {{
  var ids = getSelectedIds();
  if (ids.length === 0) {{
    showToast('请选择要删除的单据', 'warning');
    return;
  }}
  showConfirm('确认删除选中的 ' + ids.length + ' 条单据？', function() {{
    var list = JSON.parse(localStorage.getItem('erp_' + docType + '_list') || '[]');
    list = list.filter(function(item) {{ return !ids.includes(item.id); }});
    localStorage.setItem('erp_' + docType + '_list', JSON.stringify(list));
    showToast('已删除 ' + ids.length + ' 条单据', 'success');
    loadData();
  }});
}}

function exitPage() {{
  showConfirm('确认退出当前页面？', function() {{
    window.location.href = '../index.html';
  }});
}}

function openColumnSettings() {{
  var container = document.getElementById('columnCheckboxes');
  container.innerHTML = '';
  
  currentColumns.forEach(function(col) {{
    var item = document.createElement('div');
    item.className = 'column-item';
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
    if (!visibleColumns.includes(col)) {{
      visibleColumns.push(col);
    }}
  }} else {{
    visibleColumns = visibleColumns.filter(function(c) {{ return c !== col; }});
  }}
}}

function saveColumnSettings() {{
  localStorage.setItem('visible_columns_' + docType, JSON.stringify(visibleColumns));
  showToast('列设置已保存', 'success');
  closeColumnSettings();
  loadData();
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

function openLookup(title, data, callback) {{
  lookupCallback = callback;
  document.getElementById('lookupTitle').innerText = title;
  
  var head = document.getElementById('lookupTableHead');
  var body = document.getElementById('lookupTableBody');
  head.innerHTML = '<tr><th><input type="checkbox" onclick="selectAllLookup()"></th><th>编号</th><th>名称</th></tr>';
  body.innerHTML = '';
  
  data.forEach(function(item) {{
    var row = document.createElement('tr');
    row.innerHTML = '<td><input type="checkbox" class="lookup-checkbox" value="' + item.id + '"></td><td>' + item.code + '</td><td>' + item.name + '</td>';
    body.appendChild(row);
  }});
  
  document.getElementById('lookupModal').classList.add('show');
}}

function closeLookup() {{
  document.getElementById('lookupModal').classList.remove('show');
}}

function selectAllLookup() {{
  var master = document.querySelector('.lookup-table th input');
  var checkboxes = document.querySelectorAll('.lookup-checkbox');
  checkboxes.forEach(function(cb) {{ cb.checked = master.checked; }});
}}

function filterLookup() {{
  var keyword = document.getElementById('lookupKeyword').value.toLowerCase();
  var rows = document.querySelectorAll('.lookup-table tbody tr');
  rows.forEach(function(row) {{
    var text = row.innerText.toLowerCase();
    row.style.display = text.includes(keyword) ? '' : 'none';
  }});
}}

function confirmLookup() {{
  var checkboxes = document.querySelectorAll('.lookup-checkbox:checked');
  var selected = Array.from(checkboxes).map(function(cb) {{ return cb.value; }});
  if (lookupCallback) {{
    lookupCallback(selected);
  }}
  closeLookup();
}}

document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>'''
    return html

for config in pages_config:
    filepath = os.path.join(pages_dir, config['file'])
    html = generate_html(config)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Generated: {config["file"]}')

print('All pages generated successfully!')
