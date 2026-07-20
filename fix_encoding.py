import os

PAGES_PATH = r"D:\开发测试\hub-erp-v0\traewordp\pages"

COMMON_HEADER = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
"""

COMMON_FOOTER = """<script>
function searchData(){ alert('查询成功'); }
function viewItem(){ alert('查看详情'); }
function editItem(){ alert('编辑'); }
function deleteItem(){ if(confirm('确认删除?')){ alert('删除成功'); } }
</script>
</body>
</html>
"""

PAGE_TEMPLATES = {
    "base-department": {
        "title": "部门管理 - 基础资料",
        "page_title": "部门管理",
        "breadcrumb": "基础资料",
        "table_columns": ["部门编码", "部门名称", "类型", "负责人", "状态"],
        "sample_data": [
            ["DEPT-001", "生产制造部", "生产", "张经理", "已启用"],
            ["DEPT-002", "财务部", "财务", "李经理", "已启用"],
            ["DEPT-003", "销售部", "销售", "王经理", "已启用"]
        ]
    },
    "base-employee": {
        "title": "员工管理 - 基础资料",
        "page_title": "员工管理",
        "breadcrumb": "基础资料",
        "table_columns": ["员工编号", "姓名", "岗位", "部门", "状态"],
        "sample_data": [
            ["EMP-001", "张三", "经理", "生产制造部", "已在职"],
            ["EMP-002", "李四", "工程师", "生产制造部", "已在职"],
            ["EMP-003", "王五", "会计", "财务部", "已在职"]
        ]
    },
    "base-material": {
        "title": "物料管理 - 基础资料",
        "page_title": "物料管理",
        "breadcrumb": "基础资料",
        "table_columns": ["物料编码", "物料名称", "规格", "类别", "状态"],
        "sample_data": [
            ["P-001", "电路板", "PCB-V1.0", "原材料", "已启用"],
            ["P-002", "外壳", "ABS-黑色", "原材料", "已启用"],
            ["P-003", "智能控制器", "IC-2024", "成品", "已启用"]
        ]
    },
    "base-supplier": {
        "title": "供应商管理 - 基础资料",
        "page_title": "供应商管理",
        "breadcrumb": "基础资料",
        "table_columns": ["供应商编码", "供应商名称", "联系人", "电话", "状态"],
        "sample_data": [
            ["SUP-001", "深圳电子科技有限公司", "李经理", "已启用"],
            ["SUP-002", "东莞模具厂", "王经理", "已启用"],
            ["SUP-003", "上海塑胶有限公司", "张经理", "已启用"]
        ]
    },
    "base-customer": {
        "title": "客户管理 - 基础资料",
        "page_title": "客户管理",
        "breadcrumb": "基础资料",
        "table_columns": ["客户编码", "客户名称", "联系人", "电话", "状态"],
        "sample_data": [
            ["CUS-001", "北京科技集团", "刘经理", "已启用"],
            ["CUS-002", "杭州电子有限公司", "陈经理", "已启用"],
            ["CUS-003", "广州智能科技", "赵经理", "已启用"]
        ]
    },
    "base-warehouse": {
        "title": "仓库管理 - 基础资料",
        "page_title": "仓库管理",
        "breadcrumb": "基础资料",
        "table_columns": ["仓库编码", "仓库名称", "类型", "负责人", "状态"],
        "sample_data": [
            ["WH-001", "原材料仓", "原料仓", "张主管", "已启用"],
            ["WH-002", "成品仓", "成品仓", "李主管", "已启用"],
            ["WH-003", "半成品仓", "半成品仓", "王主管", "已启用"]
        ]
    },
    "base-unit": {
        "title": "计量单位管理 - 基础资料",
        "page_title": "计量单位管理",
        "breadcrumb": "基础资料",
        "table_columns": ["单位编码", "单位名称", "类型", "换算系数", "状态"],
        "sample_data": [
            ["UNIT-001", "个", "数量", "1", "已启用"],
            ["UNIT-002", "件", "数量", "10", "已启用"],
            ["UNIT-003", "米", "长度", "1", "已启用"]
        ]
    },
    "base-currency": {
        "title": "币种管理 - 基础资料",
        "page_title": "币种管理",
        "breadcrumb": "基础资料",
        "table_columns": ["币种编码", "币种名称", "符号", "汇率", "状态"],
        "sample_data": [
            ["CNY", "人民币", "RMB", "¥", "1", "已启用"],
            ["USD", "美元", "USD", "$", "7.2", "已启用"],
            ["EUR", "欧元", "EUR", "€", "7.8", "已启用"]
        ]
    },
    "base-bank": {
        "title": "银行管理 - 基础资料",
        "page_title": "银行管理",
        "breadcrumb": "基础资料",
        "table_columns": ["银行编码", "银行名称", "简称", "状态"],
        "sample_data": [
            ["BANK-001", "中国工商银行", "工商银行", "已启用"],
            ["BANK-002", "中国建设银行", "建设银行", "已启用"],
            ["BANK-003", "招商银行", "招商银行", "已启用"]
        ]
    },
    "base-bank-account": {
        "title": "银行账户管理 - 基础资料",
        "page_title": "银行账户管理",
        "breadcrumb": "基础资料",
        "table_columns": ["账户编码", "账户名称", "银行", "账号", "状态"],
        "sample_data": [
            ["ACC-001", "基本账户", "工商银行", "622202******1234", "已启用"],
            ["ACC-002", "一般账户", "建设银行", "622700******5678", "已启用"]
        ]
    },
    "base-contact": {
        "title": "联系人管理 - 基础资料",
        "page_title": "联系人管理",
        "breadcrumb": "基础资料",
        "table_columns": ["联系人编码", "姓名", "所属单位", "电话", "状态"],
        "sample_data": [
            ["CON-001", "李经理", "北京科技集团", "138****1234", "已启用"],
            ["CON-002", "王经理", "深圳电子科技", "139****5678", "已启用"]
        ]
    },
    "base-position": {
        "title": "岗位管理 - 基础资料",
        "page_title": "岗位管理",
        "breadcrumb": "基础资料",
        "table_columns": ["岗位编码", "岗位名称", "类别", "所属部门", "状态"],
        "sample_data": [
            ["POS-001", "经理", "管理", "生产制造部", "已启用"],
            ["POS-002", "工程师", "技术", "生产制造部", "已启用"],
            ["POS-003", "会计", "财务", "财务部", "已启用"]
        ]
    },
    "base-category": {
        "title": "物料类别管理 - 基础资料",
        "page_title": "物料类别管理",
        "breadcrumb": "基础资料",
        "table_columns": ["类别编码", "类别名称", "上级类别", "状态"],
        "sample_data": [
            ["CAT-001", "原材料", "无", "已启用"],
            ["CAT-002", "半成品", "无", "已启用"],
            ["CAT-003", "成品", "无", "已启用"]
        ]
    },
    "base-cost-center": {
        "title": "成本中心管理 - 基础资料",
        "page_title": "成本中心管理",
        "breadcrumb": "基础资料",
        "table_columns": ["成本中心编码", "成本中心名称", "所属组织", "状态"],
        "sample_data": [
            ["CC-001", "生产成本中心", "磐枢智能制造", "已启用"],
            ["CC-002", "管理成本中心", "磐枢智能制造", "已启用"]
        ]
    },
    "base-exchange-rate": {
        "title": "汇率管理 - 基础资料",
        "page_title": "汇率管理",
        "breadcrumb": "基础资料",
        "table_columns": ["源币种", "目标币种", "汇率", "生效日期", "状态"],
        "sample_data": [
            ["USD", "CNY", "7.20", "2024-01-01", "已启用"],
            ["EUR", "CNY", "7.80", "2024-01-01", "已启用"]
        ]
    },
    "base-expense-item": {
        "title": "费用项目管理 - 基础资料",
        "page_title": "费用项目管理",
        "breadcrumb": "基础资料",
        "table_columns": ["费用项目编码", "费用项目名称", "费用类型", "状态"],
        "sample_data": [
            ["EXP-001", "差旅费", "管理费用", "已启用"],
            ["EXP-002", "办公费", "管理费用", "已启用"],
            ["EXP-003", "水电费", "制造费用", "已启用"]
        ]
    },
    "base-payment-term": {
        "title": "付款条件管理 - 基础资料",
        "page_title": "付款条件管理",
        "breadcrumb": "基础资料",
        "table_columns": ["付款条件编码", "付款条件名称", "付款天数", "状态"],
        "sample_data": [
            ["PAY-001", "月结30天", "30", "已启用"],
            ["PAY-002", "月结60天", "60", "已启用"],
            ["PAY-003", "款到发货", "0", "已启用"]
        ]
    },
    "base-receipt-term": {
        "title": "收款条件管理 - 基础资料",
        "page_title": "收款条件管理",
        "breadcrumb": "基础资料",
        "table_columns": ["收款条件编码", "收款条件名称", "收款天数", "状态"],
        "sample_data": [
            ["REC-001", "月结30天", "30", "已启用"],
            ["REC-002", "月结60天", "60", "已启用"],
            ["REC-003", "预收", "0", "已启用"]
        ]
    },
    "base-safety-stock": {
        "title": "安全库存管理 - 基础资料",
        "page_title": "安全库存管理",
        "breadcrumb": "基础资料",
        "table_columns": ["物料编码", "物料名称", "安全库存", "仓库", "状态"],
        "sample_data": [
            ["P-001", "电路板", "100", "原材料仓", "已启用"],
            ["P-002", "外壳", "200", "原材料仓", "已启用"]
        ]
    },
    "base-salary-item": {
        "title": "薪资项目管理 - 基础资料",
        "page_title": "薪资项目管理",
        "breadcrumb": "基础资料",
        "table_columns": ["薪资项目编码", "薪资项目名称", "项目类型", "状态"],
        "sample_data": [
            ["SAL-001", "基本工资", "固定", "已启用"],
            ["SAL-002", "绩效工资", "浮动", "已启用"],
            ["SAL-003", "加班工资", "浮动", "已启用"]
        ]
    },
    "base-salary": {
        "title": "薪资管理 - 基础资料",
        "page_title": "薪资管理",
        "breadcrumb": "基础资料",
        "table_columns": ["员工编号", "姓名", "基本工资", "绩效工资", "实发工资"],
        "sample_data": [
            ["EMP-001", "张三", "8000", "2000", "10000"],
            ["EMP-002", "李四", "6000", "1500", "7500"]
        ]
    },
    "base-salesperson": {
        "title": "销售员管理 - 基础资料",
        "page_title": "销售员管理",
        "breadcrumb": "基础资料",
        "table_columns": ["销售员编号", "姓名", "所属部门", "状态"],
        "sample_data": [
            ["SP-001", "赵销售", "销售部", "已启用"],
            ["SP-002", "钱销售", "销售部", "已启用"]
        ]
    },
    "base-shift": {
        "title": "班次管理 - 基础资料",
        "page_title": "班次管理",
        "breadcrumb": "基础资料",
        "table_columns": ["班次编码", "班次名称", "开始时间", "结束时间", "状态"],
        "sample_data": [
            ["SHIFT-001", "早班", "08:00", "16:00", "已启用"],
            ["SHIFT-002", "中班", "16:00", "24:00", "已启用"],
            ["SHIFT-003", "晚班", "00:00", "08:00", "已启用"]
        ]
    },
    "base-shift-system": {
        "title": "排班制度管理 - 基础资料",
        "page_title": "排班制度管理",
        "breadcrumb": "基础资料",
        "table_columns": ["制度编码", "制度名称", "适用部门", "状态"],
        "sample_data": [
            ["SS-001", "三班倒制度", "生产制造部", "已启用"],
            ["SS-002", "正常班制度", "财务部", "已启用"]
        ]
    },
    "base-unit-convert": {
        "title": "单位换算管理 - 基础资料",
        "page_title": "单位换算管理",
        "breadcrumb": "基础资料",
        "table_columns": ["源单位", "目标单位", "换算系数", "状态"],
        "sample_data": [
            ["个", "件", "10", "已启用"],
            ["米", "千米", "0.001", "已启用"]
        ]
    },
    "base-work-calendar": {
        "title": "工作日历管理 - 基础资料",
        "page_title": "工作日历管理",
        "breadcrumb": "基础资料",
        "table_columns": ["日历编码", "日历名称", "所属组织", "状态"],
        "sample_data": [
            ["CAL-001", "标准工作日历", "磐枢智能制造", "已启用"],
            ["CAL-002", "周末加班日历", "生产制造部", "已启用"]
        ]
    },
    "base-work-calendar-template": {
        "title": "工作日历模板管理 - 基础资料",
        "page_title": "工作日历模板管理",
        "breadcrumb": "基础资料",
        "table_columns": ["模板编码", "模板名称", "适用范围", "状态"],
        "sample_data": [
            ["TEMP-001", "标准模板", "全年", "已启用"],
            ["TEMP-002", "节假日模板", "法定节假日", "已启用"]
        ]
    },
    "base-code-rule": {
        "title": "编码规则管理 - 基础资料",
        "page_title": "编码规则管理",
        "breadcrumb": "基础资料",
        "table_columns": ["规则编码", "规则名称", "编码类型", "状态"],
        "sample_data": [
            ["RULE-001", "采购订单编码", "采购订单", "已启用"],
            ["RULE-002", "销售订单编码", "销售订单", "已启用"],
            ["RULE-003", "物料编码", "物料", "已启用"]
        ]
    },
    "base-doc-type": {
        "title": "单据类型管理 - 基础资料",
        "page_title": "单据类型管理",
        "breadcrumb": "基础资料",
        "table_columns": ["单据类型编码", "单据类型名称", "业务类型", "状态"],
        "sample_data": [
            ["DOC-001", "采购订单", "采购", "已启用"],
            ["DOC-002", "销售订单", "销售", "已启用"],
            ["DOC-003", "生产工单", "生产", "已启用"]
        ]
    },
    "base-emp-position": {
        "title": "员工岗位管理 - 基础资料",
        "page_title": "员工岗位管理",
        "breadcrumb": "基础资料",
        "table_columns": ["员工编号", "姓名", "岗位", "部门", "状态"],
        "sample_data": [
            ["EMP-001", "张三", "经理", "生产制造部", "已在职"],
            ["EMP-002", "李四", "工程师", "生产制造部", "已在职"]
        ]
    },
    "base-position-report": {
        "title": "岗位报表 - 基础资料",
        "page_title": "岗位报表",
        "breadcrumb": "基础资料",
        "table_columns": ["岗位编码", "岗位名称", "在岗人数", "缺编人数", "状态"],
        "sample_data": [
            ["POS-001", "经理", "1", "0", "已启用"],
            ["POS-002", "工程师", "2", "1", "已启用"]
        ]
    },
    "base-calendar": {
        "title": "日历管理 - 基础资料",
        "page_title": "日历管理",
        "breadcrumb": "基础资料",
        "table_columns": ["日历编码", "日历名称", "类型", "状态"],
        "sample_data": [
            ["CAL-STD", "标准日历", "公历", "已启用"],
            ["CAL-LUNAR", "农历日历", "农历", "已启用"]
        ]
    },
    "base-tax-rate": {
        "title": "税率管理 - 基础资料",
        "page_title": "税率管理",
        "breadcrumb": "基础资料",
        "table_columns": ["税率编码", "税率名称", "税率(%)", "状态"],
        "sample_data": [
            ["TAX-001", "增值税13%", "13", "已启用"],
            ["TAX-002", "增值税9%", "9", "已启用"],
            ["TAX-003", "增值税6%", "6", "已启用"]
        ]
    },
    "base-tax-rule": {
        "title": "税务规则管理 - 基础资料",
        "page_title": "税务规则管理",
        "breadcrumb": "基础资料",
        "table_columns": ["规则编码", "规则名称", "适用范围", "状态"],
        "sample_data": [
            ["TAXR-001", "进项税抵扣规则", "采购", "已启用"],
            ["TAXR-002", "销项税计算规则", "销售", "已启用"]
        ]
    },
    "base-tax-type": {
        "title": "税务类型管理 - 基础资料",
        "page_title": "税务类型管理",
        "breadcrumb": "基础资料",
        "table_columns": ["税务类型编码", "税务类型名称", "税种", "状态"],
        "sample_data": [
            ["TAXT-001", "增值税", "流转税", "已启用"],
            ["TAXT-002", "企业所得税", "所得税", "已启用"]
        ]
    }
}


def generate_list_page(template):
    html = COMMON_HEADER
    html += f"<title>{template['title']}</title>\n"
    html += '<link rel="stylesheet" href="../common.css">\n<script src="../common.js"></script>\n<style>\n'
    html += '.page-header { margin-bottom: 20px; }\n'
    html += '.search-area { background: #fff; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px; }\n'
    html += '.search-row { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }\n'
    html += '.search-item { display: flex; align-items: center; gap: 8px; }\n'
    html += '.search-item label { font-size: 13px; color: #666; }\n'
    html += '.search-item input, .search-item select { padding: 6px 10px; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 13px; }\n'
    html += '.search-btn { padding: 6px 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }\n'
    html += '.search-btn:hover { background: #40a9ff; }\n'
    html += '.table-wrapper { background: #fff; border-radius: 6px; overflow: hidden; }\n'
    html += '.data-table { width: 100%; border-collapse: collapse; }\n'
    html += '.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e8e8e8; font-size: 13px; }\n'
    html += '.data-table th { background: #fafafa; font-weight: 600; color: #333; }\n'
    html += '.data-table tr:hover { background: #f5f5f5; }\n'
    html += '.action-btn { padding: 4px 10px; margin-right: 4px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }\n'
    html += '.action-btn.view { background: #e6f7ff; color: #1890ff; }\n'
    html += '.action-btn.edit { background: #fffbe6; color: #faad14; }\n'
    html += '.action-btn.delete { background: #fff2f0; color: #f5222d; }\n'
    html += '.badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }\n'
    html += '.badge-success { background: #f6ffed; color: #52c41a; }\n'
    html += '.badge-warning { background: #fffbe6; color: #faad14; }\n'
    html += '</style>\n</head>\n<body>\n'
    html += '<aside class="sidebar" id="sidebar"><div class="sidebar-logo"><img src="../images/logo.png" alt="磐枢工业智能平台" style="width: 100%; max-width: 200px; margin-bottom: 8px;"><h1 style="font-size: 16px; margin: 0;">磐枢HubPang</h1></div><nav class="sidebar-menu"></nav><div class="sidebar-user"><div class="avatar">管理员</div></aside>\n'
    html += '<div class="main-content" id="mainContent">\n'
    html += f'<div class="page-header"><div><div class="flex items-center gap-8"><button class="sidebar-toggle" onclick="toggleSidebar()">&#9776;</button><div><h2>{template["page_title"]}</h2><div class="breadcrumb"><a href="../index.html">首页</a> <span>/</span> <span>{template["breadcrumb"]}</span></div></div></div></div></div>\n'
    html += '<div class="search-area"><div class="search-row">'
    html += '<div class="search-item"><label>关键字</label><input type="text" placeholder="请输入关键字"></div>'
    html += '<div class="search-item"><label>状态</label><select><option>全部状态</option><option>已启用</option><option>未启用</option></select></div>'
    html += '</div><button class="search-btn" onclick="searchData()">查询</button></div>'
    html += '<div class="table-wrapper"><table class="data-table"><thead><tr>'
    for col in template["table_columns"]:
        html += f"<th>{col}</th>"
    html += '<th>操作</th></tr></thead><tbody>'
    for row in template["sample_data"]:
        html += '<tr>'
        for cell in row:
            if cell in ["已启用", "已在职"]:
                html += f"<td><span class='badge badge-success'>{cell}</span></td>"
            else:
                html += f"<td>{cell}</td>"
        html += '<td><button class="action-btn view" onclick="viewItem()">查看</button><button class="action-btn edit" onclick="editItem()">编辑</button><button class="action-btn delete" onclick="deleteItem()">删除</button></td></tr>'
    html += '</tbody></table></div>'
    html += '</div>'
    html += COMMON_FOOTER
    return html


def main():
    corrupted_files = []
    for filename in os.listdir(PAGES_PATH):
        if filename.startswith("base-") and filename.endswith(".html"):
            filepath = os.path.join(PAGES_PATH, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                if "?????" in content:
                    corrupted_files.append(filename)
            except Exception as e:
                print(f"Error reading {filename}: {e}")
    
    print(f"Found {len(corrupted_files)} corrupted base data files")
    
    for filename in corrupted_files:
        base_name = filename.replace(".html", "")
        if base_name in PAGE_TEMPLATES:
            html = generate_list_page(PAGE_TEMPLATES[base_name])
            filepath = os.path.join(PAGES_PATH, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"Fixed: {filename}")
        else:
            print(f"No template for: {filename}")
    
    print("Fix completed!")


if __name__ == "__main__":
    main()