(function () {
  'use strict';

  var API_BASE = window.PURCHASE_P0_API_BASE || 'http://localhost:3001/api';
  var P0_TYPES = ['purchase_request', 'purchase_order', 'purchase_receive', 'purchase_inspect', 'purchase_inbound'];
  var currentDoc = null;
  var currentList = [];
  var p0Busy = false;

  var CONFIG = {
    purchase_request: {
      name: '采购申请单', listPage: 'purchase-request.html', createPage: 'purchase-request-create.html', endpoint: '/purchase-requests', noField: 'requestNo', dateField: 'requestDate', orgField: 'orgId', partnerField: 'supplierName', amountField: 'totalAmount',
      listColumns: ['单据编号', '日期', '供应商', '组织', '申请数量', '批准数量', '已下推数量', '剩余可下推', '状态', '创建时间'],
      actions: ['submit', 'approve', 'reject', 'cancel', 'close'], target: 'purchase_order'
    },
    purchase_order: {
      name: '采购订单', listPage: 'purchase-order.html', createPage: 'purchase-order-create.html', detailPage: 'purchase-order-detail.html', endpoint: '/purchase-orders', noField: 'orderNo', dateField: 'orderDate', orgField: 'purchaseOrgId', partnerField: 'supplierName', amountField: 'totalAmount',
      listColumns: ['单据编号', '日期', '供应商', '组织', '采购合同号', '订单数量', '已收料数量', '剩余可收料', '已入库数量', '状态', '创建时间'],
      actions: ['submit', 'approve', 'reject', 'cancel', 'close'], target: 'purchase_receive'
    },
    purchase_receive: {
      name: '收料通知单', listPage: 'purchase-receive.html', createPage: 'purchase-receive-create.html', endpoint: '/purchase-receive-notices', noField: 'noticeNo', dateField: 'receiveDate', orgField: 'stockOrgId', partnerField: 'supplierName', amountField: 'totalAmount',
      listColumns: ['单据编号', '日期', '供应商', '组织', '来源采购订单', '是否检验', '收料数量', '已检验数量', '可入库数量', '已入库数量', '状态', '创建时间'],
      actions: ['submit', 'approve', 'reject', 'cancel', 'close'], target: 'purchase_inspect'
    },
    purchase_inspect: {
      name: '来料检验单', listPage: 'purchase-inspect.html', createPage: 'purchase-inspect-create.html', endpoint: '/quality-inspections', noField: 'inspectionNo', dateField: 'inspectionDate', orgField: '', partnerField: 'supplierName', amountField: '',
      listColumns: ['单据编号', '日期', '供应商', '来源收料通知', '送检数量', '合格数量', '让步接收数量', '不合格数量', '可入库数量', '检验结果', '状态', '创建时间'],
      actions: ['submit', 'approve', 'reject'], target: 'purchase_inbound'
    },
    purchase_inbound: {
      name: '采购入库单', listPage: 'purchase-inbound.html', createPage: 'purchase-inbound-create.html', endpoint: '/inventory-in', noField: 'inNo', dateField: 'inDate', orgField: 'orgId', partnerField: 'supplierName', amountField: 'totalAmount',
      listColumns: ['单据编号', '日期', '供应商', '组织', '来源收料通知', '入库仓库', '入库数量', '金额', '状态', '暂估应付状态', '暂估应付单号', '创建时间'],
      actions: ['submit', 'approve', 'reject', 'cancel'], target: null
    }
  };

  function isP0Page() {
    var file = location.pathname.split('/').pop();
    return /^purchase-(request|order|receive|inspect|inbound)(-|\.|$)/.test(file);
  }

  if (!isP0Page()) return;

  function cfg() { return CONFIG[window.docType] || inferConfigByPath(); }

  function inferConfigByPath() {
    var file = location.pathname.split('/').pop();
    if (file.indexOf('purchase-order') === 0) return CONFIG.purchase_order;
    if (file.indexOf('purchase-request') === 0) return CONFIG.purchase_request;
    if (file.indexOf('purchase-receive') === 0) return CONFIG.purchase_receive;
    if (file.indexOf('purchase-inspect') === 0) return CONFIG.purchase_inspect;
    if (file.indexOf('purchase-inbound') === 0) return CONFIG.purchase_inbound;
    return null;
  }

  function token() { return localStorage.getItem('accessToken') || ''; }
  function toast(msg, type) { if (typeof showToast === 'function') showToast(msg, type || 'info'); else alert(msg); }
  function money(v) { var n = Number(v || 0); return isFinite(n) ? n.toFixed(2) : '0.00'; }
  function qty(v) { var n = Number(v || 0); return isFinite(n) ? String(Number(n.toFixed(4))) : '0'; }
  function val(v) { return v === null || v === undefined ? '' : v; }
  function fmtDate(v) { if (!v) return ''; return String(v).slice(0, 10); }
  function nowKey(prefix) { return prefix + '-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8); }

  async function api(path, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (token()) headers.Authorization = 'Bearer ' + token();
    var res = await fetch(API_BASE + path, Object.assign({}, options, { headers: headers }));
    var json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    if (!res.ok || (json && json.code && Number(json.code) >= 400)) {
      var msg = (json && (json.message || json.error)) || ('接口请求失败：HTTP ' + res.status);
      throw new Error(msg);
    }
    return json && Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json;
  }

  async function loadLookupData() {
    if (typeof loadAllMasterData === 'function') {
      try { await loadAllMasterData(); } catch (e) {}
    }
  }

  function cache(type) {
    var map = {
      supplier: 'erp_suppliers_cache', suppliers: 'erp_suppliers_cache',
      material: 'erp_materials_cache', materials: 'erp_materials_cache',
      warehouse: 'erp_warehouses_cache', warehouses: 'erp_warehouses_cache',
      org: 'erp_orgs', orgs: 'erp_orgs',
      employee: 'erp_employees_cache', department: 'erp_departments_cache', units: 'erp_units_cache', unit: 'erp_units_cache'
    };
    try { return JSON.parse(localStorage.getItem(map[type] || type) || '[]'); } catch (e) { return []; }
  }

  function findMaster(type, text) {
    var s = String(text || '').trim();
    var list = cache(type);
    return list.find(function (x) {
      return String(x.id || '') === s || String(x.code || x.materialCode || x.supplierCode || '') === s || String(x.name || x.materialName || x.supplierName || x.warehouseName || '') === s;
    }) || list[0] || null;
  }

  function firstId(type, fallback) {
    var item = findMaster(type, fallback);
    return item && item.id ? item.id : (fallback || '');
  }

  function getField(name) { return document.getElementById('field_' + name); }
  function setField(name, value) { var el = getField(name); if (el) el.value = val(value); }
  function getFieldValue(name) { var el = getField(name); return el ? el.value.trim() : ''; }

  function ensureHeaderField(label, idSuffix, type, required, readonly) {
    var id = 'field_' + idSuffix;
    if (document.getElementById(id)) return document.getElementById(id);
    var grid = document.querySelector('.form-grid');
    if (!grid) return null;
    var div = document.createElement('div');
    div.className = 'form-item p0-extra-field';
    var req = required ? '<span class="required">*</span>' : '';
    div.innerHTML = '<label>' + req + label + '</label><input type="' + (type || 'text') + '" id="' + id + '" ' + (readonly ? 'readonly class="readonly"' : '') + ' placeholder="请输入' + label + '">';
    grid.appendChild(div);
    return document.getElementById(id);
  }

  function ensureP0Ui() {
    var c = cfg();
    if (!c) return;
    var styleId = 'purchase-p0-api-style';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = '.p0-api-banner{margin:12px 16px 0;padding:10px 12px;border:1px solid #91caff;background:#e6f4ff;color:#0958d9;border-radius:4px;font-size:13px}.p0-trace{margin:0 0 16px;background:#fff;border:1px solid #e8e8e8;border-radius:4px}.p0-trace-title{padding:10px 14px;background:#fafafa;border-bottom:1px solid #e8e8e8;font-weight:600}.p0-trace-body{padding:12px 14px;font-size:13px;color:#555;line-height:1.8}.toolbar-btn[disabled],.btn[disabled]{opacity:.55;cursor:not-allowed}.badge-info{background:#e6f4ff;color:#1677ff}.badge-muted{background:#f5f5f5;color:#8c8c8c}.badge-error{background:#fff2f0;color:#cf1322}';
      document.head.appendChild(style);
    }
    var body = document.querySelector('.doc-body');
    if (body && !document.getElementById('p0ApiBanner')) {
      var banner = document.createElement('div');
      banner.id = 'p0ApiBanner';
      banner.className = 'p0-api-banner';
      banner.textContent = 'P0 标准采购主链：当前页面已切换为真实 API 驱动；数量、状态、错误提示以后端返回为准。';
      body.insertBefore(banner, body.firstChild);
    }
    if (window.docType === 'purchase_order') ensureHeaderField('采购合同号', '采购合同号', 'text', true, false);
    if (window.docType === 'purchase_receive') ensureHeaderField('是否需要检验', '是否需要检验', 'text', false, false);
    if (window.docType === 'purchase_inbound') {
      ensureHeaderField('暂估应付状态', '暂估应付状态', 'text', false, true);
      ensureHeaderField('暂估应付单号', '暂估应付单号', 'text', false, true);
      ensureHeaderField('应付失败原因', '应付失败原因', 'text', false, true);
      ensureRetryPayableButton();
    }
  }

  function ensureRetryPayableButton() {
    if (document.getElementById('p0RetryPayableBtn')) return;
    var toolbar = document.querySelector('.doc-toolbar');
    if (!toolbar) return;
    var btn = document.createElement('button');
    btn.id = 'p0RetryPayableBtn';
    btn.className = 'toolbar-btn';
    btn.innerHTML = '<span class="icon">↻</span> 重试应付';
    btn.onclick = retryPayable;
    toolbar.insertBefore(btn, toolbar.firstChild);
  }

  function getStatusBadge(item) {
    var code = item.statusCode || item.status || '';
    var name = item.statusName || item.statusLabel || code || '未知';
    var cls = 'badge-muted';
    if (['APPROVED', 'FULLY_ORDERED', 'FULLY_STOCKED', 'GENERATED'].indexOf(code) >= 0 || name.indexOf('已审核') >= 0 || name.indexOf('成功') >= 0) cls = 'badge-success';
    else if (['SUBMITTED', 'DRAFT'].indexOf(code) >= 0 || name.indexOf('待') >= 0 || name.indexOf('草稿') >= 0) cls = 'badge-warning';
    else if (['CANCELED', 'CLOSED', 'REJECTED', 'FAILED'].indexOf(code) >= 0 || name.indexOf('失败') >= 0 || name.indexOf('取消') >= 0 || name.indexOf('关闭') >= 0) cls = 'badge-danger';
    return '<span class="badge ' + cls + '">' + name + '</span>';
  }

  function docNo(item) {
    var c = cfg();
    return item[c.noField] || item.docNo || item.billNo || item.no || '';
  }

  function dateOf(item) {
    var c = cfg();
    return fmtDate(item[c.dateField] || item.docDate || item.createdAt);
  }

  function sumEntries(item, field) {
    return (item.entries || []).reduce(function (s, e) { return s + Number(e[field] || 0); }, 0);
  }

  function listValue(item, col) {
    if (col === '单据编号') return docNo(item);
    if (col === '日期') return dateOf(item);
    if (col === '供应商') return item.supplierName || item.partnerName || ((item.entries || [])[0] || {}).supplierName || '';
    if (col === '组织') return item.orgName || item.purchaseOrgName || item.stockOrgName || item.orgId || item.purchaseOrgId || item.stockOrgId || '';
    if (col === '采购合同号') return item.contractNo || '';
    if (col === '来源采购订单') return item.purchaseOrderNo || item.sourceOrderNo || ((item.entries || [])[0] || {}).sourceOrderNo || '';
    if (col === '来源收料通知') return item.sourceReceiveNoticeNo || ((item.entries || [])[0] || {}).sourceReceiveNoticeNo || '';
    if (col === '入库仓库') return item.warehouseName || ((item.entries || [])[0] || {}).warehouseName || '';
    if (col === '申请数量') return qty(sumEntries(item, 'requestQty'));
    if (col === '批准数量') return qty(sumEntries(item, 'approveQty'));
    if (col === '已下推数量') return qty(sumEntries(item, 'purchasedQty'));
    if (col === '剩余可下推') return qty(sumEntries(item, 'remainingPurchaseQty'));
    if (col === '订单数量') return qty(sumEntries(item, 'orderQty'));
    if (col === '已收料数量') return qty(sumEntries(item, 'receivedQty'));
    if (col === '剩余可收料') return qty(sumEntries(item, 'remainingReceiveQty'));
    if (col === '收料数量') return qty(sumEntries(item, 'receiveQty'));
    if (col === '已检验数量') return qty(sumEntries(item, 'inspectedQty'));
    if (col === '可入库数量') return qty(item.availableInboundQty || sumEntries(item, 'availableInboundQty'));
    if (col === '已入库数量') return qty(sumEntries(item, 'stockedQty'));
    if (col === '入库数量') return qty(sumEntries(item, 'quantity'));
    if (col === '送检数量') return qty(item.inspectionQty);
    if (col === '合格数量') return qty(item.qualifiedQty);
    if (col === '让步接收数量') return qty(item.concessionQty);
    if (col === '不合格数量') return qty(item.unqualifiedQty);
    if (col === '检验结果') return resultName(item.result);
    if (col === '是否检验') return item.needCheck ? '是' : '否';
    if (col === '金额') return money(item.totalAmount || item.amount);
    if (col === '暂估应付状态') return payableStatusName(item.payableGenerationStatus);
    if (col === '暂估应付单号') return item.payableNo || '';
    if (col === '状态') return '__STATUS__';
    if (col === '创建时间') return item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
    return val(item[col]);
  }

  function resultName(result) {
    var map = { 0: '待定', 1: '合格', 2: '不合格', 3: '让步接收' };
    return map[Number(result)] || val(result);
  }

  function payableStatusName(s) {
    var map = { NOT_GENERATED: '未生成', GENERATED: '已生成', FAILED: '生成失败', AP_FAILED: '生成失败' };
    return map[s] || s || '';
  }

  window.loadData = async function loadDataApi() {
    var c = cfg();
    if (!c) return;
    ensureP0Ui();
    await loadLookupData();
    try {
      setBusy(true, '加载中...');
      var params = '?page=' + (window.currentPage || 1) + '&pageSize=' + (window.pageSize || 10);
      if (window.docType === 'purchase_inspect') params += '&inspectionType=1';
      if (window.docType === 'purchase_inbound') params += '&inType=1';
      var data = await api(c.endpoint + params);
      currentList = data.list || data || [];
      window.renderTable(currentList);
      updatePagination(data);
    } catch (e) {
      toast(e.message || '加载失败', 'error');
      var tbody = document.getElementById('dataBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;padding:40px;color:#cf1322;">真实 API 加载失败：' + escapeHtml(e.message) + '</td></tr>';
    } finally { setBusy(false); }
  };

  window.renderTable = function renderTableApi(list) {
    var c = cfg();
    var tbody = document.getElementById('dataBody');
    if (!tbody || !c) return;
    var columns = c.listColumns;
    var theadRow = document.querySelector('.data-table thead tr');
    if (theadRow) theadRow.innerHTML = '<th><input type="checkbox" onclick="selectAll()"></th>' + columns.map(function (x) { return '<th>' + x + '</th>'; }).join('');
    tbody.innerHTML = '';
    if (!list || !list.length) {
      tbody.innerHTML = '<tr><td colspan="' + (columns.length + 1) + '" style="text-align:center;padding:40px;color:#999;">暂无真实 API 数据</td></tr>';
      return;
    }
    list.forEach(function (item) {
      var tr = document.createElement('tr');
      var html = '<td><input type="checkbox" class="data-checkbox" value="' + item.id + '"></td>';
      columns.forEach(function (col) {
        var v = listValue(item, col);
        if (v === '__STATUS__') html += '<td>' + getStatusBadge(item) + '</td>';
        else if (col === '单据编号') html += '<td><a href="' + (c.detailPage || c.createPage) + '?id=' + item.id + '">' + escapeHtml(v) + '</a></td>';
        else if (col.indexOf('金额') >= 0) html += '<td style="color:#f5222d;font-weight:600;">' + escapeHtml(v) + '</td>';
        else if (col === '暂估应付状态') html += '<td><span class="badge ' + (String(v).indexOf('失败') >= 0 ? 'badge-danger' : String(v).indexOf('已生成') >= 0 ? 'badge-success' : 'badge-muted') + '">' + escapeHtml(v) + '</span></td>';
        else html += '<td>' + escapeHtml(v) + '</td>';
      });
      tr.innerHTML = html;
      tbody.appendChild(tr);
    });
  };

  function updatePagination(data) {
    var info = document.querySelector('.pagination span');
    if (info && data && data.total !== undefined) info.textContent = '第 ' + (data.page || 1) + ' 页 / 共 ' + data.total + ' 条';
  }

  function isCreatePage() { return !!document.getElementById('detailBody') || !!document.getElementById('pageTitle'); }
  function isOrderDetailPage() { return location.pathname.split('/').pop() === 'purchase-order-detail.html'; }

  window.loadDoc = async function loadDocApi(id) {
    var c = cfg();
    if (!c || !id) return;
    ensureP0Ui();
    await loadLookupData();
    try {
      setBusy(true);
      currentDoc = await api(c.endpoint + '/' + encodeURIComponent(id));
      window.editingId = currentDoc && currentDoc.id;
      fillDoc(currentDoc);
      renderTrace(currentDoc);
      updateActionButtons(currentDoc);
    } catch (e) { toast(e.message || '加载详情失败', 'error'); }
    finally { setBusy(false); }
  };

  function fillDoc(doc) {
    if (!doc) return;
    var c = cfg();
    setField('单据编号', docNo(doc));
    setField('日期', dateOf(doc));
    setField('供应商', doc.supplierName || doc.partnerName || ((doc.entries || [])[0] || {}).supplierName || '');
    setField('组织', doc.orgName || doc.purchaseOrgName || doc.stockOrgName || doc.orgId || doc.purchaseOrgId || doc.stockOrgId || '');
    setField('金额', money(doc.totalAmount || doc.amount));
    setField('状态', doc.statusName || doc.statusCode || '');
    setField('创建时间', doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '');
    setField('备注', doc.remark || '');
    setField('采购合同号', doc.contractNo || '');
    setField('是否需要检验', doc.needCheck ? '是' : '否');
    setField('暂估应付状态', payableStatusName(doc.payableGenerationStatus));
    setField('暂估应付单号', doc.payableNo || '');
    setField('应付失败原因', doc.payableGenerationError || doc.payableError || '');
    var tbody = document.getElementById('detailBody');
    if (tbody) {
      tbody.innerHTML = '';
      var rows = detailRowsFromDoc(doc);
      rows.forEach(function (r) { addDetailRowWithMeta(r, r.__meta || {}); });
    }
    if (typeof calculateTotal === 'function') try { calculateTotal(); } catch (e) {}
  }

  function detailRowsFromDoc(doc) {
    if (window.docType === 'purchase_inspect') {
      return [{
        '物料编码': doc.materialCode, '物料名称': doc.materialName, '规格型号': doc.materialModel || '', '单位': doc.unitName || '',
        '送检数量': qty(doc.inspectionQty), '合格数量': qty(doc.qualifiedQty), '让步接收数量': qty(doc.concessionQty), '不合格数量': qty(doc.unqualifiedQty), '检验结果': resultName(doc.result), '合格率': doc.inspectionQty ? ((Number(doc.qualifiedQty || 0) / Number(doc.inspectionQty || 1)) * 100).toFixed(2) + '%' : '', '备注': doc.remark || '',
        __meta: { id: doc.id, sourceReceiveNoticeEntryId: doc.sourceReceiveNoticeEntryId, availableInboundQty: doc.availableInboundQty }
      }];
    }
    return (doc.entries || []).map(function (e) {
      var row = {
        '物料编码': e.materialCode, '物料名称': e.materialName, '规格型号': e.materialModel || e.spec || '', '单位': e.unitName || e.unitCode || '',
        '数量': qty(e.requestQty || e.orderQty || e.receiveQty || e.quantity),
        '订单数量': qty(e.purchasedQty), '收料数量': qty(e.receivedQty || e.receiveQty), '检验数量': qty(e.inspectedQty), '入库数量': qty(e.stockedQty || e.quantity),
        '未订货数量': qty(e.remainingPurchaseQty), '未到货数量': qty(e.remainingReceiveQty), '未入库数量': qty(e.availableInboundQty || e.remainingStockQty),
        '合格数量': qty(e.qualifiedQty), '不合格数量': qty(e.unqualifiedQty), '送检数量': qty(e.inspectionQty),
        '单价': qty(e.unitPrice || e.estimatedPrice), '金额': money(e.totalAmount || e.amount || e.estimatedAmount), '税率': qty(e.taxRate), '税额': money(e.taxAmount), '备注': e.remark || ''
      };
      row.__meta = e;
      return row;
    });
  }

  function addDetailRowWithMeta(row, meta) {
    if (window.docType === 'purchase_inspect') {
      addInspectDetailRow(row || {}, meta || {});
      return;
    }
    if (typeof window.addDetailRow === 'function') window.addDetailRow(row || {});
    var tr = document.querySelector('#detailBody tr:last-child');
    if (!tr) return;
    var keys = ['id', 'materialId', 'unitId', 'warehouseId', 'supplierId', 'sourceRequestEntryId', 'sourceOrderEntryId', 'sourceReceiveNoticeEntryId', 'availableInboundQty', 'remainingPurchaseQty', 'remainingReceiveQty'];
    keys.forEach(function (k) { if (meta && meta[k] !== undefined && meta[k] !== null) appendHidden(tr, k, meta[k]); });
  }

  function addInspectDetailRow(row, meta) {
    var tbody = document.getElementById('detailBody');
    if (!tbody) return;
    var table = tbody.closest('table');
    var headRow = table && table.querySelector('thead tr');
    if (headRow) headRow.innerHTML = '<th><input type="checkbox" onclick="typeof selectAllDetails === \'function\' && selectAllDetails()"></th><th>序号</th><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>送检数量</th><th>合格数量</th><th>让步接收数量</th><th>不合格数量</th><th>检验结果</th><th>备注</th>';
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><input type="checkbox" class="detail-checkbox"></td>' +
      '<td>' + (tbody.children.length + 1) + '</td>' +
      '<td><input data-field="物料编码" value="' + escapeHtml(row['物料编码']) + '" readonly></td>' +
      '<td><input data-field="物料名称" value="' + escapeHtml(row['物料名称']) + '" readonly></td>' +
      '<td><input data-field="规格型号" value="' + escapeHtml(row['规格型号']) + '" readonly></td>' +
      '<td><input data-field="单位" value="' + escapeHtml(row['单位']) + '" readonly></td>' +
      '<td><input data-field="送检数量" type="number" step="0.0001" value="' + escapeHtml(row['送检数量']) + '"></td>' +
      '<td><input data-field="合格数量" type="number" step="0.0001" value="' + escapeHtml(row['合格数量']) + '"></td>' +
      '<td><input data-field="让步接收数量" type="number" step="0.0001" value="' + escapeHtml(row['让步接收数量'] || 0) + '"></td>' +
      '<td><input data-field="不合格数量" type="number" step="0.0001" value="' + escapeHtml(row['不合格数量']) + '"></td>' +
      '<td><input data-field="检验结果" value="' + escapeHtml(row['检验结果']) + '" readonly></td>' +
      '<td><input data-field="备注" value="' + escapeHtml(row['备注']) + '"></td>';
    tbody.appendChild(tr);
    var keys = ['id', 'sourceReceiveNoticeEntryId', 'availableInboundQty'];
    keys.forEach(function (k) { if (meta && meta[k] !== undefined && meta[k] !== null) appendHidden(tr, k, meta[k]); });
  }

  function appendHidden(tr, key, value) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.setAttribute('data-field', key);
    input.value = value;
    tr.appendChild(input);
  }

  function renderTrace(doc) {
    var body = document.querySelector('.doc-body');
    if (!body || !doc) return;
    var box = document.getElementById('p0TraceBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'p0TraceBox';
      box.className = 'p0-trace';
      body.insertBefore(box, body.children[1] || body.firstChild);
    }
    var lines = [];
    lines.push('当前状态：' + (doc.statusName || doc.statusCode || doc.status));
    if (doc.requestNo) lines.push('采购申请：' + doc.requestNo);
    if (doc.orderNo) lines.push('采购订单：' + doc.orderNo + (doc.contractNo ? ' / 合同号：' + doc.contractNo : ''));
    if (doc.purchaseOrderNo) lines.push('来源采购订单：' + doc.purchaseOrderNo);
    if (doc.noticeNo) lines.push('收料通知：' + doc.noticeNo);
    if (doc.sourceReceiveNoticeNo) lines.push('来源收料通知：' + doc.sourceReceiveNoticeNo);
    if (doc.inNo) lines.push('采购入库：' + doc.inNo);
    if (doc.payableGenerationStatus) lines.push('暂估应付：' + payableStatusName(doc.payableGenerationStatus) + (doc.payableNo ? ' / ' + doc.payableNo : ''));
    box.innerHTML = '<div class="p0-trace-title">P0 来源追溯 / 状态</div><div class="p0-trace-body">' + lines.map(escapeHtml).join('<br>') + '</div>';
  }

  function rowInput(row, key) { return row.querySelector('[data-field="' + key + '"]'); }
  function rowVal(row, key) { var el = rowInput(row, key); return el ? el.value.trim() : ''; }

  function collectEntries() {
    var rows = Array.prototype.slice.call(document.querySelectorAll('#detailBody tr'));
    return rows.map(function (row) {
      var mat = findMaster('material', rowVal(row, '物料编码')) || {};
      var unit = findMaster('unit', rowVal(row, '单位')) || findMaster('units', rowVal(row, '单位')) || {};
      var wh = findMaster('warehouse', rowVal(row, '仓库')) || {};
      return {
        id: rowVal(row, 'id') || undefined,
        materialId: rowVal(row, 'materialId') || mat.id,
        materialCode: rowVal(row, '物料编码') || mat.code || mat.materialCode,
        materialName: rowVal(row, '物料名称') || mat.name || mat.materialName,
        materialModel: rowVal(row, '规格型号') || mat.specification,
        unitId: rowVal(row, 'unitId') || unit.id || mat.unitId || 'unit-001',
        unitCode: unit.code || rowVal(row, '单位'),
        unitName: unit.name || rowVal(row, '单位'),
        requestQty: Number(rowVal(row, '数量') || 0),
        orderQty: Number(rowVal(row, '数量') || 0),
        quantity: Number(rowVal(row, '数量') || rowVal(row, '入库数量') || 0),
        unitPrice: Number(rowVal(row, '单价') || 0),
        estimatedPrice: Number(rowVal(row, '单价') || 0),
        taxRate: normalizeTax(rowVal(row, '税率')),
        estimatedAmount: Number(rowVal(row, '金额') || 0),
        warehouseId: rowVal(row, 'warehouseId') || wh.id,
        checkIncoming: true,
        remark: rowVal(row, '备注')
      };
    }).filter(function (e) { return e.materialCode && (e.requestQty || e.orderQty || e.quantity); });
  }

  function normalizeTax(v) {
    var n = Number(v || 0);
    return n > 0 && n < 1 ? n * 100 : n;
  }

  function compact(obj) {
    var out = {};
    Object.keys(obj || {}).forEach(function (k) {
      var v = obj[k];
      if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    return out;
  }

  function requestEntryDto(e, orgId, supplierId) {
    return compact({
      id: e.id,
      purchaseOrgId: e.purchaseOrgId || orgId,
      materialId: e.materialId,
      materialCode: e.materialCode,
      materialName: e.materialName,
      materialModel: e.materialModel,
      unitId: e.unitId,
      unitCode: e.unitCode,
      unitName: e.unitName,
      requestQty: e.requestQty,
      estimatedPrice: e.estimatedPrice,
      estimatedAmount: e.estimatedAmount,
      requiredDate: e.requiredDate,
      supplierId: e.supplierId || supplierId,
      supplierCode: e.supplierCode,
      supplierName: e.supplierName,
      warehouseId: e.warehouseId,
      contractNo: e.contractNo,
      remark: e.remark
    });
  }

  function orderEntryDto(e) {
    return compact({
      id: e.id,
      materialId: e.materialId,
      materialCode: e.materialCode,
      materialName: e.materialName,
      materialModel: e.materialModel,
      unitId: e.unitId,
      unitCode: e.unitCode,
      unitName: e.unitName,
      orderQty: e.orderQty || e.requestQty || e.quantity,
      unitPrice: e.unitPrice,
      taxRate: e.taxRate,
      deliveryDate: e.deliveryDate,
      warehouseId: e.warehouseId,
      checkIncoming: e.checkIncoming,
      remark: e.remark
    });
  }

  function receiveUpdateLineDto(e, warehouseId) {
    return compact({ id: e.id, quantity: e.quantity || e.orderQty || e.requestQty, checkIncoming: e.checkIncoming, warehouseId: e.warehouseId || warehouseId, remark: e.remark });
  }

  function inboundUpdateEntryDto(e, warehouseId) {
    return compact({ id: e.id, quantity: e.quantity || e.orderQty || e.requestQty, warehouseId: e.warehouseId || warehouseId, remark: e.remark });
  }

  function firstCachedId(keys) {
    for (var i = 0; i < keys.length; i++) {
      try {
        var list = JSON.parse(localStorage.getItem(keys[i]) || '[]');
        if (list && list.length && list[0].id) return list[0].id;
      } catch (e) {}
    }
    return undefined;
  }

  function getCurrencyId() {
    return firstCachedId(['erp_currencies_cache', 'erp_currency_cache']) || undefined;
  }

  function getPaymentTermId() {
    return firstCachedId(['erp_payment_terms_cache', 'erp_payment_term_cache', 'erp_paymentTerm_cache']) || undefined;
  }

  function collectDto() {
    var dt = window.docType;
    var orgId = firstId('org', getFieldValue('组织')) || (JSON.parse(localStorage.getItem('currentOrg') || '{}').id || '');
    var supplierId = firstId('supplier', getFieldValue('供应商'));
    var warehouseId = firstId('warehouse', getFieldValue('入库仓库')) || firstId('warehouse', '');
    var entries = collectEntries();
    if (dt === 'purchase_request') {
      return { orgId: orgId, requestDate: getFieldValue('日期'), remark: getFieldValue('备注'), entries: entries.map(function (e) { return requestEntryDto(e, orgId, supplierId); }) };
    }
    if (dt === 'purchase_order') {
      return compact({ supplierId: supplierId, purchaseOrgId: orgId, contractNo: getFieldValue('采购合同号'), orderDate: getFieldValue('日期'), warehouseId: warehouseId || undefined, currencyId: getCurrencyId(), paymentTermId: getPaymentTermId(), remark: getFieldValue('备注'), entries: entries.map(orderEntryDto) });
    }
    if (dt === 'purchase_receive') {
      return { stockOrgId: orgId, purchaseOrgId: orgId, receiveDate: getFieldValue('日期'), needCheck: getFieldValue('是否需要检验') !== '否', remark: getFieldValue('备注'), lines: entries.map(function (e) { return receiveUpdateLineDto(e, warehouseId); }) };
    }
    if (dt === 'purchase_inspect') {
      var first = document.querySelector('#detailBody tr');
      return { inspectionQty: Number(rowVal(first, '送检数量') || 0), qualifiedQty: Number(rowVal(first, '合格数量') || 0), unqualifiedQty: Number(rowVal(first, '不合格数量') || 0), concessionQty: Number(rowVal(first, '让步接收数量') || 0), inspectionDate: getFieldValue('日期'), inspector: getFieldValue('检验人员'), remark: getFieldValue('备注') };
    }
    if (dt === 'purchase_inbound') {
      return { inDate: getFieldValue('日期'), settleOrgId: orgId, ownerType: 'BD_OwnerOrg', ownerId: orgId, remark: getFieldValue('备注'), entries: entries.map(function (e) { return inboundUpdateEntryDto(e, warehouseId); }) };
    }
    return {};
  }

  window.saveDoc = async function saveDocApi() {
    var c = cfg();
    if (!c) return;
    try {
      if (!canEdit(currentDoc)) return toast('仅草稿/已驳回单据允许编辑，当前状态以后端为准', 'warning');
      var dto = collectDto();
      validateBeforeSave(dto);
      setBusy(true);
      var data;
      if (window.editingId) data = await api(c.endpoint + '/' + encodeURIComponent(window.editingId), { method: 'PUT', body: JSON.stringify(dto) });
      else data = await api(c.endpoint, { method: 'POST', body: JSON.stringify(dto) });
      currentDoc = data;
      window.editingId = data.id;
      fillDoc(data);
      renderTrace(data);
      updateActionButtons(data);
      toast('保存成功', 'success');
    } catch (e) { toast(e.message || '保存失败', 'error'); }
    finally { setBusy(false); }
  };

  function validateBeforeSave(dto) {
    if (window.docType === 'purchase_order' && !dto.contractNo) throw new Error('采购合同号必填');
    if ((window.docType === 'purchase_request' || window.docType === 'purchase_order') && (!dto.entries || !dto.entries.length)) throw new Error('请至少添加一条有效明细');
    if ((window.docType === 'purchase_receive' || window.docType === 'purchase_inbound') && !window.editingId) throw new Error('该单据必须从上游单据下推生成；草稿编辑请先打开已有单据');
    if (window.docType === 'purchase_inspect' && !window.editingId) throw new Error('来料检验单必须从已审核收料通知明细下推生成');
  }

  function canEdit(doc) {
    if (!window.editingId || !doc) return true;
    return ['DRAFT', 'REJECTED'].indexOf(statusCodeOf(doc)) >= 0;
  }

  function statusCodeOf(doc) {
    return (doc && (doc.statusCode || doc.status)) || '';
  }

  async function doAction(action, label) {
    var c = cfg();
    if (!window.editingId) return toast('请先保存或打开单据', 'warning');
    try {
      setBusy(true);
      var body = undefined;
      if (window.docType === 'purchase_inspect' && action === 'approve') body = JSON.stringify({ approvedBy: getUserName() });
      else if (window.docType === 'purchase_inbound' && action === 'approve') body = JSON.stringify({ approvedBy: getUserName() });
      var data = await api(c.endpoint + '/' + encodeURIComponent(window.editingId) + '/' + action, { method: 'POST', body: body });
      currentDoc = data || await api(c.endpoint + '/' + encodeURIComponent(window.editingId));
      fillDoc(currentDoc);
      renderTrace(currentDoc);
      updateActionButtons(currentDoc);
      toast(label + '成功', 'success');
    } catch (e) { toast((e && e.message) || (label + '失败'), 'error'); }
    finally { setBusy(false); }
  }

  window.submitDoc = function () { doAction('submit', '提交'); };
  window.approveDoc = function () { doAction('approve', '审核'); };
  window.rejectDoc = function () { doAction('reject', '驳回'); };
  window.closeDoc = function () { doAction('close', '关闭'); };
  window.cancelDoc = function () { doAction('cancel', '取消'); };
  window.reverseApproveDoc = function () { toast('P0 不开放前端反审核；是否允许由后端动作返回决定', 'warning'); };
  window.reverseCloseDoc = function () { toast('P0 不开放前端反关闭；是否允许由后端动作返回决定', 'warning'); };

  window.pushDownDoc = async function pushDownDocApi() {
    if (!currentDoc || !window.editingId) return toast('请先打开已审核单据', 'warning');
    var code = statusCodeOf(currentDoc);
    if (code !== 'APPROVED' && code !== 'FULLY_ORDERED' && code !== 'FULLY_STOCKED') return toast('只有已审核单据允许下推，当前状态：' + (currentDoc.statusName || code), 'warning');
    try {
      setBusy(true);
      if (window.docType === 'purchase_request') await pushRequestToOrder();
      else if (window.docType === 'purchase_order') await pushOrderToReceive();
      else if (window.docType === 'purchase_receive') await pushReceiveNext();
      else if (window.docType === 'purchase_inspect') await pushInspectionToInbound();
      else if (window.docType === 'purchase_inbound') await retryPayable();
      else toast('此单据不支持 P0 下推', 'warning');
    } catch (e) { toast(e.message || '下推失败', 'error'); }
    finally { setBusy(false); }
  };

  async function pushRequestToOrder() {
    var lines = (currentDoc.entries || []).filter(function (e) { return Number(e.remainingPurchaseQty || 0) > 0; });
    if (!lines.length) throw new Error('没有剩余可下推数量');
    var contractNo = prompt('请输入采购合同号（必填）', getFieldValue('采购合同号') || currentDoc.contractNo || '');
    if (!contractNo) throw new Error('采购合同号必填');
    var supplierId = currentDoc.supplierId || lines[0].supplierId || firstId('supplier', getFieldValue('供应商'));
    if (!supplierId) throw new Error('请选择供应商');
    var dto = compact({ idempotencyKey: nowKey('PR-PO'), supplierId: supplierId, contractNo: contractNo, orderDate: new Date().toISOString().slice(0, 10), currencyId: getCurrencyId(), paymentTermId: getPaymentTermId(), lines: lines.map(function (e) { return compact({ requestEntryId: e.id, quantity: Number(e.remainingPurchaseQty), unitPrice: Number(e.estimatedPrice || 0), taxRate: 13, warehouseId: e.warehouseId, checkIncoming: true }); }) });
    var order = await api('/purchase-orders/from-request', { method: 'POST', body: JSON.stringify(dto) });
    toast('已下推生成采购订单', 'success');
    location.href = 'purchase-order-create.html?id=' + order.id;
  }

  async function pushOrderToReceive() {
    var lines = (currentDoc.entries || []).filter(function (e) { return Number(e.remainingReceiveQty || 0) > 0; });
    if (!lines.length) throw new Error('没有剩余可收料数量');
    var needCheck = confirm('本次收料是否需要来料检验？选择“确定”为需要检验，选择“取消”为免检。');
    var orgId = currentDoc.purchaseOrgId || firstId('org', getFieldValue('组织'));
    var dto = { purchaseOrderId: currentDoc.id, stockOrgId: orgId, purchaseOrgId: orgId, receiveBatchNo: nowKey('RCV'), receiveDate: new Date().toISOString().slice(0, 10), needCheck: needCheck, lines: lines.map(function (e) { return { orderEntryId: e.id, quantity: Number(e.remainingReceiveQty), checkIncoming: needCheck, warehouseId: e.warehouseId || currentDoc.warehouseId }; }) };
    var notice = await api('/purchase-receive-notices/from-order', { method: 'POST', body: JSON.stringify(dto) });
    toast('已下推生成收料通知单', 'success');
    location.href = 'purchase-receive-create.html?id=' + notice.id;
  }

  async function pushReceiveNext() {
    var needInspect = (currentDoc.entries || []).filter(function (e) { return e.requiresInspection && Number(e.remainingInspectQty || 0) > 0; });
    if (needInspect.length) {
      var first = needInspect[0];
      var inspect = await api('/quality-inspections/incoming/from-receive-entry', { method: 'POST', body: JSON.stringify({ receiveNoticeEntryId: first.id }) });
      toast('已下推生成来料检验单', 'success');
      location.href = 'purchase-inspect-create.html?id=' + inspect.id;
      return;
    }
    await pushReceiveToInbound(currentDoc.entries || []);
  }

  async function pushReceiveToInbound(entries) {
    var lines = entries.filter(function (e) { return Number(e.availableInboundQty || 0) > 0; });
    if (!lines.length) throw new Error('没有可入库数量');
    var orgId = currentDoc.stockOrgId || currentDoc.purchaseOrgId || firstId('org', getFieldValue('组织'));
    var wh = firstId('warehouse', getFieldValue('入库仓库'));
    var dto = { idempotencyKey: nowKey('RCV-IN'), inDate: new Date().toISOString().slice(0, 10), settleOrgId: orgId, ownerType: 'BD_OwnerOrg', ownerId: orgId, entries: lines.map(function (e) { return { sourceReceiveNoticeEntryId: e.id || e.sourceReceiveNoticeEntryId, quantity: Number(e.availableInboundQty), warehouseId: e.warehouseId || wh }; }) };
    var inbound = await api('/inventory-in/from-receive-notices', { method: 'POST', body: JSON.stringify(dto) });
    toast('已下推生成采购入库单', 'success');
    location.href = 'purchase-inbound-create.html?id=' + inbound.id;
  }

  async function pushInspectionToInbound() {
    if (!currentDoc.sourceReceiveNoticeEntryId) throw new Error('检验单缺少来源收料通知明细，无法入库');
    await pushReceiveToInbound([{ id: currentDoc.sourceReceiveNoticeEntryId, sourceReceiveNoticeEntryId: currentDoc.sourceReceiveNoticeEntryId, availableInboundQty: currentDoc.availableInboundQty }]);
  }

  async function retryPayable() {
    if (!window.editingId) return toast('请先打开采购入库单', 'warning');
    try {
      setBusy(true);
      var data = await api('/inventory-in/' + encodeURIComponent(window.editingId) + '/generate-estimated-payable', { method: 'POST', body: JSON.stringify({ operatedBy: getUserName() }) });
      currentDoc = data || await api('/inventory-in/' + encodeURIComponent(window.editingId));
      fillDoc(currentDoc);
      renderTrace(currentDoc);
      updateActionButtons(currentDoc);
      toast('暂估应付已生成/已确认', 'success');
    } catch (e) { toast(e.message || '暂估应付重试失败', 'error'); }
    finally { setBusy(false); }
  }

  function getUserName() {
    try { return (JSON.parse(localStorage.getItem('user') || '{}').username || 'frontend'); } catch (e) { return 'frontend'; }
  }

  function setBusy(flag, text) {
    p0Busy = flag;
    document.querySelectorAll('.toolbar-btn,.btn').forEach(function (b) {
      if (flag) b.setAttribute('disabled', 'disabled');
      else b.removeAttribute('disabled');
    });
    var banner = document.getElementById('p0ApiBanner');
    if (banner && text) banner.textContent = text;
    if (banner && !flag) banner.textContent = 'P0 标准采购主链：当前页面已切换为真实 API 驱动；数量、状态、错误提示以后端返回为准。';
    if (!flag) {
      if (currentDoc) updateActionButtons(currentDoc);
      else if (isCreatePage()) updateActionButtons({ statusCode: 'DRAFT', statusName: '草稿' });
    }
  }

  function updateActionButtons(doc) {
    if (!doc) return;
    var code = statusCodeOf(doc);
    var editable = ['DRAFT', 'REJECTED'].indexOf(code) >= 0;
    var submitted = code === 'SUBMITTED';
    var approved = code === 'APPROVED';
    var terminal = ['CLOSED', 'CANCELED', 'FULLY_ORDERED', 'FULLY_STOCKED'].indexOf(code) >= 0;
    var payableFailed = window.docType === 'purchase_inbound' && (doc.payableGenerationStatus === 'FAILED' || doc.payableGenerationStatus === 'AP_FAILED');
    setButton('saveDoc', editable);
    setButton('submitDoc', editable);
    setButton('approveDoc', submitted);
    setButton('rejectDoc', submitted);
    setButton('pushDownDoc', approved || payableFailed);
    setButton('closeDoc', approved);
    setButton('cancelDoc', editable || submitted || approved);
    setButton('reverseApproveDoc', false);
    setButton('reverseCloseDoc', false);
    var retry = document.getElementById('p0RetryPayableBtn');
    if (retry) {
      retry.style.display = payableFailed ? '' : 'none';
      retry.disabled = !payableFailed;
    }
    document.querySelectorAll('input,select,textarea').forEach(function (el) {
      if (el.closest('.lookup-modal') || el.closest('.confirm-modal') || el.type === 'checkbox') return;
      if (el.id === 'field_状态' || el.id === 'field_单据编号' || el.id === 'field_创建时间' || el.classList.contains('readonly')) return;
      el.disabled = !editable;
    });
  }

  function setButton(fn, enabled) {
    document.querySelectorAll('[onclick^="' + fn + '("]').forEach(function (b) { b.disabled = !enabled; });
  }



  async function loadOrderDetailPage() {
    ensureP0Ui();
    var id = new URLSearchParams(location.search).get('id');
    if (!id) {
      renderOrderDetailCard(null, '请从采购订单列表点击单据编号进入真实 API 详情。');
      return;
    }
    try {
      setBusy(true, '正在加载采购订单详情...');
      currentDoc = await api('/purchase-orders/' + encodeURIComponent(id));
      renderOrderDetailCard(currentDoc);
    } catch (e) {
      renderOrderDetailCard(null, e.message || '采购订单详情加载失败');
      toast(e.message || '采购订单详情加载失败', 'error');
    } finally { setBusy(false); }
  }

  function renderOrderDetailCard(doc, error) {
    var host = document.querySelector('.main-content') || document.body;
    var card = document.getElementById('p0OrderDetailCard');
    if (!card) {
      card = document.createElement('div');
      card.id = 'p0OrderDetailCard';
      card.className = 'p0-trace';
      card.style.margin = '16px';
      host.insertBefore(card, host.firstChild);
    }
    if (error) {
      card.innerHTML = '<div class="p0-trace-title">P0 采购订单真实 API 详情</div><div class="p0-trace-body" style="color:#cf1322;">' + escapeHtml(error) + '</div>';
      return;
    }
    var rows = (doc.entries || []).map(function(e, i){
      return '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(e.materialCode) + '</td><td>' + escapeHtml(e.materialName) + '</td><td>' + qty(e.orderQty) + '</td><td>' + qty(e.receivedQty) + '</td><td>' + qty(e.remainingReceiveQty) + '</td><td>' + qty(e.stockedQty) + '</td><td>' + escapeHtml(e.sourceRequestNo || e.sourceRequestEntryId || '') + '</td></tr>';
    }).join('');
    card.innerHTML = '<div class="p0-trace-title">P0 采购订单真实 API 详情 / 来源追溯</div>' +
      '<div class="p0-trace-body">' +
      '<b>订单号：</b>' + escapeHtml(doc.orderNo) + '　<b>状态：</b>' + escapeHtml(doc.statusName || doc.statusCode) + '　<b>供应商：</b>' + escapeHtml(doc.supplierName || '') + '　<b>采购合同号：</b>' + escapeHtml(doc.contractNo || '') + '<br>' +
      '<b>价税合计：</b>' + money(doc.totalAmount || doc.amount) + '　<b>创建时间：</b>' + escapeHtml(doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '') +
      '<div style="overflow:auto;margin-top:12px;"><table class="data-table"><thead><tr><th>行号</th><th>物料编码</th><th>物料名称</th><th>订单数量</th><th>已收料</th><th>剩余可收</th><th>已入库</th><th>来源申请</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8" style="text-align:center;color:#999;">暂无明细</td></tr>') + '</tbody></table></div>' +
      '</div>';
  }

  function getSelectedIds() { return Array.from(document.querySelectorAll('.data-checkbox:checked')).map(function (cb) { return cb.value; }); }
  window.getSelectedIds = getSelectedIds;

  async function batchAction(action, label) {
    var ids = getSelectedIds();
    if (!ids.length) return toast('请选择单据', 'warning');
    var c = cfg();
    try {
      setBusy(true);
      for (var i = 0; i < ids.length; i++) await api(c.endpoint + '/' + encodeURIComponent(ids[i]) + '/' + action, { method: 'POST', body: action === 'approve' && window.docType === 'purchase_inbound' ? JSON.stringify({ approvedBy: getUserName() }) : undefined });
      toast(label + '成功：' + ids.length + ' 条', 'success');
      await window.loadData();
    } catch (e) { toast(e.message || (label + '失败'), 'error'); }
    finally { setBusy(false); }
  }

  window.batchSubmit = function () { batchAction('submit', '提交'); };
  window.batchApprove = function () { batchAction('approve', '审核'); };
  window.batchClose = function () { batchAction('close', '关闭'); };
  window.batchDelete = async function () {
    var ids = getSelectedIds();
    if (!ids.length) return toast('请选择单据', 'warning');
    var c = cfg();
    try { setBusy(true); for (var i = 0; i < ids.length; i++) await api(c.endpoint + '/' + encodeURIComponent(ids[i]), { method: 'DELETE' }); toast('删除成功：' + ids.length + ' 条', 'success'); await window.loadData(); }
    catch (e) { toast(e.message || '删除失败', 'error'); }
    finally { setBusy(false); }
  };
  window.batchReverseApprove = function () { toast('P0 不开放批量反审核', 'warning'); };
  window.batchReverseClose = function () { toast('P0 不开放批量反关闭', 'warning'); };

  function escapeHtml(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]; });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    if (!cfg()) return;
    if (isOrderDetailPage()) { await loadOrderDetailPage(); return; }
    ensureP0Ui();
    await loadLookupData();
    var params = new URLSearchParams(location.search);
    var id = params.get('id');
    if (isCreatePage() && id) {
      await window.loadDoc(id);
    } else if (!isCreatePage()) {
      await window.loadData();
    } else {
      updateActionButtons({ statusCode: 'DRAFT', statusName: '草稿' });
      if (window.docType === 'purchase_order') setField('采购合同号', '');
      if (window.docType === 'purchase_receive' || window.docType === 'purchase_inspect' || window.docType === 'purchase_inbound') {
        toast(CONFIG[window.docType].name + '必须从上游单据下推生成；请先在上游已审核单据点击“下推”。', 'warning');
      }
    }
  });
})();
