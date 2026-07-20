const puppeteer = require('puppeteer');

const testPages = [
  { name: '销售报价单创建页', url: 'http://localhost:3001/pages/sales-quotation-create.html', keyFields: ['客户', '业务员', '部门'] },
  { name: '采购订单创建页', url: 'http://localhost:3001/pages/purchase-order-create.html', keyFields: ['供应商', '采购员', '部门'] },
  { name: '销售出库创建页', url: 'http://localhost:3001/pages/inventory-out-create.html', keyFields: ['客户', '业务员', '仓库'] },
  { name: '采购申请创建页', url: 'http://localhost:3001/pages/purchase-request-create.html', keyFields: ['供应商', '采购员', '部门'] },
  { name: '销售合同创建页', url: 'http://localhost:3001/pages/sales-contract-create.html', keyFields: ['客户', '业务员', '部门'] }
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
    orgData: [],
    allSelects: [],
    keyFieldData: {},
    detailRows: 0,
    hasDetailRow: false,
    detailFirstRowCols: [],
    layoutOk: false,
    pageTitle: '',
    masterDataCache: {}
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
  await new Promise(r => setTimeout(r, 4000));

  results.pageTitle = await page.title();

  const orgSelector = await page.$('#orgSelector');
  if (orgSelector) {
    const orgData = await page.$$eval('#orgSelector option', options => 
      options.map(o => ({ value: o.value, text: o.textContent.trim() }))
    );
    results.orgData = orgData;
    results.orgDataCount = orgData.length;
    results.orgDropdown = orgData.length > 0 && orgData[0].value !== '';
  }

  const selectInfo = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    return selects.map((s, idx) => {
      const options = Array.from(s.options).map(o => ({
        value: o.value,
        text: o.textContent.trim()
      }));
      const label = s.closest('.form-item')?.querySelector('label')?.textContent?.trim() || '';
      return {
        index: idx,
        id: s.id || '',
        name: s.name || '',
        className: s.className || '',
        label: label,
        optionCount: options.length,
        firstOptions: options.slice(0, 3)
      };
    });
  });
  results.allSelects = selectInfo;

  for (const field of pageInfo.keyFields) {
    const matchingSelect = selectInfo.find(s => s.label.includes(field));
    if (matchingSelect) {
      results.keyFieldData[field] = {
        found: true,
        optionCount: matchingSelect.optionCount,
        hasData: matchingSelect.optionCount > 1,
        sampleOptions: matchingSelect.firstOptions
      };
    } else {
      results.keyFieldData[field] = { found: false };
    }
  }

  const detailTable = await page.$('.detail-table, #detailTable');
  if (detailTable) {
    const rows = await page.evaluate(() => {
      const table = document.querySelector('.detail-table') || document.getElementById('detailTable');
      if (!table || !table.tBodies[0]) return 0;
      return table.tBodies[0].rows.length;
    });
    results.detailRows = rows;
    results.hasDetailRow = rows > 0;
    
    if (rows > 0) {
      const firstRowCols = await page.evaluate(() => {
        const table = document.querySelector('.detail-table') || document.getElementById('detailTable');
        if (!table || !table.tBodies[0] || !table.tBodies[0].rows[0]) return [];
        const cells = Array.from(table.tBodies[0].rows[0].cells);
        return cells.map((c, i) => ({
          index: i,
          hasInput: !!c.querySelector('input, select'),
          text: c.textContent.trim().substring(0, 30)
        }));
      });
      results.detailFirstRowCols = firstRowCols;
    }
    
    const noDataText = await page.evaluate(() => {
      const table = document.querySelector('.detail-table') || document.getElementById('detailTable');
      if (!table || !table.tBodies[0]) return false;
      return table.tBodies[0].textContent.includes('暂无数据');
    });
    if (noDataText) {
      results.hasDetailRow = false;
    }
  }

  results.masterDataCache = await page.evaluate(() => {
    if (typeof masterDataCache !== 'undefined') {
      const result = {};
      for (const key in masterDataCache) {
        result[key] = {
          count: masterDataCache[key].length,
          sample: masterDataCache[key].slice(0, 2).map(x => x.name || x.code || JSON.stringify(x).substring(0, 50))
        };
      }
      return result;
    }
    return {};
  });

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  results.layoutOk = bodyHeight > 100;

  await page.close();
  return results;
}

async function runTests() {
  console.log('========================================');
  console.log('  5个单据创建页面详细测试报告');
  console.log('========================================\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let token = '';

  console.log('[1/2] 登录系统...');
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
  console.log('      登录状态: ' + (token ? '成功 (Token已获取)' : '失败'));
  await loginPage.close();
  console.log('');

  const allResults = [];

  console.log('[2/2] 测试5个页面...\n');

  for (let i = 0; i < testPages.length; i++) {
    const pageInfo = testPages[i];
    console.log('----------------------------------------');
    console.log('  页面 ' + (i + 1) + ': ' + pageInfo.name);
    console.log('----------------------------------------');
    try {
      const result = await testPage(browser, pageInfo, token);
      allResults.push(result);
      
      console.log('');
      console.log('  📄 页面标题: ' + result.pageTitle);
      console.log('  🔗 页面地址: ' + result.url);
      console.log('');
      
      console.log('  ❌ JavaScript错误: ' + (result.jsErrors.length === 0 ? '无 ✓' : result.jsErrors.length + '个 ✗'));
      if (result.jsErrors.length > 0) {
        result.jsErrors.forEach(function(e) {
          console.log('     - ' + e.substring(0, 150));
        });
      }
      console.log('');
      
      console.log('  🏢 组织下拉框: ' + (result.orgDropdown ? '正常 ✓' : '异常 ✗'));
      console.log('     组织数量: ' + result.orgDataCount + '个');
      if (result.orgData.length > 0) {
        console.log('     组织列表:');
        result.orgData.forEach(function(o) {
          if (o.value) {
            console.log('       - ' + o.text);
          }
        });
      }
      console.log('');
      
      console.log('  📊 关键字段下拉数据:');
      let hasKeyFieldIssue = false;
      for (const field of pageInfo.keyFields) {
        const data = result.keyFieldData[field];
        if (data && data.found) {
          const status = data.hasData ? '✓' : '✗ 无数据';
          if (!data.hasData) hasKeyFieldIssue = true;
          console.log('     ' + field + ': ' + data.optionCount + '项 ' + status);
          if (data.sampleOptions && data.sampleOptions.length > 0) {
            console.log('       示例: ' + data.sampleOptions.map(o => o.text).join(', '));
          }
        } else {
          console.log('     ' + field + ': 未找到字段');
          hasKeyFieldIssue = true;
        }
      }
      console.log('');
      
      console.log('  📋 明细行: ' + (result.hasDetailRow ? '有第一行 ✓' : '暂无数据 ✗'));
      console.log('     明细行数: ' + result.detailRows + '行');
      if (result.detailFirstRowCols.length > 0) {
        console.log('     第一行列数: ' + result.detailFirstRowCols.length + '列');
        console.log('     可编辑列数: ' + result.detailFirstRowCols.filter(c => c.hasInput).length + '列');
      }
      console.log('');
      
      console.log('  📐 页面布局: ' + (result.layoutOk ? '正常 ✓' : '异常 ✗'));
      console.log('');
      
      console.log('  📦 主数据缓存 (masterDataCache):');
      const cacheKeys = Object.keys(result.masterDataCache);
      if (cacheKeys.length > 0) {
        for (const key of cacheKeys) {
          const data = result.masterDataCache[key];
          console.log('     - ' + key + ': ' + data.count + '条');
          if (data.sample && data.sample.length > 0) {
            console.log('       示例: ' + data.sample.join(', '));
          }
        }
      } else {
        console.log('     (空)');
      }
      console.log('');
      
      console.log('  📑 所有下拉框统计: ' + result.allSelects.length + '个');
      const withData = result.allSelects.filter(s => s.optionCount > 1).length;
      console.log('     有数据的下拉框: ' + withData + '个');
      console.log('     空下拉框: ' + (result.allSelects.length - withData) + '个');
      console.log('');
      
    } catch (e) {
      console.log('  ✗ 测试失败: ' + e.message);
      console.log('  错误堆栈: ' + e.stack);
      allResults.push({ name: pageInfo.name, error: e.message });
    }
    console.log('');
  }

  console.log('========================================');
  console.log('  测试总结');
  console.log('========================================\n');
  
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;

  allResults.forEach(function(r, i) {
    let status;
    let statusIcon;
    if (r.error) {
      status = '失败';
      statusIcon = '✗';
      failCount++;
    } else if (r.jsErrors.length > 0) {
      status = '有JS错误';
      statusIcon = '⚠';
      warningCount++;
    } else if (!r.orgDropdown) {
      status = '组织下拉框无数据';
      statusIcon = '⚠';
      warningCount++;
    } else if (!r.hasDetailRow) {
      status = '明细无第一行';
      statusIcon = '⚠';
      warningCount++;
    } else {
      status = '通过';
      statusIcon = '✓';
      passCount++;
    }
    console.log('  ' + (i + 1) + '. ' + statusIcon + ' ' + r.name + ': ' + status);
  });

  console.log('');
  console.log('  总计: ' + allResults.length + '个页面');
  console.log('  通过: ' + passCount + '个');
  console.log('  警告: ' + warningCount + '个');
  console.log('  失败: ' + failCount + '个');
  console.log('');

  await browser.close();
  console.log('测试完成！');
}

runTests().catch(console.error);
