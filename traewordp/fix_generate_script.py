import re

with open(r'd:\开发测试\hub-erp-v0\traewordp\generate_all_pages.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<script src="../doc-data-store.js"></script>\n    html_parts.append(',
    '<script src="../doc-data-store.js"></script>\n    html_parts.append(\'<script src="../doc-conversion.js"></script>\')\n    html_parts.append('
)

with open(r'd:\开发测试\hub-erp-v0\traewordp\generate_all_pages.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')