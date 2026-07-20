import glob

files = glob.glob('production-*.html') + glob.glob('purchase-*.html') + glob.glob('sales-*.html') + glob.glob('inventory-*.html') + glob.glob('quality-*.html')

for f in files:
    if '-create' in f:
        continue
    try:
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        
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

        content = content.replace(old_open, new_open)
        content = content.replace('}); }); }', '}); }')
        
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        
        print('Fixed:', f)
    except Exception as e:
        print('Error:', f, '-', str(e))

print('Done!')
