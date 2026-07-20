const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const projectRequire = createRequire('/Users/dq/Documents/ERP/hub-erp-v0/server/package.json');
const frontendRequire = createRequire('/Users/dq/Documents/ERP/hub-erp-v0/traewordp/package.json');
const sql = projectRequire('mssql');
const bcrypt = projectRequire('bcryptjs');
const puppeteer = frontendRequire('puppeteer');
const ROOT = '/Users/dq/Documents/ERP/hub-erp-v0';
const SERVER = path.join(ROOT, 'server');
const FRONT = 'http://127.0.0.1:8099';
const API = 'http://localhost:3003/api';
const OUT = path.join(ROOT, '采购模块P3费用采购前端浏览器复验证据-20260720.json');
const RUN = `P3FE-${Date.now()}`;
const ev = { runTag: RUN, front: FRONT, api: API, startedAt: new Date().toISOString(), checks: [], defects: [] };
function add(id, name, ok, detail = {}) { const x = { id, name, status: ok ? 'PASS' : 'FAIL', detail, at: new Date().toISOString() }; ev.checks.push(x); if (!ok) ev.defects.push(x); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}`); }
function readEnv(){ const o={}; for(const l of fs.readFileSync(path.join(SERVER,'.env'),'utf8').split(/\r?\n/)){ const m=l.match(/^([^#=]+)=(.*)$/); if(m)o[m[1].trim()]=m[2].trim(); } return o; }
async function api(p,opt={}){ const headers={'content-type':'application/json',...(opt.headers||{})}; if(global.token) headers.authorization='Bearer '+global.token; const r=await fetch(API+p,{...opt,headers}); const t=await r.text(); let j; try{j=t?JSON.parse(t):null}catch{j=t} if(!r.ok||(j&&j.code>=400)) throw new Error(j?.message||t); return j&&Object.prototype.hasOwnProperty.call(j,'data')?j.data:j; }
async function createUser(){ const env=readEnv(); const pool=await sql.connect({server:env.DB_MSSQL_HOST||'localhost',port:+(env.DB_MSSQL_PORT||1433),user:env.DB_MSSQL_USERNAME,password:env.DB_MSSQL_PASSWORD,database:env.DB_MSSQL_DATABASE,options:{encrypt:false,trustServerCertificate:true}}); try{ const suffix=String(Date.now()).slice(-10); const username=`p3fe_${suffix}`; const password=`P3FE_${suffix}_Pwd`; const now=new Date(); await pool.request().input('username',username).input('password',bcrypt.hashSync(password,10)).input('now',now).query("insert into sys_user (username,password,real_name,email,phone,dept_id,emp_id,avatar,status,created_at,updated_at,is_deleted) values (@username,@password,N'P3前端验收','','',null,null,'',1,@now,@now,0)"); return { username, password }; } finally { await pool.close(); } }

async function seedExpenseRequest(){
 const base=require('/Users/dq/Documents/ERP/hub-erp-v0/采购模块P3费用采购接口数据库复验证据-20260720.json').ids;
 const dto={billType:'EXPENSE_PURCHASE',businessType:'EXPENSE_PURCHASE',orgId:base.orgId,requestType:'EXPENSE_PURCHASE',requestDate:'2026-07-20',reason:'P3FE种子',remark:RUN,entries:[{purchaseOrgId:base.orgId,expenseItemCode:'EXP-P3FE',expenseItemName:'P3前端服务费',requestQty:1,estimatedPrice:100,estimatedAmount:100,supplierId:base.supplierId,requiredDate:'2026-07-20'}]};
 return api('/purchase-requests',{method:'POST',body:JSON.stringify(dto)});
}

async function setToken(page, token){ await page.goto(`${FRONT}/pages/purchase-request.html`,{waitUntil:'domcontentloaded'}).catch(()=>{}); await page.evaluate(t=>localStorage.setItem('accessToken',t), token); }
async function load(page, file){ const requests=[]; const errors=[]; const onReq=req=>{ if(req.url().includes('localhost:3003/api')) requests.push(req.url()); }; const onErr=e=>errors.push(String(e.message||e)); page.on('request',onReq); page.on('pageerror',onErr); await page.goto(`${FRONT}/pages/${file}`,{waitUntil:'networkidle2',timeout:25000}); await page.waitForSelector('#p3ExpensePanel',{timeout:10000}).catch(()=>{}); const text=await page.evaluate(()=>document.body.innerText); page.off('request',onReq); page.off('pageerror',onErr); return {text,requests,errors}; }
(async()=>{ let browser; try{
 const docs = await fetch(`${API}/docs-json`); add('P3-FE-ENV-001','3003 Swagger 可访问且费用验收路由存在',docs.ok && Boolean((await docs.json()).paths['/api/expense-acceptances']),{});
 const user = await createUser(); const login = await api('/auth/login',{method:'POST',body:JSON.stringify(user)}); const token = login.accessToken; global.token = token; await seedExpenseRequest();
 const accList = await api('/expense-acceptances?page=1&pageSize=20'); const acceptance = (accList.list||[]).find(x=>x.statusCode==='APPROVED' && x.payableGenerationStatus==='GENERATED') || (accList.list||[])[0];
 const reqList = await api('/purchase-requests?page=1&pageSize=100'); const req = (reqList.list||[]).find(x=>x.businessType==='EXPENSE_PURCHASE' || x.billType==='EXPENSE_PURCHASE');
 const poList = await api('/purchase-orders?page=1&pageSize=100'); const po = (poList.list||[]).find(x=>x.businessType==='EXPENSE_PURCHASE' || x.billType==='EXPENSE_PURCHASE');
 const rnList = await api('/purchase-receive-notices?page=1&pageSize=100'); const rn = (rnList.list||[]).find(x=>x.businessType==='EXPENSE_PURCHASE');
 add('P3-FE-DATA-001','后端存在 P3 浏览器复验基础数据',!!(acceptance&&po&&rn),{acceptance:acceptance?.acceptanceNo,request:req?.requestNo,order:po?.orderNo,receive:rn?.noticeNo});
 browser = await puppeteer.launch({headless:'new',executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']}); const page = await browser.newPage(); await setToken(page, token);
 let r = await load(page,'purchase-request.html'); add('P3-FE-001','费用采购申请列表加载真实 API 并展示费用采购类型/项目',r.text.includes('P3 费用采购申请') && r.requests.some(u=>u.includes('/api/purchase-requests')) && r.text.includes('EXPENSE_PURCHASE') && /Service-|P3前端服务费/.test(r.text),{requests:r.requests.slice(0,5),errors:r.errors}); add('P3-FE-002','费用采购申请新增/OA导入入口字段可见',r.text.includes('创建手工费用申请') && r.text.includes('OA导入费用申请') && r.text.includes('费用项目'),{});
 r = await load(page,'purchase-order.html'); add('P3-FE-003','费用采购订单展示合同号、费用类型并提供下推服务完成',r.text.includes('P3 费用采购订单') && r.requests.some(u=>u.includes('/api/purchase-orders')) && r.text.includes('合同号') && r.text.includes('下推服务完成') && r.text.includes('EXPENSE_PURCHASE'),{requests:r.requests.slice(0,5),errors:r.errors});
 r = await load(page,'purchase-receive.html'); add('P3-FE-004','服务完成页面展示费用采购服务语义和禁止下游提示',r.text.includes('P3 服务完成') && r.requests.some(u=>u.includes('/api/purchase-receive-notices')) && r.text.includes('费用采购服务完成强制免检') && r.text.includes('不允许采购入库') && r.text.includes('不允许资产建卡'),{requests:r.requests.slice(0,5),errors:r.errors});
 const clicked = await page.evaluate(()=>{ const buttons=[...document.querySelectorAll('button')]; const b=buttons.find(x=>x.textContent.includes('尝试入库')); if(!b) return false; b.click(); return true; }); await new Promise(res=>setTimeout(res,1200)); const inboundMsg = await page.evaluate(()=>document.querySelector('#p3Msg')?.innerText || ''); add('P3-FE-009A','费用采购尝试入库时页面展示后端错误',clicked && /费用采购|禁止|sourceReceiveNoticeEntryId|入库/.test(inboundMsg),{clicked,inboundMsg});
 r = await load(page,'expense-acceptance.html'); add('P3-FE-005','费用验收列表展示来源、数量金额、状态和暂估应付',r.text.includes('P3 费用验收') && r.requests.some(u=>u.includes('/api/expense-acceptances')) && r.text.includes('暂估应付') && r.text.includes('已生成') && r.text.includes(acceptance.acceptanceNo),{acceptance:acceptance?.acceptanceNo,requests:r.requests.slice(0,5),errors:r.errors});
 r = await load(page,`expense-acceptance-create.html?id=${encodeURIComponent(acceptance.id)}`); add('P3-FE-006','费用验收详情展示来源链、明细、保存/状态动作',r.text.includes('P3 费用验收详情') && r.text.includes(acceptance.sourceReceiveNoticeNo) && r.text.includes(acceptance.entries[0].sourceOrderEntryId) && r.text.includes(acceptance.entries[0].sourceRequestEntryId) && r.text.includes('保存') && r.text.includes('审核'),{errors:r.errors}); add('P3-FE-007','费用验收详情展示暂估应付状态和重试入口',r.text.includes('暂估应付') && r.text.includes('已生成') && r.text.includes('重试暂估应付'),{}); const cardClicked=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('资产建卡禁止提示')); if(!b)return false; b.click(); return true;}); await new Promise(res=>setTimeout(res,500)); const cardMsg=await page.evaluate(()=>document.querySelector('#p3Msg')?.innerText || ''); add('P3-FE-009B','费用验收页面提供禁止资产建卡提示',cardClicked && cardMsg.includes('费用采购禁止生成资产卡片'),{cardClicked,cardMsg});
 r = await load(page,'expense-acceptance-create.html'); add('P3-FE-006B','费用验收新增页可录入来源服务完成和明细创建',r.text.includes('P3 新建费用验收') && r.text.includes('来源服务完成ID') && r.text.includes('来源明细ID') && r.text.includes('创建费用验收'),{errors:r.errors});
 } catch(e){ add('P3-FE-FATAL','浏览器复验脚本异常',false,{message:e.message,stack:e.stack}); }
 finally { if(browser) await browser.close(); ev.completedAt=new Date().toISOString(); ev.summary={total:ev.checks.length,passed:ev.checks.filter(x=>x.status==='PASS').length,failed:ev.defects.length}; fs.writeFileSync(OUT,JSON.stringify(ev,null,2)+'\n'); console.log('evidence='+OUT); console.log(JSON.stringify(ev.summary)); if(ev.defects.length) process.exitCode=1; }
})();
