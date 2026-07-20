import os

pages_dir = r'D:\开发测试\hub-erp-v0\traewordp\pages'

def fix_purchase_request_create():
    filepath = os.path.join(pages_dir, 'purchase-request-create.html')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        '<tbody id="detailBody">\n              </tbody>\n            </table>',
        '''<tbody id="detailBody">
              </tbody>
              <tfoot>
                <tr style="background:#fafafa;font-weight:600;">
                  <td colspan="17" style="text-align:right;">合计金额</td>
                  <td id="tableTotalAmount" style="color:#f5222d;font-size:14px;">0.00</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>'''
    )
    
    content = content.replace(
        '<button class="toolbar-btn" onclick="goToList()"><span class="icon">📋</span> 列表</button>\n        <button class="toolbar-btn danger" onclick="exitDoc()"><span class="icon">✖️</span> 退出</button>',
        '<button class="toolbar-btn" onclick="goToList()"><span class="icon">📋</span> 列表</button>\n        <button class="toolbar-btn" onclick="printDoc()"><span class="icon">🖨️</span> 打印</button>\n        <button class="toolbar-btn danger" onclick="exitDoc()"><span class="icon">✖️</span> 退出</button>'
    )
    
    content = content.replace(
        'function exitDoc() {\n  showConfirm(\'确认退出当前单据编辑？\', function() {\n    var listPage = window.location.pathname.replace(\'-create.html\', \'.html\');\n    window.location.href = listPage;\n  });\n}\n</script>',
        '''function exitDoc() {
  showConfirm('确认退出当前单据编辑？', function() {
    var listPage = window.location.pathname.replace('-create.html', '.html');
    window.location.href = listPage;
  });
}

function printDoc() {
  var modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.innerHTML = '<div class="modal-dialog" style="width:400px;"><div class="modal-header"><div class="modal-title">选择打印模板</div><button class="modal-close" onclick="this.closest(\\'.modal-overlay\\').remove()">×</button></div><div class="modal-body"><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="standard" checked> 标准模板</label></div><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="detailed"> 详细模板</label></div><div style="margin-bottom:12px;"><label><input type="radio" name="printTemplate" value="simple"> 简洁模板</label></div></div><div class="modal-footer"><button class="btn btn-default" onclick="this.closest(\\'.modal-overlay\\').remove()">取消</button><button class="btn btn-primary" onclick="confirmPrint()">确定打印</button></div></div>';
  document.body.appendChild(modal);
}

function confirmPrint() {
  var template = document.querySelector('input[name="printTemplate"]:checked').value;
  document.querySelector('.modal-overlay').remove();
  showToast('正在打印... (模板: ' + {'standard':'标准', 'detailed':'详细', 'simple':'简洁'}[template] + ')', 'info');
  setTimeout(function() { window.print(); }, 500);
}
</script>'''
    )
    
    content = content.replace(
        'function calcTotal() {\n  var rows = document.getElementById(\'detailBody\').children;\n  var totalQty = 0;\n  var totalAmount = 0;\n  \n  for (var i = 0; i < rows.length; i++) {\n    totalQty += parseFloat(rows[i].querySelector(\'.qty\').value) || 0;\n    totalAmount += parseFloat(rows[i].querySelector(\'.amount\').value) || 0;\n  }\n  \n  document.getElementById(\'totalQty\').textContent = totalQty;\n  document.getElementById(\'totalAmount\').textContent = totalAmount.toFixed(2);\n}',
        '''function calcTotal() {
  var rows = document.getElementById('detailBody').children;
  var totalQty = 0;
  var totalAmount = 0;
  
  for (var i = 0; i < rows.length; i++) {
    totalQty += parseFloat(rows[i].querySelector('.qty').value) || 0;
    totalAmount += parseFloat(rows[i].querySelector('.amount').value) || 0;
  }
  
  document.getElementById('totalQty').textContent = totalQty;
  document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
  var tableTotal = document.getElementById('tableTotalAmount');
  if (tableTotal) tableTotal.textContent = totalAmount.toFixed(2);
}'''
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Fixed purchase-request-create.html')

fix_purchase_request_create()
print('Done!')
