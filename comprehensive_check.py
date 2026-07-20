import os
import re

pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'
common_js_path = r'd:\开发测试\hub-erp-v0\traewordp\common.js'

with open(common_js_path, 'r', encoding='utf-8') as f:
    common_js_content = f.read()

all_issues = {
    'alert': [],
    'confirm': [],
    'duplicate_exit': [],
    'octal_escape': [],
    'layout_issue': [],
    'sticky_header': [],
    'empty_button': [],
    'undefined_function': [],
}

html_files = []
for f in os.listdir(pages_dir):
    if f.endswith('.html'):
        try:
            with open(os.path.join(pages_dir, f), 'r', encoding='utf-8') as fh:
                content = fh.read()
                if 'meta http-equiv="refresh"' not in content:
                    html_files.append(f)
        except:
            pass

print("=" * 80)
print("综合检查脚本 v2")
print("检查范围:", len(html_files), "个HTML文件")
print("=" * 80)

for filename in html_files:
    filepath = os.path.join(pages_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'alert(' in content:
            all_issues['alert'].append(filename)
            
        if 'confirm(' in content:
            all_issues['confirm'].append(filename)
            
        exit_count = content.count('退出')
        action_btn_exit = content.count('action-btn"') if '退出' in content and 'action-btn' in content else 0
        func_def_exit = content.count('function exit')
        page_actions_exit = 1 if 'page-actions' in content and '退出' in content else 0
        confirm_exit = content.count('确认退出？')
        logout_exit = 1 if 'login.html' in content and '退出' in content else 0
        toolbar_exit = content.count('toolbar-btn') if '退出' in content and 'toolbar-btn' in content else 0
        case_exit = content.count("case '退出':") + content.count('case "退出":')
        
        expected_exits = action_btn_exit + func_def_exit + page_actions_exit + confirm_exit + logout_exit + toolbar_exit + case_exit
        if exit_count > expected_exits:
            all_issues['duplicate_exit'].append(f"{filename} (实际:{exit_count},预期:{expected_exits})")
            
        if '.\\1' in content or '.\\2' in content or '.\\3' in content:
            all_issues['octal_escape'].append(filename)
            
        if 'style="position:absolute;right:16px;top:50%;transform:translateY(-50%);"' in content:
            all_issues['layout_issue'].append(filename)
            
        if 'class="page-header"' in content:
            has_sticky = 'position: sticky' in content or 'position:sticky' in content
            if not has_sticky:
                all_issues['sticky_header'].append(filename)
                
        if re.search(r'<button[^>]*>\s*</button>', content):
            all_issues['empty_button'].append(filename)
            
        undefined_funcs = []
        for func in ['exitPage', 'exitDoc', 'openLookup', 'submitDoc', 'reverseApproveDoc', 'selectSourceDoc']:
            if f'{func}(' in content and f'function {func}' not in content and f'function {func}' not in common_js_content:
                undefined_funcs.append(func)
        if undefined_funcs:
            all_issues['undefined_function'].append(f"{filename}: {', '.join(undefined_funcs)}")
            
    except Exception as e:
        print(f"[错误] {filename}: {e}")

total_issues = sum(len(v) for v in all_issues.values())

print("\n检查结果汇总:")
print("=" * 80)

for issue_type, files in all_issues.items():
    count = len(files)
    status = "✓ 已修复" if count == 0 else f"✗ 发现 {count} 个问题"
    print(f"{issue_type:20} {status}")
    if count > 0 and count <= 10:
        for f in files:
            print(f"    - {f}")
    elif count > 10:
        print(f"    (共 {count} 个文件，显示前10个)")
        for f in files[:10]:
            print(f"    - {f}")

print("=" * 80)
print(f"总计发现 {total_issues} 个问题")

if total_issues == 0:
    print("\n🎉 所有问题已修复！")
else:
    print(f"\n⚠️ 还有 {total_issues} 个问题需要修复")