import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'

issues = []

for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
        
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'meta http-equiv="refresh"' in content:
            continue
        
        showToast_count = content.count('function showToast')
        if showToast_count > 1:
            issues.append(f"[重复函数] {filename}: 存在{showToast_count}个showToast定义")
        
        showConfirm_count = content.count('function showConfirm')
        if showConfirm_count > 1:
            issues.append(f"[重复函数] {filename}: 存在{showConfirm_count}个showConfirm定义")
        
        matches = re.findall(r"onclick='[^']*closest\('\.", content)
        if matches:
            issues.append(f"[语法错误] {filename}: onclick属性中存在单引号嵌套问题")
        
        if 'hr-employee' in filename and 'partnerName' in content and 'docNo' in content:
            issues.append(f"[数据模型错误] {filename}: 员工管理页面使用了单据数据模型")
        
        if 'customer' in filename.lower() and 'partnerName' in content and 'crm-customer' not in filename:
            issues.append(f"[数据模型错误] {filename}: 客户管理页面使用了partnerName字段")
        
        if 'confirm-modal-title' in content and '确认操作' in content:
            issues.append(f"[弹窗标题未修改] {filename}: 弹窗标题仍为'确认操作'")
        
        if 'showConfirm' in content and "确认操作" in content:
            issues.append(f"[弹窗标题未修改] {filename}: showConfirm调用中仍使用'确认操作'")
        
        if 'doc-header' in content:
            header_pos = content.find('<header class="doc-header"')
            body_pos = content.find('<div class="doc-body"')
            if body_pos > 0 and header_pos > body_pos:
                issues.append(f"[布局问题] {filename}: doc-header在doc-body之后")
        
        has_exit = False
        if 'exitPage()' in content or 'onclick="location.href=' in content:
            has_exit = True
        
        if re.search(r'onclick="location\.href=[\'"]index', content):
            has_exit = True
        
        if not has_exit and 'create' not in filename and 'detail' not in filename:
            if 'index' not in filename and 'dashboard' not in filename:
                issues.append(f"[缺少退出功能] {filename}: 页面缺少退出按钮")
        
        if content.count('</script>') != content.count('<script'):
            issues.append(f"[语法错误] {filename}: script标签未正确闭合")
        
        if content.count('</style>') != content.count('<style'):
            issues.append(f"[语法错误] {filename}: style标签未正确闭合")
        
    except Exception as e:
        issues.append(f"[读取错误] {filename}: {e}")

print(f"共发现 {len(issues)} 个问题:\n")
for i, issue in enumerate(issues, 1):
    print(f"{i}. {issue}")

if len(issues) == 0:
    print("所有已知问题已修复！")