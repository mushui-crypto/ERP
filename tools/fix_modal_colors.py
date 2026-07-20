import os
import re

def fix_modal_colors(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = 0

    content, count = re.subn(
        r'background:\s*var\(--bg-surface\)',
        'background: #fff',
        content
    )
    changes += count

    content, count = re.subn(
        r'background:\s*var\(--bg-inset\)',
        'background: #f5f5f5',
        content
    )
    changes += count

    content, count = re.subn(
        r'background:\s*var\(--bg-card\)',
        'background: #fff',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--text-primary\)',
        'color: #333',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--text-secondary\)',
        'color: #666',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--text-tertiary\)',
        'color: #999',
        content
    )
    changes += count

    content, count = re.subn(
        r'border-color:\s*var\(--border-normal\)',
        'border-color: #e8e8e8',
        content
    )
    changes += count

    content, count = re.subn(
        r'border-color:\s*var\(--border-strong\)',
        'border-color: #d9d9d9',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--text-accent\)',
        'color: #1890ff',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--admin-accent\)',
        'color: #1890ff',
        content
    )
    changes += count

    content, count = re.subn(
        r'background:\s*var\(--admin-accent-light\)',
        'background: #e6f7ff',
        content
    )
    changes += count

    content, count = re.subn(
        r'border-color:\s*var\(--admin-accent-glow\)',
        'border-color: #91d5ff',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--color-success\)',
        'color: #52c41a',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--color-warning\)',
        'color: #faad14',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--color-error\)',
        'color: #f5222d',
        content
    )
    changes += count

    content, count = re.subn(
        r'color:\s*var\(--color-info\)',
        'color: #1890ff',
        content
    )
    changes += count

    content, count = re.subn(
        r'background:\s*var\(--admin-accent\)',
        'background: #1890ff',
        content
    )
    changes += count

    content, count = re.subn(
        r'border-color:\s*var\(--admin-accent\)',
        'border-color: #1890ff',
        content
    )
    changes += count

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified {filepath}: {changes} changes")
    else:
        print(f"No changes needed for {filepath}")

files_to_fix = [
    'admin/ai-config/data-analysis.html',
    'admin/ai-config/api-manage.html',
    'admin/ai-config/agent-config.html',
    'admin/dev-design/workflow.html',
    'admin/dev-design/doc-flow.html',
    'admin/dev-design/lowcode.html',
    'admin/dev-design/form-designer.html',
    'admin/dev-design/print-template.html',
    'admin/data-center/index.html',
    'admin/data-center/backup.html',
    'admin/index.html'
]

for file in files_to_fix:
    filepath = os.path.join('traewordp', file)
    if os.path.exists(filepath):
        fix_modal_colors(filepath)
    else:
        print(f"File not found: {filepath}")

print("Done!")