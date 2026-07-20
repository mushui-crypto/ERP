import glob
import os

os.chdir('d:/开发测试/hub-erp-v0/traewordp')

base_dir = 'pages'

files = glob.glob(os.path.join(base_dir, 'production-*.html')) + \
        glob.glob(os.path.join(base_dir, 'purchase-*.html')) + \
        glob.glob(os.path.join(base_dir, 'sales-*.html')) + \
        glob.glob(os.path.join(base_dir, 'inventory-*.html')) + \
        glob.glob(os.path.join(base_dir, 'quality-*.html'))

old_open = '''function openColumnSettings() {
  var container = document.getElementById('columnCheckboxes');
  container.innerHTML = '';
  allColumns.forEach(function(col) {
  allColumns.forEach(function(col) {
    var item = document.createElement('div');
    item.className = 'column-item';
    var checked = visibleColumns.includes(col) ? 'checked' : '';
    item.innerHTML = '<input type="checkbox" ' + checked + ' value="' + col + '" onchange="toggleColumn(this)">' + '<label>' + col + '</label>';
    container.appendChild(item);
  });
  document.getElementById('columnModal').classList.add('show');
}'''

new_open = '''function openColumnSettings() {
  var container = document.getElementById('columnCheckboxes');
  container.innerHTML = '';
  allColumns.forEach(function(col) {
    var item = document.createElement('div');
    item.className = 'column-item';
    var checked = visibleColumns.includes(col) ? 'checked' : '';
    item.innerHTML = '<input type="checkbox" ' + checked + ' value="' + col + '" onchange="toggleColumn(this)">' + '<label>' + col + '</label>';
    container.appendChild(item);
  });
  document.getElementById('columnModal').classList.add('show');
}'''

for f in files:
    if '-create' in f:
        continue
    try:
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        
        if old_open in content:
            content = content.replace(old_open, new_open)
        
        content = content.replace('}); }); }', '}); }')
        
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        
        print('Fixed:', os.path.basename(f))
    except Exception as e:
        print('Error:', os.path.basename(f), '-', str(e))

print('Done!')
