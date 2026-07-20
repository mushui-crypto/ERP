import os

base_dir = os.path.dirname(os.path.abspath(__file__))

files_to_modify = [
    'common.js',
    'admin/ai-config/nl-training.html',
    'admin/org-perm/user.html',
    'admin/org-perm/role.html',
    'admin/org-perm/org.html',
    'admin/org-perm/menu.html',
    'admin/index.html',
    'admin/data-center/index.html',
    'admin/data-center/new.html',
    'index.html',
    'login.html',
    'select-org.html',
    'select-data-center.html'
]

for file_name in files_to_modify:
    file_path = os.path.join(base_dir, file_name)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_port = 'localhost:3000'
        new_port = 'localhost:3001'
        
        if old_port in content:
            new_content = content.replace(old_port, new_port)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated: {file_name}')
        else:
            print(f'No change needed: {file_name}')
    else:
        print(f'File not found: {file_name}')

print('\nDone!')
