import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

all_files = os.listdir(pages_dir)

underscore_files = set()
hyphen_files = []

for f in all_files:
    if '_' in f and f.endswith('.html'):
        underscore_files.add(f)
    elif '-' in f and f.endswith('.html'):
        hyphen_files.append(f)

deleted_count = 0
kept_count = 0

for hyphen_file in hyphen_files:
    underscore_version = hyphen_file.replace('-', '_')
    if underscore_version in underscore_files:
        os.remove(os.path.join(pages_dir, hyphen_file))
        print(f"Deleted old file: {hyphen_file}")
        deleted_count += 1
    else:
        kept_count += 1

print(f"\nTotal deleted: {deleted_count}")
print(f"Kept (no underscore version): {kept_count}")