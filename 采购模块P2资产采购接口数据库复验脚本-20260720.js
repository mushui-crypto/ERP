const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { createRequire } = require('module');

const projectRequire = createRequire('/Users/dq/Documents/ERP/hub-erp-v0/server/package.json');
const sql = projectRequire('mssql');
const bcrypt = projectRequire('bcryptjs');
const ROOT = '/Users/dq/Documents/ERP/hub-erp-v0';
const SERVER = path.join(ROOT, 'server');
const API = process.env.P2_API || 'http://localhost:3003/api';
const RUN = `P2VERIFY-${Date.now()}`;
const OUT = path.join(ROOT, '采购模块P2资产采购接口数据库复验证据-20260720.json');
const evidence = { runTag: RUN, api: API, startedAt: new Date().toISOString(), tests: [], defects: [], ids: {} };
let FLOW_SEQ = 0;

function readEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(SERVER, '.env'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

function record(id, name, ok, detail = {}) {
  const item = { id, name, status: ok ? 'PASS' : 'FAIL', detail, at: new Date().toISOString() };
  evidence.tests.push(item);
  if (!ok) evidence.defects.push(item);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}`);
  return ok;
}

function assert(id, name, condition, detail = {}) {
  return record(id, name, Boolean(condition), detail);
}

async function api(uri, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers || {}) };
  if (global.token) headers.authorization = `Bearer ${global.token}`;
  const response = await fetch(`${API}${uri}`, { ...options, headers });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok || (body && body.code >= 400)) {
    const error = new Error(body?.message || text || `HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body;
}

async function expectError(id, name, action, includes) {
  try {
    await action();
    record(id, name, false, { expected: includes, actual: '未报错' });
  } catch (error) {
    assert(id, name, !includes || error.message.includes(includes), { message: error.message });
  }
}

async function db(pool, query, inputs = {}) {
  const request = pool.request();
  for (const [key, value] of Object.entries(inputs)) request.input(key, value);
  return (await request.query(query)).recordset;
}

async function one(pool, query, inputs = {}) {
  return (await db(pool, query, inputs))[0];
}

async function insert(pool, table, values) {
  const columns = Object.keys(values);
  const request = pool.request();
  for (const column of columns) request.input(column, values[column]);
  const query = `insert into ${table} (${columns.map((column) => `[${column}]`).join(',')}) output inserted.id values (${columns.map((column) => `@${column}`).join(',')})`;
  return (await request.query(query)).recordset[0].id;
}

async function prepare(pool) {
  const suffix = RUN.replace(/\D/g, '').slice(-10);
  const now = new Date();
  const common = { created_at: now, updated_at: now, is_deleted: 0 };
  const password = `P2_${suffix}_Pwd`;
  const userId = await insert(pool, 'sys_user', {
    username: `p2acc_${suffix}`, password: bcrypt.hashSync(password, 10), real_name: 'P2验收',
    email: '', phone: '', dept_id: null, emp_id: null, avatar: '', status: 1, ...common,
  });
  const supplierId = await insert(pool, 'master_supplier', {
    supplier_code: `P2SUP_${suffix}`, supplier_name: `P2供应商_${suffix}`, short_name: `P2SUP_${suffix}`,
    supplier_type: 1, contact_person: 'P2', contact_phone: '', email: '', address: '', payment_term_id: null,
    buyer_id: null, tax_number: '', bank_name: '', bank_account: '', status: 1, remark: RUN, ...common,
  });
  const warehouseId = await insert(pool, 'master_warehouse', {
    warehouse_code: `P2WH_${suffix}`, warehouse_name: `P2仓_${suffix}`, warehouse_type: 1,
    parent_id: null, manager_id: null, address: '', is_default: 0, status: 1, remark: RUN, ...common,
  });
  const unitId = await insert(pool, 'master_unit', {
    unit_code: `P2U_${suffix}`, unit_name: '个', unit_type: 1, precision: 4, status: 1, remark: RUN, ...common,
  });
  const materialId = await insert(pool, 'master_material', {
    material_code: `P2MAT_${suffix}`, material_name: `P2资产_${suffix}`, material_spec: 'P2-SPEC',
    category_id: null, unit_id: unitId, material_type: 2, purchase_type: 1, barcode: '',
    default_warehouse: warehouseId, safety_stock: 0, min_order_qty: 0, lead_time: 0, standard_cost: 0,
    sale_price: 0, is_batch_manage: 0, is_serial_manage: 0, shelf_life_days: 0, status: 1, remark: RUN, ...common,
  });
  const currencyId = await insert(pool, 'master_currency', {
    currency_code: `C${suffix.slice(-5)}`, currency_name: `P2币_${suffix}`, currency_symbol: 'CNY',
    exchange_rate: 1, is_base: 0, status: 1, remark: RUN, ...common,
  });
  const paymentTermId = await insert(pool, 'master_payment_term', {
    term_code: `P2PT_${suffix}`, term_name: `P2月结_${suffix}`, term_type: 3, credit_days: 30,
    advance_ratio: 0, stage1_ratio: 0, stage2_ratio: 0, stage3_ratio: 0, status: 1, remark: RUN, ...common,
  });
  const orgId = randomUUID();
  const login = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username: `p2acc_${suffix}`, password }) });
  global.token = login.accessToken;
  const categoryCode = `P2CAT_${suffix}`;
  await api('/fixed-asset/categories', { method: 'POST', body: JSON.stringify({
    categoryCode, categoryName: `P2设备_${suffix}`, assetType: 'EQUIPMENT', usefulLifeMonths: 60,
    salvageRate: 5, depreciationMethod: 'straight_line', remark: RUN,
  }) });
  return { suffix, userId, supplierId, warehouseId, unitId, materialId, currencyId, paymentTermId, orgId, categoryCode };
}

async function createToReceive(ctx, businessType, quantity) {
  const externalSourceId = `${RUN}-${businessType}-${++FLOW_SEQ}`;
  const importPayload = {
    externalSourceType: 'OA', externalSourceId, externalSourceNo: `OA-${ctx.suffix}`,
    billType: 'ASSET_PURCHASE', businessType, orgId: ctx.orgId, requestDate: '2026-07-20', remark: RUN,
    entries: [{ purchaseOrgId: ctx.orgId, materialId: ctx.materialId, materialCode: `P2MAT_${ctx.suffix}`,
      materialName: `P2资产_${ctx.suffix}`, materialModel: 'P2-SPEC', unitId: ctx.unitId, unitCode: 'EA', unitName: '个',
      requestQty: quantity, estimatedPrice: 100, supplierId: ctx.supplierId, warehouseId: ctx.warehouseId }],
  };
  const concurrentImports = await Promise.all(Array.from({ length: 4 }, () => api('/purchase-requests/import', {
    method: 'POST', body: JSON.stringify(importPayload),
  })));
  const request = concurrentImports[0];
  assert(`P2-${businessType}-${FLOW_SEQ}-CONCURRENT-PR`, 'OA导入首次并发只返回一个申请',
    concurrentImports.every((item) => item.id === request.id), { ids: concurrentImports.map((item) => item.id) });
  const same = await api('/purchase-requests/import', { method: 'POST', body: JSON.stringify(importPayload) });
  assert(`P2-${businessType}-${FLOW_SEQ}-IDEM-PR`, 'OA导入同来源同载荷返回原单', same.id === request.id, { id: request.id });
  await expectError(`P2-${businessType}-${FLOW_SEQ}-CONFLICT-PR`, 'OA导入同来源不同载荷冲突', () => api('/purchase-requests/import', {
    method: 'POST', body: JSON.stringify({ ...importPayload, remark: `${RUN}-DIFF` }),
  }), '不同请求载荷');
  await api(`/purchase-requests/${request.id}/submit`, { method: 'POST' });
  const approvedRequest = await api(`/purchase-requests/${request.id}/approve`, { method: 'POST', body: '{}' });
  const order = await api('/purchase-orders/from-request', { method: 'POST', body: JSON.stringify({
    idempotencyKey: `${RUN}-PO-${businessType}-${FLOW_SEQ}`, supplierId: ctx.supplierId, contractNo: `HT-${RUN}-${businessType}`,
    orderDate: '2026-07-20', currencyId: ctx.currencyId, paymentTermId: ctx.paymentTermId,
    lines: [{ requestEntryId: approvedRequest.entries[0].id, quantity, unitPrice: 100, taxRate: 13,
      warehouseId: ctx.warehouseId, checkIncoming: false }],
  }) });
  await api(`/purchase-orders/${order.id}/submit`, { method: 'POST' });
  const approvedOrder = await api(`/purchase-orders/${order.id}/approve`, { method: 'POST' });
  const receive = await api('/purchase-receive-notices/from-order', { method: 'POST', body: JSON.stringify({
    purchaseOrderId: approvedOrder.id, stockOrgId: ctx.orgId, purchaseOrgId: ctx.orgId,
    receiveBatchNo: `RB-${RUN}-${businessType}-${FLOW_SEQ}`, receiveDate: '2026-07-20', needCheck: false,
    lines: [{ orderEntryId: approvedOrder.entries[0].id, quantity, checkIncoming: false, warehouseId: ctx.warehouseId }],
  }) });
  await api(`/purchase-receive-notices/${receive.id}/submit`, { method: 'POST' });
  const approvedReceive = await api(`/purchase-receive-notices/${receive.id}/approve`, { method: 'POST' });
  assert(`P2-${businessType}-${FLOW_SEQ}-TRACE`, '采购类型逐级透传',
    approvedRequest.businessType === businessType && approvedOrder.businessType === businessType && approvedReceive.businessType === businessType,
    { request: approvedRequest.businessType, order: approvedOrder.businessType, receive: approvedReceive.businessType });
  return { request: approvedRequest, order: approvedOrder, receive: approvedReceive };
}

async function runNoInbound(pool, ctx) {
  const flow = await createToReceive(ctx, 'ASSET_NO_INBOUND', 3);
  await expectError('P2-CG07-NO-IN', '不入库资产采购禁止生成采购入库', () => api('/inventory-in/from-receive-notices', {
    method: 'POST', body: JSON.stringify({ idempotencyKey: `${RUN}-NO-IN`, settleOrgId: ctx.orgId,
      ownerType: 'BD_OwnerOrg', ownerId: ctx.orgId,
      entries: [{ sourceReceiveNoticeEntryId: flow.receive.entries[0].id, quantity: 3, warehouseId: ctx.warehouseId }] }),
  }), '禁止生成采购入库');
  const payload = { idempotencyKey: `${RUN}-AA-CG07`, sourceId: flow.receive.id, settleOrgId: ctx.orgId,
    acceptanceDate: '2026-07-20', entries: [{ sourceEntryId: flow.receive.entries[0].id,
      acceptanceQty: 3, passedQty: 2, failedQty: 1, assetCategoryCode: ctx.categoryCode,
      departmentId: ctx.orgId, custodianId: ctx.userId, location: 'CG07' }] };
  const concurrentAcceptances = await Promise.all(Array.from({ length: 4 }, () => api('/asset-acceptances/from-receive-notice', {
    method: 'POST', body: JSON.stringify(payload),
  })));
  const acceptance = concurrentAcceptances[0];
  assert('P2-CG07-CONCURRENT-AA', '资产验收首次并发只返回一个验收单',
    concurrentAcceptances.every((item) => item.id === acceptance.id), { ids: concurrentAcceptances.map((item) => item.id) });
  const same = await api('/asset-acceptances/from-receive-notice', { method: 'POST', body: JSON.stringify(payload) });
  assert('P2-CG07-IDEM-AA', '资产验收同键同载荷返回原单', same.id === acceptance.id, { id: acceptance.id });
  await expectError('P2-CG07-CONFLICT-AA', '资产验收同键不同载荷冲突', () => api('/asset-acceptances/from-receive-notice', {
    method: 'POST', body: JSON.stringify({ ...payload, remark: 'DIFF' }),
  }), '幂等键');
  await expectError('P2-CG07-OVER-AA', '资产验收禁止超验收', () => api('/asset-acceptances/from-receive-notice', {
    method: 'POST', body: JSON.stringify({ ...payload, idempotencyKey: `${RUN}-AA-CG07-OVER`, entries: [{ ...payload.entries[0], acceptanceQty: 4, passedQty: 4, failedQty: 0 }] }),
  }), '可验收数量');
  await api(`/asset-acceptances/${acceptance.id}/submit`, { method: 'POST' });
  await db(pool, 'update fin_asset_category set status=0 where category_code=@categoryCode', ctx);
  const approved = await api(`/asset-acceptances/${acceptance.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  assert('P2-CG07-CARD-FAIL', 'CG-07建卡失败不回滚验收和暂估应付',
    approved.statusCode === 'APPROVED' && approved.payableGenerationStatus === 'GENERATED'
      && approved.assetCardGenerationStatus === 'FAILED' && approved.assetCardGenerationError,
    approved);
  await db(pool, 'update fin_asset_category set status=1 where category_code=@categoryCode', ctx);
  const retried = await api(`/asset-acceptances/${acceptance.id}/generate-asset-cards`, { method: 'POST', body: '{}' });
  assert('P2-CG07-CARD-RETRY', 'CG-07建卡失败后允许幂等重试成功',
    retried.assetCardGenerationStatus === 'GENERATED' && !retried.assetCardGenerationError, retried);
  const payable = await one(pool, "select count(*) c from fin_payable where source_type='ASSET_ACCEPTANCE' and source_id=@id and is_deleted=0", { id: acceptance.id });
  const cards = await one(pool, "select count(*) c from fin_fixed_asset where source_type='ASSET_ACCEPTANCE' and source_id=@id and is_deleted=0", { id: acceptance.id });
  const source = await one(pool, 'select asset_accepted_qty from biz_purchase_receive_notice_entry where id=@id', { id: flow.receive.entries[0].id });
  assert('P2-CG07-DB', 'CG-07应付唯一、通过数量反写且一物一卡', Number(payable.c) === 1 && Number(cards.c) === 2 && Number(source.asset_accepted_qty) === 2,
    { payables: payable.c, cards: cards.c, assetAcceptedQty: source.asset_accepted_qty });
  const retriedAgain = await api(`/asset-acceptances/${acceptance.id}/generate-asset-cards`, { method: 'POST', body: '{}' });
  const cardsAfter = await one(pool, "select count(*) c from fin_fixed_asset where source_type='ASSET_ACCEPTANCE' and source_id=@id and is_deleted=0", { id: acceptance.id });
  assert('P2-CG07-CARD-IDEM', 'CG-07重复建卡不重复数据', retriedAgain.assetCardGenerationStatus === 'GENERATED' && Number(cardsAfter.c) === 2, cardsAfter);
}

async function runInbound(pool, ctx) {
  const flow = await createToReceive(ctx, 'ASSET_INBOUND', 2);
  const inbound = await api('/inventory-in/from-receive-notices', { method: 'POST', body: JSON.stringify({
    idempotencyKey: `${RUN}-IN-CG08`, inDate: '2026-07-20', settleOrgId: ctx.orgId,
    ownerType: 'BD_OwnerOrg', ownerId: ctx.orgId,
    entries: [{ sourceReceiveNoticeEntryId: flow.receive.entries[0].id, quantity: 2, warehouseId: ctx.warehouseId }],
  }) });
  await api(`/inventory-in/${inbound.id}/submit`, { method: 'POST' });
  const approvedInbound = await api(`/inventory-in/${inbound.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  assert('P2-CG08-IN', 'CG-08采购入库审核生成暂估应付', approvedInbound.businessType === 'ASSET_INBOUND' && approvedInbound.payableGenerationStatus === 'GENERATED', approvedInbound);
  const acceptance = await api('/asset-acceptances/from-inventory-in', { method: 'POST', body: JSON.stringify({
    idempotencyKey: `${RUN}-AA-CG08`, sourceId: approvedInbound.id, acceptanceDate: '2026-07-20',
    entries: [{ sourceEntryId: approvedInbound.entries[0].id, acceptanceQty: 2, passedQty: 2, failedQty: 0,
      assetCategoryCode: ctx.categoryCode, departmentId: ctx.orgId, custodianId: ctx.userId, location: 'CG08' }],
  }) });
  await api(`/asset-acceptances/${acceptance.id}/submit`, { method: 'POST' });
  const approvedAcceptance = await api(`/asset-acceptances/${acceptance.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  assert('P2-CG08-AA', 'CG-08验收审核不提前建卡或重复应付',
    approvedAcceptance.statusCode === 'APPROVED' && approvedAcceptance.payableGenerationStatus === 'NOT_REQUIRED' && approvedAcceptance.assetCardGenerationStatus === 'NOT_REQUIRED', approvedAcceptance);
  const firstRequest = await api('/asset-out-requests/from-asset-acceptance', { method: 'POST', body: JSON.stringify({
    idempotencyKey: `${RUN}-AOR-CANCEL`, assetAcceptanceId: acceptance.id, warehouseId: ctx.warehouseId, requestDate: '2026-07-20',
  }) });
  await api(`/asset-out-requests/${firstRequest.id}/cancel`, { method: 'POST' });
  const request = await api('/asset-out-requests/from-asset-acceptance', { method: 'POST', body: JSON.stringify({
    idempotencyKey: `${RUN}-AOR-CG08`, assetAcceptanceId: acceptance.id, warehouseId: ctx.warehouseId, requestDate: '2026-07-20',
  }) });
  assert('P2-CG08-AOR-RECREATE', '取消出库申请释放数量并允许重建', request.id !== firstRequest.id && Number(request.entries[0].requestQty) === 2,
    { canceledId: firstRequest.id, recreatedId: request.id });
  await api(`/asset-out-requests/${request.id}/submit`, { method: 'POST' });
  await api(`/asset-out-requests/${request.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  const push = { idempotencyKey: `${RUN}-OUT-CG08`, outDate: '2026-07-20', remark: RUN };
  const inventoryOut = await api(`/asset-out-requests/${request.id}/push-inventory-out`, { method: 'POST', body: JSON.stringify(push) });
  const sameOut = await api(`/asset-out-requests/${request.id}/push-inventory-out`, { method: 'POST', body: JSON.stringify(push) });
  assert('P2-CG08-IDEM-OUT', '其他出库下推同键同载荷返回原单', sameOut.id === inventoryOut.id, { id: inventoryOut.id });
  await expectError('P2-CG08-CONFLICT-OUT', '其他出库下推同键不同载荷冲突', () => api(`/inventory-out/from-asset-out-request/${request.id}`, {
    method: 'POST', body: JSON.stringify({ ...push, remark: 'DIFF' }),
  }), '幂等键');
  await api(`/inventory-out/${inventoryOut.id}/submit`, { method: 'POST' });
  const approvedOut = await api(`/inventory-out/${inventoryOut.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  assert('P2-CG08-OUT', '其他出库审核扣库存后生成资产卡片', approvedOut.statusCode === 'APPROVED' && approvedOut.assetCardGenerationStatus === 'GENERATED', approvedOut);
  const cards = await one(pool, "select count(*) c from fin_fixed_asset where source_type='ASSET_INVENTORY_OUT' and source_id=@id and is_deleted=0", { id: inventoryOut.id });
  const posting = await one(pool, "select count(*) c, sum(quantity) qty from biz_inventory_posting where source_type='ASSET_OTHER_OUTBOUND' and source_id=@id and is_deleted=0", { id: inventoryOut.id });
  const stock = await one(pool, 'select quantity,available_qty from biz_inventory where warehouse_id=@warehouseId and material_id=@materialId and is_deleted=0', ctx);
  const source = await one(pool, 'select asset_accepted_qty from inventory_in_entry where id=@id', { id: approvedInbound.entries[0].id });
  assert('P2-CG08-DB', 'CG-08库存出库、通过数量反写且一物一卡', Number(cards.c) === 2 && Number(posting.c) === 1 && Number(posting.qty) === -2 && Number(stock.quantity) === 0 && Number(source.asset_accepted_qty) === 2,
    { cards: cards.c, postings: posting.c, postingQty: posting.qty, stockQty: stock.quantity, assetAcceptedQty: source.asset_accepted_qty });
  await api(`/inventory-out/${inventoryOut.id}/generate-asset-cards`, { method: 'POST', body: '{}' });
  const cardsAfter = await one(pool, "select count(*) c from fin_fixed_asset where source_type='ASSET_INVENTORY_OUT' and source_id=@id and is_deleted=0", { id: inventoryOut.id });
  assert('P2-CG08-CARD-IDEM', 'CG-08重复建卡不重复数据', Number(cardsAfter.c) === 2, cardsAfter);
}



async function runNoInboundPayableRetry(pool, ctx) {
  const flow = await createToReceive(ctx, 'ASSET_NO_INBOUND', 1);
  const payload = { idempotencyKey: `${RUN}-AA-CG07-PAYFAIL`, sourceId: flow.receive.id, settleOrgId: ctx.orgId,
    acceptanceDate: '2026-07-20', entries: [{ sourceEntryId: flow.receive.entries[0].id, acceptanceQty: 1, passedQty: 1, failedQty: 0,
      assetCategoryCode: ctx.categoryCode, departmentId: ctx.orgId, custodianId: ctx.userId, location: 'CG07-PAYFAIL' }] };
  const aa = await api('/asset-acceptances/from-receive-notice', { method: 'POST', body: JSON.stringify(payload) });
  await api(`/asset-acceptances/${aa.id}/submit`, { method: 'POST' });
  await db(pool, 'update master_payment_term set status=0 where id=@paymentTermId', ctx);
  const approved = await api(`/asset-acceptances/${aa.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  assert('P2-CG07-PAYABLE-FAIL', 'CG-07暂估应付失败不回滚资产验收', approved.statusCode === 'APPROVED' && approved.payableGenerationStatus === 'FAILED', { status: approved.statusCode, payable: approved.payableGenerationStatus, err: approved.payableGenerationError });
  await db(pool, 'update master_payment_term set status=1 where id=@paymentTermId', ctx);
  const retried = await api(`/asset-acceptances/${aa.id}/generate-estimated-payable`, { method: 'POST', body: '{}' });
  const payable = await one(pool, "select count(*) c from fin_payable where source_type='ASSET_ACCEPTANCE' and source_id=@id and payable_type='ESTIMATED' and is_deleted=0", { id: aa.id });
  assert('P2-CG07-PAYABLE-RETRY', 'CG-07暂估应付失败后重试成功且唯一', retried.payableGenerationStatus === 'GENERATED' && Number(payable.c) === 1, { status: retried.payableGenerationStatus, count: payable.c });
}

async function runInboundPayableRetry(pool, ctx) {
  const flow = await createToReceive(ctx, 'ASSET_INBOUND', 1);
  const inbound = await api('/inventory-in/from-receive-notices', { method: 'POST', body: JSON.stringify({
    idempotencyKey: `${RUN}-IN-CG08-PAYFAIL`, inDate: '2026-07-20', settleOrgId: ctx.orgId,
    ownerType: 'BD_OwnerOrg', ownerId: ctx.orgId,
    entries: [{ sourceReceiveNoticeEntryId: flow.receive.entries[0].id, quantity: 1, warehouseId: ctx.warehouseId }],
  }) });
  await api(`/inventory-in/${inbound.id}/submit`, { method: 'POST' });
  await db(pool, 'update master_payment_term set status=0 where id=@paymentTermId', ctx);
  const approved = await api(`/inventory-in/${inbound.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  assert('P2-CG08-PAYABLE-FAIL', 'CG-08入库暂估应付失败不回滚入库审核', approved.statusCode === 'APPROVED' && approved.payableGenerationStatus === 'FAILED', { status: approved.statusCode, payable: approved.payableGenerationStatus, err: approved.payableGenerationError });
  await db(pool, 'update master_payment_term set status=1 where id=@paymentTermId', ctx);
  const retried = await api(`/inventory-in/${inbound.id}/generate-estimated-payable`, { method: 'POST', body: '{}' });
  const payable = await one(pool, "select count(*) c from fin_payable where source_type='PURCHASE_INBOUND' and source_id=@id and payable_type='ESTIMATED' and is_deleted=0", { id: inbound.id });
  assert('P2-CG08-PAYABLE-RETRY', 'CG-08入库暂估应付失败后重试成功且唯一', retried.payableGenerationStatus === 'GENERATED' && Number(payable.c) === 1, { status: retried.payableGenerationStatus, count: payable.c });
}

async function runInventoryOutRollback(pool, ctx) {
  const flow = await createToReceive(ctx, 'ASSET_INBOUND', 1);
  const inbound = await api('/inventory-in/from-receive-notices', { method: 'POST', body: JSON.stringify({
    idempotencyKey: `${RUN}-IN-CG08-ROLLBACK`, inDate: '2026-07-20', settleOrgId: ctx.orgId,
    ownerType: 'BD_OwnerOrg', ownerId: ctx.orgId,
    entries: [{ sourceReceiveNoticeEntryId: flow.receive.entries[0].id, quantity: 1, warehouseId: ctx.warehouseId }],
  }) });
  await api(`/inventory-in/${inbound.id}/submit`, { method: 'POST' });
  const approvedInbound = await api(`/inventory-in/${inbound.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  const aa = await api('/asset-acceptances/from-inventory-in', { method: 'POST', body: JSON.stringify({ idempotencyKey: `${RUN}-AA-ROLLBACK`, sourceId: approvedInbound.id, acceptanceDate: '2026-07-20', entries: [{ sourceEntryId: approvedInbound.entries[0].id, acceptanceQty: 1, passedQty: 1, failedQty: 0, assetCategoryCode: ctx.categoryCode, departmentId: ctx.orgId, custodianId: ctx.userId, location: 'ROLLBACK' }] }) });
  await api(`/asset-acceptances/${aa.id}/submit`, { method: 'POST' });
  await api(`/asset-acceptances/${aa.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  const req = await api('/asset-out-requests/from-asset-acceptance', { method: 'POST', body: JSON.stringify({ idempotencyKey: `${RUN}-AOR-ROLLBACK`, assetAcceptanceId: aa.id, warehouseId: ctx.warehouseId, requestDate: '2026-07-20' }) });
  await api(`/asset-out-requests/${req.id}/submit`, { method: 'POST' });
  await api(`/asset-out-requests/${req.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  const out = await api(`/asset-out-requests/${req.id}/push-inventory-out`, { method: 'POST', body: JSON.stringify({ idempotencyKey: `${RUN}-OUT-ROLLBACK`, outDate: '2026-07-20' }) });
  await api(`/inventory-out/${out.id}/submit`, { method: 'POST' });
  await db(pool, 'update biz_inventory set quantity=0, available_qty=0 where warehouse_id=@warehouseId and material_id=@materialId and is_deleted=0', ctx);
  await expectError('P2-CG08-STOCK-ROLLBACK-ERR', '库存不足时其他出库审核返回错误', () => api(`/inventory-out/${out.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) }), '库存');
  const outDb = await one(pool, 'select status, asset_card_generation_status from inventory_out where id=@id', { id: out.id });
  const reqEntry = await one(pool, 'select out_qty from biz_asset_out_request_entry where asset_out_request_id=@id', { id: req.id });
  const post = await one(pool, "select count(*) c from biz_inventory_posting where source_id=@id and source_type='ASSET_OTHER_OUTBOUND' and is_deleted=0", { id: out.id });
  assert('P2-CG08-STOCK-ROLLBACK-DB', '库存不足时其他出库保持待审核且未反写/未建卡/未过账', Number(outDb.status) === 1 && Number(reqEntry.out_qty || 0) === 0 && Number(post.c) === 0, { outDb, reqEntry, post });
}

async function runNoInboundMultiLine(pool, ctx) {
  const externalSourceId = `${RUN}-MULTI-CG07`;
  const importPayload = { externalSourceType: 'OA', externalSourceId, externalSourceNo: `OA-MULTI-${ctx.suffix}`,
    billType: 'ASSET_PURCHASE', businessType: 'ASSET_NO_INBOUND', orgId: ctx.orgId, requestDate: '2026-07-20', remark: `${RUN}-MULTI`,
    entries: [2, 1].map((qty, idx) => ({ purchaseOrgId: ctx.orgId, materialId: ctx.materialId, materialCode: `P2MAT_${ctx.suffix}`,
      materialName: `P2资产_${ctx.suffix}-${idx + 1}`, materialModel: `P2-SPEC-${idx + 1}`, unitId: ctx.unitId, unitCode: 'EA', unitName: '个',
      requestQty: qty, estimatedPrice: 100, supplierId: ctx.supplierId, warehouseId: ctx.warehouseId })) };
  const pr = await api('/purchase-requests/import', { method: 'POST', body: JSON.stringify(importPayload) });
  await api(`/purchase-requests/${pr.id}/submit`, { method: 'POST' });
  const pra = await api(`/purchase-requests/${pr.id}/approve`, { method: 'POST', body: '{}' });
  const po = await api('/purchase-orders/from-request', { method: 'POST', body: JSON.stringify({ idempotencyKey: `${RUN}-PO-MULTI`, supplierId: ctx.supplierId, contractNo: `HT-${RUN}-MULTI`, orderDate: '2026-07-20', currencyId: ctx.currencyId, paymentTermId: ctx.paymentTermId, lines: pra.entries.map((e) => ({ requestEntryId: e.id, quantity: Number(e.approveQty || e.requestQty), unitPrice: 100, taxRate: 13, warehouseId: ctx.warehouseId, checkIncoming: false })) }) });
  await api(`/purchase-orders/${po.id}/submit`, { method: 'POST' });
  const poa = await api(`/purchase-orders/${po.id}/approve`, { method: 'POST' });
  const rn = await api('/purchase-receive-notices/from-order', { method: 'POST', body: JSON.stringify({ purchaseOrderId: poa.id, stockOrgId: ctx.orgId, purchaseOrgId: ctx.orgId, receiveBatchNo: `RB-${RUN}-MULTI`, receiveDate: '2026-07-20', needCheck: false, lines: poa.entries.map((e) => ({ orderEntryId: e.id, quantity: Number(e.orderQty), checkIncoming: false, warehouseId: ctx.warehouseId })) }) });
  await api(`/purchase-receive-notices/${rn.id}/submit`, { method: 'POST' });
  const rna = await api(`/purchase-receive-notices/${rn.id}/approve`, { method: 'POST' });
  const aa = await api('/asset-acceptances/from-receive-notice', { method: 'POST', body: JSON.stringify({ idempotencyKey: `${RUN}-AA-MULTI`, sourceId: rna.id, settleOrgId: ctx.orgId, acceptanceDate: '2026-07-20', entries: [
    { sourceEntryId: rna.entries[0].id, acceptanceQty: 2, passedQty: 1, failedQty: 1, assetCategoryCode: ctx.categoryCode, departmentId: ctx.orgId, custodianId: ctx.userId, location: 'MULTI-1' },
    { sourceEntryId: rna.entries[1].id, acceptanceQty: 1, passedQty: 1, failedQty: 0, assetCategoryCode: ctx.categoryCode, departmentId: ctx.orgId, custodianId: ctx.userId, location: 'MULTI-2' },
  ] }) });
  await api(`/asset-acceptances/${aa.id}/submit`, { method: 'POST' });
  const approved = await api(`/asset-acceptances/${aa.id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy: 'P2' }) });
  const cards = await one(pool, "select count(*) c from fin_fixed_asset where source_type='ASSET_ACCEPTANCE' and source_id=@id and is_deleted=0", { id: aa.id });
  const sum = await one(pool, 'select sum(asset_accepted_qty) qty from biz_purchase_receive_notice_entry where purchase_receive_notice_id=@id and is_deleted=0', { id: rna.id });
  assert('P2-CG07-MULTI-PARTIAL', 'CG-07多明细部分验收按通过数量反写并一物一卡', approved.entries.length === 2 && Number(cards.c) === 2 && Number(sum.qty) === 2, { entries: approved.entries.length, cards: cards.c, acceptedQty: sum.qty });
}

async function main() {
  const env = readEnv();
  const pool = await sql.connect({
    server: env.DB_MSSQL_HOST || 'localhost', port: +(env.DB_MSSQL_PORT || 1433),
    user: env.DB_MSSQL_USERNAME, password: env.DB_MSSQL_PASSWORD, database: env.DB_MSSQL_DATABASE,
    options: { encrypt: false, trustServerCertificate: true },
  });
  try {
    const swagger = await (await fetch(`${API}/docs-json`)).json();
    const requiredRoutes = ['/api/purchase-requests/import', '/api/asset-acceptances/from-receive-notice',
      '/api/asset-acceptances/from-inventory-in', '/api/asset-out-requests/from-asset-acceptance',
      '/api/inventory-out/from-asset-out-request/{requestId}'];
    assert('P2-ROUTES', 'P2 Swagger 路由完整', requiredRoutes.every((route) => swagger.paths?.[route]), { requiredRoutes });
    const ctx = await prepare(pool);
    evidence.ids = ctx;
    await runNoInbound(pool, ctx);
    await runNoInboundMultiLine(pool, ctx);
    await runNoInboundPayableRetry(pool, ctx);
    await runInbound(pool, ctx);
    await runInboundPayableRetry(pool, ctx);
    await runInventoryOutRollback(pool, ctx);
  } catch (error) {
    record('P2-UNHANDLED', '脚本未处理异常', false, { message: error.message, stack: error.stack, body: error.body });
  } finally {
    evidence.completedAt = new Date().toISOString();
    evidence.summary = { total: evidence.tests.length, passed: evidence.tests.filter((item) => item.status === 'PASS').length, failed: evidence.defects.length };
    fs.writeFileSync(OUT, `${JSON.stringify(evidence, null, 2)}\n`);
    await pool.close();
    console.log(`evidence=${OUT}`);
    console.log(JSON.stringify(evidence.summary));
    if (evidence.defects.length) process.exitCode = 1;
  }
}

main();
