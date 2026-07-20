const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const projectRequire = createRequire('/Users/dq/Documents/ERP/hub-erp-v0/server/package.json');
const frontendRequire = createRequire('/Users/dq/Documents/ERP/hub-erp-v0/traewordp/package.json');
const puppeteer = frontendRequire('puppeteer');
const sql = projectRequire('mssql');
const bcrypt = projectRequire('bcryptjs');
const ROOT = '/Users/dq/Documents/ERP/hub-erp-v0';
const SERVER = path.join(ROOT, 'server');
const FRONT = 'http://127.0.0.1:8099';
const API = 'http://localhost:3003/api';
const OUT = path.join(ROOT, '采购模块P2资产采购前端浏览器复验证据-20260720.json');
const RUN = `P2FE-${Date.now()}`;
const ev = { runTag: RUN, front: FRONT, api: API, startedAt: new Date().toISOString(), checks: [], defects: [] };
function add(id, name, ok, detail={}) { const x={id,name,status:ok?'PASS':'FAIL',detail,at:new Date().toISOString()}; ev.checks.push(x); if(!ok) ev.defects.push(x); console.log(`${ok?'PASS':'FAIL'} ${id} ${name}`); }
function readEnv(){const o={}; for(const l of fs.readFileSync(path.join(SERVER,'.env'),'utf8').split(/\r?\n/)){const m=l.match(/^([^#=]+)=(.*)$/); if(m)o[m[1].trim()]=m[2].trim();} return o;}
async function api(p,opt={}){const r=await fetch(API+p,{...opt,headers:{'content-type':'application/json',...(opt.headers||{})}}); const t=await r.text(); let j; try{j=t?JSON.parse(t):null}catch{j=t} if(!r.ok||(j&&j.code>=400)) throw new Error(j?.message||t); return j&&Object.prototype.hasOwnProperty.call(j,'data')?j.data:j;}
async function dbInsertUser(){const env=readEnv(); const pool=await sql.connect({server:env.DB_MSSQL_HOST||'localhost',port:+(env.DB_MSSQL_PORT||1433),user:env.DB_MSSQL_USERNAME,password:env.DB_MSSQL_PASSWORD,database:env.DB_MSSQL_DATABASE,options:{encrypt:false,trustServerCertificate:true}}); try{const suffix=String(Date.now()).slice(-10); const pwd=`P2FE_${suffix}_Pwd`; const now=new Date(); const req=pool.request(); req.input('username',`p2fe_${suffix}`); req.input('password',bcrypt.hashSync(pwd,10)); req.input('now',now); await req.query("insert into sys_user (username,password,real_name,email,phone,dept_id,emp_id,avatar,status,created_at,updated_at,is_deleted) values (@username,@password,N'P2前端验收','','',null,null,'',1,@now,@now,0)"); return {username:`p2fe_${suffix}`,password:pwd};} finally {await pool.close();}}
async function setupToken(page, token){await page.goto(FRONT + '/pages/purchase-request.html', {waitUntil:'domcontentloaded'}).catch(()=>{}); await page.evaluate(t=>localStorage.setItem('accessToken',t), token);}
async function load(page, file){const requests=[]; const errors=[]; const onReq=req=>{ if(req.url().includes('localhost:3003/api')) requests.push(req.url()); }; const onErr=e=>errors.push(String(e.message||e)); page.on('request', onReq); page.on('pageerror', onErr); await page.goto(`${FRONT}/pages/${file}`, {waitUntil:'networkidle2', timeout:20000}); await page.waitForSelector('#p2AssetPanel,.p2-panel', {timeout:8000}).catch(()=>{}); const text=await page.evaluate(()=>document.body.innerText); page.off('request', onReq); page.off('pageerror', onErr); return {text, requests, errors};}
(async()=>{
 let browser; try{
  const health = await fetch(API + '/docs-json'); add('P2-FE-ENV-001','3003 Swagger 可访问',health.ok,{status:health.status});
  const assetData = await api('/fixed-asset?page=1&pageSize=1'); const firstAsset = assetData.list?.[0];
  const outReqData = await api('/asset-out-requests?page=1&pageSize=1'); const firstOutReq = outReqData.list?.[0];
  const outDataAll = await api('/inventory-out?page=1&pageSize=20'); const outDataP2 = await api('/inventory-out?page=1&pageSize=20&outType=4');
  const user = await dbInsertUser(); const login = await api('/auth/login',{method:'POST',body:JSON.stringify(user)}); const token = login.accessToken;
  browser = await puppeteer.launch({headless:'new',executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']}); const page = await browser.newPage(); await setupToken(page, token);
  const purchasePages=['purchase-request.html','purchase-request-create.html','purchase-order.html','purchase-order-create.html','purchase-order-detail.html','purchase-receive.html','purchase-receive-create.html','purchase-inbound.html','purchase-inbound-create.html'];
  for (const f of purchasePages) { const r=await load(page,f); add(`P2-FE-PUR-${f}`,'采购路径页面显示 P2 资产采购识别提示且指向 3003',r.text.includes('P2 资产采购路径识别') && r.text.includes('localhost:3003/api'),{file:f,requests:r.requests.slice(0,5),errors:r.errors}); }
  let r=await load(page,'equipment-check.html'); add('P2-FE-AA-001','资产验收页面加载真实 API 面板',r.text.includes('P2 资产验收') && r.requests.some(u=>u.includes('/api/asset-acceptances')), {requests:r.requests}); add('P2-FE-AA-002','资产验收页面展示业务类型/状态/下游生成状态',/ASSET_(NO_)?INBOUND/.test(r.text) && (r.text.includes('已审核')||r.text.includes('草稿')) && (r.text.includes('已生成')||r.text.includes('不需要')), {});
  r=await load(page,'finance-fa-card.html'); add('P2-FE-CARD-001','资产卡片页面加载真实 API 面板',r.text.includes('P2 资产卡片') && r.requests.some(u=>u.includes('/api/fixed-asset')), {requests:r.requests}); add('P2-FE-CARD-002','资产卡片页面展示后端 purchasePrice 原值',!!firstAsset && r.text.includes(firstAsset.assetNo) && r.text.includes(Number(firstAsset.purchasePrice).toFixed(2)), {assetNo:firstAsset?.assetNo,purchasePrice:firstAsset?.purchasePrice});
  r=await load(page,'inventory-out-request.html'); add('P2-FE-AOR-001','资产出库申请页面加载真实 API 面板',r.text.includes('P2 资产出库申请') && r.requests.some(u=>u.includes('/api/asset-out-requests')), {requests:r.requests}); add('P2-FE-AOR-002','资产出库申请页面展示来源资产验收单号',!!firstOutReq && r.text.includes(firstOutReq.requestNo) && r.text.includes(firstOutReq.sourceAssetAcceptanceNo), {requestNo:firstOutReq?.requestNo, sourceAssetAcceptanceNo:firstOutReq?.sourceAssetAcceptanceNo});
  r=await load(page,'inventory-out-request-list.html'); add('P2-FE-AOR-LIST-001','资产出库申请列表页加载真实 API 面板',r.text.includes('P2 资产出库申请') && r.requests.some(u=>u.includes('/api/asset-out-requests')), {requests:r.requests});
  r=await load(page,'inventory-out.html'); add('P2-FE-OUT-001','其他出库页面加载真实 API 面板',r.text.includes('P2 资产其他出库') && r.requests.some(u=>u.includes('/api/inventory-out')), {requests:r.requests}); add('P2-FE-OUT-002','其他出库页面展示 P2 资产其他出库记录',outDataP2.total>0 && r.text.includes(outDataP2.list[0].outNo), {apiWithoutFilterTotal:outDataAll.total, apiP2Total:outDataP2.total, expectedOutNo:outDataP2.list?.[0]?.outNo});
  r=await load(page,'inventory-out-create.html'); add('P2-FE-OUT-CREATE-001','其他出库新增页加载真实 API 面板',r.text.includes('P2 资产其他出库') && r.requests.some(u=>u.includes('/api/inventory-out')), {requests:r.requests});
 } catch(e){add('P2-FE-FATAL','浏览器复验脚本异常',false,{message:e.message,stack:e.stack});}
 finally { if(browser) await browser.close(); ev.completedAt=new Date().toISOString(); ev.summary={total:ev.checks.length,passed:ev.checks.filter(x=>x.status==='PASS').length,failed:ev.defects.length}; fs.writeFileSync(OUT,JSON.stringify(ev,null,2)); console.log('evidence='+OUT); console.log(JSON.stringify(ev.summary)); if(ev.defects.length) process.exitCode=1; }
})();
