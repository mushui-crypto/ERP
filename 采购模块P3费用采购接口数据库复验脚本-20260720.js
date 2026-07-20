const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { createRequire } = require('module');

const projectRequire = createRequire('/Users/dq/Documents/ERP/hub-erp-v0/server/package.json');
const sql = projectRequire('mssql');
const bcrypt = projectRequire('bcryptjs');
const ROOT = '/Users/dq/Documents/ERP/hub-erp-v0';
const SERVER = path.join(ROOT, 'server');
const API = process.env.P3_API || 'http://localhost:3003/api';
const RUN = `P3VERIFY-${Date.now()}`;
const OUT = path.join(ROOT, '采购模块P3费用采购接口数据库复验证据-20260720.json');
const evidence = {
  runTag: RUN,
  api: API,
  startedAt: new Date().toISOString(),
  tests: [],
  defects: [],
  ids: {},
};

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

async function expectError(id, name, action, includes) {
  try {
    await action();
    record(id, name, false, { expected: includes, actual: 'no error' });
  } catch (error) {
    assert(id, name, !includes || error.message.includes(includes), { message: error.message });
  }
}

async function api(uri, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers || {}) };
  if (global.token) headers.authorization = `Bearer ${global.token}`;
  const response = await fetch(`${API}${uri}`, { ...options, headers });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok || (body && body.code >= 400)) {
    const error = new Error(body?.message || text || `HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body;
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
  const password = `P3_${suffix}_Pwd`;
  const username = `p3acc_${suffix}`;
  const userId = await insert(pool, 'sys_user', {
    username,
    password: bcrypt.hashSync(password, 10),
    real_name: 'P3',
    email: '',
    phone: '',
    dept_id: null,
    emp_id: null,
    avatar: '',
    status: 1,
    ...common,
  });
  const supplierId = await insert(pool, 'master_supplier', {
    supplier_code: `P3SUP_${suffix}`,
    supplier_name: `P3Supplier_${suffix}`,
    short_name: `P3SUP_${suffix}`,
    supplier_type: 1,
    contact_person: 'P3',
    contact_phone: '',
    email: '',
    address: '',
    payment_term_id: null,
    buyer_id: null,
    tax_number: '',
    bank_name: '',
    bank_account: '',
    status: 1,
    remark: RUN,
    ...common,
  });
  const currencyId = await insert(pool, 'master_currency', {
    currency_code: `E${suffix.slice(-5)}`,
    currency_name: `P3Currency_${suffix}`,
    currency_symbol: 'CNY',
    exchange_rate: 1,
    is_base: 0,
    status: 1,
    remark: RUN,
    ...common,
  });
  const paymentTermId = await insert(pool, 'master_payment_term', {
    term_code: `P3PT_${suffix}`,
    term_name: `P3Term_${suffix}`,
    term_type: 3,
    credit_days: 30,
    advance_ratio: 0,
    stage1_ratio: 0,
    stage2_ratio: 0,
    stage3_ratio: 0,
    status: 1,
    remark: RUN,
    ...common,
  });
  const orgId = randomUUID();
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  global.token = login.accessToken;
  return { suffix, userId, supplierId, currencyId, paymentTermId, orgId };
}

function requestPayload(ctx, key, quantity = 10) {
  return {
    externalSourceType: 'OA',
    externalSourceId: `${RUN}-${key}`,
    externalSourceNo: `OA-${key}-${ctx.suffix}`,
    billType: 'EXPENSE_PURCHASE',
    businessType: 'EXPENSE_PURCHASE',
    orgId: ctx.orgId,
    requestDate: '2026-07-20',
    remark: RUN,
    entries: [{
      purchaseOrgId: ctx.orgId,
      expenseItemCode: `EXP-${key}`,
      expenseItemName: `Service-${key}`,
      requestQty: quantity,
      estimatedPrice: 100,
      supplierId: ctx.supplierId,
    }],
  };
}

async function createServiceCompletion(ctx, key, quantity = 10, useImport = true) {
  const payload = requestPayload(ctx, key, quantity);
  const request = useImport
    ? await api('/purchase-requests/import', { method: 'POST', body: JSON.stringify(payload) })
    : await api('/purchase-requests', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        externalSourceType: undefined,
        externalSourceId: undefined,
        externalSourceNo: undefined,
      }),
    });
  await api(`/purchase-requests/${request.id}/submit`, { method: 'POST' });
  const approvedRequest = await api(`/purchase-requests/${request.id}/approve`, {
    method: 'POST',
    body: '{}',
  });
  const order = await api('/purchase-orders/from-request', {
    method: 'POST',
    body: JSON.stringify({
      idempotencyKey: `${RUN}-PO-${key}`,
      supplierId: ctx.supplierId,
      contractNo: `HT-${RUN}-${key}`,
      orderDate: '2026-07-20',
      currencyId: ctx.currencyId,
      paymentTermId: ctx.paymentTermId,
      lines: [{
        requestEntryId: approvedRequest.entries[0].id,
        quantity,
        unitPrice: 100,
        taxRate: 13,
        checkIncoming: true,
      }],
    }),
  });
  await api(`/purchase-orders/${order.id}/submit`, { method: 'POST' });
  const approvedOrder = await api(`/purchase-orders/${order.id}/approve`, { method: 'POST' });
  const notice = await api('/purchase-receive-notices/from-order', {
    method: 'POST',
    body: JSON.stringify({
      purchaseOrderId: approvedOrder.id,
      stockOrgId: ctx.orgId,
      purchaseOrgId: ctx.orgId,
      receiveBatchNo: `${RUN}-RB-${key}`,
      receiveDate: '2026-07-20',
      needCheck: true,
      lines: [{
        orderEntryId: approvedOrder.entries[0].id,
        quantity,
        checkIncoming: true,
        warehouseId: randomUUID(),
      }],
    }),
  });
  await api(`/purchase-receive-notices/${notice.id}/submit`, { method: 'POST' });
  const approvedNotice = await api(`/purchase-receive-notices/${notice.id}/approve`, { method: 'POST' });
  const refreshedRequest = await api(`/purchase-requests/${approvedRequest.id}`);
  const refreshedOrder = await api(`/purchase-orders/${approvedOrder.id}`);
  return { request: refreshedRequest, order: refreshedOrder, notice: approvedNotice };
}

async function createAcceptance(ctx, notice, key, quantity) {
  return api('/expense-acceptances/from-receive-notice', {
    method: 'POST',
    body: JSON.stringify({
      idempotencyKey: `${RUN}-EA-${key}`,
      sourceId: notice.id,
      settleOrgId: ctx.orgId,
      acceptanceDate: '2026-07-20',
      departmentId: ctx.orgId,
      acceptorId: ctx.userId,
      entries: [{
        sourceEntryId: notice.entries[0].id,
        acceptanceQty: quantity,
        departmentId: ctx.orgId,
      }],
    }),
  });
}

async function runMainFlow(pool, ctx) {
  const manual = await createServiceCompletion(ctx, 'MANUAL', 10, false);
  const requestList = await api('/purchase-requests?page=1&pageSize=100');
  assert(
    'P3-QUERY-01',
    'unfiltered purchase request query includes expense requests',
    requestList.list.some((item) => item.id === manual.request.id && item.billType === 'EXPENSE_PURCHASE'),
    { total: requestList.total, requestId: manual.request.id },
  );
  assert(
    'P3-TYPE-01',
    'manual expense request type propagated',
    manual.request.billType === 'EXPENSE_PURCHASE'
      && manual.order.businessType === 'EXPENSE_PURCHASE'
      && manual.notice.businessType === 'EXPENSE_PURCHASE',
    { request: manual.request.billType, order: manual.order.businessType, notice: manual.notice.businessType },
  );
  assert(
    'P3-FIELD-01',
    'text expense item propagated with nullable material and unit',
    manual.notice.entries[0].expenseItemName === 'Service-MANUAL'
      && manual.notice.entries[0].materialId == null
      && manual.notice.entries[0].unitId == null,
    manual.notice.entries[0],
  );
  assert(
    'P3-SERVICE-01',
    'expense service completion forced inspection and warehouse off',
    manual.notice.needCheck === false
      && manual.notice.entries[0].checkIncoming === false
      && manual.notice.entries[0].warehouseId == null,
    {
      needCheck: manual.notice.needCheck,
      checkIncoming: manual.notice.entries[0].checkIncoming,
      warehouseId: manual.notice.entries[0].warehouseId,
    },
  );
  assert(
    'P3-QTY-01',
    'order approval and service completion quantities written back',
    Number(manual.request.entries[0].purchasedQty) === 10
      && Number(manual.order.entries[0].receivedQty) === 10,
    {
      purchasedQty: manual.request.entries[0].purchasedQty,
      receivedQty: manual.order.entries[0].receivedQty,
    },
  );
  await expectError(
    'P3-BOUNDARY-01',
    'expense service completion cannot create incoming inspection',
    () => api('/quality-inspections/incoming/from-receive-entry', {
      method: 'POST',
      body: JSON.stringify({ receiveNoticeEntryId: manual.notice.entries[0].id }),
    }),
    '免检',
  );
  await expectError(
    'P3-BOUNDARY-02',
    'expense service completion cannot create purchase inbound',
    () => api('/inventory-in/from-receive-notices', {
      method: 'POST',
      body: JSON.stringify({
        idempotencyKey: `${RUN}-IN-EXPENSE`,
        inDate: '2026-07-20',
        settleOrgId: ctx.orgId,
        ownerType: 'BD_OwnerOrg',
        ownerId: ctx.orgId,
        entries: [{
          sourceReceiveNoticeEntryId: manual.notice.entries[0].id,
          quantity: 1,
          warehouseId: randomUUID(),
        }],
      }),
    }),
    '费用采购',
  );

  const first = await createAcceptance(ctx, manual.notice, 'PART-1', 6);
  const same = await createAcceptance(ctx, manual.notice, 'PART-1', 6);
  assert('P3-IDEM-01', 'same idempotency key and payload returns same acceptance', first.id === same.id, { id: first.id });
  await expectError(
    'P3-IDEM-02',
    'same idempotency key with different payload conflicts',
    () => createAcceptance(ctx, manual.notice, 'PART-1', 5),
    '不同请求载荷',
  );
  await api(`/expense-acceptances/${first.id}/submit`, { method: 'POST' });
  const approved = await api(`/expense-acceptances/${first.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approvedBy: 'P3' }),
  });
  assert(
    'P3-ACCEPT-01',
    'expense acceptance approved and estimated payable generated',
    approved.statusCode === 'APPROVED'
      && approved.payableGenerationStatus === 'GENERATED'
      && Boolean(approved.payableNo),
    {
      statusCode: approved.statusCode,
      payableGenerationStatus: approved.payableGenerationStatus,
      payableNo: approved.payableNo,
    },
  );
  const noticeEntry = await one(
    pool,
    'select expense_accepted_qty from biz_purchase_receive_notice_entry where id=@id',
    { id: manual.notice.entries[0].id },
  );
  assert('P3-QTY-02', 'approved acceptance quantity written to service completion', Number(noticeEntry.expense_accepted_qty) === 6, noticeEntry);
  const payable = await one(
    pool,
    "select id, source_type, source_id, amount, payable_date, due_date from fin_payable where source_type='EXPENSE_ACCEPTANCE' and source_id=@id and is_deleted=0",
    { id: first.id },
  );
  assert(
    'P3-PAYABLE-01',
    'one estimated payable traces to expense acceptance',
    payable && payable.source_type === 'EXPENSE_ACCEPTANCE' && Number(payable.amount) === 678,
    payable,
  );
  const payableEntry = await one(
    pool,
    'select expense_acceptance_entry_id, expense_item_code, expense_item_name, material_id, unit_id, quantity, total_amount from fin_payable_entry where payable_id=@id and is_deleted=0',
    { id: payable.id },
  );
  assert(
    'P3-TRACE-01',
    'payable entry keeps expense item and source with nullable material',
    Boolean(payableEntry.expense_acceptance_entry_id)
      && payableEntry.expense_item_name === 'Service-MANUAL'
      && payableEntry.material_id == null
      && payableEntry.unit_id == null
      && Number(payableEntry.quantity) === 6,
    payableEntry,
  );
  const dueDays = Math.round((new Date(payable.due_date) - new Date(payable.payable_date)) / 86400000);
  assert('P3-PAYABLE-02', 'payable due date uses payment term credit days', dueDays === 30, { dueDays });
  const retry = await api(`/expense-acceptances/${first.id}/generate-estimated-payable`, { method: 'POST' });
  const payableCount = await one(
    pool,
    "select count(*) c from fin_payable where source_type='EXPENSE_ACCEPTANCE' and source_id=@id and is_deleted=0",
    { id: first.id },
  );
  assert(
    'P3-PAYABLE-03',
    'estimated payable retry is idempotent',
    retry.payableId === approved.payableId && Number(payableCount.c) === 1,
    { payableId: retry.payableId, count: payableCount.c },
  );

  await expectError(
    'P3-OVER-01',
    'acceptance cannot exceed remaining service quantity',
    () => createAcceptance(ctx, manual.notice, 'OVER', 5),
    '可验收数量',
  );
  const remainder = await createAcceptance(ctx, manual.notice, 'PART-2', 4);
  await api(`/expense-acceptances/${remainder.id}/submit`, { method: 'POST' });
  const remainderApproved = await api(`/expense-acceptances/${remainder.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approvedBy: 'P3' }),
  });
  assert('P3-PARTIAL-01', 'remaining quantity can be accepted separately', remainderApproved.statusCode === 'APPROVED', { id: remainder.id });
}

async function runOaAndConcurrency(pool, ctx) {
  const payload = requestPayload(ctx, 'OA-IDEM', 2);
  const first = await api('/purchase-requests/import', { method: 'POST', body: JSON.stringify(payload) });
  const second = await api('/purchase-requests/import', { method: 'POST', body: JSON.stringify(payload) });
  assert('P3-OA-01', 'OA expense request import is idempotent', first.id === second.id, { id: first.id });
  await expectError(
    'P3-OA-02',
    'OA source with different expense payload conflicts',
    () => api('/purchase-requests/import', {
      method: 'POST',
      body: JSON.stringify({ ...payload, entries: [{ ...payload.entries[0], expenseItemName: 'Changed-Service' }] }),
    }),
    '不同请求载荷',
  );

  const flow = await createServiceCompletion(ctx, 'CONCURRENT', 2, true);
  const body = {
    idempotencyKey: `${RUN}-EA-CONCURRENT`,
    sourceId: flow.notice.id,
    settleOrgId: ctx.orgId,
    acceptanceDate: '2026-07-20',
    entries: [{ sourceEntryId: flow.notice.entries[0].id, acceptanceQty: 2 }],
  };
  const results = await Promise.all([
    api('/expense-acceptances/from-receive-notice', { method: 'POST', body: JSON.stringify(body) }),
    api('/expense-acceptances/from-receive-notice', { method: 'POST', body: JSON.stringify(body) }),
  ]);
  const count = await one(
    pool,
    'select count(*) c from biz_expense_acceptance where idempotency_key=@key and is_deleted=0',
    { key: body.idempotencyKey },
  );
  assert(
    'P3-CONCURRENT-01',
    'concurrent same-key acceptance creates one record',
    results[0].id === results[1].id && Number(count.c) === 1,
    { ids: results.map((item) => item.id), count: count.c },
  );
}

async function runPayableFailureRetry(pool, ctx) {
  const flow = await createServiceCompletion(ctx, 'PAYABLE-FAIL', 3, true);
  const acceptance = await createAcceptance(ctx, flow.notice, 'PAYABLE-FAIL', 3);
  await api(`/expense-acceptances/${acceptance.id}/submit`, { method: 'POST' });
  await db(pool, 'update master_payment_term set status=0 where id=@id', { id: ctx.paymentTermId });
  const approved = await api(`/expense-acceptances/${acceptance.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approvedBy: 'P3' }),
  });
  assert(
    'P3-RETRY-01',
    'payable failure does not roll back expense acceptance approval',
    approved.statusCode === 'APPROVED'
      && approved.payableGenerationStatus === 'FAILED'
      && Boolean(approved.payableGenerationError),
    {
      statusCode: approved.statusCode,
      payableGenerationStatus: approved.payableGenerationStatus,
      error: approved.payableGenerationError,
    },
  );
  const sourceEntry = await one(
    pool,
    'select expense_accepted_qty from biz_purchase_receive_notice_entry where id=@id',
    { id: flow.notice.entries[0].id },
  );
  assert('P3-RETRY-02', 'failed payable keeps acceptance quantity writeback', Number(sourceEntry.expense_accepted_qty) === 3, sourceEntry);
  await db(pool, 'update master_payment_term set status=1 where id=@id', { id: ctx.paymentTermId });
  const retried = await api(`/expense-acceptances/${acceptance.id}/generate-estimated-payable`, { method: 'POST' });
  assert(
    'P3-RETRY-03',
    'failed estimated payable can retry successfully',
    retried.statusCode === 'APPROVED'
      && retried.payableGenerationStatus === 'GENERATED'
      && Boolean(retried.payableNo),
    {
      statusCode: retried.statusCode,
      payableGenerationStatus: retried.payableGenerationStatus,
      payableNo: retried.payableNo,
    },
  );
}

async function main() {
  const env = readEnv();
  const pool = await sql.connect({
    server: env.DB_MSSQL_HOST || 'localhost',
    port: +(env.DB_MSSQL_PORT || 1433),
    user: env.DB_MSSQL_USERNAME,
    password: env.DB_MSSQL_PASSWORD,
    database: env.DB_MSSQL_DATABASE,
    options: { encrypt: false, trustServerCertificate: true },
  });
  try {
    const swagger = await (await fetch(`${API}/docs-json`)).json();
    const routes = [
      '/api/purchase-requests/import',
      '/api/purchase-orders/from-request',
      '/api/purchase-receive-notices/from-order',
      '/api/expense-acceptances/from-receive-notice',
      '/api/expense-acceptances/{id}/generate-estimated-payable',
    ];
    assert('P3-ROUTE-01', 'P3 Swagger routes are complete', routes.every((route) => swagger.paths?.[route]), { routes });
    const ctx = await prepare(pool);
    evidence.ids = ctx;
    await runMainFlow(pool, ctx);
    await runOaAndConcurrency(pool, ctx);
    await runPayableFailureRetry(pool, ctx);
  } catch (error) {
    record('P3-UNHANDLED', 'unhandled verification error', false, {
      message: error.message,
      stack: error.stack,
      body: error.body,
    });
  } finally {
    evidence.completedAt = new Date().toISOString();
    evidence.summary = {
      total: evidence.tests.length,
      passed: evidence.tests.filter((item) => item.status === 'PASS').length,
      failed: evidence.defects.length,
    };
    fs.writeFileSync(OUT, `${JSON.stringify(evidence, null, 2)}\n`);
    await pool.close();
    console.log(`evidence=${OUT}`);
    console.log(JSON.stringify(evidence.summary));
    if (evidence.defects.length) process.exitCode = 1;
  }
}

main();
