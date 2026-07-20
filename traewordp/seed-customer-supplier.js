const puppeteer = require('puppeteer');

async function seedMasterData() {
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
  
  const customers = [
    { customerCode: 'CUST001', customerName: '成都科技有限公司', shortName: '成都科技', customerType: 1, contactPerson: '张三', contactPhone: '13800138001', address: '成都市高新区', status: 1 },
    { customerCode: 'CUST002', customerName: '重庆制造集团', shortName: '重庆制造', customerType: 1, contactPerson: '李四', contactPhone: '13800138002', address: '重庆市渝北区', status: 1 },
    { customerCode: 'CUST003', customerName: '西安电子科技公司', shortName: '西安电子', customerType: 1, contactPerson: '王五', contactPhone: '13800138003', address: '西安市雁塔区', status: 1 },
    { customerCode: 'CUST004', customerName: '武汉机械制造厂', shortName: '武汉机械', customerType: 1, contactPerson: '赵六', contactPhone: '13800138004', address: '武汉市洪山区', status: 1 },
    { customerCode: 'CUST005', customerName: '上海贸易有限公司', shortName: '上海贸易', customerType: 1, contactPerson: '钱七', contactPhone: '13800138005', address: '上海市浦东新区', status: 1 }
  ];
  
  const suppliers = [
    { supplierCode: 'SUPP001', supplierName: '深圳零部件供应商', shortName: '深圳零部件', supplierType: 1, contactPerson: '孙八', contactPhone: '13900139001', address: '深圳市南山区', status: 1 },
    { supplierCode: 'SUPP002', supplierName: '广州原材料厂', shortName: '广州原材料', supplierType: 1, contactPerson: '周九', contactPhone: '13900139002', address: '广州市天河区', status: 1 },
    { supplierCode: 'SUPP003', supplierName: '杭州电子元件公司', shortName: '杭州电子', supplierType: 1, contactPerson: '吴十', contactPhone: '13900139003', address: '杭州市西湖区', status: 1 },
    { supplierCode: 'SUPP004', supplierName: '南京机械设备厂', shortName: '南京机械', supplierType: 1, contactPerson: '郑十一', contactPhone: '13900139004', address: '南京市鼓楼区', status: 1 },
    { supplierCode: 'SUPP005', supplierName: '北京五金交电公司', shortName: '北京五金', supplierType: 1, contactPerson: '冯十二', contactPhone: '13900139005', address: '北京市朝阳区', status: 1 }
  ];
  
  console.log('\n检查现有客户数据...');
  const existingCustomers = await page.evaluate(async (t) => {
    const res = await fetch('http://localhost:3001/api/customers?pageSize=100', {
      headers: { 'Authorization': 'Bearer ' + t }
    });
    const data = await res.json();
    return data.data?.list || data.data || [];
  }, token);
  console.log('现有客户数量: ' + existingCustomers.length);
  
  if (existingCustomers.length === 0) {
    console.log('\n创建客户数据...');
    for (const cust of customers) {
      try {
        const result = await page.evaluate(async (customer, t) => {
          const res = await fetch('http://localhost:3001/api/customers', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + t,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customer)
          });
          return await res.json();
        }, cust, token);
        console.log('  创建客户: ' + cust.customerName + ' - ' + (result.code === 200 ? '成功' : '失败: ' + result.message));
      } catch (e) {
        console.log('  创建客户失败: ' + cust.customerName + ' - ' + e.message);
      }
    }
  } else {
    console.log('客户数据已存在，跳过创建');
  }
  
  console.log('\n检查现有供应商数据...');
  const existingSuppliers = await page.evaluate(async (t) => {
    const res = await fetch('http://localhost:3001/api/suppliers?pageSize=100', {
      headers: { 'Authorization': 'Bearer ' + t }
    });
    const data = await res.json();
    return data.data?.list || data.data || [];
  }, token);
  console.log('现有供应商数量: ' + existingSuppliers.length);
  
  if (existingSuppliers.length === 0) {
    console.log('\n创建供应商数据...');
    for (const supp of suppliers) {
      try {
        const result = await page.evaluate(async (supplier, t) => {
          const res = await fetch('http://localhost:3001/api/suppliers', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + t,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplier)
          });
          return await res.json();
        }, supp, token);
        console.log('  创建供应商: ' + supp.supplierName + ' - ' + (result.code === 200 ? '成功' : '失败: ' + result.message));
      } catch (e) {
        console.log('  创建供应商失败: ' + supp.supplierName + ' - ' + e.message);
      }
    }
  } else {
    console.log('供应商数据已存在，跳过创建');
  }
  
  console.log('\n数据初始化完成！');
  await browser.close();
}

seedMasterData().catch(console.error);
