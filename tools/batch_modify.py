import os
import shutil
import time

def create_backup(source_dir, backup_dir=None):
    if backup_dir is None:
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        backup_dir = os.path.join(os.path.dirname(source_dir), f'backup_{os.path.basename(source_dir)}_{timestamp}')
    
    if os.path.exists(backup_dir):
        counter = 1
        while os.path.exists(f'{backup_dir}_{counter}'):
            counter += 1
        backup_dir = f'{backup_dir}_{counter}'
    
    shutil.copytree(source_dir, backup_dir)
    print(f"✅ Backup created: {backup_dir}")
    return backup_dir

def batch_replace(source_dir, replacements, file_pattern='*.html'):
    modified_count = 0
    
    for root, dirs, files in os.walk(source_dir):
        for filename in files:
            if fnmatch.fnmatch(filename, file_pattern):
                filepath = os.path.join(root, filename)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for old_str, new_str in replacements:
                    content = content.replace(old_str, new_str)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    modified_count += 1
                    print(f"Modified: {filepath}")
    
    print(f"\n✅ Total modified: {modified_count} files")
    return modified_count

def restore_from_backup(backup_dir, target_dir):
    if not os.path.exists(backup_dir):
        print(f"❌ Backup not found: {backup_dir}")
        return False
    
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    
    shutil.copytree(backup_dir, target_dir)
    print(f"✅ Restored from backup: {backup_dir}")
    return True

def verify_files(source_dir, check_func, file_pattern='*.html'):
    issues = []
    
    for root, dirs, files in os.walk(source_dir):
        for filename in files:
            if fnmatch.fnmatch(filename, file_pattern):
                filepath = os.path.join(root, filename)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                result = check_func(filepath, content)
                if result is not None:
                    issues.append(result)
    
    if issues:
        print(f"\n⚠️ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\n✅ All files verified successfully")
    
    return len(issues) == 0

if __name__ == '__main__':
    import fnmatch
    
    pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'
    
    print("=== Batch Modify Tool ===")
    print("1. Create backup")
    print("2. Batch replace")
    print("3. Restore from backup")
    print("4. Verify files")
    
    choice = input("\nEnter your choice: ")
    
    if choice == '1':
        create_backup(pages_dir)
    elif choice == '2':
        replacements = [
            ('background:#fff', 'background:#f5f5f5'),
            ('color:#333', 'color:#666'),
        ]
        batch_replace(pages_dir, replacements)
    elif choice == '3':
        backup_dir = input("Enter backup directory: ")
        restore_from_backup(backup_dir, pages_dir)
    elif choice == '4':
        def check_chinese(filepath, content):
            if '锟斤拷' in content or '閿熸枻鎷' in content:
                return f"Encoding issue: {filepath}"
            return None
        
        verify_files(pages_dir, check_chinese)
    else:
        print("Invalid choice")