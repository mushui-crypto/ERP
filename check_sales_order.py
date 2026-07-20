import os

def analyze_file(file_path):
    with open(file_path, 'rb') as f:
        raw = f.read()
    
    print(f"File: {file_path}")
    print(f"Size: {len(raw)} bytes")
    print(f"First 100 bytes (hex): {raw[:100].hex()}")
    print(f"First 100 bytes (repr): {repr(raw[:100])}")
    
    try:
        content = raw.decode('utf-8')
        print(f"\nUTF-8 decode OK")
        print(f"Title tag content:")
        for line in content[:2000].split('\n'):
            if '<title>' in line:
                print(f"  {line.strip()}")
        print(f"\nFirst 500 chars of content:")
        print(repr(content[:500]))
    except Exception as e:
        print(f"UTF-8 decode failed: {e}")

def main():
    file_path = r'd:\开发测试\hub-erp-v0\traewordp\pages\sales-order.html'
    analyze_file(file_path)

if __name__ == '__main__':
    main()