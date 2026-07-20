import json
import os
import re

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'
config_path = r'D:\开发测试\hub-erp-v0\traewordp\documents_config.json'

with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

documents = config['documents']

def validate_config():
    errors = []
    for doc in documents:
        if doc['type'] == 'purchase' and '供应商' not in doc['header_fields']:
            errors.append('采购类单据 "' + doc['name'] + '" 缺少供应商字段')
        if doc['type'] == 'sales' and '客户' not in doc['header_fields']:
            errors.append('销售类单据 "' + doc['name'] + '" 缺少客户字段')
        if doc['type'] == 'production' and '生产订单' not in doc['header_fields'] and doc['code'] != 'production_order':
            errors.append('生产类单据 "' + doc['name'] + '" 缺少生产订单字段')
        if doc['type'] == 'inventory' and '仓库' not in doc['header_fields']:
            errors.append('库存类单据 "' + doc['name'] + '" 缺少仓库字段')
        if '关闭' in doc['buttons'] and '反关闭' not in doc['buttons']:
            errors.append('单据 "' + doc['name'] + '" 有关闭按钮但无反关闭按钮')
        if '反关闭' in doc['buttons'] and '关闭' not in doc['buttons']:
            errors.append('单据 "' + doc['name'] + '" 有反关闭按钮但无关闭按钮')
    return errors

def is_reverse_write_field(field):
    reverse_fields = ['收料数量', '检验数量', '入库数量', '未到货数量', '未入库数量', '发货数量', '出库数量', '未发货数量', '未出库数量', '领料数量', '退料数量', '未领料数量', '合格数量', '不合格数量', '未检验数量', '订单数量', '送检数量', '入库上限', '入库下限', '成品率']
    return field in reverse_fields

def get_field_type(field):
    if field in ['单据编号', '状态', '创建时间', '金额']:
        return 'readonly'
    if field == '日期':
        return 'date'
    if field in ['计划开工时间', '计划完工时间', '开工时间', '完工时间']:
        return 'datetime'
    if field in ['组织', '部门', '员工', '供应商', '客户', '物料', '仓库', '生产部门', '采购部门', '销售部门', '申请部门', '退货部门', '检验部门', '收货仓库', '发料仓库', '退料仓库', '入库仓库', '出库仓库', '发货仓库', '采购人员', '销售人员', '申请人', '检验人员', '收货人员', '领料人员', '退料人员', '入库人员', '出库人员', '发货人员', '产品编码', '产品名称', '产品BOM', '工艺路线']:
        return 'lookup'
    if field in ['币别', '汇率', '税率', '验收方式', '退货原因', '入库类型', '出库类型']:
        return 'select'
    return 'text'

def get_field_label(field):
    labels = {
        '供应商': '供应商',
        '客户': '客户',
        '组织': '组织',
        '部门': '部门',
        '员工': '员工',
        '物料': '物料',
        '仓库': '仓库',
        '生产部门': '部门',
        '采购部门': '部门',
        '销售部门': '部门',
        '申请部门': '部门',
        '退货部门': '部门',
        '检验部门': '部门',
        '收货仓库': '仓库',
        '发料仓库': '仓库',
        '退料仓库': '仓库',
        '入库仓库': '仓库',
        '出库仓库': '仓库',
        '发货仓库': '仓库',
        '采购人员': '员工',
        '销售人员': '员工',
        '申请人': '员工',
        '检验人员': '员工',
        '收货人员': '员工',
        '领料人员': '员工',
        '退料人员': '员工',
        '入库人员': '员工',
        '出库人员': '员工',
        '发货人员': '员工',
        '产品编码': '物料',
        '产品名称': '物料',
        '产品BOM': '物料',
        '工艺路线': '物料'
    }
    return labels.get(field, field)

def get_quantity_field(doc):
    if doc['code'] == 'purchase_inspect':
        return '送检数量'
    return '数量'

def get_lookup_type(field):
    types = {
        '组织': 'org',
        '部门': 'department',
        '员工': 'employee',
        '供应商': 'supplier',
        '客户': 'customer',
        '物料': 'material',
        '仓库': 'warehouse',
        '生产部门': 'department',
        '采购部门': 'department',
        '销售部门': 'department',
        '申请部门': 'department',
        '退货部门': 'department',
        '检验部门': 'department',
        '收货仓库': 'warehouse',
        '发料仓库': 'warehouse',
        '退料仓库': 'warehouse',
        '入库仓库': 'warehouse',
        '出库仓库': 'warehouse',
        '发货仓库': 'warehouse',
        '采购人员': 'employee',
        '销售人员': 'employee',
        '申请人': 'employee',
        '检验人员': 'employee',
        '收货人员': 'employee',
        '领料人员': 'employee',
        '退料人员': 'employee',
        '入库人员': 'employee',
        '出库人员': 'employee',
        '发货人员': 'employee',
        '产品编码': 'material',
        '产品名称': 'material',
        '产品BOM': 'material',
        '工艺路线': 'material'
    }
    return types.get(field, '')

def generate_list_page(doc):
    file_name = doc['code'].replace('_', '-') + '.html'
    filepath = os.path.join(pages_dir, file_name)
    
    doc_code_upper = doc['code'].upper().replace('_', '')
    partner_label = '供应商' if doc['type'] == 'purchase' else '客户'
    partner_data = '深圳电子元器件有限公司' if doc['type'] == 'purchase' else '上海科技有限公司'
    
    columns_th = ''
    for col in doc['list_columns']:
        columns_th += '<th>' + col + '</th>'
    all_fields = list(set(doc['header_fields'] + doc['detail_fields']))
    all_columns_json = json.dumps(all_fields)
    default_visible_json = json.dumps(doc['list_columns'])
    
    close_buttons = ''
    if doc['has_close']:
        close_buttons = '<button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 关闭</button>\n          <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 反关闭</button>'
    
    html_parts = []
    html_parts.append('<!DOCTYPE html>')
    html_parts.append('<html lang="zh-CN">')
    html_parts.append('<head>')
    html_parts.append('<meta charset="UTF-8">')
    html_parts.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    html_parts.append('<title>' + doc['name'] + ' — 磐枢工业智能平台</title>')
    html_parts.append('<link rel="stylesheet" href="../common.css">')
    html_parts.append('<script src="../common.js"></script>')
    html_parts.append('<script src="../doc-data-store.js"></script>')
    html_parts.append('<script src="../doc-conversion.js"></script>')
    html_parts.append('''<style>
.doc-page{display:flex;height:100vh;background:#f0f2f5;}
.doc-sidebar{width:200px;background:#001529;color:#fff;display:flex;flex-direction:column;}
.doc-sidebar-title{padding:16px 20px;font-size:15px;font-weight:600;border-bottom:1px solid #002140;background:#001529;}
.doc-sidebar-menu{list-style:none;padding:0;margin:0;flex:1;}
.doc-sidebar-menu li a{display:flex;align-items:center;padding:12px 20px;color:#bfbfbf;text-decoration:none;font-size:13px;transition:all 0.3s;}
.doc-sidebar-menu li a:hover{background:#002140;color:#fff;}
.doc-sidebar-menu li a.active{background:#1890ff;color:#fff;}
.doc-content{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.doc-header{background:#fff;border-bottom:1px solid #e8e8e8;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;}
.doc-header-title{font-size:20px;font-weight:600;color:#333;margin-bottom:4px;}
.doc-header-subtitle{font-size:13px;color:#999;}
.doc-toolbar{display:flex;gap:8px;flex-wrap:wrap;}
.toolbar-btn{padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;display:flex;align-items:center;gap:6px;transition:all 0.3s;}
.toolbar-btn:hover{border-color:#1890ff;color:#1890ff;}
.toolbar-btn.primary{background:#1890ff;color:#fff;border-color:#1890ff;}
.toolbar-btn.danger{background:#f5222d;color:#fff;border-color:#f5222d;}
.doc-body{flex:1;padding:16px;overflow-y:auto;}
.doc-card{background:#fff;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);overflow:hidden;}
.data-table{width:100%;border-collapse:collapse;}
.data-table th{background:#fafafa;padding:12px 16px;text-align:left;font-weight:600;font-size:13px;color:#333;border-bottom:2px solid #e8e8e8;}
.data-table td{padding:12px 16px;border-bottom:1px solid #e8e8e8;font-size:13px;color:#333;}
.data-table tr:hover{background:#f5f5f5;}
.pagination{padding:16px;display:flex;justify-content:center;align-items:center;gap:16px;border-top:1px solid #e8e8e8;}
.lookup-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;justify-content:center;align-items:center;}
.lookup-modal.show{display:flex;}
.lookup-dialog{background:#fff;border:1px solid #d9d9d9;border-radius:8px;width:800px;min-width:600px;max-width:90vw;height:500px;min-height:400px;max-height:70vh;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);position:relative;resize:both;}
.lookup-header{padding:16px 20px;border-bottom:1px solid #f0f0f0;background:#fafafa;display:flex;align-items:center;justify-content:space-between;cursor:move;}
.lookup-title{font-size:16px;font-weight:600;color:#333;}
.lookup-close{font-size:20px;color:#999;cursor:pointer;border:none;background:none;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all 0.3s;cursor:pointer;}
.lookup-close:hover{background:#f5f5f5;color:#666;}
.lookup-search{display:flex;gap:8px;margin-bottom:12px;}
.lookup-search input{flex:1;padding:8px 12px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;}
.lookup-search button{padding:8px 16px;border:none;background:#1890ff;color:#fff;border-radius:4px;cursor:pointer;font-size:13px;}
.lookup-table{width:100%;border-collapse:collapse;}
.lookup-table th,.lookup-table td{padding:10px 12px;text-align:left;border-bottom:1px solid #e8e8e8;}
.lookup-table th{background:#fafafa;font-weight:600;color:#333;}
.column-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;justify-content:center;align-items:center;}
.column-modal.show{display:flex;}
.column-dialog{background:#fff;border:1px solid #d9d9d9;border-radius:8px;width:560px;min-width:400px;max-width:720px;height:420px;min-height:300px;max-height:70vh;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);position:relative;resize:both;}
.column-header{padding:16px 20px;border-bottom:1px solid #f0f0f0;background:#fafafa;display:flex;align-items:center;justify-content:space-between;cursor:move;}
.column-title{font-size:16px;font-weight:600;color:#333;}
.column-close{font-size:20px;color:#999;cursor:pointer;border:none;background:none;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all 0.3s;cursor:pointer;}
.column-close:hover{background:#f5f5f5;color:#666;}
.column-body{padding:20px;overflow-y:auto;height:calc(100% - 88px);background:#fff;}
.column-footer{padding:14px 20px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:12px;background:#fafafa;position:absolute;bottom:0;left:0;right:0;}
.column-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:4px;transition:all 0.2s;}
.column-item:hover{background:#f5f7fa;}
.column-item input[type="checkbox"]{width:16px;height:16px;cursor:pointer;accent-color:#1890ff;}
.column-item label{font-size:14px;color:#333;cursor:pointer;flex:1;}
.filter-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;justify-content:center;align-items:center;}
.filter-modal.show{display:flex;}
.filter-dialog{background:#fff;border:1px solid #d9d9d9;border-radius:8px;width:560px;min-width:480px;max-width:720px;height:auto;max-height:70vh;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);position:relative;resize:both;}
.filter-header{padding:16px 20px;border-bottom:1px solid #f0f0f0;background:#fafafa;display:flex;align-items:center;justify-content:space-between;cursor:move;}
.filter-title{font-size:16px;font-weight:600;color:#333;}
.filter-close{font-size:20px;color:#999;cursor:pointer;border:none;background:none;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all 0.3s;cursor:pointer;}
.filter-close:hover{background:#f5f5f5;color:#666;}
.filter-body{padding:20px;overflow-y:auto;}
.filter-footer{padding:14px 20px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:12px;background:#fafafa;}
.form-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 16px;margin-bottom:12px;}
.form-group label{font-size:13px;color:#666;display:block;margin-bottom:4px;}
.form-group input,.form-group select{width:100%;padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;box-sizing:border-box;}
.btn{padding:6px 16px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;transition:all 0.3s;}
.btn:hover{border-color:#1890ff;color:#1890ff;}
.btn-primary{background:#1890ff;color:#fff;border-color:#1890ff;}
.btn-cancel{border-color:#d9d9d9;color:#666;}
.badge{padding:2px 8px;border-radius:4px;font-size:12px;}
.badge-success{background:#f6ffed;color:#52c41a;}
.badge-warning{background:#fffbe6;color:#faad14;}
.badge-danger{background:#fff2f0;color:#f5222d;}
.toast{position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:4px;color:#fff;font-size:13px;z-index:9999;}
.toast-success{background:#52c41a;}
.toast-warning{background:#faad14;}
.toast-info{background:#1890ff;}
.toast-error{background:#f5222d;}
.confirm-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:3000;justify-content:center;align-items:center;}
.confirm-modal.show{display:flex;}
.confirm-dialog{background:#fff;border:1px solid #e8e8e8;border-radius:4px;width:420px;overflow:hidden;}
.confirm-header{padding:14px 20px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;background:#fafafa;}
.confirm-title{font-size:14px;font-weight:600;color:#333;}
.confirm-close{font-size:18px;color:#999;cursor:pointer;border:none;background:none;}
.confirm-body{padding:24px 20px;font-size:14px;color:#333;line-height:1.6;background:#fff;}
.confirm-footer{padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;background:#fafafa;}
</style>''')
    html_parts.append('</head>')
    html_parts.append('<body>')
    html_parts.append('<div class="doc-page">')
    html_parts.append('  <aside class="doc-sidebar">')
    html_parts.append('    <div class="doc-sidebar-title">业务导航</div>')
    html_parts.append('    <ul class="doc-sidebar-menu">')
    html_parts.append('      <li><a href="#" class="active"><span class="menu-icon">&#128203;</span> ' + doc['name'] + '列表</a></li>')
    html_parts.append('      <li><a href="' + doc['code'].replace('_', '-') + '-create.html"><span class="menu-icon">&#10010;</span> ' + doc['name'] + '新增</a></li>')
    html_parts.append('    </ul>')
    html_parts.append('  </aside>')
    html_parts.append('  <div class="doc-content">')
    html_parts.append('    <header class="doc-header">')
    html_parts.append('      <div>')
    html_parts.append('        <div class="doc-header-title">' + doc['name'] + '</div>')
    html_parts.append('        <div class="doc-header-subtitle">管理' + doc['name'] + '信息</div>')
    html_parts.append('      </div>')
    html_parts.append('      <div class="doc-toolbar">')
    html_parts.append('        <button class="toolbar-btn" onclick="openFilterModal()"><span class="icon">🔍</span> 过滤</button>')
    html_parts.append('        <button class="toolbar-btn primary" onclick="location.href=\'' + doc['code'].replace('_', '-') + '-create.html\'"><span class="icon">+</span> 新增</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 批量提交</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 批量审核</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 批量反审核</button>')
    html_parts.append('        ' + close_buttons)
    html_parts.append('        <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>')
    html_parts.append('        <div style="width:1px;height:24px;background:#e8e8e8;margin:0 8px;"></div>')
    html_parts.append('        <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 显示/隐藏列</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="exitPage()"><span class="icon">✖️</span> 退出</button>')
    html_parts.append('      </div>')
    html_parts.append('    </header>')
    html_parts.append('    <div class="doc-body">')
    html_parts.append('      <div class="doc-card">')
    html_parts.append('        <table class="data-table">')
    html_parts.append('          <thead>')
    html_parts.append('            <tr>')
    html_parts.append('              <th><input type="checkbox" onclick="selectAll()"></th>')
    html_parts.append(columns_th)
    html_parts.append('            </tr>')
    html_parts.append('          </thead>')
    html_parts.append('          <tbody id="dataBody"></tbody>')
    html_parts.append('        </table>')
    html_parts.append('        <div class="pagination">')
    html_parts.append('          <button class="btn" onclick="prevPage()">上一页</button>')
    html_parts.append('          <span id="pageInfo">第 1 页 / 共 0 页</span>')
    html_parts.append('          <button class="btn" onclick="nextPage()">下一页</button>')
    html_parts.append('        </div>')
    html_parts.append('      </div>')
    html_parts.append('    </div>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    
    html_parts.append('<div class="confirm-modal" id="confirmModal">')
    html_parts.append('  <div class="confirm-dialog">')
    html_parts.append('    <div class="confirm-header">')
    html_parts.append('      <div class="confirm-title" id="confirmTitle">系统提示</div>')
    html_parts.append('      <button class="confirm-close" onclick="closeConfirm()">×</button>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="confirm-body" id="confirmBody"></div>')
    html_parts.append('    <div class="confirm-footer" id="confirmFooter">')
    html_parts.append('      <button class="btn btn-cancel" onclick="closeConfirm()">取消</button>')
    html_parts.append('      <button class="btn btn-primary" id="confirmOkBtn" onclick="confirmOk()">确定</button>')
    html_parts.append('    </div>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    html_parts.append('    ')
    html_parts.append('<div class="lookup-modal" id="lookupModal">')
    html_parts.append('  <div class="lookup-dialog">')
    html_parts.append('    <div class="lookup-header">')
    html_parts.append('      <div class="lookup-title" id="lookupTitle">选择</div>')
    html_parts.append('      <button class="lookup-close" onclick="closeLookup()">×</button>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="lookup-body">')
    html_parts.append('      <div class="lookup-search">')
    html_parts.append('        <input type="text" id="lookupKeyword" placeholder="请输入编码或名称搜索" onkeydown="if(event.key===\'Enter\')filterLookup()">')
    html_parts.append('        <button onclick="filterLookup()">搜索</button>')
    html_parts.append('      </div>')
    html_parts.append('      <table class="lookup-table">')
    html_parts.append('        <thead id="lookupTableHead"></thead>')
    html_parts.append('        <tbody id="lookupTableBody"></tbody>')
    html_parts.append('      </table>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="lookup-footer">')
    html_parts.append('      <button class="btn btn-cancel" onclick="closeLookup()">取消</button>')
    html_parts.append('      <button class="btn btn-primary" onclick="confirmLookup()">确定</button>')
    html_parts.append('    </div>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    
    html_parts.append('<div class="column-modal" id="columnModal">')
    html_parts.append('  <div class="column-dialog">')
    html_parts.append('    <div class="column-header">')
    html_parts.append('      <div class="column-title">列设置</div>')
    html_parts.append('      <button class="column-close" onclick="closeColumnSettings()">×</button>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="column-body">')
    html_parts.append('      <div id="columnCheckboxes"></div>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="column-footer">')
    html_parts.append('      <button class="btn btn-cancel" onclick="closeColumnSettings()">取消</button>')
    html_parts.append('      <button class="btn btn-primary" onclick="saveColumnSettings()">确定</button>')
    html_parts.append('    </div>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    
    html_parts.append('<div class="filter-modal" id="filterModal">')
    html_parts.append('  <div class="filter-dialog">')
    html_parts.append('    <div class="filter-header">')
    html_parts.append('      <div class="filter-title">过滤条件</div>')
    html_parts.append('      <button class="filter-close" onclick="closeFilterModal()">×</button>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="filter-body">')
    html_parts.append('      <div class="form-row">')
    html_parts.append('        <div class="form-group"><label>单据编号</label><input type="text" id="filterDocNo" placeholder="请输入单据编号"></div>')
    html_parts.append('        <div class="form-group"><label>' + partner_label + '</label><input type="text" id="filterPartner" placeholder="请输入' + partner_label + '"></div>')
    html_parts.append('        <div class="form-group"><label>组织</label><input type="text" id="filterOrg" placeholder="请输入组织"></div>')
    html_parts.append('      </div>')
    html_parts.append('      <div class="form-row">')
    html_parts.append('        <div class="form-group"><label>状态</label><select id="filterStatus"><option value="">全部状态</option><option value="draft">草稿</option><option value="pending">待审核</option><option value="approved">已审核</option><option value="closed">已关闭</option></select></div>')
    html_parts.append('        <div class="form-group"><label>开始日期</label><input type="date" id="filterStartDate"></div>')
    html_parts.append('        <div class="form-group"><label>结束日期</label><input type="date" id="filterEndDate"></div>')
    html_parts.append('      </div>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="filter-footer">')
    html_parts.append('      <button class="btn btn-cancel" onclick="closeFilterModal()">取消</button>')
    html_parts.append('      <button class="btn" onclick="resetFilter()">重置</button>')
    html_parts.append('      <button class="btn btn-primary" onclick="searchData()">确定</button>')
    html_parts.append('    </div>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    
    html_parts.append('<script>')
    html_parts.append('var docType = \'' + doc['code'] + '\';')
    html_parts.append('var docName = \'' + doc['name'] + '\';')
    html_parts.append('var allColumns = ' + all_columns_json + ';')
    html_parts.append('var defaultVisibleColumns = ' + default_visible_json + ';')
    html_parts.append('var visibleColumns = JSON.parse(localStorage.getItem(\'visible_columns_\' + docType) || JSON.stringify(defaultVisibleColumns));')
    html_parts.append('var currentPage = 1;')
    html_parts.append('var pageSize = 10;')
    html_parts.append('function init() { loadData(); }')
    html_parts.append('function loadData() {')
    html_parts.append('  var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('  if (list.length === 0) {')
    html_parts.append('    var now = new Date().toISOString();')
    html_parts.append('    list = [{ id: \'1\', docNo: \'' + doc_code_upper + '202607170001\', partnerName: \'' + partner_data + '\', orgName: \'磐枢工业集团\', docDate: \'2026-07-17\', amount: 10000, status: \'approved\', createdAt: now }];')
    html_parts.append('    localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('  }')
    html_parts.append('  renderTable(list);')
    html_parts.append('}')
    html_parts.append('function renderTable(list) {')
    html_parts.append('  var tbody = document.getElementById(\'dataBody\');')
    html_parts.append('  tbody.innerHTML = \'\';')
    html_parts.append('  if (list.length === 0) { tbody.innerHTML = \'<tr><td colspan="\' + (allColumns.length + 1) + \'" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>\'; return; }')
    html_parts.append('  var statusMap = { \'draft\': \'草稿\', \'submitted\': \'待审核\', \'approved\': \'已审核\', \'closed\': \'已关闭\' };')
    html_parts.append('  var statusClassMap = { \'draft\': \'badge-warning\', \'submitted\': \'badge-warning\', \'approved\': \'badge-success\', \'closed\': \'badge-danger\' };')
    html_parts.append('  var colKeys = {')
    html_parts.append("    '单据编号': 'docNo', '日期': 'docDate', '供应商': 'partnerName', '客户': 'partnerName',")
    html_parts.append("    '组织': 'orgName', '金额': 'amount', '状态': 'status', '创建时间': 'createdAt',")
    html_parts.append("    '生产订单': 'productionOrder', '仓库': 'warehouse', '产品名称': 'productName', '数量': 'qty'")
    html_parts.append('  };')
    html_parts.append('  list.forEach(function(item) {')
    html_parts.append('    var row = document.createElement(\'tr\');')
    html_parts.append('    var cells = \'<td><input type="checkbox" class="data-checkbox" value="\' + item.id + \'"></td>\';')
    html_parts.append('    allColumns.forEach(function(col) {')
    html_parts.append('      var key = colKeys[col] || col;')
    html_parts.append('      var value = item[key] || \'\';')
    html_parts.append('      if (col === \'状态\') {')
    html_parts.append('        cells += \'<td><span class="badge \' + statusClassMap[value] + \'">\'+ statusMap[value] + \'</span></td>\';')
    html_parts.append('      } else if (col === \'金额\') {')
    html_parts.append('        cells += \'<td style="color:#f5222d;font-weight:600;">\' + parseFloat(value).toFixed(2) + \'</td>\';')
    html_parts.append('      } else if (col === \'创建时间\') {')
    html_parts.append('        cells += \'<td>\' + (value ? new Date(value).toLocaleString() : \'\') + \'</td>\';')
    html_parts.append('      } else if (col === \'单据编号\') {')
    html_parts.append('        cells += \'<td><a href="\' + docType.replace(/_/g, \'-\') + \'-create.html?id=\' + item.id + \'">\'+ value + \'</a></td>\';')
    html_parts.append('      } else {')
    html_parts.append('        cells += \'<td>\' + value + \'</td>\';')
    html_parts.append('      }')
    html_parts.append('    });')
    html_parts.append('    row.innerHTML = cells;')
    html_parts.append('    tbody.appendChild(row);')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function searchData() {')
    html_parts.append('  var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('  var filtered = list.filter(function(item) {')
    html_parts.append('    if (document.getElementById(\'filterDocNo\').value && !item.docNo.includes(document.getElementById(\'filterDocNo\').value)) return false;')
    html_parts.append('    if (document.getElementById(\'filterPartner\').value && !item.partnerName.includes(document.getElementById(\'filterPartner\').value)) return false;')
    html_parts.append('    if (document.getElementById(\'filterOrg\').value && !item.orgName.includes(document.getElementById(\'filterOrg\').value)) return false;')
    html_parts.append('    if (document.getElementById(\'filterStatus\').value && item.status !== document.getElementById(\'filterStatus\').value) return false;')
    html_parts.append('    if (document.getElementById(\'filterStartDate\').value && item.docDate < document.getElementById(\'filterStartDate\').value) return false;')
    html_parts.append('    if (document.getElementById(\'filterEndDate\').value && item.docDate > document.getElementById(\'filterEndDate\').value) return false;')
    html_parts.append('    return true;')
    html_parts.append('  });')
    html_parts.append('  closeFilterModal();')
    html_parts.append('  renderTable(filtered);')
    html_parts.append('}')
    html_parts.append('function openFilterModal() { document.getElementById(\'filterModal\').classList.add(\'show\'); }')
    html_parts.append('function closeFilterModal() { document.getElementById(\'filterModal\').classList.remove(\'show\'); }')
    html_parts.append('function resetFilter() { document.getElementById(\'filterDocNo\').value = \'\'; document.getElementById(\'filterPartner\').value = \'\'; document.getElementById(\'filterOrg\').value = \'\'; document.getElementById(\'filterStatus\').value = \'\'; document.getElementById(\'filterStartDate\').value = \'\'; document.getElementById(\'filterEndDate\').value = \'\'; }')
    html_parts.append('function selectAll() { document.querySelectorAll(\'.data-checkbox\').forEach(function(cb) { cb.checked = document.querySelector(\'.data-table th input\').checked; }); }')
    html_parts.append('function getSelectedIds() { return Array.from(document.querySelectorAll(\'.data-checkbox:checked\')).map(function(cb) { return cb.value; }); }')
    html_parts.append('function batchSubmit() {')
    html_parts.append('  var ids = getSelectedIds();')
    html_parts.append('  if (ids.length === 0) { showToast(\'请选择要提交的单据\', \'warning\'); return; }')
    html_parts.append('  showConfirm(\'确认提交选中的 \' + ids.length + \' 条单据？\', function() {')
    html_parts.append('    var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('    list.forEach(function(item) { if (ids.includes(item.id) && item.status === \'draft\') item.status = \'submitted\'; });')
    html_parts.append('    localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('    showToast(\'已提交 \' + ids.length + \' 条单据\', \'success\');')
    html_parts.append('    loadData();')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function batchApprove() {')
    html_parts.append('  var ids = getSelectedIds();')
    html_parts.append('  if (ids.length === 0) { showToast(\'请选择要审核的单据\', \'warning\'); return; }')
    html_parts.append('  showConfirm(\'确认审核选中的 \' + ids.length + \' 条单据？\', function() {')
    html_parts.append('    var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('    list.forEach(function(item) { if (ids.includes(item.id) && item.status === \'submitted\') item.status = \'approved\'; });')
    html_parts.append('    localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('    showToast(\'已审核 \' + ids.length + \' 条单据\', \'success\');')
    html_parts.append('    loadData();')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function batchReverseApprove() {')
    html_parts.append('  var ids = getSelectedIds();')
    html_parts.append('  if (ids.length === 0) { showToast(\'请选择要反审核的单据\', \'warning\'); return; }')
    html_parts.append('  showConfirm(\'确认反审核选中的 \' + ids.length + \' 条单据？\', function() {')
    html_parts.append('    var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('    list.forEach(function(item) { if (ids.includes(item.id) && item.status === \'approved\') item.status = \'submitted\'; });')
    html_parts.append('    localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('    showToast(\'已反审核 \' + ids.length + \' 条单据\', \'success\');')
    html_parts.append('    loadData();')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function batchClose() {')
    html_parts.append('  var ids = getSelectedIds();')
    html_parts.append('  if (ids.length === 0) { showToast(\'请选择要关闭的单据\', \'warning\'); return; }')
    html_parts.append('  showConfirm(\'确认关闭选中的 \' + ids.length + \' 条单据？\', function() {')
    html_parts.append('    var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('    list.forEach(function(item) { if (ids.includes(item.id) && item.status === \'approved\') item.status = \'closed\'; });')
    html_parts.append('    localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('    showToast(\'已关闭 \' + ids.length + \' 条单据\', \'success\');')
    html_parts.append('    loadData();')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function batchReverseClose() {')
    html_parts.append('  var ids = getSelectedIds();')
    html_parts.append('  if (ids.length === 0) { showToast(\'请选择要反关闭的单据\', \'warning\'); return; }')
    html_parts.append('  showConfirm(\'确认反关闭选中的 \' + ids.length + \' 条单据？\', function() {')
    html_parts.append('    var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('    list.forEach(function(item) { if (ids.includes(item.id) && item.status === \'closed\') item.status = \'approved\'; });')
    html_parts.append('    localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('    showToast(\'已反关闭 \' + ids.length + \' 条单据\', \'success\');')
    html_parts.append('    loadData();')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function batchDelete() {')
    html_parts.append('  var ids = getSelectedIds();')
    html_parts.append('  if (ids.length === 0) { showToast(\'请选择要删除的单据\', \'warning\'); return; }')
    html_parts.append('  showConfirm(\'确认删除选中的 \' + ids.length + \' 条单据？\', function() {')
    html_parts.append('    var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('    list = list.filter(function(item) { return !ids.includes(item.id); });')
    html_parts.append('    localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('    showToast(\'已删除 \' + ids.length + \' 条单据\', \'success\');')
    html_parts.append('    loadData();')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function openColumnSettings() {')
    html_parts.append('  var container = document.getElementById(\'columnCheckboxes\');')
    html_parts.append('  container.innerHTML = \'\';')
    html_parts.append('  allColumns.forEach(function(col) {')
    html_parts.append('    var item = document.createElement(\'div\');')
    html_parts.append('    item.className = \'column-item\';')
    html_parts.append('    var checked = visibleColumns.includes(col) ? \'checked\' : \'\';')
    html_parts.append('    item.innerHTML = \'<input type="checkbox" \' + checked + \' value="\' + col + \'" onchange="toggleColumn(this)">\' + \'<label>\' + col + \'</label>\';')
    html_parts.append('    container.appendChild(item);')
    html_parts.append('  });')
    html_parts.append('  document.getElementById(\'columnModal\').classList.add(\'show\');')
    html_parts.append('}')
    html_parts.append('function closeColumnSettings() { document.getElementById(\'columnModal\').classList.remove(\'show\'); }')
    html_parts.append('function toggleColumn(cb) {')
    html_parts.append('  var idx = visibleColumns.indexOf(cb.value);')
    html_parts.append('  if (cb.checked && idx === -1) visibleColumns.push(cb.value);')
    html_parts.append('  else if (!cb.checked && idx !== -1) visibleColumns.splice(idx, 1);')
    html_parts.append('}')
    html_parts.append('function saveColumnSettings() {')
    html_parts.append('  localStorage.setItem(\'visible_columns_\' + docType, JSON.stringify(visibleColumns));')
    html_parts.append('  showToast(\'列设置已保存\', \'success\');')
    html_parts.append('  closeColumnSettings();')
    html_parts.append('  loadData();')
    html_parts.append('}')
    html_parts.append('function prevPage() { if (currentPage > 1) { currentPage--; loadData(); } }')
    html_parts.append('function nextPage() { loadData(); }')
    html_parts.append('function exitPage() { showConfirm(\'确认退出？\', function() { window.location.href = \'../index.html\'; }); }')
    html_parts.append('function showToast(msg, type) {')
    html_parts.append('  var toast = document.createElement(\'div\');')
    html_parts.append('  toast.className = \'toast toast-\' + type;')
    html_parts.append('  toast.innerText = msg;')
    html_parts.append('  document.body.appendChild(toast);')
    html_parts.append('  setTimeout(function() { toast.remove(); }, 2000);')
    html_parts.append('}')
    html_parts.append('var confirmCallback = null;')
    html_parts.append('function showConfirm(msg, onConfirm, type) {')
    html_parts.append('  var title = (type === \'warning\') ? \'温馨提示\' : \'系统提示\';')
    html_parts.append('  document.getElementById(\'confirmTitle\').innerText = title;')
    html_parts.append('  document.getElementById(\'confirmBody\').innerText = msg;')
    html_parts.append('  confirmCallback = onConfirm;')
    html_parts.append('  document.getElementById(\'confirmModal\').classList.add(\'show\');')
    html_parts.append('}')
    html_parts.append('function closeConfirm() {')
    html_parts.append('  document.getElementById(\'confirmModal\').classList.remove(\'show\');')
    html_parts.append('  confirmCallback = null;')
    html_parts.append('}')
    html_parts.append('function confirmOk() {')
    html_parts.append('  document.getElementById(\'confirmModal\').classList.remove(\'show\');')
    html_parts.append('  if (confirmCallback) { confirmCallback(); confirmCallback = null; }')
    html_parts.append('}')
    html_parts.append('document.addEventListener(\'DOMContentLoaded\', init);')
    html_parts.append('</script>')
    html_parts.append('</body>')
    html_parts.append('</html>')
    
    html = '\n'.join(html_parts)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Generated list: ' + file_name)

def generate_create_page(doc):
    file_name = doc['code'].replace('_', '-') + '-create.html'
    filepath = os.path.join(pages_dir, file_name)
    
    doc_code_upper = doc['code'].upper().replace('_', '')
    partner_label = '供应商' if doc['type'] == 'purchase' else '客户'
    
    close_buttons = ''
    if doc['has_close']:
        close_buttons = '<button class="toolbar-btn" onclick="closeDoc()"><span class="icon">🔒</span> 关闭</button>\n        <button class="toolbar-btn" onclick="reverseCloseDoc()"><span class="icon">🔓</span> 反关闭</button>'
    
    header_fields_html = ''
    for field in doc['header_fields']:
        if is_reverse_write_field(field):
            continue
        ftype = get_field_type(field)
        if ftype == 'readonly':
            header_fields_html += '<div class="form-item"><label>' + field + '</label><input type="text" id="field_' + field + '" readonly class="readonly"></div>'
        elif ftype == 'date':
            header_fields_html += '<div class="form-item"><label><span class="required">*</span>' + field + '</label><input type="date" id="field_' + field + '"></div>'
        elif ftype == 'datetime':
            header_fields_html += '<div class="form-item"><label>' + field + '</label><input type="datetime-local" id="field_' + field + '"></div>'
        elif ftype == 'lookup':
            ltype = get_lookup_type(field)
            header_fields_html += '<div class="form-item"><label>' + field + '</label><div class="lookup-field"><input type="text" id="field_' + field + '" readonly><button onclick="openLookup(\'' + field + '\', \'' + ltype + '\')">...</button></div></div>'
        elif ftype == 'select':
            options = ''
            if field == '币别':
                options = '<option value="CNY">人民币</option><option value="USD">美元</option><option value="EUR">欧元</option>'
            elif field == '税率':
                options = '<option value="0">0%</option><option value="0.03">3%</option><option value="0.06">6%</option><option value="0.09">9%</option><option value="0.13">13%</option>'
            elif field == '验收方式':
                options = '<option value="full">全检</option><option value="sample">抽检</option><option value="none">免检</option>'
            elif field == '退货原因':
                options = '<option value="quality">质量问题</option><option value="overstock">库存积压</option><option value="wrong">采购错误</option><option value="other">其他</option>'
            elif field == '入库类型':
                options = '<option value="purchase">采购入库</option><option value="production">生产入库</option><option value="transfer">调拨入库</option><option value="other">其他入库</option>'
            elif field == '出库类型':
                options = '<option value="sales">销售出库</option><option value="production">生产领料</option><option value="transfer">调拨出库</option><option value="other">其他出库</option>'
            header_fields_html += '<div class="form-item"><label>' + field + '</label><select id="field_' + field + '"><option value="">请选择</option>' + options + '</select></div>'
        else:
            header_fields_html += '<div class="form-item"><label>' + field + '</label><input type="text" id="field_' + field + '" placeholder="请输入' + field + '"></div>'
    
    detail_fields_th = ''
    for field in doc['detail_fields']:
        if is_reverse_write_field(field):
            continue
        detail_fields_th += '<th>' + field + '</th>'
    
    html_parts = []
    html_parts.append('<!DOCTYPE html>')
    html_parts.append('<html lang="zh-CN">')
    html_parts.append('<head>')
    html_parts.append('<meta charset="UTF-8">')
    html_parts.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    html_parts.append('<title>' + doc['name'] + ' - 新增/编辑</title>')
    html_parts.append('<link rel="stylesheet" href="../common.css">')
    html_parts.append('<script src="../common.js"></script>')
    html_parts.append('<script src="../doc-data-store.js"></script>')
    html_parts.append('<script src="../doc-conversion.js"></script>')
    html_parts.append('''<style>
.doc-page{display:flex;height:100vh;background:#f0f2f5;}
.doc-sidebar{width:200px;background:#001529;color:#fff;display:flex;flex-direction:column;}
.doc-sidebar-title{padding:16px 20px;font-size:15px;font-weight:600;border-bottom:1px solid #002140;background:#001529;}
.doc-sidebar-menu{list-style:none;padding:0;margin:0;flex:1;}
.doc-sidebar-menu li a{display:flex;align-items:center;padding:12px 20px;color:#bfbfbf;text-decoration:none;font-size:13px;transition:all 0.3s;}
.doc-sidebar-menu li a:hover{background:#002140;color:#fff;}
.doc-sidebar-menu li a.active{background:#1890ff;color:#fff;}
.doc-content{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.doc-header{background:#fff;border-bottom:1px solid #e8e8e8;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;}
.doc-header-title{font-size:20px;font-weight:600;color:#333;margin-bottom:4px;}
.doc-header-subtitle{font-size:13px;color:#999;}
.doc-toolbar{display:flex;gap:8px;flex-wrap:wrap;}
.toolbar-btn{padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;display:flex;align-items:center;gap:6px;transition:all 0.3s;}
.toolbar-btn:hover{border-color:#1890ff;color:#1890ff;}
.toolbar-btn.primary{background:#1890ff;color:#fff;border-color:#1890ff;}
.toolbar-btn.danger{background:#f5222d;color:#fff;border-color:#f5222d;}
.doc-body{flex:1;padding:16px;overflow-y:auto;}
.doc-card{background:#fff;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,0.05);overflow:hidden;margin-bottom:16px;}
.doc-card-title{padding:14px 20px;border-bottom:1px solid #e8e8e8;font-weight:600;font-size:14px;color:#333;background:#fafafa;}
.form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 16px;padding:20px;}
.form-item{display:flex;flex-direction:column;}
.form-item label{font-size:13px;color:#666;margin-bottom:4px;font-weight:500;}
.form-item label .required{color:#f5222d;margin-right:4px;}
.form-item input,.form-item select,.form-item textarea{padding:6px 10px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;color:#333;background:#fff;box-sizing:border-box;}
.form-item input:focus,.form-item select:focus{outline:none;border-color:#1890ff;}
.form-item textarea{resize:vertical;min-height:60px;}
.form-item .readonly{background:#fafafa;color:#999;}
.lookup-field{display:flex;align-items:center;}
.lookup-field input{flex:1;border-radius:4px 0 0 4px;}
.lookup-field button{width:28px;height:28px;border:1px solid #e8e8e8;border-left:none;border-radius:0 4px 4px 0;background:#fff;cursor:pointer;}
.lookup-field button:hover{background:#f5f5f5;}
.detail-toolbar{display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-bottom:1px solid #e8e8e8;background:#fafafa;}
.data-table{width:100%;border-collapse:collapse;}
.data-table th{background:#fafafa;padding:10px 12px;text-align:left;font-weight:600;font-size:12px;color:#666;border-bottom:2px solid #e8e8e8;}
.data-table td{padding:10px 12px;border-bottom:1px solid #e8e8e8;font-size:13px;color:#333;}
.data-table tr:hover{background:#f5f5f5;}
.data-table input{width:100%;padding:4px 8px;border:1px solid #e8e8e8;border-radius:4px;font-size:12px;}
.data-table select{width:100%;padding:4px 8px;border:1px solid #e8e8e8;border-radius:4px;font-size:12px;}
.doc-footer{background:#fff;border-top:1px solid #e8e8e8;padding:12px 20px;display:flex;justify-content:flex-end;gap:24px;align-items:center;}
.footer-item{display:flex;align-items:center;gap:8px;}
.footer-item label{font-size:12px;color:#666;}
.footer-item value{font-size:14px;font-weight:600;color:#333;}
.footer-item value.important{color:#f5222d;}
.toast{position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:4px;color:#fff;font-size:13px;z-index:9999;}
.toast-success{background:#52c41a;}
.toast-warning{background:#faad14;}
.toast-info{background:#1890ff;}
.lookup-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;justify-content:center;align-items:center;}
.lookup-modal.show{display:flex;}
.lookup-dialog{background:#fff;border:1px solid #d9d9d9;border-radius:8px;width:800px;min-width:600px;max-width:90vw;height:500px;min-height:400px;max-height:70vh;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);position:relative;resize:both;}
.lookup-header{padding:16px 20px;border-bottom:1px solid #f0f0f0;background:#fafafa;display:flex;align-items:center;justify-content:space-between;cursor:move;}
.lookup-title{font-size:16px;font-weight:600;color:#333;}
.lookup-close{font-size:20px;color:#999;cursor:pointer;border:none;background:none;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all 0.3s;cursor:pointer;}
.lookup-close:hover{background:#f5f5f5;color:#666;}
.lookup-search{display:flex;gap:8px;margin-bottom:12px;}
.lookup-search input{flex:1;padding:8px 12px;border:1px solid #e8e8e8;border-radius:4px;font-size:13px;}
.lookup-search button{padding:8px 16px;border:none;background:#1890ff;color:#fff;border-radius:4px;cursor:pointer;font-size:13px;}
.lookup-table{width:100%;border-collapse:collapse;}
.lookup-table th,.lookup-table td{padding:10px 12px;text-align:left;border-bottom:1px solid #e8e8e8;}
.lookup-table th{background:#fafafa;font-weight:600;color:#333;}
.btn{padding:6px 16px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid #d9d9d9;background:#fff;color:#666;transition:all 0.3s;}
.btn:hover{border-color:#1890ff;color:#1890ff;}
.btn-primary{background:#1890ff;color:#fff;border-color:#1890ff;}
.btn-cancel{border-color:#d9d9d9;color:#666;}
.confirm-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:3000;justify-content:center;align-items:center;}
.confirm-modal.show{display:flex;}
.confirm-dialog{background:#fff;border:1px solid #e8e8e8;border-radius:4px;width:420px;overflow:hidden;}
.confirm-header{padding:14px 20px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;background:#fafafa;}
.confirm-title{font-size:14px;font-weight:600;color:#333;}
.confirm-close{font-size:18px;color:#999;cursor:pointer;border:none;background:none;}
.confirm-body{padding:24px 20px;font-size:14px;color:#333;line-height:1.6;background:#fff;}
.confirm-footer{padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;background:#fafafa;}
</style>''')
    html_parts.append('</head>')
    html_parts.append('<body>')
    html_parts.append('<div class="doc-page">')
    html_parts.append('  <aside class="doc-sidebar">')
    html_parts.append('    <div class="doc-sidebar-title">业务导航</div>')
    html_parts.append('    <ul class="doc-sidebar-menu">')
    html_parts.append('      <li><a href="' + doc['code'].replace('_', '-') + '.html"><span class="menu-icon">&#128203;</span> ' + doc['name'] + '列表</a></li>')
    html_parts.append('      <li><a href="#" class="active"><span class="menu-icon">&#10010;</span> ' + doc['name'] + '新增</a></li>')
    html_parts.append('    </ul>')
    html_parts.append('  </aside>')
    html_parts.append('  <div class="doc-content">')
    html_parts.append('    <header class="doc-header">')
    html_parts.append('      <div>')
    html_parts.append('        <div class="doc-header-title" id="pageTitle">' + doc['name'] + ' - 新增</div>')
    html_parts.append('        <div class="doc-header-subtitle">新建' + doc['name'] + '</div>')
    html_parts.append('      </div>')
    html_parts.append('      <div class="doc-toolbar">')
    html_parts.append('        <button class="toolbar-btn" onclick="copyDoc()"><span class="icon">📋</span> 复制</button>')
    html_parts.append('        <button class="toolbar-btn primary" onclick="saveDoc()"><span class="icon">✓</span> 保存</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="submitDoc()"><span class="icon">✓</span> 提交</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="approveDoc()"><span class="icon">✓</span> 审核</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="reverseApproveDoc()"><span class="icon">↩️</span> 反审核</button>')
    html_parts.append('        <div style="width:1px;height:24px;background:#e8e8e8;margin:0 8px;"></div>')
    html_parts.append('        <button class="toolbar-btn" onclick="selectSourceDoc()"><span class="icon">🔗</span> 选单</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="pushDownDoc()"><span class="icon">⬇️</span> 下推</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="prevDoc()"><span class="icon">⬅️</span> 上查</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="nextDoc()"><span class="icon">➡️</span> 下查</button>')
    html_parts.append('        ' + close_buttons)
    html_parts.append('        <div style="width:1px;height:24px;background:#e8e8e8;margin:0 8px;"></div>')
    html_parts.append('        <button class="toolbar-btn" onclick="goToList()"><span class="icon">📋</span> 列表</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="printSettings()"><span class="icon">⚙️</span> 打印设置</button>')
    html_parts.append('        <button class="toolbar-btn" onclick="printDoc()"><span class="icon">🖨️</span> 打印</button>')
    html_parts.append('        <button class="toolbar-btn danger" onclick="exitDoc()"><span class="icon">✖️</span> 退出</button>')
    html_parts.append('      </div>')
    html_parts.append('    </header>')
    html_parts.append('    <div class="doc-body">')
    html_parts.append('      <div class="doc-card">')
    html_parts.append('        <div class="doc-card-title">基本信息</div>')
    html_parts.append('        <div class="form-grid">')
    html_parts.append(header_fields_html)
    html_parts.append('        </div>')
    html_parts.append('      </div>')
    html_parts.append('      <div class="doc-card">')
    html_parts.append('        <div class="doc-card-title">明细信息</div>')
    html_parts.append('        <div class="detail-toolbar">')
    html_parts.append('          <button class="toolbar-btn primary" onclick="addDetailRow()"><span class="icon">+</span> 新增行</button>')
    html_parts.append('          <button class="toolbar-btn" onclick="deleteSelectedRows()">删除选中行</button>')
    html_parts.append('        </div>')
    html_parts.append('        <table class="data-table">')
    html_parts.append('          <thead>')
    html_parts.append('            <tr>')
    html_parts.append('              <th><input type="checkbox" onclick="selectAllDetails()"></th>')
    html_parts.append('              <th>序号</th>')
    html_parts.append(detail_fields_th)
    html_parts.append('            </tr>')
    html_parts.append('          </thead>')
    html_parts.append('          <tbody id="detailBody"></tbody>')
    html_parts.append('          <tfoot>')
    html_parts.append('            <tr style="background:#fafafa;font-weight:600;">')
    html_parts.append('              <td colspan="' + str(len(doc['detail_fields']) + 1) + '" style="text-align:right;">合计金额</td>')
    html_parts.append('              <td id="totalAmount" style="color:#f5222d;font-size:14px;">0.00</td>')
    html_parts.append('            </tr>')
    html_parts.append('          </tfoot>')
    html_parts.append('        </table>')
    html_parts.append('      </div>')
    html_parts.append('    </div>')
    html_parts.append('    <footer class="doc-footer">')
    html_parts.append('      <div class="footer-item"><label>合计金额:</label><value id="footerAmount" class="important">0.00</value></div>')
    html_parts.append('    </footer>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    
    html_parts.append('<div class="confirm-modal" id="confirmModal">')
    html_parts.append('  <div class="confirm-dialog">')
    html_parts.append('    <div class="confirm-header">')
    html_parts.append('      <div class="confirm-title" id="confirmTitle">系统提示</div>')
    html_parts.append('      <button class="confirm-close" onclick="closeConfirm()">×</button>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="confirm-body" id="confirmBody"></div>')
    html_parts.append('    <div class="confirm-footer" id="confirmFooter">')
    html_parts.append('      <button class="btn btn-cancel" onclick="closeConfirm()">取消</button>')
    html_parts.append('      <button class="btn btn-primary" id="confirmOkBtn" onclick="confirmOk()">确定</button>')
    html_parts.append('    </div>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    html_parts.append('    ')
    html_parts.append('<div class="lookup-modal" id="lookupModal">')
    html_parts.append('  <div class="lookup-dialog">')
    html_parts.append('    <div class="lookup-header">')
    html_parts.append('      <div class="lookup-title" id="lookupTitle">选择</div>')
    html_parts.append('      <button onclick="closeLookup()">×</button>')
    html_parts.append('    </div>')
    html_parts.append('    <div class="lookup-body">')
    html_parts.append('      <div class="lookup-search">')
    html_parts.append('        <input type="text" id="lookupKeyword" placeholder="请输入编码或名称搜索" onkeydown="if(event.key===\'Enter\')filterLookup()">')
    html_parts.append('        <button onclick="filterLookup()">搜索</button>')
    html_parts.append('      </div>')
    html_parts.append('      <table class="lookup-table">')
    html_parts.append('        <thead id="lookupTableHead"></thead>')
    html_parts.append('        <tbody id="lookupTableBody"></tbody>')
    html_parts.append('      </table>')
    html_parts.append('    </div>')
    html_parts.append('    <div style="padding:12px 20px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px;">')
    html_parts.append('      <button class="btn btn-cancel" onclick="closeLookup()">取消</button>')
    html_parts.append('      <button class="btn btn-primary" onclick="confirmLookup()">确定</button>')
    html_parts.append('    </div>')
    html_parts.append('  </div>')
    html_parts.append('</div>')
    
    html_parts.append('<script>')
    html_parts.append('var docType = \'' + doc['code'] + '\';')
    html_parts.append('var docName = \'' + doc['name'] + '\';')
    html_parts.append('var editingId = null;')
    html_parts.append('var headerFields = ' + json.dumps(doc['header_fields']) + ';')
    html_parts.append('var detailFields = ' + json.dumps(doc['detail_fields']) + ';')
    html_parts.append('var currentLookupField = null;')
    html_parts.append('var currentLookupType = null;')
    html_parts.append('var lookupData = [];')
    html_parts.append('function init() {')
    html_parts.append('  var params = new URLSearchParams(window.location.search);')
    html_parts.append('  editingId = params.get(\'id\');')
    html_parts.append('  var sourceId = params.get(\'sourceId\');')
    html_parts.append('  if (editingId) {')
    html_parts.append('    document.getElementById(\'pageTitle\').innerText = docName + \' - 编辑\';')
    html_parts.append('    loadDoc(editingId);')
    html_parts.append('  } else if (sourceId) {')
    html_parts.append('    document.getElementById(\'pageTitle\').innerText = docName + \' - 新增\';')
    html_parts.append('    document.getElementById(\'field_单据编号\').value = generateDocNo();')
    html_parts.append('    document.getElementById(\'field_日期\').value = new Date().toISOString().split(\'T\')[0];')
    html_parts.append('    document.getElementById(\'field_状态\').value = \'草稿\';')
    html_parts.append('    loadSourceDoc(sourceId);')
    html_parts.append('  } else {')
    html_parts.append('    document.getElementById(\'field_单据编号\').value = generateDocNo();')
    html_parts.append('    document.getElementById(\'field_日期\').value = new Date().toISOString().split(\'T\')[0];')
    html_parts.append('    document.getElementById(\'field_状态\').value = \'草稿\';')
    html_parts.append('    addDetailRow();')
    html_parts.append('  }')
    html_parts.append('  initLookupData();')
    html_parts.append('}')
    html_parts.append('function generateDocNo() {')
    html_parts.append('  return \'' + doc_code_upper + '\' + new Date().toISOString().slice(2,10).replace(/-/g,\'\') + \'0001\';')
    html_parts.append('}')
    html_parts.append('function initLookupData() {')
    html_parts.append('  if (!localStorage.getItem(\'erp_orgs\')) localStorage.setItem(\'erp_orgs\', JSON.stringify([{id:\'org-001\',code:\'ORG-HQ\',name:\'磐枢工业集团\',form:\'集团\'}]));')
    html_parts.append('  if (!localStorage.getItem(\'erp_suppliers_cache\')) localStorage.setItem(\'erp_suppliers_cache\', JSON.stringify([{id:\'sup-001\',code:\'S-001\',name:\'深圳电子元器件有限公司\'}]));')
    html_parts.append('  if (!localStorage.getItem(\'erp_customers_cache\')) localStorage.setItem(\'erp_customers_cache\', JSON.stringify([{id:\'cust-001\',code:\'C-001\',name:\'上海科技有限公司\'}]));')
    html_parts.append('  if (!localStorage.getItem(\'erp_materials_cache\')) localStorage.setItem(\'erp_materials_cache\', JSON.stringify([{id:\'mat-001\',code:\'P-001\',name:\'高频传感器模块\',specification:\'HT-2026\',unit:\'个\'}]));')
    html_parts.append('  if (!localStorage.getItem(\'erp_warehouses_cache\')) localStorage.setItem(\'erp_warehouses_cache\', JSON.stringify([{id:\'wh-001\',code:\'WH-001\',name:\'原料仓\'}]));')
    html_parts.append('}')
    html_parts.append('function loadDoc(id) {')
    html_parts.append('  var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('  var doc = list.find(function(item) { return item.id === id; });')
    html_parts.append('  if (doc) {')
    html_parts.append('    headerFields.forEach(function(f) {')
    html_parts.append('      if (f !== \'备注\') {')
    html_parts.append('        document.getElementById(\'field_\' + f).value = doc[f] || \'\';')
    html_parts.append('      }')
    html_parts.append('    });')
    html_parts.append('    document.getElementById(\'field_备注\').value = doc.remark || \'\';')
    html_parts.append('    if (doc.details) doc.details.forEach(function(d) { addDetailRow(d); });')
    html_parts.append('    else addDetailRow();')
    html_parts.append('  }')
    html_parts.append('}')
    html_parts.append('function saveDoc() {')
    html_parts.append('  logConversion(\'saveDoc START\', { docType: docType, editingId: editingId });')
    html_parts.append('  var doc = collectDocData();')
    html_parts.append('  logConversion(\'单据数据收集完成\', { docNo: doc.单据编号, detailCount: doc.details ? doc.details.length : 0 });')
    html_parts.append('  var list = JSON.parse(localStorage.getItem(\'erp_\' + docType + \'_list\') || \'[]\');')
    html_parts.append('  logConversion(\'读取单据列表\', { listSize: list.length });')
    html_parts.append('  if (editingId) {')
    html_parts.append('    var idx = list.findIndex(function(item) { return item.id === editingId; });')
    html_parts.append('    logConversion(\'编辑模式\', { idx: idx, editingId: editingId });')
    html_parts.append('    if (idx !== -1) list[idx] = doc;')
    html_parts.append('  } else {')
    html_parts.append('    doc.id = Date.now().toString();')
    html_parts.append('    doc.createdAt = new Date().toISOString();')
    html_parts.append('    list.push(doc);')
    html_parts.append('    logConversion(\'新增模式\', { newId: doc.id });')
    html_parts.append('  }')
    html_parts.append('  localStorage.setItem(\'erp_\' + docType + \'_list\', JSON.stringify(list));')
    html_parts.append('  logConversion(\'saveDoc END\', { success: true, listSize: list.length });')
    html_parts.append('  showToast(\'保存成功\', \'success\');')
    html_parts.append('}')
    html_parts.append('function collectDocData() {')
    html_parts.append('  var doc = {};')
    html_parts.append('  headerFields.forEach(function(f) {')
    html_parts.append('    if (f !== \'备注\') {')
    html_parts.append('      doc[f] = document.getElementById(\'field_\' + f).value;')
    html_parts.append('    }')
    html_parts.append('  });')
    html_parts.append('  doc.remark = document.getElementById(\'field_备注\').value;')
    html_parts.append('  doc.details = [];')
    html_parts.append('  document.querySelectorAll(\'#detailBody tr\').forEach(function(row) {')
    html_parts.append('    var detail = {};')
    html_parts.append('    detailFields.forEach(function(f) {')
    html_parts.append('      detail[f] = row.querySelector(\'[data-field=\"\' + f + \'\"]\').value;')
    html_parts.append('    });')
    html_parts.append('    var sourceDocId = row.querySelector(\'[data-field=\"source_doc_id\"]\');')
    html_parts.append('    if (sourceDocId) detail.source_doc_id = sourceDocId.value;')
    html_parts.append('    var sourceDetailIndex = row.querySelector(\'[data-field=\"source_detail_index\"]\');')
    html_parts.append('    if (sourceDetailIndex) detail.source_detail_index = parseInt(sourceDetailIndex.value);')
    html_parts.append('    doc.details.push(detail);')
    html_parts.append('  });')
    html_parts.append('  return doc;')
    html_parts.append('}')
    html_parts.append('function submitDoc() {')
    html_parts.append('  logConversion(\'submitDoc START\', { docType: docType, editingId: editingId });')
    html_parts.append('  showConfirm(\'确认提交此单据？\', function() {')
    html_parts.append('    document.getElementById(\'field_状态\').value = \'待审核\';')
    html_parts.append('    logConversion(\'状态变更\', { status: \'待审核\' });')
    html_parts.append('    saveDoc();')
    html_parts.append('    logConversion(\'submitDoc END\', { success: true });')
    html_parts.append('    showToast(\'提交成功\', \'success\');')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function approveDoc() {')
    html_parts.append('  logConversion(\'approveDoc START\', { docType: docType, editingId: editingId });')
    html_parts.append('  showConfirm(\'确认审核此单据？\', function() {')
    html_parts.append('    var rules = getSourceRules(docType);')
    html_parts.append('    logConversion(\'审核 - 转换规则查询\', { hasRules: rules && rules.length > 0 });')
    html_parts.append('    if (rules && rules.length > 0) {')
    html_parts.append('      var doc = collectDocData();')
    html_parts.append('      doc.id = editingId || Date.now().toString();')
    html_parts.append('      logConversion(\'审核 - 收集单据数据\', { docNo: doc.单据编号, detailCount: doc.details ? doc.details.length : 0 });')
    html_parts.append('      var linkageCount = 0;')
    html_parts.append('      doc.details.forEach(function(detail) {')
    html_parts.append('        if (detail.source_doc_id !== undefined) {')
    html_parts.append('          linkageCount++;')
    html_parts.append('          var convertedQty = parseFloat(detail[qtyField]) || parseFloat(detail.数量) || 0;')
    html_parts.append('          logConversion(\'审核 - 明细行转换数量\', { materialCode: detail[\'物料编码\'], convertedQty: convertedQty });')
    html_parts.append('          saveLinkageRecord({')
    html_parts.append('            source_doc: rules[0].source_doc,')
    html_parts.append('            source_doc_id: detail.source_doc_id,')
    html_parts.append('            source_detail_index: detail.source_detail_index,')
    html_parts.append('            target_doc: docType,')
    html_parts.append('            target_doc_id: doc.id,')
    html_parts.append('            converted_qty: convertedQty,')
    html_parts.append('            create_time: new Date().toISOString()')
    html_parts.append('          });')
    html_parts.append('        }')
    html_parts.append('      });')
    html_parts.append('      logConversion(\'审核 - 关联记录保存\', { linkageCount: linkageCount });')
    html_parts.append('      logConversion(\'审核 - 开始执行反写\');')
    html_parts.append('      executeReverseWrite(doc);')
    html_parts.append('      logConversion(\'审核 - 反写完成\');')
    html_parts.append('      logConversion(\'审核 - 开始计算表头反写字段\');')
    html_parts.append('      calculateHeaderReverseWriteFields(doc);')
    html_parts.append('      logConversion(\'审核 - 表头反写字段计算完成\');')
    html_parts.append('    }')
    html_parts.append('    document.getElementById(\'field_状态\').value = \'已审核\';')
    html_parts.append('    logConversion(\'审核 - 状态变更\', { status: \'已审核\' });')
    html_parts.append('    saveDoc();')
    html_parts.append('    logConversion(\'approveDoc END\', { success: true });')
    html_parts.append('    showToast(\'审核成功\', \'success\');')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function reverseApproveDoc() {')
    html_parts.append('  showConfirm(\'确认反审核此单据？\', function() {')
    html_parts.append('    document.getElementById(\'field_状态\').value = \'待审核\';')
    html_parts.append('    saveDoc();')
    html_parts.append('    showToast(\'反审核成功\', \'success\');')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function closeDoc() {')
    html_parts.append('  showConfirm(\'确认关闭此单据？\', function() {')
    html_parts.append('    document.getElementById(\'field_状态\').value = \'已关闭\';')
    html_parts.append('    saveDoc();')
    html_parts.append('    showToast(\'关闭成功\', \'success\');')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function reverseCloseDoc() {')
    html_parts.append('  showConfirm(\'确认反关闭此单据？\', function() {')
    html_parts.append('    document.getElementById(\'field_状态\').value = \'已审核\';')
    html_parts.append('    saveDoc();')
    html_parts.append('    showToast(\'反关闭成功\', \'success\');')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function copyDoc() {')
    html_parts.append('  showToast(\'复制功能开发中\', \'info\');')
    html_parts.append('}')
    html_parts.append('function selectSourceDoc() {')
    html_parts.append('  var rules = getSourceRules(docType);')
    html_parts.append('  if (!rules || rules.length === 0) {')
    html_parts.append('    showToast(\'此单据不支持选单下推\', \'warning\');')
    html_parts.append('    return;')
    html_parts.append('  }')
    html_parts.append('  var sourceDocType = rules[0].source_doc;')
    html_parts.append('  var sourceList = JSON.parse(localStorage.getItem(\'erp_\' + sourceDocType + \'_list\') || \'[]\');')
    html_parts.append('  sourceList = sourceList.filter(function(d) { return d.status === \'approved\'; });')
    html_parts.append('  if (sourceList.length === 0) {')
    html_parts.append('    showToast(\'没有已审核的源单据\', \'warning\');')
    html_parts.append('    return;')
    html_parts.append('  }')
    html_parts.append('  window._sourceList = sourceList;')
    html_parts.append('  document.getElementById(\'lookupTitle\').innerText = \'选择源单据\';')
    html_parts.append('  var head = document.getElementById(\'lookupTableHead\');')
    html_parts.append('  var body = document.getElementById(\'lookupTableBody\');')
    html_parts.append('  head.innerHTML = \'<tr><th><input type="checkbox" onclick="selectAllSource()"></th><th>单据编号</th><th>日期</th><th>金额</th></tr>\';')
    html_parts.append('  body.innerHTML = \'\';')
    html_parts.append('  sourceList.forEach(function(doc) {')
    html_parts.append('    var row = document.createElement(\'tr\');')
    html_parts.append('    row.style.cursor = \'pointer\';')
    html_parts.append('    row.innerHTML = \'<td><input type="checkbox" class="source-checkbox" value="\' + doc.id + \'"></td><td>\' + doc.docNo + \'</td><td>\' + doc.docDate + \'</td><td>\' + parseFloat(doc.amount).toFixed(2) + \'</td>\';')
    html_parts.append('    body.appendChild(row);')
    html_parts.append('  });')
    html_parts.append('  document.getElementById(\'lookupModal\').classList.add(\'show\');')
    html_parts.append('  window._lookupMode = \'source_select\';')
    html_parts.append('}')
    html_parts.append('function selectAllSource() {')
    html_parts.append('  document.querySelectorAll(\'.source-checkbox\').forEach(function(cb) { cb.checked = event.target.checked; });')
    html_parts.append('}')
    html_parts.append('var qtyField = \'' + get_quantity_field(doc) + '\';')
    html_parts.append('function confirmSourceSelect() {')
    html_parts.append('  var selectedIds = Array.from(document.querySelectorAll(\'.source-checkbox:checked\')).map(function(cb) { return cb.value; });')
    html_parts.append('  if (selectedIds.length === 0) {')
    html_parts.append('    showToast(\'请选择源单据\', \'warning\');')
    html_parts.append('    return;')
    html_parts.append('  }')
    html_parts.append('  var sourceList = window._sourceList || [];')
    html_parts.append('  selectedIds.forEach(function(id) {')
    html_parts.append('    var sourceDoc = sourceList.find(function(d) { return d.id === id; });')
    html_parts.append('    if (sourceDoc && sourceDoc.details) {')
    html_parts.append('      sourceDoc.details.forEach(function(detail, index) {')
    html_parts.append('        var remainingQty = parseFloat(detail.数量) || 0;')
    html_parts.append('        var usedQty = getSourceDocUsedQty(sourceDoc.id, index);')
    html_parts.append('        remainingQty = Math.max(0, remainingQty - usedQty);')
    html_parts.append('        if (remainingQty > 0) {')
    html_parts.append('          var newRow = {')
    html_parts.append('            \'物料编码\': detail[\'物料编码\'] || \'\',')
    html_parts.append('            \'物料名称\': detail[\'物料名称\'] || \'\',')
    html_parts.append('            \'规格型号\': detail[\'规格型号\'] || \'\',')
    html_parts.append('            \'单位\': detail[\'单位\'] || \'\',')
    html_parts.append('            \'单价\': detail[\'单价\'] || \'\',')
    html_parts.append('            \'金额\': (remainingQty * (parseFloat(detail[\'单价\']) || 0)).toFixed(2),')
    html_parts.append('            \'税率\': detail[\'税率\'] || \'\',')
    html_parts.append('            \'税额\': \'\',')
    html_parts.append('            \'source_doc_id\': sourceDoc.id,')
    html_parts.append('            \'source_detail_index\': index')
    html_parts.append('          };')
    html_parts.append('          newRow[qtyField] = remainingQty.toFixed(2);')
    html_parts.append('          addDetailRow(newRow);')
    html_parts.append('        }')
    html_parts.append('      });')
    html_parts.append('    }')
    html_parts.append('  });')
    html_parts.append('  closeLookup();')
    html_parts.append('  showToast(\'已成功携带源单据数据\', \'success\');')
    html_parts.append('}')
    html_parts.append('function loadSourceDoc(sourceId) {')
    html_parts.append('  logConversion(\'loadSourceDoc START\', { sourceId: sourceId, targetDocType: docType });')
    html_parts.append('  var rules = getSourceRules(docType);')
    html_parts.append('  if (!rules || rules.length === 0) {')
    html_parts.append('    logConversion(\'loadSourceDoc END\', { reason: \'此单据不支持从源单据下推\' });')
    html_parts.append('    return;')
    html_parts.append('  }')
    html_parts.append('  var sourceDocType = rules[0].source_doc;')
    html_parts.append('  var sourceList = JSON.parse(localStorage.getItem(\'erp_\' + sourceDocType + \'_list\') || \'[]\');')
    html_parts.append('  var sourceDoc = sourceList.find(function(d) { return d.id === sourceId; });')
    html_parts.append('  if (!sourceDoc) {')
    html_parts.append('    logConversion(\'loadSourceDoc END\', { reason: \'未找到源单据\' });')
    html_parts.append('    showToast(\'未找到源单据\', \'error\');')
    html_parts.append('    return;')
    html_parts.append('  }')
    html_parts.append('  logConversion(\'源单据查找成功\', { sourceDocNo: sourceDoc.docNo, sourceDocType: sourceDocType });')
    html_parts.append('  sourceDoc.docType = sourceDocType;')
    html_parts.append('  var convertData = prepareConvertData(sourceDoc, docType);')
    html_parts.append('  logConversion(\'转换数据准备完成\', { headerFields: Object.keys(convertData.header), detailCount: convertData.details.length });')
    html_parts.append('  if (convertData.header.sourceDocNo) {')
    html_parts.append('    var sourceField = headerFields.find(function(f) { return f === \'源单据编号\' || f === \'生产订单\' || f === \'采购订单\' || f === \'销售订单\' || f === \'收料通知单\' || f === \'检验单\'; });')
    html_parts.append('    if (sourceField && document.getElementById(\'field_\' + sourceField)) {')
    html_parts.append('      document.getElementById(\'field_\' + sourceField).value = convertData.header.sourceDocNo;')
    html_parts.append('    }')
    html_parts.append('  }')
    html_parts.append('  if (convertData.header.供应商) {')
    html_parts.append('    document.getElementById(\'field_供应商\').value = convertData.header.供应商;')
    html_parts.append('  }')
    html_parts.append('  if (convertData.header.客户) {')
    html_parts.append('    document.getElementById(\'field_客户\').value = convertData.header.客户;')
    html_parts.append('  }')
    html_parts.append('  if (convertData.header.组织) {')
    html_parts.append('    document.getElementById(\'field_组织\').value = convertData.header.组织;')
    html_parts.append('  }')
    html_parts.append('  if (convertData.details && convertData.details.length > 0) {')
    html_parts.append('    document.getElementById(\'detailBody\').innerHTML = \'\';')
    html_parts.append('    convertData.details.forEach(function(row) {')
    html_parts.append('      addDetailRow(row);')
    html_parts.append('    });')
    html_parts.append('    logConversion(\'明细数据已加载\', { detailCount: convertData.details.length });')
    html_parts.append('  }')
    html_parts.append('  logConversion(\'loadSourceDoc END\', { success: true });')
    html_parts.append('}')
    html_parts.append('function pushDownDoc() {')
    html_parts.append('  logConversion(\'pushDownDoc START\', { docType: docType, editingId: editingId });')
    html_parts.append('  var rules = getTargetRules(docType);')
    html_parts.append('  if (!rules || rules.length === 0) {')
    html_parts.append('    logConversion(\'pushDownDoc END\', { reason: \'此单据不支持下推\' });')
    html_parts.append('    showToast(\'此单据不支持下推\', \'warning\');')
    html_parts.append('    return;')
    html_parts.append('  }')
    html_parts.append('  logConversion(\'下推规则查询\', { ruleCount: rules.length, rules: rules.map(function(r) { return r.name; }) });')
    html_parts.append('  if (rules.length === 1) {')
    html_parts.append('    var targetDoc = rules[0].target_doc;')
    html_parts.append('    var targetName = rules[0].name.replace(/.*下推/, \'\');')
    html_parts.append('    logConversion(\'下推目标\', { targetDoc: targetDoc, targetName: targetName });')
    html_parts.append('    showConfirm(\'确认下推生成\' + targetName + \'？\', function() {')
    html_parts.append('      logConversion(\'下推执行\', { url: targetDoc.replace(/_/g, \'-\') + \'-create.html?sourceId=\' + (editingId || \'\') });')
    html_parts.append('      window.location.href = targetDoc.replace(/_/g, \'-\') + \'-create.html?sourceId=\' + (editingId || \'\');')
    html_parts.append('    });')
    html_parts.append('  } else {')
    html_parts.append('    var html = \'\';')
    html_parts.append('    rules.forEach(function(r, i) {')
    html_parts.append('      html += \'<button class="toolbar-btn" style="width:100%;margin-bottom:8px;justify-content:flex-start;" onclick="executePushDown(\\\'\' + r.target_doc + \'\\\',\\\'\' + r.name + \'\\\')"><span class="icon">⬇️</span> \' + r.name + \'</button>\';')
    html_parts.append('    });')
    html_parts.append('    document.getElementById(\'confirmBody\').innerHTML = html;')
    html_parts.append('    document.getElementById(\'confirmTitle\').innerText = \'系统提示\';')
    html_parts.append('    document.getElementById(\'confirmFooter\').style.display = \'none\';')
    html_parts.append('    document.getElementById(\'confirmModal\').classList.add(\'show\');')
    html_parts.append('  }')
    html_parts.append('}')
    html_parts.append('function executePushDown(targetDoc, ruleName) {')
    html_parts.append('  document.getElementById(\'confirmModal\').classList.remove(\'show\');')
    html_parts.append('  document.getElementById(\'confirmFooter\').style.display = \'\';')
    html_parts.append('  window.location.href = targetDoc.replace(/_/g, \'-\') + \'-create.html?sourceId=\' + (editingId || \'\');')
    html_parts.append('}')
    html_parts.append('function prevDoc() {')
    html_parts.append('  showToast(\'上查功能开发中\', \'info\');')
    html_parts.append('}')
    html_parts.append('function nextDoc() {')
    html_parts.append('  showToast(\'下查功能开发中\', \'info\');')
    html_parts.append('}')
    html_parts.append('function goToList() {')
    html_parts.append('  window.location.href = \'' + doc['code'].replace('_', '-') + '.html\';')
    html_parts.append('}')
    html_parts.append('function printSettings() {')
    html_parts.append('  showToast(\'打印设置功能开发中\', \'info\');')
    html_parts.append('}')
    html_parts.append('function printDoc() {')
    html_parts.append('  showToast(\'打印功能开发中\', \'info\');')
    html_parts.append('}')
    html_parts.append('function exitDoc() {')
    html_parts.append('  showConfirm(\'确认退出？\', function() {')
    html_parts.append('    window.location.href = \'' + doc['code'].replace('_', '-') + '.html\';')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function addDetailRow(data) {')
    html_parts.append('  var tbody = document.getElementById(\'detailBody\');')
    html_parts.append('  var row = document.createElement(\'tr\');')
    html_parts.append('  var idx = tbody.children.length + 1;')
    html_parts.append('  var cells = \'<td><input type="checkbox" class="detail-checkbox"></td>\';')
    html_parts.append('  cells += \'<td>\' + idx + \'</td>\';')
    html_parts.append('  var reverseFields = [\'收料数量\', \'检验数量\', \'入库数量\', \'未到货数量\', \'未入库数量\', \'发货数量\', \'出库数量\', \'未发货数量\', \'未出库数量\', \'领料数量\', \'退料数量\', \'未领料数量\', \'合格数量\', \'不合格数量\', \'未检验数量\', \'订单数量\', \'送检数量\', \'入库上限\', \'入库下限\', \'成品率\'];')
    html_parts.append('  detailFields.forEach(function(f) {')
    html_parts.append('    if (reverseFields.includes(f)) return;')
    html_parts.append('    var val = data && data[f] ? data[f] : \'\';')
    html_parts.append('    if (f === \'仓库\') {')
    html_parts.append('      cells += \'<td><div class="lookup-field"><input type="text" data-field="\' + f + \'" value="\' + val + \'" readonly><button onclick="openWarehouseLookup(this)">...</button></div></td>\';')
    html_parts.append('    } else if (f === \'物料编码\') {')
    html_parts.append('      cells += \'<td><div class="lookup-field"><input type="text" data-field="\' + f + \'" value="\' + val + \'" readonly><button onclick="openMaterialLookup(this)">...</button></div></td>\';')
    html_parts.append('    } else if (f === \'物料名称\') {')
    html_parts.append('      cells += \'<td><input type="text" data-field="\' + f + \'" value="\' + val + \'" readonly></td>\';')
    html_parts.append('    } else if (f === \'金额\' || f === \'税额\') {')
    html_parts.append('      cells += \'<td><input type="text" data-field="\' + f + \'" value="\' + val + \'" readonly class="readonly"></td>\';')
    html_parts.append('    } else if (f === \'税率\') {')
    html_parts.append('      cells += \'<td><select data-field="\' + f + \'"><option value="0">0%</option><option value="0.03">3%</option><option value="0.06">6%</option><option value="0.09">9%</option><option value="0.13">13%</option></select></td>\';')
    html_parts.append('    } else {')
    html_parts.append('      cells += \'<td><input type="text" data-field="\' + f + \'" value="\' + val + \'" oninput="calculateRow(this)"></td>\';')
    html_parts.append('    }')
    html_parts.append('  });')
    html_parts.append('  if (data && data.source_doc_id) {')
    html_parts.append('    cells += \'<input type="hidden" data-field="source_doc_id" value="\' + data.source_doc_id + \'" />\';')
    html_parts.append('  }')
    html_parts.append('  if (data && data.source_detail_index !== undefined) {')
    html_parts.append('    cells += \'<input type="hidden" data-field="source_detail_index" value="\' + data.source_detail_index + \'" />\';')
    html_parts.append('  }')
    html_parts.append('  row.innerHTML = cells;')
    html_parts.append('  tbody.appendChild(row);')
    html_parts.append('  if (data) calculateTotal();')
    html_parts.append('}')
    html_parts.append('function deleteSelectedRows() {')
    html_parts.append('  document.querySelectorAll(\'.detail-checkbox:checked\').forEach(function(cb) {')
    html_parts.append('    cb.closest(\'tr\').remove();')
    html_parts.append('  });')
    html_parts.append('  calculateTotal();')
    html_parts.append('}')
    html_parts.append('function selectAllDetails() {')
    html_parts.append('  document.querySelectorAll(\'.detail-checkbox\').forEach(function(cb) {')
    html_parts.append('    cb.checked = document.querySelector(\'.detail-toolbar + table th input\').checked;')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function calculateRow(input) {')
    html_parts.append('  var row = input.closest(\'tr\');')
    html_parts.append('  var qty = parseFloat(row.querySelector(\'[data-field=\"数量\"]\').value) || 0;')
    html_parts.append('  var price = parseFloat(row.querySelector(\'[data-field=\"单价\"]\').value) || 0;')
    html_parts.append('  var taxRate = parseFloat(row.querySelector(\'[data-field=\"税率\"]\').value) || 0;')
    html_parts.append('  var amount = (qty * price).toFixed(2);')
    html_parts.append('  var tax = (amount * taxRate).toFixed(2);')
    html_parts.append('  row.querySelector(\'[data-field=\"金额\"]\').value = amount;')
    html_parts.append('  row.querySelector(\'[data-field=\"税额\"]\').value = tax;')
    html_parts.append('  calculateTotal();')
    html_parts.append('}')
    html_parts.append('function calculateTotal() {')
    html_parts.append('  var total = 0;')
    html_parts.append('  document.querySelectorAll(\'#detailBody tr\').forEach(function(row) {')
    html_parts.append('    var amount = parseFloat(row.querySelector(\'[data-field=\"金额\"]\').value) || 0;')
    html_parts.append('    total += amount;')
    html_parts.append('  });')
    html_parts.append('  document.getElementById(\'totalAmount\').innerText = total.toFixed(2);')
    html_parts.append('  document.getElementById(\'footerAmount\').innerText = total.toFixed(2);')
    html_parts.append('  document.getElementById(\'field_金额\').value = total.toFixed(2);')
    html_parts.append('}')
    html_parts.append('function openLookup(field, type) {')
    html_parts.append('  currentLookupField = field;')
    html_parts.append('  currentLookupType = type;')
    html_parts.append('  var titles = { \'supplier\': \'选择供应商\', \'customer\': \'选择客户\', \'org\': \'选择组织\', \'warehouse\': \'选择仓库\', \'material\': \'选择物料\', \'employee\': \'选择员工\', \'department\': \'选择部门\' };')
    html_parts.append('  document.getElementById(\'lookupTitle\').innerText = titles[type] || \'选择\';')
    html_parts.append('  var caches = { \'supplier\': \'erp_suppliers_cache\', \'customer\': \'erp_customers_cache\', \'org\': \'erp_orgs\', \'warehouse\': \'erp_warehouses_cache\', \'material\': \'erp_materials_cache\', \'employee\': \'erp_employees_cache\', \'department\': \'erp_departments_cache\' };')
    html_parts.append('  var data = JSON.parse(localStorage.getItem(caches[type]) || \'[]\');')
    html_parts.append('  if (type === \'material\') {')
    html_parts.append('    renderLookupTable(data, [\'code\', \'name\', \'specification\', \'unit\'], [\'编码\', \'名称\', \'规格型号\', \'单位\']);')
    html_parts.append('  } else {')
    html_parts.append('    renderLookupTable(data, [\'code\', \'name\'], [\'编码\', \'名称\']);')
    html_parts.append('  }')
    html_parts.append('  document.getElementById(\'lookupModal\').classList.add(\'show\');')
    html_parts.append('}')
    html_parts.append('var currentDetailRow = null;')
    html_parts.append('function openWarehouseLookup(btn) {')
    html_parts.append('  currentDetailRow = btn.closest(\'tr\');')
    html_parts.append('  currentLookupField = \'detail_warehouse\';')
    html_parts.append('  var data = JSON.parse(localStorage.getItem(\'erp_warehouses_cache\') || \'[]\');')
    html_parts.append('  renderLookupTable(data, [\'code\', \'name\'], [\'编码\', \'名称\']);')
    html_parts.append('  document.getElementById(\'lookupTitle\').textContent = \'选择仓库\';')
    html_parts.append('  document.getElementById(\'lookupModal\').classList.add(\'show\');')
    html_parts.append('}')
    html_parts.append('function openMaterialLookup(btn) {')
    html_parts.append('  currentDetailRow = btn.closest(\'tr\');')
    html_parts.append('  currentLookupField = \'detail_material\';')
    html_parts.append('  var data = JSON.parse(localStorage.getItem(\'erp_materials_cache\') || \'[]\');')
    html_parts.append('  renderLookupTable(data, [\'code\', \'name\', \'specification\', \'unit\'], [\'物料编码\', \'物料名称\', \'规格型号\', \'基本单位\']);')
    html_parts.append('  document.getElementById(\'lookupTitle\').textContent = \'选择物料\';')
    html_parts.append('  document.getElementById(\'lookupModal\').classList.add(\'show\');')
    html_parts.append('}')
    html_parts.append('function renderLookupTable(data, keys, labels) {')
    html_parts.append('  var head = document.getElementById(\'lookupTableHead\');')
    html_parts.append('  var body = document.getElementById(\'lookupTableBody\');')
    html_parts.append('  head.innerHTML = \'<tr>\' + labels.map(function(l) { return \'<th>\' + l + \'</th>\'; }).join(\'\') + \'</tr>\';')
    html_parts.append('  body.innerHTML = \'\';')
    html_parts.append('  data.forEach(function(item) {')
    html_parts.append('    var row = document.createElement(\'tr\');')
    html_parts.append('    row.style.cursor = \'pointer\';')
    html_parts.append('    row.onclick = function() { selectLookupItem(item); };')
    html_parts.append('    var cells = keys.map(function(k) { return \'<td>\' + (item[k] || \'\') + \'</td>\'; }).join(\'\');')
    html_parts.append('    row.innerHTML = cells;')
    html_parts.append('    body.appendChild(row);')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function filterLookup() {')
    html_parts.append('  var keyword = document.getElementById(\'lookupKeyword\').value.toLowerCase();')
    html_parts.append('  document.querySelectorAll(\'#lookupTableBody tr\').forEach(function(row) {')
    html_parts.append('    row.style.display = row.innerText.toLowerCase().includes(keyword) ? \'\' : \'none\';')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function selectLookupItem(item) {')
    html_parts.append('  window.selectedLookupItem = item;')
    html_parts.append('  document.querySelectorAll(\'#lookupTableBody tr\').forEach(function(r) {')
    html_parts.append('    r.style.backgroundColor = \'\';')
    html_parts.append('    r.style.borderLeft = \'\';')
    html_parts.append('  });')
    html_parts.append('  var rows = document.querySelectorAll(\'#lookupTableBody tr\');')
    html_parts.append('  rows.forEach(function(row) {')
    html_parts.append('    if (row.innerText.includes(item.code) && row.innerText.includes(item.name)) {')
    html_parts.append('      row.style.backgroundColor = \'#e6f7ff\';')
    html_parts.append('      row.style.borderLeft = \'3px solid #1890ff\';')
    html_parts.append('    }')
    html_parts.append('  });')
    html_parts.append('}')
    html_parts.append('function confirmLookup() {')
    html_parts.append('  if (window._lookupMode === \'source_select\') {')
    html_parts.append('    confirmSourceSelect();')
    html_parts.append('    return;')
    html_parts.append('  }')
    html_parts.append('  if (window.selectedLookupItem) {')
    html_parts.append('    if (currentLookupField === \'detail_material\' && currentDetailRow) {')
    html_parts.append('      var item = window.selectedLookupItem;')
    html_parts.append('      var codeInput = currentDetailRow.querySelector(\'[data-field="物料编码"]\');')
    html_parts.append('      var nameInput = currentDetailRow.querySelector(\'[data-field="物料名称"]\');')
    html_parts.append('      var specInput = currentDetailRow.querySelector(\'[data-field="规格型号"]\');')
    html_parts.append('      var unitInput = currentDetailRow.querySelector(\'[data-field="单位"]\');')
    html_parts.append('      if (codeInput) codeInput.value = item.code || \'\';')
    html_parts.append('      if (nameInput) nameInput.value = item.name || \'\';')
    html_parts.append('      if (specInput) specInput.value = item.specification || \'\';')
    html_parts.append('      if (unitInput) unitInput.value = item.unit || \'\';')
    html_parts.append('    } else if (currentLookupField === \'detail_warehouse\' && currentDetailRow) {')
    html_parts.append('      var item = window.selectedLookupItem;')
    html_parts.append('      var whInput = currentDetailRow.querySelector(\'[data-field="仓库"]\');')
    html_parts.append('      if (whInput) whInput.value = item.name || item.code || \'\';')
    html_parts.append('    } else {')
    html_parts.append('      var displayName = window.selectedLookupItem.name || window.selectedLookupItem.code;')
    html_parts.append('      document.getElementById(\'field_\' + currentLookupField).value = displayName;')
    html_parts.append('    }')
    html_parts.append('    closeLookup();')
    html_parts.append('  } else {')
    html_parts.append('    showToast(\'请选择一条记录\', \'warning\');')
    html_parts.append('  }')
    html_parts.append('}')
    html_parts.append('function closeLookup() {')
    html_parts.append('  document.getElementById(\'lookupModal\').classList.remove(\'show\');')
    html_parts.append('  window.selectedLookupItem = null;')
    html_parts.append('  window._lookupMode = null;')
    html_parts.append('}')
    html_parts.append('function showToast(msg, type) {')
    html_parts.append('  var toast = document.createElement(\'div\');')
    html_parts.append('  toast.className = \'toast toast-\' + type;')
    html_parts.append('  toast.innerText = msg;')
    html_parts.append('  document.body.appendChild(toast);')
    html_parts.append('  setTimeout(function() { toast.remove(); }, 2000);')
    html_parts.append('}')
    html_parts.append('var confirmCallback = null;')
    html_parts.append('function showConfirm(msg, onConfirm, type) {')
    html_parts.append('  var title = (type === \'warning\') ? \'温馨提示\' : \'系统提示\';')
    html_parts.append('  document.getElementById(\'confirmTitle\').innerText = title;')
    html_parts.append('  document.getElementById(\'confirmBody\').innerText = msg;')
    html_parts.append('  confirmCallback = onConfirm;')
    html_parts.append('  document.getElementById(\'confirmModal\').classList.add(\'show\');')
    html_parts.append('}')
    html_parts.append('function closeConfirm() {')
    html_parts.append('  document.getElementById(\'confirmModal\').classList.remove(\'show\');')
    html_parts.append('  confirmCallback = null;')
    html_parts.append('}')
    html_parts.append('function confirmOk() {')
    html_parts.append('  document.getElementById(\'confirmModal\').classList.remove(\'show\');')
    html_parts.append('  if (confirmCallback) { confirmCallback(); confirmCallback = null; }')
    html_parts.append('}')
    html_parts.append('document.addEventListener(\'DOMContentLoaded\', init);')
    html_parts.append('</script>')
    html_parts.append('</body>')
    html_parts.append('</html>')
    
    html = '\n'.join(html_parts)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Generated create: ' + file_name)

def main():
    print('=== 开始生成单据页面 ===')
    errors = validate_config()
    if errors:
        print('配置验证失败：')
        for err in errors:
            print('  - ' + err)
        return
    
    for doc in documents:
        generate_list_page(doc)
        generate_create_page(doc)
    
    print('=== 单据页面生成完成 ===')

if __name__ == '__main__':
    main()