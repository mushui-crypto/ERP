import os
import re

pages_dir = 'D:\\开发测试\\hub-erp-v0\\traewordp\\pages'

create_pages = [
    'purchase-request-create.html',
    'purchase-order-create.html',
    'purchase-inbound-create.html',
    'purchase-return-create.html',
    'purchase-return-request-create.html',
    'purchase-inspect-create.html',
    'purchase-inspect-notice-create.html',
    'purchase-receive-inspect-create.html',
    'sales-order-create.html',
    'sales-contract-create.html',
    'sales-quotation-create.html',
    'sales-delivery-create.html',
    'sales-outbound-create.html',
    'sales-return-create.html',
    'sales-return-notice-create.html',
    'sales-split-delivery-create.html',
    'sales-disassembly-shipment-create.html',
    'production-order-create.html',
    'production-material-request-create.html',
    'production-material-return-create.html',
    'production-inbound-create.html',
    'production-inspect-create.html',
    'production-report-inspect-create.html',
    'inventory-in-create.html',
    'inventory-out-create.html'
]

list_pages = [
    'purchase-request.html',
    'purchase-order.html',
    'purchase-inbound.html',
    'purchase-return.html',
    'purchase-return-request.html',
    'purchase-inspect.html',
    'purchase-receive-inspect.html',
    'sales-order.html',
    'sales-contract.html',
    'sales-quotation.html',
    'sales-delivery.html',
    'sales-outbound.html',
    'sales-return.html',
    'sales-split-delivery.html',
    'production-order.html',
    'production-material-request.html',
    'production-material-return.html',
    'production-inbound.html',
    'production-inspect.html',
    'production-report-inspect.html',
    'inventory-in.html',
    'inventory-out.html'
]

create_toolbar_html = '''      <div class="doc-toolbar">
        <button class="toolbar-btn" onclick="saveDraft()"><span class="icon">💾</span> 保存草稿</button>
        <button class="toolbar-btn primary" onclick="submitDoc()"><span class="icon">✓</span> 提交审核</button>
        <button class="toolbar-btn" onclick="copyDoc()"><span class="icon">📋</span> 复制</button>
        <button class="toolbar-btn" onclick="prevDoc()"><span class="icon">⬅️</span> 上查</button>
        <button class="toolbar-btn" onclick="nextDoc()"><span class="icon">➡️</span> 下查</button>
        <button class="toolbar-btn" onclick="selectSrcDoc()"><span class="icon">📄</span> 选单</button>
        <button class="toolbar-btn" onclick="reverseApprove()"><span class="icon">↩️</span> 反审核</button>
        <button class="toolbar-btn" onclick="closeDoc()"><span class="icon">🔒</span> 关闭</button>
        <button class="toolbar-btn" onclick="reverseClose()"><span class="icon">🔓</span> 反关闭</button>
        <button class="toolbar-btn" onclick="goToList()"><span class="icon">📋</span> 列表</button>
        <button class="toolbar-btn danger" onclick="exitDoc()"><span class="icon">✖️</span> 退出</button>
      </div>'''

list_toolbar_html = '''      <div class="doc-toolbar">
        <button class="toolbar-btn primary" onclick="location.href='{create_page}'"><span class="icon">+</span> 新增</button>
        <button class="toolbar-btn" onclick="toggleFilter()"><span class="icon">🔍</span> 过滤</button>
        <button class="toolbar-btn" onclick="openColumnSettings()"><span class="icon">⚙️</span> 显示/隐藏列</button>
        <button class="toolbar-btn" onclick="batchSubmit()"><span class="icon">✓</span> 批量提交</button>
        <button class="toolbar-btn" onclick="batchApprove()"><span class="icon">✓</span> 批量审核</button>
        <button class="toolbar-btn" onclick="batchReverseApprove()"><span class="icon">↩️</span> 批量反审核</button>
        <button class="toolbar-btn" onclick="batchClose()"><span class="icon">🔒</span> 批量关闭</button>
        <button class="toolbar-btn" onclick="batchReverseClose()"><span class="icon">🔓</span> 批量反关闭</button>
        <button class="toolbar-btn danger" onclick="batchDelete()"><span class="icon">🗑️</span> 批量删除</button>
      </div>'''

create_js_functions = '''

function copyDoc() {
  showToast('复制单据功能', 'info');
}

function prevDoc() {
  showToast('上查功能', 'info');
}

function nextDoc() {
  showToast('下查功能', 'info');
}

function selectSrcDoc() {
  showToast('选择上游单据功能', 'info');
}

function reverseApprove() {
  showConfirm('确认反审核此单据？', function() {
    showToast('反审核成功', 'success');
  });
}

function closeDoc() {
  showConfirm('确认关闭此单据？', function() {
    showToast('单据已关闭', 'success');
  });
}

function reverseClose() {
  showConfirm('确认反关闭此单据？', function() {
    showToast('单据已反关闭', 'success');
  });
}

function goToList() {
  var listPage = window.location.pathname.replace('-create.html', '.html');
  window.location.href = listPage;
}

function exitDoc() {
  showConfirm('确认退出当前单据编辑？', function() {
    var listPage = window.location.pathname.replace('-create.html', '.html');
    window.location.href = listPage;
  });
}'''

list_js_functions = '''

function toggleFilter() {
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    filterBar.style.display = filterBar.style.display === 'none' ? 'block' : 'none';
  }
}

function openColumnSettings() {
  showToast('显示/隐藏列功能', 'info');
}

function batchReverseApprove() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要反审核的单据', 'warning');
    return;
  }
  showConfirm('确认反审核选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'approved') {
        item.status = 'pending';
        count++;
      }
    });
    localStorage.setItem('erp_list', JSON.stringify(list));
    showToast('已反审核 ' + count + ' 条单据', 'success');
    loadData();
  });
}

function batchClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要关闭的单据', 'warning');
    return;
  }
  showConfirm('确认关闭选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'approved') {
        item.status = 'closed';
        count++;
      }
    });
    localStorage.setItem('erp_list', JSON.stringify(list));
    showToast('已关闭 ' + count + ' 条单据', 'success');
    loadData();
  });
}

function batchReverseClose() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要反关闭的单据', 'warning');
    return;
  }
  showConfirm('确认反关闭选中的 ' + ids.length + ' 条单据？', function() {
    var list = JSON.parse(localStorage.getItem('erp_list') || '[]');
    var count = 0;
    list.forEach(function(item) {
      if (ids.includes(item.id) && item.status === 'closed') {
        item.status = 'approved';
        count++;
      }
    });
    localStorage.setItem('erp_list', JSON.stringify(list));
    showToast('已反关闭 ' + count + ' 条单据', 'success');
    loadData();
  });
}'''

def fix_create_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'<div class="doc-toolbar">.*?</div>', create_toolbar_html, content, flags=re.DOTALL)
    
    if 'function copyDoc()' not in content:
        content = content.replace('</script>', create_js_functions + '\n</script>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed create page toolbar: {os.path.basename(filepath)}')

def fix_list_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    basename = os.path.basename(filepath)
    create_page = basename.replace('.html', '-create.html')
    
    content = re.sub(r'<div class="doc-toolbar">.*?</div>', list_toolbar_html.format(create_page=create_page), content, flags=re.DOTALL)
    
    if 'function toggleFilter()' not in content:
        content = content.replace('</script>', list_js_functions + '\n</script>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed list page toolbar: {os.path.basename(filepath)}')

for page in create_pages:
    filepath = os.path.join(pages_dir, page)
    if os.path.exists(filepath):
        fix_create_page(filepath)

for page in list_pages:
    filepath = os.path.join(pages_dir, page)
    if os.path.exists(filepath):
        fix_list_page(filepath)

print('All toolbar buttons fixed successfully!')
