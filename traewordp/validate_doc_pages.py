import json
import os
import re

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'
config_path = r'D:\开发测试\hub-erp-v0\traewordp\documents_config.json'

with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

documents = config['documents']

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def validate_all_pages():
    results = {'errors': [], 'warnings': [], 'success': []}
    
    conversion_rules = config.get('conversion_rules', [])
    validate_conversion_rules(conversion_rules, results)
    
    for doc in documents:
        list_file = os.path.join(pages_dir, doc['code'].replace('_', '-') + '.html')
        create_file = os.path.join(pages_dir, doc['code'].replace('_', '-') + '-create.html')
        
        if not os.path.exists(list_file):
            results['errors'].append(f"单据[{doc['name']}]列表页面不存在: {list_file}")
            continue
        
        if not os.path.exists(create_file):
            results['errors'].append(f"单据[{doc['name']}]新增页面不存在: {create_file}")
            continue
        
        list_content = read_file(list_file)
        create_content = read_file(create_file)
        
        validate_doc_page(doc, list_content, create_content, results)
    
    return results

def validate_doc_page(doc, list_content, create_content, results):
    doc_name = doc['name']
    
    if doc['type'] == 'purchase':
        if '供应商' not in list_content:
            results['errors'].append(f"单据[{doc_name}]列表页缺少供应商字段")
        if '供应商' not in create_content:
            results['errors'].append(f"单据[{doc_name}]新增页缺少供应商字段")
        if 'openSupplierLookup' not in create_content:
            results['errors'].append(f"单据[{doc_name}]新增页缺少供应商选择弹窗函数")
    
    if doc['type'] == 'sales':
        if '客户' not in list_content:
            results['errors'].append(f"单据[{doc_name}]列表页缺少客户字段")
        if '客户' not in create_content:
            results['errors'].append(f"单据[{doc_name}]新增页缺少客户字段")
        if 'openCustomerLookup' not in create_content:
            results['errors'].append(f"单据[{doc_name}]新增页缺少客户选择弹窗函数")
    
    if doc['type'] == 'production' and doc['code'] != 'production_order':
        if '生产订单' not in create_content:
            results['errors'].append(f"单据[{doc_name}]新增页缺少生产订单字段")
    
    if doc['type'] == 'inventory':
        if '仓库' not in create_content:
            results['errors'].append(f"单据[{doc_name}]新增页缺少仓库字段")
    
    close_btn_check(doc, list_content, '列表页', results)
    close_btn_check(doc, create_content, '新增页', results)
    
    if '关闭' in create_content and 'closeDoc' not in create_content:
        results['errors'].append(f"单据[{doc_name}]新增页有关闭按钮但无closeDoc函数")
    if '反关闭' in create_content and 'reverseCloseDoc' not in create_content:
        results['errors'].append(f"单据[{doc_name}]新增页有反关闭按钮但无reverseCloseDoc函数")
    
    if '基本信息' not in create_content:
        results['warnings'].append(f"单据[{doc_name}]新增页缺少基本信息区域")
    if '明细信息' not in create_content:
        results['warnings'].append(f"单据[{doc_name}]新增页缺少明细信息区域")
    
    if 'lookup-modal' not in create_content:
        results['warnings'].append(f"单据[{doc_name}]新增页缺少选择弹窗容器")
    if 'column-modal' not in list_content:
        results['warnings'].append(f"单据[{doc_name}]列表页缺少显示/隐藏列弹窗")
    
    required_create_buttons = ['复制', '保存', '提交', '审核', '反审核', '选单', '下推', '上查', '下查', '列表', '打印设置', '打印', '退出']
    for btn in required_create_buttons:
        if btn not in create_content:
            results['errors'].append(f"单据[{doc_name}]新增页缺少按钮: {btn}")
    
    required_list_buttons = ['过滤', '新增', '显示/隐藏列', '退出']
    for btn in required_list_buttons:
        if btn not in list_content:
            results['errors'].append(f"单据[{doc_name}]列表页缺少按钮: {btn}")
    
    if 'pushDownDoc' not in create_content:
        results['errors'].append(f"单据[{doc_name}]新增页缺少pushDownDoc函数")
    if 'selectSourceDoc' not in create_content:
        results['errors'].append(f"单据[{doc_name}]新增页缺少selectSourceDoc函数")
    
    if 'showToast' not in create_content or 'showConfirm' not in create_content:
        results['warnings'].append(f"单据[{doc_name}]新增页缺少提示/确认函数")
    
    native_confirm_list = re.findall(r'(?<!show)(?<!close)(?<!\w)confirm\(', list_content)
    native_confirm_create = re.findall(r'(?<!show)(?<!close)(?<!\w)confirm\(', create_content)
    native_alert_list = re.findall(r'(?<!\w)alert\(', list_content)
    native_alert_create = re.findall(r'(?<!\w)alert\(', create_content)
    
    if native_confirm_list:
        results['errors'].append(f"单据[{doc_name}]列表页使用了原生confirm()弹窗，应使用showConfirm()")
    if native_confirm_create:
        results['errors'].append(f"单据[{doc_name}]新增页使用了原生confirm()弹窗，应使用showConfirm()")
    if native_alert_list:
        results['errors'].append(f"单据[{doc_name}]列表页使用了原生alert()弹窗，应使用showToast()")
    if native_alert_create:
        results['errors'].append(f"单据[{doc_name}]新增页使用了原生alert()弹窗，应使用showToast()")
    
    if 'confirmModal' not in create_content:
        results['errors'].append(f"单据[{doc_name}]新增页缺少自定义确认弹窗HTML结构")
    if 'confirmModal' not in list_content:
        results['errors'].append(f"单据[{doc_name}]列表页缺少自定义确认弹窗HTML结构")
    if '系统提示' not in create_content or '温馨提示' not in create_content:
        results['errors'].append(f"单据[{doc_name}]新增页缺少'系统提示'或'温馨提示'标题")
    if '系统提示' not in list_content or '温馨提示' not in list_content:
        results['errors'].append(f"单据[{doc_name}]列表页缺少'系统提示'或'温馨提示'标题")
    
    results['success'].append(f"单据[{doc_name}]验证通过")

def validate_conversion_rules(rules, results):
    doc_codes = {doc['code']: doc for doc in documents}
    
    for rule in rules:
        if rule['source_doc'] not in doc_codes:
            results['errors'].append(f"转换规则[{rule['name']}]源单据类型不存在: {rule['source_doc']}")
        if rule['target_doc'] not in doc_codes:
            results['errors'].append(f"转换规则[{rule['name']}]目标单据类型不存在: {rule['target_doc']}")
        
        if 'reverse_write' in rule and rule['reverse_write']:
            source_doc = doc_codes.get(rule['source_doc'])
            if source_doc:
                for key, field_name in rule['reverse_write'].items():
                    if field_name not in source_doc['header_fields'] and field_name not in source_doc['detail_fields']:
                        results['warnings'].append(f"转换规则[{rule['name']}]反写字段[{field_name}]不在源单据[{source_doc['name']}]的字段定义中")
        
        if 'quantity_control' in rule:
            allowed_types = ['no_over', 'allow_over_ratio', 'no_over_qualified', 'no_over_issued']
            if rule['quantity_control'] not in allowed_types:
                results['errors'].append(f"转换规则[{rule['name']}]数量控制类型无效: {rule['quantity_control']}")
            if rule['quantity_control'] == 'allow_over_ratio' and ('max_over_ratio' not in rule or rule['max_over_ratio'] <= 0):
                results['errors'].append(f"转换规则[{rule['name']}]使用allow_over_ratio但未配置有效max_over_ratio")

def close_btn_check(doc, content, page_type, results):
    close_button_count = len(re.findall(r'<button[^>]*>.*关闭.*</button>', content))
    reverse_close_button_count = len(re.findall(r'<button[^>]*>.*反关闭.*</button>', content))
    
    has_close_buttons = close_button_count > 0 or reverse_close_button_count > 0
    
    if doc['has_close'] and not has_close_buttons:
        results['errors'].append(f"单据[{doc['name']}]{page_type}缺少关闭/反关闭按钮（需要显示）")
    if not doc['has_close'] and has_close_buttons:
        results['errors'].append(f"单据[{doc['name']}]{page_type}不应有关闭/反关闭按钮，但检测到关闭按钮:{close_button_count}个，反关闭按钮:{reverse_close_button_count}个")

def print_results(results):
    print('=' * 60)
    print('单据页面验证报告')
    print('=' * 60)
    
    if results['errors']:
        print(f"\n❌ 错误 ({len(results['errors'])}):")
        for err in results['errors']:
            print(f"  - {err}")
    
    if results['warnings']:
        print(f"\n⚠️ 警告 ({len(results['warnings'])}):")
        for warn in results['warnings']:
            print(f"  - {warn}")
    
    print(f"\n✅ 通过 ({len(results['success'])}):")
    for succ in results['success']:
        print(f"  - {succ}")
    
    print(f"\n{'=' * 60}")
    print(f"总计: {len(documents)} 个单据")
    print(f"错误: {len(results['errors'])} | 警告: {len(results['warnings'])} | 通过: {len(results['success'])}")
    print(f"{'=' * 60}")

if __name__ == '__main__':
    results = validate_all_pages()
    print_results(results)