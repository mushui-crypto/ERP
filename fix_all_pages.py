import os

def fix_file(file_path):
    with open(file_path, 'rb') as f:
        raw = f.read()
    
    if raw[:3] == b'\xef\xbb\xbf':
        raw = raw[3:]
    
    try:
        content = raw.decode('utf-8')
    except:
        try:
            content = raw.decode('gbk', errors='replace')
        except:
            content = raw.decode('utf-8', errors='replace')
    
    has_corruption = '锟斤拷' in content or '閿熸枻鎷' in content or '鏂ゆ嫹' in content
    
    if has_corruption:
        try:
            bytes_gbk = content.encode('gbk', errors='replace')
            content = bytes_gbk.decode('utf-8', errors='replace')
        except:
            pass
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return has_corruption

def main():
    pages_dir = r'd:\开发测试\hub-erp-v0\traewordp\pages'
    
    fixed = 0
    total = 0
    
    for root, dirs, files in os.walk(pages_dir):
        for filename in files:
            if filename.endswith('.html'):
                filepath = os.path.join(root, filename)
                total += 1
                if fix_file(filepath):
                    fixed += 1
                    print(f"Fixed: {filepath}")
    
    print(f"\nTotal: {total}, Fixed: {fixed}")

if __name__ == '__main__':
    main()