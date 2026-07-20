import os

def check_file(file_path):
    with open(file_path, 'rb') as f:
        raw = f.read()
    
    print(f"File size: {len(raw)} bytes")
    print(f"First 50 bytes (hex): {raw[:50].hex()}")
    
    try:
        content = raw.decode('utf-8')
        print(f"UTF-8 decode OK")
        print(f"Title: {content[:100]}")
    except Exception as e:
        print(f"UTF-8 decode failed: {e}")
    
    try:
        content = raw.decode('gbk')
        print(f"GBK decode OK")
        print(f"Title (GBK): {content[:100]}")
    except Exception as e:
        print(f"GBK decode failed: {e}")

def main():
    test_file = r'd:\开发测试\hub-erp-v0\traewordp\pages\dashboard.html'
    check_file(test_file)

if __name__ == '__main__':
    main()