import os

PAGES_PATH = r"D:\开发测试\hub-erp-v0\traewordp\pages"

def generate_page(template):
    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{template['title']}</title>
<link rel="stylesheet" href="../common.css">
<script src="../common.js"></script>
<style>
.modal-overlay {{ display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:flex-start; padding-top:40px; }}
.modal-overlay.show {{ display:flex; }}
.modal-dialog {{ background:#fff; border:1px solid #e8e8e8; border-radius:4px; width:600px; max-height:88vh; overflow-y:auto; box-shadow:0 4px 16px rgba(0,0,0,0.15); }}
.modal-header {{ display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-bottom:1px solid #e8e8e8; position:sticky; top:0; background:#fff; z-index:2; }}
.modal-title {{ font-size:16px; font-weight:600; color:#333; }}
.modal-close {{ cursor:pointer; font-size:22px; color:#666; background:none; border:none; line-height:1; padding:0 4px; }}
.modal-close:hover {{ color:#f5222d; }}
.modal-body {{ padding:16px 20px; }}
.modal-footer {{ display:flex; justify-content:flex-end; gap:8px; padding:12px 20px; border-top:1px solid #e8e8e8; position:sticky; bottom:0; background:#fff; z-index:2; }}
.modal-toolbar {{ display:flex; align-items:center; gap:0; padding:6px 20px; background:#f5f5f5; border-bottom:1px solid #e8e8e8; }}
.modal-tool-btn {{ display:flex; align-items:center; gap:4px; padding:6px 14px; border:none; background:transparent; font-size:13px; color:#333; cursor:pointer; border-radius:4px; }}
.modal-tool-btn:hover {{ background:#e8e8e8; }}
.modal-tool-btn.primary {{ color:#1890ff; font-weight:500; }}
.modal-tool-btn.danger {{ color:#f5222d; }}
.modal-tool-separator {{ width:1px; height:20px; background:#e8e8e8; margin:0 4px; }}
.form-grid {{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px 16px; }}
.form-grid .full-row {{ grid-column:1/-1; }}
.form-group {{ margin-bottom:0; }}
.form-group label {{ display:block;font-size:12px;color:#666;margin-bottom:4px;font-weight:500; }}
.form-group label .required {{ color:#f5222d; margin-right:4px; }}
.form-input,.form-select,.form-textarea {{ width:100%; padding:6px 10px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; color:#333; background:#fff; }}
.form-input:focus,.form-select:focus,.form-textarea:focus {{ border-color:#1890ff; outline:none; }}
.form-textarea {{ resize:vertical; min-height:60px; }}
.page-header {{ margin-bottom: 20px; }}
.search-area {{ background: #fff; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px; }}
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
.action-btn {{ padding: 4px 10px; margin-right: 4px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }}
.action-btn.view {{ background: #e6f7ff; color: #1890ff; }}
.action-btn.edit {{ background: #fffbe6; color: #faad14; }}
.action-btn.delete {{ background: #fff2f0; color: #f5222d; }}
.action-btn.audit {{ background: #f6ffed; color: #52c41a; }}
.badge {{ padding: 2px 8px; border-radius: 4px; font-size: 12px; }}
.badge-success {{ background: #f6ffed; color: #52c41a; }}
.badge-warning {{ background: #fffbe6; color: #faad14; }}
.page-actions {{ display:flex; gap:8px; }}
</style>
</head>
<body>
<aside class="sidebar" id="sidebar">
<div class="sidebar-logo">
    <img src="../images/logo.png" alt="磐枢工业智能平台" style="width: 100%; max-width: 200px; margin-bottom: 8px;">
    <h1 style="font-size: 16px; margin: 0;">磐枢HubPang</h1>
  </div>
  <nav class="sidebar-menu"></nav>
<div class="sidebar-user"><div class="avatar">管理员</div>
</aside>
<div class="main-content" id="mainContent">
  <div class="page-header">
    <div>
      <div class="flex items-center gap-8">
        <button class="sidebar-toggle" onclick="toggleSidebar()">&#9776;</button>
        <div>
          <h2>{template['page_title']}</h2>
          <div class="breadcrumb"><a href="../index.html">首页</a> <span>/</span> <span>基础资料</span></div>
        </div>
      </div>
    </div>
    <div class="page-actions">
      <button class="btn btn-primary btn-sm" onclick="openModal('add')">+ 新增</button>
    </div>
  </div>
  <div class="search-area">
    <div class="search-row">
      <div class="search-item"><label>关键字</label><input type="text" placeholder="请输入关键字"></div>
      <div class="search-item"><label>状态</label><select><option>全部状态</option><option>已启用</option><option>未启用</option></select></div>
    </div>
    <button class="search-btn" onclick="searchData()">查询</button>
  </div>
  <div class="table-wrapper">
    <table class="data-table">
      <thead><tr>
'''
    
    for col in template['list_columns']:
        html += f'<th>{col}</th>'
    html += '<th>操作</th></tr></thead><tbody>'
    
    for row in template['sample_data']:
        html += '<tr>'
        for col in template['list_columns']:
            val = row.get(template['columns_map'].get(col, col), '')
            if col == '状态':
                status_map = {'approved': '已启用', 'draft': '未启用', 'pending': '待审核'}
                badge_class = 'badge-success' if row.get('status') == 'approved' else 'badge-warning'
                html += f'<td><span class="badge {badge_class}">{status_map.get(row.get("status"), val)}</span></td>'
            else:
                html += f'<td>{val}</td>'
        html += '<td><button class="action-btn view" onclick="viewItem()">查看</button><button class="action-btn edit" onclick="editItem()">编辑</button><button class="action-btn delete" onclick="deleteItem()">删除</button></td></tr>'
    
    html += '''</tbody></table>
  </div>
</div>

<div class="modal-overlay" id="dataModal">
  <div class="modal-dialog">
    <div class="modal-header">
      <span class="modal-title" id="modalTitle">新增</span>
      <button class="modal-close" onclick="closeModal('dataModal')">&times;</button>
    </div>
    <div class="modal-toolbar">
      <button class="modal-tool-btn" onclick="openModal('add')"><span>&#10010;</span> 新增</button>
      <button class="modal-tool-btn primary" onclick="saveItem()"><span>&#128184;</span> 保存</button>
      <button class="modal-tool-btn" onclick="submitItem()"><span>&#9989;</span> 提交</button>
      <button class="modal-tool-btn" onclick="auditItem()"><span>&#10004;</span> 审核</button>
      <div class="modal-tool-separator"></div>
      <button class="modal-tool-btn" onclick="closeModal('dataModal')"><span>&#128203;</span> 关闭</button>
    </div>
    <div class="modal-body">
      <form id="dataForm">
        <input type="hidden" id="dataId">
        <div class="form-grid">
'''
    
    for field in template['modal_fields']:
        required_mark = '<span style="color:#f5222d;">*</span>' if field['required'] else ''
        if field['type'] == 'select':
            options_html = ''.join(f'<option value="{opt}">{opt}</option>' for opt in field['options'])
            html += f'<div class="form-group"><label class="form-label">{field["label"]} {required_mark}</label><select class="form-select" id="{field["name"]}">{options_html}</select></div>'
        elif field['type'] == 'textarea':
            html += f'<div class="form-group"><label class="form-label">{field["label"]} {required_mark}</label><textarea class="form-textarea" id="{field["name"]}" placeholder="{field.get("placeholder", "")}"></textarea></div>'
        elif field['type'] in ['date', 'time']:
            html += f'<div class="form-group"><label class="form-label">{field["label"]} {required_mark}</label><input type="{field["type"]}" class="form-input" id="{field["name"]}"></div>'
        else:
            placeholder = field.get('placeholder', '')
            step = f' step="{field.get("step")}"' if field.get('step') else ''
            html += f'<div class="form-group"><label class="form-label">{field["label"]} {required_mark}</label><input type="{field["type"]}" class="form-input" id="{field["name"]}" placeholder="{placeholder}"{step}></div>'
    
    html += '''        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal('dataModal')">取消</button>
      <button class="btn btn-primary btn-sm" onclick="saveItem()">保存</button>
    </div>
  </div>
</div>

<script>
function openModal(id){ document.getElementById('dataModal').classList.add('show'); }
function closeModal(id){ document.getElementById(id).classList.remove('show'); }
function searchData(){ alert('查询成功'); }
function viewItem(){ alert('查看详情'); }
function editItem(){ alert('编辑'); }
function deleteItem(){ if(confirm('确认删除?')){ alert('删除成功'); } }
function saveItem(){ alert('保存成功'); }
function submitItem(){ alert('提交成功'); }
function auditItem(){ alert('审核成功'); }
</script>
</body>
</html>'''
    return html

PAGE_TEMPLATES = {
    "base-org": {
        "title": "组织架构管理 - 基础资料",
        "page_title": "组织架构管理",
        "list_columns": ["组织编码", "组织名称", "简称", "组织类型", "负责人", "状态"],
        "columns_map": {"组织编码": "code", "组织名称": "name", "简称": "shortName", "组织类型": "form", "负责人": "contact"},
        "modal_fields": [
            {"name": "orgCode", "label": "组织编码", "required": True, "type": "text", "placeholder": "请输入组织编码"},
            {"name": "orgName", "label": "组织名称", "required": True, "type": "text", "placeholder": "请输入组织名称"},
            {"name": "orgShortName", "label": "简称", "required": False, "type": "text", "placeholder": "请输入简称"},
            {"name": "orgForm", "label": "组织形态", "required": True, "type": "select", "options": ["集团", "公司", "部门", "车间", "班组"]},
            {"name": "orgParent", "label": "上级组织", "required": False, "type": "text", "placeholder": "请输入上级组织"},
            {"name": "orgContact", "label": "联系人", "required": False, "type": "text", "placeholder": "请输入联系人"},
            {"name": "orgAddress", "label": "地址", "required": False, "type": "text", "placeholder": "请输入地址"},
            {"name": "orgTel", "label": "联系电话", "required": False, "type": "text", "placeholder": "请输入联系电话"},
            {"name": "orgIsCorp", "label": "法人", "required": False, "type": "select", "options": ["是", "否"]},
            {"name": "orgIsAccountOrg", "label": "核算组织", "required": False, "type": "select", "options": ["是", "否"]},
            {"name": "orgIsBusinessOrg", "label": "业务组织", "required": False, "type": "select", "options": ["是", "否"]},
            {"name": "orgStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"ORG-G01","name":"磐枢工业集团","shortName":"磐枢集团","form":"集团","contact":"张总裁","status":"approved"},
            {"id":"2","code":"ORG-C01","name":"磐枢智能制造有限公司","shortName":"磐枢智能","form":"公司","contact":"李总经理","status":"approved"},
            {"id":"3","code":"ORG-D01","name":"生产制造部","shortName":"生产部","form":"部门","contact":"王经理","status":"approved"},
            {"id":"4","code":"ORG-D02","name":"财务部","shortName":"财务","form":"部门","contact":"赵经理","status":"approved"},
        ]
    },
    "base-department": {
        "title": "部门管理 - 基础资料",
        "page_title": "部门管理",
        "list_columns": ["部门编码", "部门名称", "简称", "上级部门", "部门属性", "负责人", "状态"],
        "columns_map": {"部门编码": "code", "部门名称": "name", "简称": "shortName", "上级部门": "parent", "部门属性": "property", "负责人": "manager"},
        "modal_fields": [
            {"name": "deptCode", "label": "部门编码", "required": True, "type": "text", "placeholder": "请输入部门编码"},
            {"name": "deptName", "label": "部门名称", "required": True, "type": "text", "placeholder": "请输入部门名称"},
            {"name": "deptShortName", "label": "简称", "required": False, "type": "text", "placeholder": "请输入简称"},
            {"name": "deptParent", "label": "上级部门", "required": False, "type": "text", "placeholder": "请输入上级部门"},
            {"name": "deptProperty", "label": "部门属性", "required": False, "type": "select", "options": ["生产部门", "管理部门", "销售部门", "财务部门", "研发部门"]},
            {"name": "deptManager", "label": "负责人", "required": False, "type": "text", "placeholder": "请输入负责人"},
            {"name": "deptStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"DEPT-001","name":"生产制造部","shortName":"生产部","parent":"","property":"生产部门","manager":"张经理","status":"approved"},
            {"id":"2","code":"DEPT-002","name":"财务部","shortName":"财务","parent":"","property":"财务部门","manager":"李经理","status":"approved"},
            {"id":"3","code":"DEPT-003","name":"销售部","shortName":"销售","parent":"","property":"销售部门","manager":"王经理","status":"approved"},
            {"id":"4","code":"DEPT-004","name":"研发部","shortName":"研发","parent":"","property":"研发部门","manager":"赵经理","status":"approved"},
            {"id":"5","code":"DEPT-001-01","name":"装配车间","shortName":"装配","parent":"生产制造部","property":"生产部门","manager":"孙主管","status":"approved"},
            {"id":"6","code":"DEPT-001-02","name":"质检车间","shortName":"质检","parent":"生产制造部","property":"生产部门","manager":"周主管","status":"approved"},
        ]
    },
    "base-employee": {
        "title": "员工管理 - 基础资料",
        "page_title": "员工管理",
        "list_columns": ["员工编号", "员工姓名", "编码", "部门", "岗位", "移动电话", "状态"],
        "columns_map": {"员工编号": "number", "员工姓名": "name", "编码": "code", "部门": "dept", "岗位": "post", "移动电话": "mobile"},
        "modal_fields": [
            {"name": "empNumber", "label": "员工编号", "required": True, "type": "text", "placeholder": "请输入员工编号"},
            {"name": "empName", "label": "员工姓名", "required": True, "type": "text", "placeholder": "请输入员工姓名"},
            {"name": "empCode", "label": "编码", "required": False, "type": "text", "placeholder": "请输入编码"},
            {"name": "empDept", "label": "部门", "required": False, "type": "select", "options": ["生产制造部", "财务部", "销售部", "研发部", "装配车间", "质检车间"]},
            {"name": "empPost", "label": "岗位", "required": False, "type": "select", "options": ["经理", "工程师", "会计", "销售员", "主管", "检验员"]},
            {"name": "empMobile", "label": "移动电话", "required": False, "type": "text", "placeholder": "请输入移动电话"},
            {"name": "empEmail", "label": "电子邮箱", "required": False, "type": "text", "placeholder": "请输入电子邮箱"},
            {"name": "empTel", "label": "固定电话", "required": False, "type": "text", "placeholder": "请输入固定电话"},
            {"name": "empAddress", "label": "联系地址", "required": False, "type": "text", "placeholder": "请输入联系地址"},
            {"name": "empStatus", "label": "状态", "required": False, "type": "select", "options": ["已在职", "离职"]},
        ],
        "sample_data": [
            {"id":"1","number":"EMP-001","name":"张三","code":"U2001","dept":"生产制造部","post":"经理","mobile":"13800001234","status":"approved"},
            {"id":"2","number":"EMP-002","name":"李四","code":"U2002","dept":"生产制造部","post":"工程师","mobile":"13800001235","status":"approved"},
            {"id":"3","number":"EMP-003","name":"王五","code":"U2003","dept":"财务部","post":"会计","mobile":"13800001236","status":"approved"},
            {"id":"4","number":"EMP-004","name":"赵六","code":"U2004","dept":"销售部","post":"销售员","mobile":"13800001237","status":"approved"},
            {"id":"5","number":"EMP-005","name":"孙七","code":"U2005","dept":"装配车间","post":"主管","mobile":"13800001238","status":"approved"},
        ]
    },
    "base-position": {
        "title": "岗位管理 - 基础资料",
        "page_title": "岗位管理",
        "list_columns": ["岗位编码", "岗位名称", "所属部门", "生效日期", "失效日期", "状态"],
        "columns_map": {"岗位编码": "code", "岗位名称": "name", "所属部门": "dept", "生效日期": "effectDate", "失效日期": "lapseDate"},
        "modal_fields": [
            {"name": "posCode", "label": "岗位编码", "required": False, "type": "text", "placeholder": "请输入岗位编码"},
            {"name": "posName", "label": "岗位名称", "required": True, "type": "text", "placeholder": "请输入岗位名称"},
            {"name": "posDept", "label": "所属部门", "required": True, "type": "select", "options": ["生产制造部", "财务部", "销售部", "研发部", "装配车间", "质检车间"]},
            {"name": "posEffectDate", "label": "生效日期", "required": True, "type": "date"},
            {"name": "posLapseDate", "label": "失效日期", "required": True, "type": "date"},
            {"name": "posStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"POS-001","name":"经理","dept":"生产制造部","effectDate":"2024-01-01","lapseDate":"2029-12-31","status":"approved"},
            {"id":"2","code":"POS-002","name":"工程师","dept":"生产制造部","effectDate":"2024-01-01","lapseDate":"2029-12-31","status":"approved"},
            {"id":"3","code":"POS-003","name":"会计","dept":"财务部","effectDate":"2024-01-01","lapseDate":"2029-12-31","status":"approved"},
            {"id":"4","code":"POS-004","name":"销售员","dept":"销售部","effectDate":"2024-01-01","lapseDate":"2029-12-31","status":"approved"},
            {"id":"5","code":"POS-005","name":"检验员","dept":"质检车间","effectDate":"2024-01-01","lapseDate":"2029-12-31","status":"approved"},
        ]
    },
    "base-unit": {
        "title": "计量单位管理 - 基础资料",
        "page_title": "计量单位管理",
        "list_columns": ["单位编码", "单位名称", "所属组别", "精度", "舍入类型", "状态"],
        "columns_map": {"单位编码": "code", "单位名称": "name", "所属组别": "group", "精度": "precision", "舍入类型": "roundType"},
        "modal_fields": [
            {"name": "unitCode", "label": "单位编码", "required": False, "type": "text", "placeholder": "请输入单位编码"},
            {"name": "unitName", "label": "单位名称", "required": True, "type": "text", "placeholder": "请输入单位名称"},
            {"name": "unitGroup", "label": "所属组别", "required": True, "type": "select", "options": ["数量", "长度", "重量", "体积", "面积"]},
            {"name": "unitPrecision", "label": "精度", "required": False, "type": "number", "placeholder": "请输入精度"},
            {"name": "unitRoundType", "label": "舍入类型", "required": True, "type": "select", "options": ["四舍五入", "向上取整", "向下取整"]},
            {"name": "unitStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"UNIT-001","name":"个","group":"数量","precision":"0","roundType":"四舍五入","status":"approved"},
            {"id":"2","code":"UNIT-002","name":"件","group":"数量","precision":"0","roundType":"四舍五入","status":"approved"},
            {"id":"3","code":"UNIT-003","name":"米","group":"长度","precision":"2","roundType":"四舍五入","status":"approved"},
            {"id":"4","code":"UNIT-004","name":"千克","group":"重量","precision":"3","roundType":"四舍五入","status":"approved"},
            {"id":"5","code":"UNIT-005","name":"立方米","group":"体积","precision":"3","roundType":"四舍五入","status":"approved"},
        ]
    },
    "base-unit-convert": {
        "title": "单位换算管理 - 基础资料",
        "page_title": "单位换算管理",
        "list_columns": ["源单位", "目标单位", "换算分子", "换算分母", "状态"],
        "columns_map": {"源单位": "source", "目标单位": "target", "换算分子": "numerator", "换算分母": "denominator"},
        "modal_fields": [
            {"name": "convSource", "label": "源单位", "required": True, "type": "select", "options": ["个", "件", "米", "千克", "立方米"]},
            {"name": "convTarget", "label": "目标单位", "required": True, "type": "select", "options": ["个", "件", "米", "千克", "立方米"]},
            {"name": "convNumerator", "label": "换算分子", "required": True, "type": "number", "placeholder": "请输入换算分子"},
            {"name": "convDenominator", "label": "换算分母", "required": True, "type": "number", "placeholder": "请输入换算分母"},
            {"name": "convStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","source":"个","target":"件","numerator":"10","denominator":"1","status":"approved"},
            {"id":"2","source":"件","target":"个","numerator":"1","denominator":"10","status":"approved"},
            {"id":"3","source":"米","target":"千米","numerator":"1","denominator":"1000","status":"approved"},
            {"id":"4","source":"千克","target":"克","numerator":"1000","denominator":"1","status":"approved"},
        ]
    },
    "base-currency": {
        "title": "币种管理 - 基础资料",
        "page_title": "币种管理",
        "list_columns": ["币种编码", "币种名称", "符号", "状态"],
        "columns_map": {"币种编码": "code", "币种名称": "name", "符号": "symbol"},
        "modal_fields": [
            {"name": "currCode", "label": "币种编码", "required": True, "type": "text", "placeholder": "请输入币种编码"},
            {"name": "currName", "label": "币种名称", "required": True, "type": "text", "placeholder": "请输入币种名称"},
            {"name": "currSymbol", "label": "符号", "required": False, "type": "text", "placeholder": "请输入符号"},
            {"name": "currStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"CNY","name":"人民币","symbol":"¥","status":"approved"},
            {"id":"2","code":"USD","name":"美元","symbol":"$","status":"approved"},
            {"id":"3","code":"EUR","name":"欧元","symbol":"€","status":"approved"},
            {"id":"4","code":"JPY","name":"日元","symbol":"¥","status":"approved"},
        ]
    },
    "base-exchange-rate": {
        "title": "汇率管理 - 基础资料",
        "page_title": "汇率管理",
        "list_columns": ["源币种", "目标币种", "汇率", "生效日期", "状态"],
        "columns_map": {"源币种": "source", "目标币种": "target", "汇率": "value", "生效日期": "date"},
        "modal_fields": [
            {"name": "rateSource", "label": "源币种", "required": True, "type": "select", "options": ["CNY", "USD", "EUR", "JPY"]},
            {"name": "rateTarget", "label": "目标币种", "required": True, "type": "select", "options": ["CNY", "USD", "EUR", "JPY"]},
            {"name": "rateValue", "label": "汇率", "required": True, "type": "number", "placeholder": "请输入汇率", "step": "0.0001"},
            {"name": "rateDate", "label": "生效日期", "required": True, "type": "date"},
            {"name": "rateStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","source":"USD","target":"CNY","value":"7.2450","date":"2024-01-01","status":"approved"},
            {"id":"2","source":"EUR","target":"CNY","value":"7.8560","date":"2024-01-01","status":"approved"},
            {"id":"3","source":"JPY","target":"CNY","value":"0.0485","date":"2024-01-01","status":"approved"},
        ]
    },
    "base-bank": {
        "title": "银行管理 - 基础资料",
        "page_title": "银行管理",
        "list_columns": ["银行编码", "银行名称", "联行号", "地区", "状态"],
        "columns_map": {"银行编码": "code", "银行名称": "name", "联行号": "branchNo", "地区": "area"},
        "modal_fields": [
            {"name": "bankCode", "label": "银行编码", "required": False, "type": "text", "placeholder": "请输入银行编码"},
            {"name": "bankName", "label": "银行名称", "required": True, "type": "text", "placeholder": "请输入银行名称"},
            {"name": "bankBranchNo", "label": "联行号", "required": False, "type": "text", "placeholder": "请输入联行号"},
            {"name": "bankArea", "label": "地区", "required": False, "type": "text", "placeholder": "请输入地区"},
            {"name": "bankAddress", "label": "银行地址", "required": False, "type": "text", "placeholder": "请输入银行地址"},
            {"name": "bankStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"BANK-001","name":"中国工商银行","branchNo":"10229000001","area":"上海市","status":"approved"},
            {"id":"2","code":"BANK-002","name":"中国建设银行","branchNo":"10529000001","area":"上海市","status":"approved"},
            {"id":"3","code":"BANK-003","name":"招商银行","branchNo":"30829000001","area":"上海市","status":"approved"},
        ]
    },
    "base-bank-account": {
        "title": "银行账户管理 - 基础资料",
        "page_title": "银行账户管理",
        "list_columns": ["账户名称", "银行账号", "开户银行", "币别", "状态"],
        "columns_map": {"账户名称": "name", "银行账号": "number", "开户银行": "bank", "币别": "currency"},
        "modal_fields": [
            {"name": "accName", "label": "账户名称", "required": True, "type": "text", "placeholder": "请输入账户名称"},
            {"name": "accNumber", "label": "银行账号", "required": True, "type": "text", "placeholder": "请输入银行账号"},
            {"name": "accBank", "label": "开户银行", "required": True, "type": "select", "options": ["中国工商银行", "中国建设银行", "招商银行"]},
            {"name": "accCurrency", "label": "币别", "required": True, "type": "select", "options": ["CNY", "USD", "EUR"]},
            {"name": "accIsPublic", "label": "对公账号", "required": False, "type": "select", "options": ["是", "否"]},
            {"name": "accStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","name":"基本账户","number":"6222021001001234567","bank":"中国工商银行","currency":"CNY","status":"approved"},
            {"id":"2","name":"一般账户","number":"6227001001005678901","bank":"中国建设银行","currency":"CNY","status":"approved"},
            {"id":"3","name":"外汇账户","number":"6222021001009876543","bank":"招商银行","currency":"USD","status":"approved"},
        ]
    },
    "base-category": {
        "title": "存货类别管理 - 基础资料",
        "page_title": "存货类别管理",
        "list_columns": ["类别编码", "类别名称", "上级类别", "状态"],
        "columns_map": {"类别编码": "code", "类别名称": "name", "上级类别": "parent"},
        "modal_fields": [
            {"name": "catCode", "label": "类别编码", "required": True, "type": "text", "placeholder": "请输入类别编码"},
            {"name": "catName", "label": "类别名称", "required": True, "type": "text", "placeholder": "请输入类别名称"},
            {"name": "catParent", "label": "上级类别", "required": False, "type": "text", "placeholder": "请输入上级类别"},
            {"name": "catStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"CAT-001","name":"原材料","parent":"","status":"approved"},
            {"id":"2","code":"CAT-002","name":"半成品","parent":"","status":"approved"},
            {"id":"3","code":"CAT-003","name":"成品","parent":"","status":"approved"},
            {"id":"4","code":"CAT-001-01","name":"电子元器件","parent":"原材料","status":"approved"},
            {"id":"5","code":"CAT-001-02","name":"塑胶件","parent":"原材料","status":"approved"},
        ]
    },
    "base-contact": {
        "title": "联系人管理 - 基础资料",
        "page_title": "联系人管理",
        "list_columns": ["联系人编码", "姓名", "职务", "电话", "手机", "状态"],
        "columns_map": {"联系人编码": "code", "姓名": "name", "职务": "post", "电话": "tel", "手机": "mobile"},
        "modal_fields": [
            {"name": "conCode", "label": "联系人编码", "required": False, "type": "text", "placeholder": "请输入联系人编码"},
            {"name": "conName", "label": "姓名", "required": True, "type": "text", "placeholder": "请输入姓名"},
            {"name": "conPost", "label": "职务", "required": False, "type": "text", "placeholder": "请输入职务"},
            {"name": "conTel", "label": "电话", "required": False, "type": "text", "placeholder": "请输入电话"},
            {"name": "conMobile", "label": "手机", "required": False, "type": "text", "placeholder": "请输入手机"},
            {"name": "conEmail", "label": "电子邮箱", "required": False, "type": "text", "placeholder": "请输入电子邮箱"},
            {"name": "conStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"CON-001","name":"李明华","post":"采购经理","tel":"021-5888-1234","mobile":"13800001234","status":"approved"},
            {"id":"2","code":"CON-002","name":"王建国","post":"销售总监","tel":"0755-2888-5678","mobile":"13900005678","status":"approved"},
            {"id":"3","code":"CON-003","name":"张丽","post":"财务经理","tel":"010-6888-9012","mobile":"13700009012","status":"approved"},
        ]
    },
    "base-cost-center": {
        "title": "成本中心管理 - 基础资料",
        "page_title": "成本中心管理",
        "list_columns": ["成本中心编码", "成本中心名称", "所属组织", "状态"],
        "columns_map": {"成本中心编码": "code", "成本中心名称": "name", "所属组织": "org"},
        "modal_fields": [
            {"name": "ccCode", "label": "成本中心编码", "required": False, "type": "text", "placeholder": "请输入成本中心编码"},
            {"name": "ccName", "label": "成本中心名称", "required": True, "type": "text", "placeholder": "请输入成本中心名称"},
            {"name": "ccOrg", "label": "所属组织", "required": False, "type": "select", "options": ["磐枢工业集团", "磐枢智能制造有限公司"]},
            {"name": "ccStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"CC-001","name":"生产成本中心","org":"磐枢智能制造有限公司","status":"approved"},
            {"id":"2","code":"CC-002","name":"管理成本中心","org":"磐枢智能制造有限公司","status":"approved"},
            {"id":"3","code":"CC-003","name":"销售成本中心","org":"磐枢智能制造有限公司","status":"approved"},
        ]
    },
    "base-expense-item": {
        "title": "费用项目管理 - 基础资料",
        "page_title": "费用项目管理",
        "list_columns": ["费用项目编码", "费用项目名称", "费用类型", "状态"],
        "columns_map": {"费用项目编码": "code", "费用项目名称": "name", "费用类型": "type"},
        "modal_fields": [
            {"name": "expCode", "label": "费用项目编码", "required": False, "type": "text", "placeholder": "请输入费用项目编码"},
            {"name": "expName", "label": "费用项目名称", "required": True, "type": "text", "placeholder": "请输入费用项目名称"},
            {"name": "expType", "label": "费用类型", "required": False, "type": "select", "options": ["管理费用", "销售费用", "制造费用", "财务费用"]},
            {"name": "expStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"EXP-001","name":"差旅费","type":"管理费用","status":"approved"},
            {"id":"2","code":"EXP-002","name":"办公费","type":"管理费用","status":"approved"},
            {"id":"3","code":"EXP-003","name":"水电费","type":"制造费用","status":"approved"},
            {"id":"4","code":"EXP-004","name":"广告费","type":"销售费用","status":"approved"},
        ]
    },
    "base-payment-term": {
        "title": "付款条件管理 - 基础资料",
        "page_title": "付款条件管理",
        "list_columns": ["付款条件编码", "付款条件名称", "付款方式", "到期日计算日期", "状态"],
        "columns_map": {"付款条件编码": "code", "付款条件名称": "name", "付款方式": "method", "到期日计算日期": "calcDate"},
        "modal_fields": [
            {"name": "payCode", "label": "付款条件编码", "required": False, "type": "text", "placeholder": "请输入付款条件编码"},
            {"name": "payName", "label": "付款条件名称", "required": True, "type": "text", "placeholder": "请输入付款条件名称"},
            {"name": "payMethod", "label": "付款方式", "required": True, "type": "select", "options": ["月结", "款到发货", "预付", "货到付款"]},
            {"name": "payCalcDate", "label": "到期日计算日期", "required": True, "type": "select", "options": ["单据日期", "物料日期", "对账日期"]},
            {"name": "payDays", "label": "付款天数", "required": False, "type": "number", "placeholder": "请输入付款天数"},
            {"name": "payStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"PAY-001","name":"月结30天","method":"月结","calcDate":"单据日期","status":"approved"},
            {"id":"2","code":"PAY-002","name":"月结60天","method":"月结","calcDate":"单据日期","status":"approved"},
            {"id":"3","code":"PAY-003","name":"款到发货","method":"款到发货","calcDate":"单据日期","status":"approved"},
            {"id":"4","code":"PAY-004","name":"预付30%","method":"预付","calcDate":"单据日期","status":"approved"},
        ]
    },
    "base-receipt-term": {
        "title": "收款条件管理 - 基础资料",
        "page_title": "收款条件管理",
        "list_columns": ["收款条件编码", "收款条件名称", "收款方式", "到期日计算日期", "状态"],
        "columns_map": {"收款条件编码": "code", "收款条件名称": "name", "收款方式": "method", "到期日计算日期": "calcDate"},
        "modal_fields": [
            {"name": "recCode", "label": "收款条件编码", "required": False, "type": "text", "placeholder": "请输入收款条件编码"},
            {"name": "recName", "label": "收款条件名称", "required": True, "type": "text", "placeholder": "请输入收款条件名称"},
            {"name": "recMethod", "label": "收款方式", "required": True, "type": "select", "options": ["月结", "预收", "货到付款", "款到发货"]},
            {"name": "recCalcDate", "label": "到期日计算日期", "required": True, "type": "select", "options": ["单据日期", "物料日期", "对账日期"]},
            {"name": "recDays", "label": "收款天数", "required": False, "type": "number", "placeholder": "请输入收款天数"},
            {"name": "recStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"REC-001","name":"月结30天","method":"月结","calcDate":"单据日期","status":"approved"},
            {"id":"2","code":"REC-002","name":"月结60天","method":"月结","calcDate":"单据日期","status":"approved"},
            {"id":"3","code":"REC-003","name":"预收30%","method":"预收","calcDate":"单据日期","status":"approved"},
        ]
    },
    "base-safety-stock": {
        "title": "安全库存管理 - 基础资料",
        "page_title": "安全库存管理",
        "list_columns": ["物料编码", "物料名称", "安全库存", "再订货点", "最大库存", "状态"],
        "columns_map": {"物料编码": "materialCode", "物料名称": "materialName", "安全库存": "stock", "再订货点": "reorder", "最大库存": "maxStock"},
        "modal_fields": [
            {"name": "ssMaterialCode", "label": "物料编码", "required": True, "type": "text", "placeholder": "请输入物料编码"},
            {"name": "ssMaterialName", "label": "物料名称", "required": True, "type": "text", "placeholder": "请输入物料名称"},
            {"name": "ssStock", "label": "安全库存", "required": True, "type": "number", "placeholder": "请输入安全库存"},
            {"name": "ssReorder", "label": "再订货点", "required": False, "type": "number", "placeholder": "请输入再订货点"},
            {"name": "ssMaxStock", "label": "最大库存", "required": False, "type": "number", "placeholder": "请输入最大库存"},
            {"name": "ssStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","materialCode":"P-001","materialName":"电路板","stock":"100","reorder":"50","maxStock":"500","status":"approved"},
            {"id":"2","materialCode":"P-002","materialName":"外壳","stock":"200","reorder":"100","maxStock":"800","status":"approved"},
            {"id":"3","materialCode":"P-003","materialName":"智能控制器","stock":"50","reorder":"20","maxStock":"200","status":"approved"},
        ]
    },
    "base-salary-item": {
        "title": "薪资项目管理 - 基础资料",
        "page_title": "薪资项目管理",
        "list_columns": ["薪资项目编码", "薪资项目名称", "项目类型", "状态"],
        "columns_map": {"薪资项目编码": "code", "薪资项目名称": "name", "项目类型": "type"},
        "modal_fields": [
            {"name": "salCode", "label": "薪资项目编码", "required": False, "type": "text", "placeholder": "请输入薪资项目编码"},
            {"name": "salName", "label": "薪资项目名称", "required": True, "type": "text", "placeholder": "请输入薪资项目名称"},
            {"name": "salType", "label": "项目类型", "required": False, "type": "select", "options": ["固定", "浮动", "扣除"]},
            {"name": "salStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"SAL-001","name":"基本工资","type":"固定","status":"approved"},
            {"id":"2","code":"SAL-002","name":"绩效工资","type":"浮动","status":"approved"},
            {"id":"3","code":"SAL-003","name":"加班工资","type":"浮动","status":"approved"},
            {"id":"4","code":"SAL-004","name":"社保扣除","type":"扣除","status":"approved"},
        ]
    },
    "base-salary": {
        "title": "薪资管理 - 基础资料",
        "page_title": "薪资管理",
        "list_columns": ["员工编号", "姓名", "基本工资", "绩效工资", "实发工资", "状态"],
        "columns_map": {"员工编号": "empNumber", "姓名": "empName", "基本工资": "basic", "绩效工资": "performance", "实发工资": "total"},
        "modal_fields": [
            {"name": "salEmpNumber", "label": "员工编号", "required": True, "type": "text", "placeholder": "请输入员工编号"},
            {"name": "salEmpName", "label": "姓名", "required": True, "type": "text", "placeholder": "请输入姓名"},
            {"name": "salBasic", "label": "基本工资", "required": True, "type": "number", "placeholder": "请输入基本工资"},
            {"name": "salPerformance", "label": "绩效工资", "required": False, "type": "number", "placeholder": "请输入绩效工资"},
            {"name": "salTotal", "label": "实发工资", "required": True, "type": "number", "placeholder": "请输入实发工资"},
            {"name": "salStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","empNumber":"EMP-001","empName":"张三","basic":"8000","performance":"2000","total":"10000","status":"approved"},
            {"id":"2","empNumber":"EMP-002","empName":"李四","basic":"6000","performance":"1500","total":"7500","status":"approved"},
            {"id":"3","empNumber":"EMP-003","empName":"王五","basic":"5000","performance":"1000","total":"6000","status":"approved"},
        ]
    },
    "base-salesperson": {
        "title": "销售员管理 - 基础资料",
        "page_title": "销售员管理",
        "list_columns": ["销售员编号", "姓名", "所属部门", "业务员类型", "状态"],
        "columns_map": {"销售员编号": "code", "姓名": "name", "所属部门": "dept", "业务员类型": "type"},
        "modal_fields": [
            {"name": "spCode", "label": "销售员编号", "required": False, "type": "text", "placeholder": "请输入销售员编号"},
            {"name": "spName", "label": "姓名", "required": True, "type": "text", "placeholder": "请输入姓名"},
            {"name": "spDept", "label": "所属部门", "required": False, "type": "select", "options": ["销售部"]},
            {"name": "spType", "label": "业务员类型", "required": True, "type": "select", "options": ["销售", "采购", "服务"]},
            {"name": "spStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"SP-001","name":"赵销售","dept":"销售部","type":"销售","status":"approved"},
            {"id":"2","code":"SP-002","name":"钱销售","dept":"销售部","type":"销售","status":"approved"},
            {"id":"3","code":"SP-003","name":"孙销售","dept":"销售部","type":"销售","status":"approved"},
        ]
    },
    "base-shift": {
        "title": "班次管理 - 基础资料",
        "page_title": "班次管理",
        "list_columns": ["班次编码", "班次名称", "开始时间", "结束时间", "状态"],
        "columns_map": {"班次编码": "code", "班次名称": "name", "开始时间": "start", "结束时间": "end"},
        "modal_fields": [
            {"name": "shiftCode", "label": "班次编码", "required": False, "type": "text", "placeholder": "请输入班次编码"},
            {"name": "shiftName", "label": "班次名称", "required": True, "type": "text", "placeholder": "请输入班次名称"},
            {"name": "shiftStart", "label": "开始时间", "required": True, "type": "time"},
            {"name": "shiftEnd", "label": "结束时间", "required": True, "type": "time"},
            {"name": "shiftStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"SHIFT-001","name":"早班","start":"08:00","end":"16:00","status":"approved"},
            {"id":"2","code":"SHIFT-002","name":"中班","start":"16:00","end":"24:00","status":"approved"},
            {"id":"3","code":"SHIFT-003","name":"晚班","start":"00:00","end":"08:00","status":"approved"},
        ]
    },
    "base-shift-system": {
        "title": "排班制度管理 - 基础资料",
        "page_title": "排班制度管理",
        "list_columns": ["制度编码", "制度名称", "适用部门", "状态"],
        "columns_map": {"制度编码": "code", "制度名称": "name", "适用部门": "dept"},
        "modal_fields": [
            {"name": "ssCode", "label": "制度编码", "required": False, "type": "text", "placeholder": "请输入制度编码"},
            {"name": "ssName", "label": "制度名称", "required": True, "type": "text", "placeholder": "请输入制度名称"},
            {"name": "ssDept", "label": "适用部门", "required": False, "type": "select", "options": ["生产制造部", "装配车间", "质检车间"]},
            {"name": "ssStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"SS-001","name":"三班倒制度","dept":"生产制造部","status":"approved"},
            {"id":"2","code":"SS-002","name":"正常班制度","dept":"财务部","status":"approved"},
        ]
    },
    "base-work-calendar": {
        "title": "工作日历管理 - 基础资料",
        "page_title": "工作日历管理",
        "list_columns": ["日历编码", "日历名称", "所属组织", "状态"],
        "columns_map": {"日历编码": "code", "日历名称": "name", "所属组织": "org"},
        "modal_fields": [
            {"name": "wcCode", "label": "日历编码", "required": False, "type": "text", "placeholder": "请输入日历编码"},
            {"name": "wcName", "label": "日历名称", "required": True, "type": "text", "placeholder": "请输入日历名称"},
            {"name": "wcOrg", "label": "所属组织", "required": False, "type": "select", "options": ["磐枢智能制造有限公司", "生产制造部"]},
            {"name": "wcStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"CAL-001","name":"标准工作日历","org":"磐枢智能制造有限公司","status":"approved"},
            {"id":"2","code":"CAL-002","name":"周末加班日历","org":"生产制造部","status":"approved"},
        ]
    },
    "base-work-calendar-template": {
        "title": "工作日历模板管理 - 基础资料",
        "page_title": "工作日历模板管理",
        "list_columns": ["模板编码", "模板名称", "适用范围", "状态"],
        "columns_map": {"模板编码": "code", "模板名称": "name", "适用范围": "scope"},
        "modal_fields": [
            {"name": "wctCode", "label": "模板编码", "required": False, "type": "text", "placeholder": "请输入模板编码"},
            {"name": "wctName", "label": "模板名称", "required": True, "type": "text", "placeholder": "请输入模板名称"},
            {"name": "wctScope", "label": "适用范围", "required": False, "type": "select", "options": ["全年", "法定节假日", "周末"]},
            {"name": "wctStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"TEMP-001","name":"标准模板","scope":"全年","status":"approved"},
            {"id":"2","code":"TEMP-002","name":"节假日模板","scope":"法定节假日","status":"approved"},
        ]
    },
    "base-code-rule": {
        "title": "编码规则管理 - 基础资料",
        "page_title": "编码规则管理",
        "list_columns": ["规则编码", "规则名称", "编码类型", "状态"],
        "columns_map": {"规则编码": "code", "规则名称": "name", "编码类型": "type"},
        "modal_fields": [
            {"name": "crCode", "label": "规则编码", "required": False, "type": "text", "placeholder": "请输入规则编码"},
            {"name": "crName", "label": "规则名称", "required": True, "type": "text", "placeholder": "请输入规则名称"},
            {"name": "crType", "label": "编码类型", "required": False, "type": "select", "options": ["采购订单", "销售订单", "物料", "生产工单", "采购申请"]},
            {"name": "crStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"RULE-001","name":"采购订单编码","type":"采购订单","status":"approved"},
            {"id":"2","code":"RULE-002","name":"销售订单编码","type":"销售订单","status":"approved"},
            {"id":"3","code":"RULE-003","name":"物料编码","type":"物料","status":"approved"},
        ]
    },
    "base-doc-type": {
        "title": "单据类型管理 - 基础资料",
        "page_title": "单据类型管理",
        "list_columns": ["单据类型编码", "单据类型名称", "业务类型", "状态"],
        "columns_map": {"单据类型编码": "code", "单据类型名称": "name", "业务类型": "bizType"},
        "modal_fields": [
            {"name": "dtCode", "label": "单据类型编码", "required": False, "type": "text", "placeholder": "请输入单据类型编码"},
            {"name": "dtName", "label": "单据类型名称", "required": True, "type": "text", "placeholder": "请输入单据类型名称"},
            {"name": "dtBizType", "label": "业务类型", "required": False, "type": "select", "options": ["采购", "销售", "生产", "库存", "财务"]},
            {"name": "dtStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"DOC-001","name":"采购订单","bizType":"采购","status":"approved"},
            {"id":"2","code":"DOC-002","name":"销售订单","bizType":"销售","status":"approved"},
            {"id":"3","code":"DOC-003","name":"生产工单","bizType":"生产","status":"approved"},
        ]
    },
    "base-emp-position": {
        "title": "员工岗位管理 - 基础资料",
        "page_title": "员工岗位管理",
        "list_columns": ["员工编号", "姓名", "岗位", "部门", "状态"],
        "columns_map": {"员工编号": "empNumber", "姓名": "empName", "岗位": "post", "部门": "dept"},
        "modal_fields": [
            {"name": "epEmpNumber", "label": "员工编号", "required": True, "type": "text", "placeholder": "请输入员工编号"},
            {"name": "epEmpName", "label": "姓名", "required": True, "type": "text", "placeholder": "请输入姓名"},
            {"name": "epPost", "label": "岗位", "required": True, "type": "select", "options": ["经理", "工程师", "会计", "销售员", "主管", "检验员"]},
            {"name": "epDept", "label": "部门", "required": False, "type": "select", "options": ["生产制造部", "财务部", "销售部", "研发部", "装配车间", "质检车间"]},
            {"name": "epStatus", "label": "状态", "required": False, "type": "select", "options": ["已在职", "离职"]},
        ],
        "sample_data": [
            {"id":"1","empNumber":"EMP-001","empName":"张三","post":"经理","dept":"生产制造部","status":"approved"},
            {"id":"2","empNumber":"EMP-002","empName":"李四","post":"工程师","dept":"生产制造部","status":"approved"},
            {"id":"3","empNumber":"EMP-003","empName":"王五","post":"会计","dept":"财务部","status":"approved"},
        ]
    },
    "base-position-report": {
        "title": "岗位报表 - 基础资料",
        "page_title": "岗位报表",
        "list_columns": ["岗位编码", "岗位名称", "在岗人数", "缺编人数", "状态"],
        "columns_map": {"岗位编码": "code", "岗位名称": "name", "在岗人数": "currentCount", "缺编人数": "vacantCount"},
        "modal_fields": [
            {"name": "prCode", "label": "岗位编码", "required": False, "type": "text", "placeholder": "请输入岗位编码"},
            {"name": "prName", "label": "岗位名称", "required": True, "type": "text", "placeholder": "请输入岗位名称"},
            {"name": "prCurrentCount", "label": "在岗人数", "required": True, "type": "number", "placeholder": "请输入在岗人数"},
            {"name": "prVacantCount", "label": "缺编人数", "required": False, "type": "number", "placeholder": "请输入缺编人数"},
            {"name": "prStatus", "label": "状态", "required": False, "type": "select", "options": ["已启用", "未启用"]},
        ],
        "sample_data": [
            {"id":"1","code":"POS-001","name":"经理","currentCount":"1","vacantCount":"0","status":"approved"},
            {"id":"2","code":"POS-002","name":"工程师