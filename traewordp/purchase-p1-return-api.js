(function () {
  'use strict';
  var API_BASE = window.PURCHASE_P1_API_BASE || window.PURCHASE_API_BASE || 'http://localhost:3003/api';
  var TYPES = {
    purchase_return_request: { name: '采购退料申请', endpoint: '/purchase-return-requests', no: 'requestNo', date: 'requestDate', create: 'purchase-return-request-create.html', list: 'purchase-return-request.html', fromInbound: '/purchase-return-requests/from-inventory-in', target: 'purchase_return' },
    purchase_return: { name: '采购退料单', endpoint: '/purchase-returns', no: 'returnNo', date: 'returnDate', create: 'purchase-return-create.html', list: 'purchase-return.html', fromInbound: '/purchase-returns/from-inventory-in', fromRequest: '/purchase-returns/from-return-request' }
  };
  var currentDoc = null;
  var currentList = [];
  var authRedirecting = false;
  function isP1() { return /^purchase-return(-request)?(-|\.|$)/.test(location.pathname.split('/').pop()); }
  if (!isP1()) return;
  function cfg() { return TYPES[window.docType] || (location.pathname.indexOf('purchase-return-request') >= 0 ? TYPES.purchase_return_request : TYPES.purchase_return); }
  function token() { return localStorage.getItem('accessToken') || ''; }
  function toast(m, t) { if (typeof showToast === 'function') showToast(m, t || 'info'); else alert(m); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]; }); }
  function qty(v) { var n = Number(v || 0); return isFinite(n) ? String(Number(n.toFixed(4))) : '0'; }
  function money(v) { var n = Number(v || 0); return isFinite(n) ? n.toFixed(2) : '0.00'; }
  function date(v) { return v ? String(v).slice(0, 10) : ''; }
  function nowKey(p) { return p + '-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8); }
  function redirectToLogin() {
    if (authRedirecting || window.__purchaseAuthRedirecting) return;
    authRedirecting = true;
    window.__purchaseAuthRedirecting = true;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('erpAuthMode');
    setTimeout(function () {
      location.href = '../login.html?redirect=' + encodeURIComponent(location.href);
    }, 120);
  }
  async function api(path, opt) {
    opt = opt || {};
    var method = opt.method || 'GET';
    var headers = Object.assign({ 'Content-Type': 'application/json' }, opt.headers || {});
    if (token()) headers.Authorization = 'Bearer ' + token();
    var res;
    try {
      res = await fetch(API_BASE + path, Object.assign({}, opt, { headers: headers }));
    } catch (error) {
      throw new Error(formatApiErrorMessage('无法连接采购服务，请确认后端 3003 已启动', { path: path, method: method, action: opt.action || '' }));
    }
    var json = null; try { json = await res.json(); } catch (e) {}
    if (res.status === 401) {
      redirectToLogin();
      throw createApiError(path, method, res.status, json, '登录已失效，正在跳转登录页', opt.action);
    }
    if (!res.ok || (json && Number(json.code) >= 400)) throw createApiError(path, method, res.status, json, '接口请求失败', opt.action);
    return json && Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json;
  }
  function statusName(x) { return x.statusName || ({ 0: '草稿', 1: '待审核', 2: '已审核', 3: '已取消', 4: '已关闭', 5: '已驳回' }[x.status] || x.statusCode || x.status || ''); }
  function redStatus(s) { return ({ NOT_REQUIRED: '不需要', NOT_GENERATED: '未生成', GENERATED: '已生成', FAILED: '生成失败' })[s] || s || ''; }
  function sum(es, k) { return (es || []).reduce(function (a, e) { return a + Number(e[k] || 0); }, 0); }
  function docNo(x) { var c = cfg(); return x[c.no] || x.docNo || ''; }
  function getField(n) { return document.getElementById('field_' + n); }
  function setField(n, v) { var el = getField(n); if (el) el.value = v == null ? '' : v; }
  function field(n) { var el = getField(n); return el ? el.value.trim() : ''; }
  function ensureUi() {
    if (!document.getElementById('p1ReturnStyle')) { var st = document.createElement('style'); st.id = 'p1ReturnStyle'; st.textContent = '.p1-api-banner{margin:12px 16px 0;padding:10px 12px;border:1px solid #b7eb8f;background:#f6ffed;color:#237804;border-radius:4px;font-size:13px}.toolbar-btn[disabled],.btn[disabled]{opacity:.55;cursor:not-allowed}.badge-muted{background:#f5f5f5;color:#8c8c8c}.badge-error{background:#fff2f0;color:#cf1322}'; document.head.appendChild(st); }
    var body = document.querySelector('.doc-body');
    if (window.docType === 'purchase_return') ensureRetryButton();
  }
  function ensureRetryButton() { var tb = document.querySelector('.doc-toolbar'); if (!tb || document.getElementById('p1RetryRedPayableBtn')) return; var btn = document.createElement('button'); btn.id = 'p1RetryRedPayableBtn'; btn.className = 'toolbar-btn'; btn.innerHTML = '<span class="icon">↻</span> 重试红字应付'; btn.onclick = retryPayable; tb.insertBefore(btn, tb.firstChild); }
  window.loadData = async function () {
    var c = cfg(); ensureUi();
    try { setBusy(true); var data = await api(c.endpoint + '?page=' + (window.currentPage || 1) + '&pageSize=' + (window.pageSize || 10)); currentList = data.list || data || []; window.renderTable(currentList); var p = document.querySelector('.pagination span'); if (p && data.total !== undefined) p.textContent = '第 ' + (data.page || 1) + ' 页 / 共 ' + data.total + ' 条'; }
    catch (e) { toast(e.message || '加载失败', 'error'); var tb = document.getElementById('dataBody'); if (tb) tb.innerHTML = '<tr><td colspan="14" style="text-align:center;color:#cf1322;padding:32px;">加载失败：' + esc(e.message) + '</td></tr>'; }
    finally { setBusy(false); }
  };
  window.renderTable = function (list) {
    var tb = document.getElementById('dataBody'); if (!tb) return;
    var isReq = window.docType === 'purchase_return_request';
    var cols = isReq ? ['单据编号','日期','供应商','组织','退料方式','退料原因','申请退料数量','已下推退料数量','状态','创建时间'] : ['单据编号','日期','供应商','组织','来源入库单','退料方式','退料数量','金额','红字应付状态','红字应付单号','状态','创建时间'];
    var hr = document.querySelector('.data-table thead tr'); if (hr) hr.innerHTML = '<th><input type="checkbox" onclick="selectAll&&selectAll()"></th>' + cols.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '<th class="purchase-row-action-cell">操作</th>';
    tb.innerHTML = ''; if (!list || !list.length) { tb.innerHTML = '<tr><td colspan="' + (cols.length + 2) + '" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>'; return; }
    list.forEach(function (x) { var es = x.entries || []; var href = cfg().create + '?id=' + encodeURIComponent(x.id); var actions = '<a href="' + esc(href) + '">查看</a>' + (has(x,'EDIT') ? '<a href="' + esc(href) + '">编辑</a>' : ''); var menu = typeof renderPurchaseRowActionMenu === 'function' ? renderPurchaseRowActionMenu(actions,'单据操作') : actions; var vals = { '单据编号': '<a href="' + cfg().create + '?id=' + x.id + '">' + esc(docNo(x)) + '</a>', '日期': date(x[cfg().date] || x.createdAt), '供应商': x.supplierName || '', '组织': x.purchaseOrgName || x.stockOrgName || x.orgName || '', '退料方式': x.returnModeName || (x.returnMode === 2 ? '扣款' : x.returnMode === 1 ? '补料' : x.returnMode || ''), '退料原因': x.reason || '', '申请退料数量': qty(sum(es, 'requestQty')), '已下推退料数量': qty(sum(es, 'returnedQty')), '来源入库单': x.sourceInventoryInNo || ((es[0] || {}).sourceInventoryInNo || ''), '退料数量': qty(sum(es, 'returnQty')), '金额': money(x.totalAmount), '红字应付状态': redStatus(x.payableGenerationStatus), '红字应付单号': x.payableNo || '', '状态': statusName(x), '创建时间': x.createdAt ? new Date(x.createdAt).toLocaleString() : '' }; var tr = document.createElement('tr'); tr.innerHTML = '<td><input type="checkbox" class="data-checkbox" value="' + x.id + '"></td>' + cols.map(function (c) { return '<td>' + (c === '单据编号' ? vals[c] : esc(vals[c])) + '</td>'; }).join('') + '<td class="purchase-row-action-cell">' + menu + '</td>'; tb.appendChild(tr); });
  };
  window.loadDoc = async function (id) { if (!id) return; ensureUi(); try { setBusy(true); currentDoc = await api(cfg().endpoint + '/' + encodeURIComponent(id)); window.editingId = currentDoc.id; fillDoc(currentDoc); updateButtons(currentDoc); } catch (e) { toast(e.message || '加载详情失败', 'error'); } finally { setBusy(false); } };
  function fillDoc(d) { setField('单据编号', docNo(d)); setField('日期', date(d[cfg().date] || d.createdAt)); setField('供应商', d.supplierName || ''); setField('组织', d.purchaseOrgName || d.stockOrgName || d.orgName || ''); setField('金额', money(d.totalAmount)); setField('退货原因', d.reason || ''); setField('状态', statusName(d)); setField('创建时间', d.createdAt ? new Date(d.createdAt).toLocaleString() : ''); setField('备注', d.remark || ''); var tb = document.getElementById('detailBody'); if (tb) { tb.innerHTML = ''; (d.entries || []).forEach(addRow); } }
  function addRow(e) { if (typeof window.addDetailRow === 'function') window.addDetailRow({ '物料编码': e.materialCode, '物料名称': e.materialName, '规格型号': e.materialModel || '', '单位': e.unitName || e.unitCode || '', '数量': qty(e.requestQty || e.returnQty), '单价': e.unitPrice || '', '金额': e.totalAmount || e.amount || '', '税率': e.taxRate || '', '税额': e.taxAmount || '', '备注': e.remark || '' }); var tr = document.querySelector('#detailBody tr:last-child'); if (tr) ['id','sourceInventoryInEntryId','sourceReturnRequestEntryId'].forEach(function (k) { if (e[k]) { var i = document.createElement('input'); i.type = 'hidden'; i.setAttribute('data-field', k); i.value = e[k]; tr.appendChild(i); } }); }
  function rowVal(r, k) { var el = r && r.querySelector('[data-field="' + k + '"]'); return el ? el.value.trim() : ''; }
  function collectLines() { return Array.from(document.querySelectorAll('#detailBody tr')).map(function (r) { return { id: rowVal(r, 'id'), quantity: Number(rowVal(r, '数量') || 0), remark: rowVal(r, '备注') }; }).filter(function (x) { return x.id && x.quantity > 0; }); }
  function dto() { var c = cfg(); var o = { reason: field('退货原因') || field('备注') || '采购退料', remark: field('备注') }; o[c.date] = field('日期'); var lines = collectLines(); if (lines.length) o.lines = lines; return o; }
  window.saveDoc = async function () { if (!window.editingId) return toast('退料单据需从采购入库或退料申请下推生成', 'warning'); try { setBusy(true); currentDoc = await api(cfg().endpoint + '/' + encodeURIComponent(window.editingId), { method: 'PUT', body: JSON.stringify(dto()) }); fillDoc(currentDoc); updateButtons(currentDoc); toast('保存成功', 'success'); } catch (e) { toast(e.message || '保存失败', 'error'); } finally { setBusy(false); } };
  async function action(a, label) { if (!window.editingId) return toast('请先打开单据', 'warning'); try { setBusy(true); currentDoc = await api(cfg().endpoint + '/' + encodeURIComponent(window.editingId) + '/' + a, { method: 'POST', body: a === 'approve' ? JSON.stringify({ operatedBy: user() }) : undefined }); fillDoc(currentDoc); updateButtons(currentDoc); toast(label + '成功', 'success'); } catch (e) { toast(e.message || (label + '失败'), 'error'); } finally { setBusy(false); } }
  window.submitDoc = function () { action('submit', '提交'); }; window.approveDoc = function () { action('approve', '审核'); }; window.rejectDoc = function () { action('reject', '驳回'); }; window.cancelDoc = function () { action('cancel', '取消'); }; window.closeDoc = function () { toast('当前单据不支持关闭', 'warning'); };
  window.pushDownDoc = async function () { if (!currentDoc || !window.editingId) return toast('请先打开单据', 'warning'); if (window.docType !== 'purchase_return_request') return retryPayable(); try { setBusy(true); var lines = (currentDoc.entries || []).filter(function (e) { return Number((e.requestQty || 0) - (e.returnedQty || 0)) > 0; }).map(function (e) { return { returnRequestEntryId: e.id, quantity: Number((e.requestQty || 0) - (e.returnedQty || 0)), remark: e.remark }; }); var ret = await api('/purchase-returns/from-return-request', { method: 'POST', body: JSON.stringify({ returnRequestId: currentDoc.id, idempotencyKey: nowKey('P1-RR-RT'), returnDate: new Date().toISOString().slice(0,10), lines: lines }) }); location.href = 'purchase-return-create.html?id=' + ret.id; } catch (e) { toast(e.message || '下推失败', 'error'); } finally { setBusy(false); } };
  async function retryPayable() { if (window.docType !== 'purchase_return' || !window.editingId) return toast('当前单据不支持红字应付重试', 'warning'); try { setBusy(true); currentDoc = await api('/purchase-returns/' + encodeURIComponent(window.editingId) + '/retry-payable', { method: 'POST', body: JSON.stringify({ operatedBy: user() }) }); fillDoc(currentDoc); updateButtons(currentDoc); toast('红字应付已生成/已确认', 'success'); } catch (e) { toast(e.message || '红字应付重试失败', 'error'); } finally { setBusy(false); } }
  function user() { try { return JSON.parse(localStorage.getItem('user') || '{}').username || 'frontend'; } catch(e) { return 'frontend'; } }
  function setBusy(f) { document.querySelectorAll('.toolbar-btn,.btn').forEach(function (b) { b.disabled = !!f; }); if (!f && currentDoc) updateButtons(currentDoc); }
  function has(d, a) { return (d.availableActions || []).indexOf(a) >= 0; }
  function updateButtons(d) { setBtn('saveDoc', has(d,'EDIT')); setBtn('submitDoc', has(d,'SUBMIT')); setBtn('approveDoc', has(d,'APPROVE')); setBtn('rejectDoc', has(d,'REJECT')); setBtn('pushDownDoc', window.docType === 'purchase_return_request' ? d.statusCode === 'APPROVED' || d.status === 2 : d.payableGenerationStatus === 'FAILED'); setBtn('cancelDoc', has(d,'CANCEL')); var r = document.getElementById('p1RetryRedPayableBtn'); if (r) { r.style.display = d.payableGenerationStatus === 'FAILED' ? '' : 'none'; r.disabled = d.payableGenerationStatus !== 'FAILED'; } }
  function setBtn(fn, en) { document.querySelectorAll('[onclick^="' + fn + '("]').forEach(function (b) { b.disabled = !en; }); }
  window.batchSubmit = function () { toast('当前不支持批量处理，请进入单据执行', 'warning'); }; window.batchApprove = window.batchSubmit; window.batchDelete = window.batchSubmit; window.batchClose = window.batchSubmit; window.batchReverseApprove = function(){ toast('当前不支持反审核', 'warning'); }; window.batchReverseClose = window.batchReverseApprove; window.reverseApproveDoc = window.batchReverseApprove; window.reverseCloseDoc = window.batchReverseApprove;
  document.addEventListener('DOMContentLoaded', function () {
    ensureUi();
    var id = new URLSearchParams(location.search).get('id');
    if (document.getElementById('detailBody') && !id) {
      setField('状态', '草稿');
      toast('退料单据请从采购入库或退料申请下推生成', 'info');
    }
  });
})();
