const puppeteer = require('puppeteer');

const testPages = [
  { name: '销售报价单创建页', url: 'http://localhost:3001/pages/sales-quotation-create.html' },
  { name: '采购订单创建页', url: 'http://localhost:3001/pages/purchase-order-create.html' },
  { name: '销售出库创建页', url: 'http://localhost:3001/pages/inventory-out-create.html' },
  { name: '采购申请创建页', url: 'http://localhost:3001/pages/purchase-request-create.html' },
  { name: '销售合同创建页', url: 'http://localhost:3001/pages/sales-contract-create.html' }
];

async function testPage(browser, pageInfo, token) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const results = {
    name: pageInfo.name,
    url: pageInfo.url,
    jsErrors: [],
    orgDropdown: false,
    orgDataCount: 0,
    dropdowns: {},
    detailRows: 0,
    hasDetailRow: false,
    layoutOk: false,
    pageTitle: ''
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.jsErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    results.jsErrors.push(error.message);
  });

  await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t);
  }, token);
  
  await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  results.pageTitle = await page.title();

  const orgSelector = await page.$('#orgSelector');
  if (orgSelector) {
    const orgOptions = await page.$$eval('#orgSelector option', options => options.length);
    results.orgDataCount = orgOptions;
    results.orgDropdown = orgOptions > 0;
  }

  const selectElements = await page.$$('select');
  for (let i = 0; i < selectElements.length; i++) {
    const select = selectElements[i];
    const id = await page.evaluate(el => el.id || el.name || el.className, select);
    const optionsCount = await page.evaluate(el => el.options.length, select);
    if (optionsCount > 1) {
      results.dropdowns[id || ('select_' + i)] = optionsCount;
    }
  }

  const detailTable = await page.$('.detail-table');
  if (detailTable) {
    const rows = await page.$$eval('.detail-table tbody tr', rows => rows.length);
    results.detailRows = rows;
    results.hasDetailRow = rows > 0;
    
    const noDataText = await page.evaluate(() => {
      const tbody = document.querySelector('.detail-table tbody');
      if (!tbody) return false;
      return tbody.textContent.includes('暂无数据');
    });
    if (noDataText) {
      results.hasDetailRow = false;
    }
  }

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  results.layoutOk = bodyHeight > 100;

  await page.close();
  return results;
}

async function runTests() {
  console.log('=== 开始测试 5 个单据创建页面 ===\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let token = '';

  console.log('步骤 1: 登录系统...');
  const loginPage = await browser.newPage();
  await loginPage.setViewport({ width: 1366, height: 768 });
  await loginPage.goto('http://localhost:3001/login.html', { waitUntil: 'networkidle2' });
  
  await loginPage.type('#username', 'admin');
  await loginPage.type('#password', '123456');
  
  const loginBtn = await loginPage.$('button[type="submit"], .login-btn, form button');
  if (loginBtn) {
    await loginBtn.click();
  } else {
    await loginPage.keyboard.press('Enter');
  }
  
  await loginPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  token = await loginPage.evaluate(() => localStorage.getItem('accessToken'));
  console.log('登录成功，Token:', token ? '已获取' : '未获取');
  await loginPage.close();
  console.log('');

  const allResults = [];

  for (const pageInfo of testPages) {
    console.log('测试中: ' + pageInfo.name + '...');
    try {
      const result = await testPage(browser, pageInfo, token);
      allResults.push(result);
      
      console.log('  页面标题: ' + result.pageTitle);
      console.log('  JS错误: ' + (result.jsErrors.length === 0 ? '无' : result.jsErrors.length + '个'));
      if (result.jsErrors.length > 0) {
        result.jsErrors.forEach(function(e) {
          console.log('    - ' + e.substring(0, 150));
        });
      }
      console.log('  组织下拉框: ' + (result.orgDropdown ? ('正常 (' + result.orgDataCount + '个组织)') : '无数据或不存在'));
      console.log('  有数据的下拉框: ' + Object.keys(result.dropdowns).length + '个');
      if (Object.keys(result.dropdowns).length > 0) {
        Object.entries(result.dropdowns).forEach(function(entry) {
          console.log('    - ' + entry[0] + ': ' + entry[1] + '项');
        });
      }
      console.log('  明细行: ' + (result.hasDetailRow ? ('有第一行 (' + result.detailRows + '行)') : '暂无数据'));
      console.log('  页面布局: ' + (result.layoutOk ? '正常' : '异常'));
      console.log('');
    } catch (e) {
      console.log('  测试失败: ' + e.message);
      console.log('');
      allResults.push({ name: pageInfo.name, error: e.message });
    }
  }

  console.log('\n=== 测试总结 ===\n');
  allResults.forEach(function(r, i) {
    let status;
    if (r.error) {
      status = '失败';
    } else if (r.jsErrors.length > 0) {
      status = '有JS错误';
    } else if (!r.orgDropdown) {
      status = '组织下拉框无数据';
    } else if (!r.hasDetailRow) {
      status = '明细无第一行';
    } else {
      status = '通过';
    }
    console.log((i + 1) + '. ' + r.name + ': ' + status);
  });

  await browser.close();
  console.log('\n测试完成！');
}

runTests().catch(console.error);
