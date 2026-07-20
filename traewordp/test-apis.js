const puppeteer = require('puppeteer');

async function testAPI() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  console.log('登录...');
  await page.goto('http://localhost:3001/login.html', { waitUntil: 'networkidle2' });
  await page.type('#username', 'admin');
  await page.type('#password', '123456');
  const loginBtn = await page.$('button[type="submit"], .login-btn, form button');
  if (loginBtn) {
    await loginBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
  
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  console.log('Token: ' + (token ? '已获取' : '未获取'));
  
  const apis = [
    '/api/customers?pageSize=10',
    '/api/suppliers?pageSize=10',
    '/api/materials?pageSize=10',
    '/api/employees?pageSize=10',
    '/api/departments?pageSize=10',
    '/api/warehouses?pageSize=10',
    '/api/units?pageSize=10'
  ];
  
  console.log('\n测试各API:');
  for (const api of apis) {
    try {
      const result = await page.evaluate(async (apiPath, t) => {
        const res = await fetch('http://localhost:3001' + apiPath, {
          headers: { 'Authorization': 'Bearer ' + t }
        });
        const data = await res.json();
        return { status: res.status, data: data };
      }, api, token);
      
      const list = result.data?.data?.list || result.data?.data || [];
      const count = Array.isArray(list) ? list.length : 0;
      const firstItem = count > 0 ? list[0] : null;
      const itemKeys = firstItem ? Object.keys(firstItem).slice(0, 10) : [];
      
      console.log(api + ':');
      console.log('  状态: ' + result.status);
      console.log('  返回码: ' + result.data?.code);
      console.log('  数据条数: ' + count);
      if (firstItem) {
        console.log('  第一条数据关键字段:');
        itemKeys.forEach(k => {
          const val = firstItem[k];
          if (typeof val === 'string' && val.length < 100) {
            console.log('    ' + k + ': ' + val);
          }
        });
      }
      console.log('');
    } catch (e) {
      console.log(api + ': 错误 - ' + e.message);
      console.log('');
    }
  }
  
  await browser.close();
}

testAPI().catch(console.error);
