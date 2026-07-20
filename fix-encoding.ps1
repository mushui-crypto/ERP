$pagesPath = "D:\开发测试\hub-erp-v0\traewordp\pages"
$commonHeader = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
"@

$commonFooter = @"
<script>
function openModal(id){ document.getElementById(id).classList.add('show'); }
function closeModal(id){ document.getElementById(id).classList.remove('show'); }
function switchTab(el){
  var bar = el.parentElement;
  bar.querySelectorAll('.tab-item').forEach(function(t){ t.classList.remove('active'); });
  el.classList.add('active');
  var idx = Array.prototype.indexOf.call(bar.children, el);
  var content = bar.nextElementSibling;
  if(content){
    content.querySelectorAll('.tab-pane').forEach(function(p,i){ p.classList.toggle('active', i===idx); });
  }
}
function resetForm(){
  document.querySelectorAll('.form-input, .form-select, textarea').forEach(function(el){
    if(el.type === 'checkbox'){ el.checked = false; }
    else if(el.tagName === 'SELECT'){ el.selectedIndex = 0; }
    else{ el.value = ''; }
  });
}
function saveItem(){ alert('保存成功'); }
function submitItem(){ alert('提交成功'); }
function auditItem(){ alert('审核成功'); }
function unAuditItem(){ alert('反审核成功'); }
document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ document.querySelectorAll('.modal-overlay.show').forEach(function(m){ m.classList.remove('show'); }); } });
</script>
</body>
</html>
"@

$pageTemplates = @{
    "base-department" = @{
        title = "部门管理 - 基础资料"
        pageTitle = "部门管理"
        breadcrumb = "基础资料"
        fields = @("部门编码", "部门名称", "简称", "部门类型", "上级部门", "负责人", "所属组织", "状态")
        tableColumns = @("部门编码", "部门名称", "类型", "负责人", "状态")
        sampleData = @(
            @("DEPT-001", "生产制造部", "生产", "张经理", "已启用")
            @("DEPT-002", "财务部", "财务", "李经理", "已启用")
            @("DEPT-003", "销售部", "销售", "王经理", "已启用")
        )
    }
    "base-employee" = @{
        title = "员工管理 - 基础资料"
        pageTitle = "员工管理"
        breadcrumb = "基础资料"
        fields = @("员工编号", "姓名", "性别", "岗位", "部门", "入职日期", "手机号", "状态")
        tableColumns = @("员工编号", "姓名", "岗位", "部门", "状态")
        sampleData = @(
            @("EMP-001", "张三", "男", "经理", "生产制造部", "已在职")
            @("EMP-002", "李四", "女", "工程师", "生产制造部", "已在职")
            @("EMP-003", "王五", "男", "会计", "财务部", "已在职")
        )
    }
    "base-material" = @{
        title = "物料管理 - 基础资料"
        pageTitle = "物料管理"
        breadcrumb = "基础资料"
        fields = @("物料编码", "物料名称", "规格型号", "物料类别", "单位", "成本", "单价", "状态")
        tableColumns = @("物料编码", "物料名称", "规格", "类别", "状态")
        sampleData = @(
            @("P-001", "电路板", "PCB-V1.0", "原材料", "已启用")
            @("P-002", "外壳", "ABS-黑色", "原材料", "已启用")
            @("P-003", "智能控制器", "IC-2024", "成品", "已启用")
        )
    }
    "base-supplier" = @{
        title = "供应商管理 - 基础资料"
        pageTitle = "供应商管理"
        breadcrumb = "基础资料"
        fields = @("供应商编码", "供应商名称", "简称", "公司类型", "联系人", "电话", "地址", "状态")
        tableColumns = @("供应商编码", "供应商名称", "联系人", "电话", "状态")
        sampleData = @(
            @("SUP-001", "深圳电子科技有限公司", "深圳电子", "李经理", "已启用")
            @("SUP-002", "东莞模具厂", "东莞模具", "王经理", "已启用")
            @("SUP-003", "上海塑胶有限公司", "上海塑胶", "张经理", "已启用")
        )
    }
    "base-customer" = @{
        title = "客户管理 - 基础资料"
        pageTitle = "客户管理"
        breadcrumb = "基础资料"
        fields = @("客户编码", "客户名称", "简称", "客户类型", "联系人", "电话", "地址", "状态")
        tableColumns = @("客户编码", "客户名称", "联系人", "电话", "状态")
        sampleData = @(
            @("CUS-001", "北京科技集团", "北京科技", "刘经理", "已启用")
            @("CUS-002", "杭州电子有限公司", "杭州电子", "陈经理", "已启用")
            @("CUS-003", "广州智能科技", "广州智能", "赵经理", "已启用")
        )
    }
    "base-warehouse" = @{
        title = "仓库管理 - 基础资料"
        pageTitle = "仓库管理"
        breadcrumb = "基础资料"
        fields = @("仓库编码", "仓库名称", "简称", "仓库类型", "所属组织", "地址", "负责人", "状态")
        tableColumns = @("仓库编码", "仓库名称", "类型", "负责人", "状态")
        sampleData = @(
            @("WH-001", "原材料仓", "原料仓", "张主管", "已启用")
            @("WH-002", "成品仓", "成品仓", "李主管", "已启用")
            @("WH-003", "半成品仓", "半成品仓", "王主管", "已启用")
        )
    }
    "base-unit" = @{
        title = "计量单位管理 - 基础资料"
        pageTitle = "计量单位管理"
        breadcrumb = "基础资料"
        fields = @("单位编码", "单位名称", "简称", "单位类型", "换算系数", "状态")
        tableColumns = @("单位编码", "单位名称", "类型", "换算系数", "状态")
        sampleData = @(
            @("UNIT-001", "个", "个", "数量", "1", "已启用")
            @("UNIT-002", "件", "件", "数量", "10", "已启用")
            @("UNIT-003", "米", "米", "长度", "1", "已启用")
        )
    }
    "base-currency" = @{
        title = "币种管理 - 基础资料"
        pageTitle = "币种管理"
        breadcrumb = "基础资料"
        fields = @("币种编码", "币种名称", "简称", "符号", "汇率", "状态")
        tableColumns = @("币种编码", "币种名称", "符号", "汇率", "状态")
        sampleData = @(
            @("CNY", "人民币", "RMB", "¥", "1", "已启用")
            @("USD", "美元", "USD", "$", "7.2", "已启用")
            @("EUR", "欧元", "EUR", "€", "7.8", "已启用")
        )
    }
    "base-bank" = @{
        title = "银行管理 - 基础资料"
        pageTitle = "银行管理"
        breadcrumb = "基础资料"
        fields = @("银行编码", "银行名称", "简称", "状态")
        tableColumns = @("银行编码", "银行名称", "简称", "状态")
        sampleData = @(
            @("BANK-001", "中国工商银行", "工商银行", "已启用")
            @("BANK-002", "中国建设银行", "建设银行", "已启用")
            @("BANK-003", "招商银行", "招商银行", "已启用")
        )
    }
    "base-bank-account" = @{
        title = "银行账户管理 - 基础资料"
        pageTitle = "银行账户管理"
        breadcrumb = "基础资料"
        fields = @("账户编码", "账户名称", "银行", "账号", "币种", "状态")
        tableColumns = @("账户编码", "账户名称", "银行", "账号", "状态")
        sampleData = @(
            @("ACC-001", "基本账户", "工商银行", "622202******1234", "已启用")
            @("ACC-002", "一般账户", "建设银行", "622700******5678", "已启用")
        )
    }
    "base-contact" = @{
        title = "联系人管理 - 基础资料"
        pageTitle = "联系人管理"
        breadcrumb = "基础资料"
        fields = @("联系人编码", "姓名", "性别", "所属客户/供应商", "职位", "电话", "邮箱", "状态")
        tableColumns = @("联系人编码", "姓名", "所属单位", "电话", "状态")
        sampleData = @(
            @("CON-001", "李经理", "北京科技集团", "138****1234", "已启用")
            @("CON-002", "王经理", "深圳电子科技", "139****5678", "已启用")
        )
    }
    "base-position" = @{
        title = "岗位管理 - 基础资料"
        pageTitle = "岗位管理"
        breadcrumb = "基础资料"
        fields = @("岗位编码", "岗位名称", "岗位类别", "所属部门", "职责描述", "状态")
        tableColumns = @("岗位编码", "岗位名称", "类别", "所属部门", "状态")
        sampleData = @(
            @("POS-001", "经理", "管理", "生产制造部", "已启用")
            @("POS-002", "工程师", "技术", "生产制造部", "已启用")
            @("POS-003", "会计", "财务", "财务部", "已启用")
        )
    }
    "base-department" = @{
        title = "部门管理 - 基础资料"
        pageTitle = "部门管理"
        breadcrumb = "基础资料"
        fields = @("部门编码", "部门名称", "简称", "部门类型", "上级部门", "负责人", "所属组织", "状态")
        tableColumns = @("部门编码", "部门名称", "类型", "负责人", "状态")
        sampleData = @(
            @("DEPT-001", "生产制造部", "生产", "张经理", "已启用")
            @("DEPT-002", "财务部", "财务", "李经理", "已启用")
            @("DEPT-003", "销售部", "销售", "王经理", "已启用")
        )
    }
}

function GenerateListPage($template) {
    $html = $commonHeader
    $html += "<title>$($template.title)</title>`n"
    $html += '<link rel="stylesheet" href="../common.css">`n<script src="../common.js"></script>`n<style>`n'
    $html += '.page-header { margin-bottom: 20px; }`n'
    $html += '.search-area { background: #fff; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px; }`n'
    $html += '.search-row { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }`n'
    $html += '.search-item { display: flex; align-items: center; gap: 8px; }`n'
    $html += '.search-item label { font-size: 13px; color: #666; }`n'
    $html += '.search-item input, .search-item select { padding: 6px 10px; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 13px; }`n'
    $html += '.search-btn { padding: 6px 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }`n'
    $html += '.search-btn:hover { background: #40a9ff; }`n'
    $html += '.table-wrapper { background: #fff; border-radius: 6px; overflow: hidden; }`n'
    $html += '.data-table { width: 100%; border-collapse: collapse; }`n'
    $html += '.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e8e8e8; font-size: 13px; }`n'
    $html += '.data-table th { background: #fafafa; font-weight: 600; color: #333; }`n'
    $html += '.data-table tr:hover { background: #f5f5f5; }`n'
    $html += '.action-btn { padding: 4px 10px; margin-right: 4px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }`n'
    $html += '.action-btn.view { background: #e6f7ff; color: #1890ff; }`n'
    $html += '.action-btn.edit { background: #fffbe6; color: #faad14; }`n'
    $html += '.action-btn.delete { background: #fff2f0; color: #f5222d; }`n'
    $html += '.badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }`n'
    $html += '.badge-success { background: #f6ffed; color: #52c41a; }`n'
    $html += '.badge-warning { background: #fffbe6; color: #faad14; }`n'
    $html += '</style>`n</head>`n<body>`n'
    $html += '<aside class="sidebar" id="sidebar"><div class="sidebar-logo"><img src="../images/logo.png" alt="磐枢工业智能平台" style="width: 100%; max-width: 200px; margin-bottom: 8px;"><h1 style="font-size: 16px; margin: 0;">磐枢HubPang</h1></div><nav class="sidebar-menu"></nav><div class="sidebar-user"><div class="avatar">管理员</div></aside>`n'
    $html += '<div class="main-content" id="mainContent">`n'
    $html += "<div class=`"page-header`"><div><div class=`"flex items-center gap-8`"><button class=`"sidebar-toggle`" onclick=`"toggleSidebar()`">&#9776;</button><div><h2>$($template.pageTitle)</h2><div class=`"breadcrumb`"><a href=`"../index.html`">首页</a> <span>/</span> <span>$($template.breadcrumb)</span></div></div></div></div></div>`n"
    $html += '<div class="search-area"><div class="search-row">'
    $html += '<div class="search-item"><label>关键字</label><input type="text" placeholder="请输入关键字"></div>'
    $html += '<div class="search-item"><label>状态</label><select><option>全部状态</option><option>已启用</option><option>未启用</option></select></div>'
    $html += '</div><button class="search-btn" onclick="searchData()">查询</button></div>'
    $html += '<div class="table-wrapper"><table class="data-table"><thead><tr>'
    foreach ($col in $template.tableColumns) {
        $html += "<th>$col</th>"
    }
    $html += '<th>操作</th></tr></thead><tbody>'
    foreach ($row in $template.sampleData) {
        $html += '<tr>'
        foreach ($cell in $row) {
            if ($cell -eq "已启用") {
                $html += "<td><span class='badge badge-success'>$cell</span></td>"
            } else {
                $html += "<td>$cell</td>"
            }
        }
        $html += '<td><button class="action-btn view" onclick="viewItem()">查看</button><button class="action-btn edit" onclick="editItem()">编辑</button><button class="action-btn delete" onclick="deleteItem()">删除</button></td></tr>'
    }
    $html += '</tbody></table></div>'
    $html += '</div>'
    $html += '<script>function searchData(){ alert("查询成功"); } function viewItem(){ alert("查看详情"); } function editItem(){ alert("编辑"); } function deleteItem(){ if(confirm("确认删除?")){ alert("删除成功"); } }</script>'
    $html += '</body></html>'
    return $html
}

foreach ($key in $pageTemplates.Keys) {
    $filename = "$key.html"
    $filepath = Join-Path $pagesPath $filename
    if (Test-Path $filepath) {
        $content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)
        if ($content.Contains("?????")) {
            $html = GenerateListPage $pageTemplates[$key]
            [System.IO.File]::WriteAllText($filepath, $html, [System.Text.Encoding]::UTF8)
            Write-Host "已修复: $filename"
        } else {
            Write-Host "无需修复: $filename"
        }
    }
}

Write-Host "修复完成！"