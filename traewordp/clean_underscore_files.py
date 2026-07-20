import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

all_files = os.listdir(pages_dir)

deleted_count = 0

for f in all_files:
    if '_' in f and f.endswith('.html') and f.startswith(('purchase_', 'sales_', 'production_', 'inventory_')):
        os.remove(os.path.join(pages_dir, f))
        print(f"Deleted underscore file: {f}")
        deleted_count += 1

print(f"\nTotal deleted: {deleted_count}")