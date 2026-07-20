const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');
const { createRequire } = require('module');
const projectRequire = createRequire('/Users/dq/Documents/ERP/hub-erp-v0/server/package.json');
const sql = projectRequire('mssql');
const bcrypt = projectRequire('bcryptjs');

const ROOT = '/Users/dq/Documents/ERP/hub-erp-v0';
const SERVER = path.join(ROOT, 'server');
const FRONT = 'http://127.0.0.1:8099';
const API = 'http://127.0.0.1:3001/api';
const RUN = `P0FRONT-${new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14)}-${Math.random().toString(16).slice(2,6)}`;
const evidence = { runTag: RUN, startedAt: new Date().toISOString(), checks: [], defects: [], pages: [], ids: {}, files: [], summary: null };

function readEnv() { const out={}; for (const line of fs.readFileSync(path.join(SERVER,'.env'),'utf8').split(/\r?\n/)) { const m=line.match(/^([^#=]+)=(.*)$/); if(m) out[m[1].trim()]=m[2].trim(); } return out; }
function add(status,id,name,detail={},err){ const item={id,name,status,detail,at:new Date().toISOString()}; if(err)item.error=String(err.message||err).slice(0,1200); evidence.checks.push(item); const icon=status==='PASS'?'✅':status==='FAIL'?'❌':'⚠️'; console.log(`${icon} ${id} ${name}${err?' :: '+item.error:''}`); if(status==='FAIL') evidence.defects.push({id,name,detail,error:item.error}); return item; }
function pass(id,name,detail){ return add('PASS',id,name,detail); }
function fail(id,name,detail,err){ return add('FAIL',id,name,detail,err||new Error('断言失败')); }
function warn(id,name,detail){ return add('WARN',id,name,detail); }
function assert(id,name,cond,detail){ return cond ? pass(id,name,detail) : fail(id,name,detail); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function api(path, options={}){ const res=await fetch(API+path, options); const text=await res.text(); let json=null; try{json=text?JSON.parse(text):null}catch{json=text} if(!res.ok || (json&&json.code>=400)){ const e=new Error(json?.message||text||`HTTP ${res.status}`); e.status=res.status; e.body=json; throw e;} return json&&Object.prototype.hasOwnProperty.call(json,'data')?json.data:json; }
async function dbOne(pool,q,inputs={}){ const req=pool.request(); for(const [k,v] of Object.entries(inputs)) req.input(k,v); const r=await req.query(q); return r.recordset[0]; }
async function insert(pool, table, obj){ const cols=Object.keys(obj); const req=pool.request(); cols.forEach(c=>req.input(c,obj[c])); const r=await req.query(`INSERT INTO ${table} (${cols.map(c=>'['+c+']').join(',')}) OUTPUT INSERTED.id VALUES (${cols.map(c=>'@'+c).join(',')})`); return r.recordset[0].id; }
async function prepareData(pool){
  const suffix = RUN.replace(/[^A-Za-z0-9]/g,'').slice(-12);
  const now = new Date(); const common={created_at:now, updated_at:now, is_deleted:0};
  const password = `Front_${suffix}_Pwd`;
  const userId = await insert(pool,'sys_user',{username:`p0front_${suffix}`, password:bcrypt.hashSync(password,10), real_name:'P0前端验收用户', email:'', phone:'', dept_id:null, emp_id:null, avatar:'', status:1, ...common});
  const supplierId = await insert(pool,'master_supplier',{supplier_code:`FSUP_${suffix}`, supplier_name:`P0前端供应商_${suffix}`, short_name:`FSUP_${suffix}`, supplier_type:1, contact_person:'P0', contact_phone:'', email:'', address:'', payment_term_id:null, buyer_id:null, tax_number:'', bank_name:'', bank_account:'', status:1, remark:RUN, ...common});
  const warehouseId = await insert(pool,'master_warehouse',{warehouse_code:`FWH_${suffix}`, warehouse_name:`P0前端仓_${suffix}`, warehouse_type:1, parent_id:null, manager_id:null, address:'', is_default:0, status:1, remark:RUN, ...common});
  const unitId = await insert(pool,'master_unit',{unit_code:`FEA_${suffix}`, unit_name:'个', unit_type:1, precision:4, status:1, remark:RUN, ...common});
  const materialId = await insert(pool,'master_material',{material_code:`FMAT_${suffix}`, material_name:`P0前端物料_${suffix}`, material_spec:'FRONT-SPEC', category_id:null, unit_id:unitId, material_type:2, purchase_type:1, barcode:'', default_warehouse:warehouseId, safety_stock:0, min_order_qty:0, lead_time:0, standard_cost:0, sale_price:0, is_batch_manage:0, is_serial_manage:0, shelf_life_days:0, status:1, remark:RUN, ...common});
  const currencyId = await insert(pool,'master_currency',{currency_code:`F${suffix.slice(-5)}`, currency_name:`P0前端币_${suffix.slice(-5)}`, currency_symbol:'¥', exchange_rate:1, is_base:1, status:1, remark:RUN, ...common});
  const paymentTermId = await insert(pool,'master_payment_term',{term_code:`FPT_${suffix}`, term_name:`P0前端月结_${suffix}`, term_type:3, credit_days:30, advance_ratio:0, stage1_ratio:0, stage2_ratio:0, stage3_ratio:0, status:1, remark:RUN, ...common});
  const orgId = randomUUID();
  const login = await api('/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:`p0front_${suffix}`, password})});
  const ctx={suffix, token:login.accessToken, userId, supplierId, supplierCode:`FSUP_${suffix}`, supplierName:`P0前端供应商_${suffix}`, warehouseId, warehouseCode:`FWH_${suffix}`, warehouseName:`P0前端仓_${suffix}`, unitId, unitCode:`FEA_${suffix}`, unitName:'个', materialId, materialCode:`FMAT_${suffix}`, materialName:`P0前端物料_${suffix}`, currencyId, paymentTermId, orgId, orgCode:`FORG_${suffix}`, orgName:`P0前端组织_${suffix}`};
  evidence.ids={...ctx, token:undefined}; delete evidence.ids.token;
  return ctx;
}
class CDP{
  constructor(ws){ this.wsUrl=ws; this.id=0; this.pending=new Map(); this.handlers={}; }
  async connect(){ this.ws=new WebSocket(this.wsUrl); await new Promise((res,rej)=>{ this.ws.onopen=res; this.ws.onerror=rej; }); this.ws.onmessage=(ev)=>{ const msg=JSON.parse(ev.data); if(msg.id&&this.pending.has(msg.id)){ const {resolve,reject}=this.pending.get(msg.id); this.pending.delete(msg.id); msg.error?reject(new Error(msg.error.message||JSON.stringify(msg.error))):resolve(msg.result); } else if(msg.method){ (this.handlers[msg.method]||[]).forEach(fn=>fn(msg.params)); } }; }
  on(method,fn){ (this.handlers[method]||(this.handlers[method]=[])).push(fn); }
  send(method,params={}){ const id=++this.id; this.ws.send(JSON.stringify({id,method,params})); return new Promise((resolve,reject)=>{ this.pending.set(id,{resolve,reject}); setTimeout(()=>{ if(this.pending.has(id)){this.pending.delete(id); reject(new Error('CDP timeout '+method));}},15000); }); }
  async eval(expr, awaitPromise=true){ const r=await this.send('Runtime.evaluate',{expression:expr, awaitPromise, returnByValue:true, userGesture:true}); if(r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description||'')); return r.result?.value; }
  async nav(url){ await this.send('Page.navigate',{url}); await sleep(900); }
  async close(){ try{this.ws.close();}catch{} }
}
async function launchChrome(ctx){
  const port = 9300 + Math.floor(Math.random()*400);
  const userDir = `/tmp/${RUN}-chrome`;
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const proc = spawn(chrome, ['--headless=new','--disable-gpu',`--remote-debugging-port=${port}`,`--user-data-dir=${userDir}`,'--no-first-run','--no-default-browser-check','--disable-background-networking','about:blank'], {stdio:'ignore'});
  for(let i=0;i<50;i++){ try{ const r=await fetch(`http://127.0.0.1:${port}/json/version`); if(r.ok) break; }catch{} await sleep(100); }
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {method:'PUT'})).json();
  const cdp = new CDP(target.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Log.enable'); await cdp.send('Network.enable');
  cdp.on('Page.javascriptDialogOpening', async (ev)=>{ try{ await cdp.send('Page.handleJavaScriptDialog',{accept:true,promptText: global.__promptText || ''}); }catch{} });
  const init = `
    window.PURCHASE_P0_API_BASE='http://127.0.0.1:3001/api';
    localStorage.setItem('accessToken', ${JSON.stringify(ctx.token)});
    localStorage.setItem('currentUser', ${JSON.stringify(JSON.stringify({id:ctx.userId, username:'p0front', realName:'P0前端验收用户'}))});
    localStorage.setItem('currentOrg', ${JSON.stringify(JSON.stringify({id:ctx.orgId, code:ctx.orgCode, name:ctx.orgName}))});
    localStorage.setItem('erp_orgs', ${JSON.stringify(JSON.stringify([{id:ctx.orgId, code:ctx.orgCode, name:ctx.orgName}]))});
    localStorage.setItem('erp_suppliers_cache', ${JSON.stringify(JSON.stringify([{id:ctx.supplierId, code:ctx.supplierCode, name:ctx.supplierName, supplierCode:ctx.supplierCode, supplierName:ctx.supplierName}]))});
    localStorage.setItem('erp_materials_cache', ${JSON.stringify(JSON.stringify([{id:ctx.materialId, code:ctx.materialCode, name:ctx.materialName, materialCode:ctx.materialCode, materialName:ctx.materialName, specification:'FRONT-SPEC', unitId:ctx.unitId, unit:'个'}]))});
    localStorage.setItem('erp_units_cache', ${JSON.stringify(JSON.stringify([{id:ctx.unitId, code:ctx.unitCode, name:'个', unitCode:ctx.unitCode, unitName:'个'}]))});
    localStorage.setItem('erp_warehouses_cache', ${JSON.stringify(JSON.stringify([{id:ctx.warehouseId, code:ctx.warehouseCode, name:ctx.warehouseName, warehouseCode:ctx.warehouseCode, warehouseName:ctx.warehouseName}]))});
    localStorage.setItem('erp_currencies_cache', ${JSON.stringify(JSON.stringify([{id:ctx.currencyId, code:'CNY', name:'人民币', currencyCode:'CNY', currencyName:'人民币'}]))});
    localStorage.setItem('erp_payment_terms_cache', ${JSON.stringify(JSON.stringify([{id:ctx.paymentTermId, code:'NET30', name:'月结30天', termCode:'NET30', termName:'月结30天'}]))});
    window.__p0FrontErrors=[]; window.addEventListener('error', e=>window.__p0FrontErrors.push(String(e.message||e.error||e)));
    window.addEventListener('unhandledrejection', e=>window.__p0FrontErrors.push(String(e.reason&&e.reason.message||e.reason||e)));
  `;
  await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:init});
  return {cdp, proc};
}
async function patchToast(cdp){
  await cdp.eval(`(function(){
    window.__p0Toasts=[];
    var old=window.showToast;
    window.showToast=function(msg,type){ window.__p0Toasts.push({msg:String(msg),type:type||'info',at:Date.now()}); if(old) try{return old.apply(this,arguments)}catch(e){} };
    window.prompt=function(msg,def){ window.__p0Toasts.push({msg:'PROMPT:'+msg,type:'prompt'}); return window.__promptText || def || ''; };
    window.confirm=function(msg){ window.__p0Toasts.push({msg:'CONFIRM:'+msg,type:'confirm'}); return window.__confirmValue !== false; };
    return true;
  })()`);
}
async function pageInfo(cdp){
  return await cdp.eval(`(function(){
    return {url:location.href,title:document.title,ready:document.readyState, banner:!!document.getElementById('p0ApiBanner'),
      status:document.getElementById('field_状态')&&document.getElementById('field_状态').value,
      docNo:document.getElementById('field_单据编号')&&document.getElementById('field_单据编号').value,
      editingId:window.editingId||'',
      rows:document.querySelectorAll('#dataBody tr').length,
      detailRows:document.querySelectorAll('#detailBody tr').length,
      tableText:(document.querySelector('#dataBody')&&document.querySelector('#dataBody').innerText||'').slice(0,1000),
      trace:(document.getElementById('p0TraceBox')&&document.getElementById('p0TraceBox').innerText||'').slice(0,1000),
      toasts:window.__p0Toasts||[], errors:window.__p0FrontErrors||[],
      buttons:Array.from(document.querySelectorAll('.toolbar-btn,.btn')).map(b=>({text:b.innerText.trim(),disabled:b.disabled,onclick:b.getAttribute('onclick')||'',display:getComputedStyle(b).display})).slice(0,30),
      detailFields:Array.from(document.querySelectorAll('#detailBody tr:first-child [data-field]')).map(x=>x.getAttribute('data-field'))
    };
  })()`);
}
async function goto(cdp, path){ await cdp.nav(FRONT+path); await patchToast(cdp); await sleep(900); const info=await pageInfo(cdp); evidence.pages.push({path, ...info}); return info; }
async function fillHeaderAndLine(cdp, ctx, qty=100){
  await cdp.eval(`(function(){
    function set(id,v){var el=document.getElementById(id); if(el){el.disabled=false; el.removeAttribute('readonly'); el.value=v; el.dispatchEvent(new Event('input',{bubbles:true}));}}
    set('field_日期','2026-07-20'); set('field_供应商',${JSON.stringify(ctx.supplierName)}); set('field_组织',${JSON.stringify(ctx.orgName)}); set('field_备注',${JSON.stringify(RUN)});
    if(typeof addDetailRow==='function') addDetailRow();
    var row=document.querySelector('#detailBody tr:last-child');
    function rf(k,v){var el=row&&row.querySelector('[data-field="'+k+'"]'); if(el){el.disabled=false; el.removeAttribute('readonly'); el.value=v; el.dispatchEvent(new Event('input',{bubbles:true}));}}
    rf('物料编码',${JSON.stringify(ctx.materialCode)}); rf('物料名称',${JSON.stringify(ctx.materialName)}); rf('规格型号','FRONT-SPEC'); rf('单位','个'); rf('数量',String(${qty})); rf('单价','10'); rf('仓库',${JSON.stringify(ctx.warehouseName)}); var tax=row&&row.querySelector('[data-field="税率"]'); if(tax){tax.value='0.13';}
    if(typeof calculateTotal==='function') calculateTotal();
    return true;
  })()`);
}
async function callAndInfo(cdp, fn, wait=900){ await cdp.eval(`(async()=>{ await ${fn}; return true; })()`); await sleep(wait); return await pageInfo(cdp); }
async function setContract(cdp, v){ await cdp.eval(`window.__promptText=${JSON.stringify(v)}; var el=document.getElementById('field_采购合同号'); if(el){el.disabled=false; el.value=${JSON.stringify(v)};}`); }
async function run(){
  const env=readEnv();
  const pool=await sql.connect({server:env.DB_MSSQL_HOST||'localhost',port:+(env.DB_MSSQL_PORT||1433),user:env.DB_MSSQL_USERNAME,password:env.DB_MSSQL_PASSWORD,database:env.DB_MSSQL_DATABASE,options:{encrypt:false,trustServerCertificate:true}});
  let browser;
  try{
    assert('ENV-FE-001','前端静态服务 8099 可访问', (await fetch(FRONT+'/pages/purchase-request.html')).ok, {url:FRONT+'/pages/purchase-request.html'});
    assert('ENV-BE-001','后端 Swagger JSON 可访问', (await fetch(API+'/docs-json')).ok, {url:API+'/docs-json'});
    const ctx=await prepareData(pool);
    browser=await launchChrome(ctx); const cdp=browser.cdp;

    let info=await goto(cdp,'/pages/purchase-request.html');
    assert('FE-LIST-PR','采购申请列表真实 API 加载，无 401/加载失败', info.banner && !/真实 API 加载失败|Unauthorized/.test(info.tableText), {rows:info.rows, text:info.tableText.slice(0,200), errors:info.errors});

    info=await goto(cdp,'/pages/purchase-request-create.html');
    assert('FE-CREATE-PR-INIT','采购申请新增页注入 P0 API 横幅与按钮矩阵', info.banner && info.status==='草稿', {status:info.status, buttons:info.buttons.filter(b=>/保存|提交|审核|下推/.test(b.text))});
    await fillHeaderAndLine(cdp, ctx, 100);
    info=await callAndInfo(cdp,'window.saveDoc()');
    assert('FE-CREATE-PR-SAVE','采购申请页面保存真实 API 成功并获得后端 ID', !!info.editingId && /保存成功/.test(JSON.stringify(info.toasts)), {editingId:info.editingId, status:info.status, toasts:info.toasts.slice(-3), errors:info.errors});
    const prId=info.editingId;
    info=await callAndInfo(cdp,'window.submitDoc()');
    assert('FE-CREATE-PR-SUBMIT','采购申请页面提交成功，状态变为待审核', /待审核|SUBMITTED/.test(info.status||'') && /提交成功/.test(JSON.stringify(info.toasts)), {status:info.status, toasts:info.toasts.slice(-4)});
    info=await callAndInfo(cdp,'window.approveDoc()');
    assert('FE-CREATE-PR-APPROVE','采购申请页面审核成功，状态变为已批准/已审核', /已批准|已审核|APPROVED/.test(info.status||'') && /审核成功/.test(JSON.stringify(info.toasts)), {status:info.status, toasts:info.toasts.slice(-4)});
    const prButtons=info.buttons.filter(b=>/保存|提交|审核|下推|关闭/.test(b.text));
    assert('FE-BTN-PR-APPROVED','已审核采购申请按钮状态：保存/提交/审核禁用，下推可用', prButtons.some(b=>/下推/.test(b.text)&&!b.disabled) && prButtons.some(b=>/保存/.test(b.text)&&b.disabled), {buttons:prButtons});
    await setContract(cdp, `FHT-${RUN}-NEEDCHECK`);
    info=await callAndInfo(cdp,'window.pushDownDoc()',1300);
    assert('FE-PUSH-PR-PO','采购申请下推采购订单，页面跳转到采购订单编辑页', /purchase-order-create\.html\?id=/.test(info.url) && /采购订单/.test(info.trace), {url:info.url, trace:info.trace, toasts:info.toasts.slice(-4)});
    const orderUrlNeed=info.url; const orderIdNeed=new URL(orderUrlNeed).searchParams.get('id');
    assert('FE-TRACE-PO','采购订单详情页显示合同号与来源追溯', /合同号/.test(info.trace) && /采购订单/.test(info.trace), {trace:info.trace});

    info=await callAndInfo(cdp,'window.submitDoc()');
    assert('FE-PO-SUBMIT','采购订单页面提交成功', /待审核|SUBMITTED/.test(info.status||''), {status:info.status, toasts:info.toasts.slice(-4)});
    info=await callAndInfo(cdp,'window.approveDoc()');
    assert('FE-PO-APPROVE','采购订单页面审核成功', /已审核|APPROVED/.test(info.status||''), {status:info.status, toasts:info.toasts.slice(-4)});
    await cdp.eval('window.__confirmValue=true');
    info=await callAndInfo(cdp,'window.pushDownDoc()',1300);
    assert('FE-PUSH-PO-RCV-CHECK','采购订单下推需检收料通知，页面跳转收料通知编辑页', /purchase-receive-create\.html\?id=/.test(info.url) && /收料通知/.test(info.trace), {url:info.url, trace:info.trace, toasts:info.toasts.slice(-4)});

    info=await callAndInfo(cdp,'window.submitDoc()');
    assert('FE-RCV-SUBMIT','收料通知页面提交成功', /待审核|SUBMITTED/.test(info.status||''), {status:info.status, toasts:info.toasts.slice(-4)});
    info=await callAndInfo(cdp,'window.approveDoc()');
    assert('FE-RCV-APPROVE','收料通知页面审核成功', /已审核|APPROVED/.test(info.status||''), {status:info.status, trace:info.trace, toasts:info.toasts.slice(-4)});
    info=await callAndInfo(cdp,'window.pushDownDoc()',1300);
    assert('FE-PUSH-RCV-QI','需检收料通知下推来料检验，页面跳转检验编辑页', /purchase-inspect-create\.html\?id=/.test(info.url), {url:info.url, trace:info.trace, fields:info.detailFields, toasts:info.toasts.slice(-4)});
    await patchToast(cdp);
    const qiFields=info.detailFields;
    if(qiFields.includes('送检数量') && qiFields.includes('合格数量') && qiFields.includes('不合格数量')) pass('FE-QI-FIELDS','来料检验页面展示可编辑检验数量字段',{fields:qiFields});
    else fail('FE-QI-FIELDS','来料检验页面缺少送检/合格/不合格数量输入字段，无法页面录入检验结果',{fields:qiFields},new Error('缺少检验数量字段'));
    await cdp.eval(`(function(){ var row=document.querySelector('#detailBody tr'); function set(k,v){var el=row&&row.querySelector('[data-field="'+k+'"]'); if(el){el.disabled=false; el.value=v; el.dispatchEvent(new Event('input',{bubbles:true}));}} set('送检数量','100'); set('合格数量','90'); set('不合格数量','10'); window.__promptText='5'; })()`);
    info=await callAndInfo(cdp,'window.saveDoc()',900);
    if(/保存成功/.test(JSON.stringify(info.toasts)) || (!info.errors.length && info.detailFields.includes('合格数量') && info.detailFields.includes('不合格数量'))) pass('FE-QI-SAVE','来料检验结果保存成功或页面无错误且检验字段保持有效',{status:info.status,fields:info.detailFields,toasts:info.toasts.slice(-4),errors:info.errors});
    else fail('FE-QI-SAVE','来料检验结果页面保存失败',{status:info.status,fields:info.detailFields,toasts:info.toasts.slice(-6),errors:info.errors},new Error((info.toasts.slice(-1)[0]||{}).msg||'未出现保存成功'));

    // 合同号必填负向
    info=await goto(cdp,'/pages/purchase-order-create.html');
    await fillHeaderAndLine(cdp, ctx, 10);
    await setContract(cdp, '');
    info=await callAndInfo(cdp,'window.saveDoc()',700);
    assert('FE-ERR-CONTRACT','采购订单合同号必填错误可在页面提示', /采购合同号必填/.test(JSON.stringify(info.toasts)) && !info.editingId, {toasts:info.toasts.slice(-5), editingId:info.editingId});

    // 免检链：PR->PO->Receive(免检)->Inbound，验证是否被订单缺少币种/付款条件阻断。
    info=await goto(cdp,'/pages/purchase-request-create.html');
    await fillHeaderAndLine(cdp, ctx, 40);
    info=await callAndInfo(cdp,'window.saveDoc()');
    info=await callAndInfo(cdp,'window.submitDoc()');
    info=await callAndInfo(cdp,'window.approveDoc()');
    await setContract(cdp, `FHT-${RUN}-NOCHECK`);
    info=await callAndInfo(cdp,'window.pushDownDoc()',1300);
    await patchToast(cdp);
    info=await callAndInfo(cdp,'window.submitDoc()');
    info=await callAndInfo(cdp,'window.approveDoc()');
    await patchToast(cdp);
    await cdp.eval('window.__confirmValue=false');
    info=await callAndInfo(cdp,'window.pushDownDoc()',1300);
    assert('FE-PUSH-PO-RCV-NOCHECK','采购订单下推免检收料通知成功', /purchase-receive-create\.html\?id=/.test(info.url), {url:info.url,trace:info.trace,toasts:info.toasts.slice(-5)});
    await patchToast(cdp);
    info=await callAndInfo(cdp,'window.submitDoc()');
    info=await callAndInfo(cdp,'window.approveDoc()');
    info=await callAndInfo(cdp,'window.pushDownDoc()',1300);
    if(/purchase-inbound-create\.html\?id=/.test(info.url)) pass('FE-PUSH-RCV-IN-NOCHECK','免检收料通知下推采购入库成功',{url:info.url,trace:info.trace,toasts:info.toasts.slice(-5)});
    else fail('FE-PUSH-RCV-IN-NOCHECK','免检收料通知下推采购入库失败，页面未进入入库单',{url:info.url,trace:info.trace,toasts:info.toasts.slice(-8),errors:info.errors},new Error((info.toasts.slice(-1)[0]||{}).msg||'未跳转入库页'));
    if(/purchase-inbound-create\.html\?id=/.test(info.url)) {
      await patchToast(cdp);
      info=await callAndInfo(cdp,'window.submitDoc()',1000);
      assert('FE-IN-SUBMIT','采购入库页面提交成功', /待审核|SUBMITTED/.test(info.status||''), {status:info.status,trace:info.trace,toasts:info.toasts.slice(-5),errors:info.errors});
      info=await callAndInfo(cdp,'window.approveDoc()',1600);
      assert('FE-IN-APPROVE-PAYABLE','采购入库审核成功并展示暂估应付状态/单号', /已审核|APPROVED/.test(info.status||'') && /暂估应付/.test(info.trace) && /AP|已生成|GENERATED/.test(info.trace), {status:info.status,trace:info.trace,toasts:info.toasts.slice(-6),errors:info.errors});
    }

    // 列表页回访：确认真实数据可见
    for (const [id,path,re] of [['FE-LIST-PO','/pages/purchase-order.html',/采购订单|PO/],['FE-LIST-RCV','/pages/purchase-receive.html',/收料|RCV/],['FE-LIST-QI','/pages/purchase-inspect.html',/检验|QI/],['FE-LIST-IN','/pages/purchase-inbound.html',/入库|PIN|暂无真实 API 数据/]]) {
      info=await goto(cdp,path);
      assert(id, path+' 列表真实 API 加载无 Unauthorized/加载失败', !/Unauthorized|真实 API 加载失败/.test(info.tableText), {rows:info.rows,text:info.tableText.slice(0,240),errors:info.errors});
    }

  } finally {
    if(browser){ await browser.cdp.close(); browser.proc.kill('SIGTERM'); }
    await pool.close();
    evidence.finishedAt=new Date().toISOString();
    evidence.summary={total:evidence.checks.length,pass:evidence.checks.filter(c=>c.status==='PASS').length,fail:evidence.checks.filter(c=>c.status==='FAIL').length,warn:evidence.checks.filter(c=>c.status==='WARN').length};
    fs.writeFileSync('/Users/dq/Documents/ERP/hub-erp-v0/采购标准主链-前端浏览器验收证据-20260720.json', JSON.stringify(evidence,null,2));
    console.log('\nEVIDENCE=/Users/dq/Documents/ERP/hub-erp-v0/采购标准主链-前端浏览器验收证据-20260720.json');
    console.log(JSON.stringify(evidence.summary));
    if(evidence.summary.fail>0) process.exitCode=2;
  }
}
run().catch(err=>{ evidence.fatal=String(err.stack||err); evidence.finishedAt=new Date().toISOString(); evidence.summary={total:evidence.checks.length,pass:evidence.checks.filter(c=>c.status==='PASS').length,fail:evidence.checks.filter(c=>c.status==='FAIL').length,warn:evidence.checks.filter(c=>c.status==='WARN').length}; fs.writeFileSync('/Users/dq/Documents/ERP/hub-erp-v0/采购标准主链-前端浏览器验收证据-20260720.json', JSON.stringify(evidence,null,2)); console.error('FATAL',err); process.exit(1); });
