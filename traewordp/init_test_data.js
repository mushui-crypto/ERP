function initTestData() {
  var materials = [
    { id: 'm-001', code: 'P-LAPTOP', name: '笔记本电脑', spec: 'ThinkPad X1', category: '成品', baseUnit: '台', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '自制', needInspect: true, standHour: '4.5000', stdLaborPrePareTime: '0.5', stdLaborProcessTime: '2.0', stdMachinePrepareTime: '0.5', stdMachineProcessTime: '1.5' },
    { id: 'm-002', code: 'P-KEYBOARD', name: '键盘', spec: 'USB有线', category: '原材料', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-003', code: 'P-MOUSE', name: '鼠标', spec: '无线蓝牙', category: '原材料', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-004', code: 'P-MONITOR', name: '显示器', spec: '23.8寸', category: '原材料', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-005', code: 'P-MAINBOARD', name: '主板', spec: 'B660', category: '原材料', baseUnit: '块', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-006', code: 'P-RAM', name: '内存条', spec: 'DDR5 16G', category: '原材料', baseUnit: '条', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-007', code: 'P-HDD', name: '硬盘', spec: 'SSD 512G', category: '原材料', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-008', code: 'P-CPU', name: 'CPU', spec: 'i7-12700H', category: '原材料', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-009', code: 'P-001', name: '智能控制器', spec: 'IC-2024', category: '成品', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '自制', needInspect: true, standHour: '1.5000', stdLaborPrePareTime: '0.2', stdLaborProcessTime: '0.8', stdMachinePrepareTime: '0.2', stdMachineProcessTime: '0.3' },
    { id: 'm-010', code: 'P-002', name: '传感器模块', spec: 'SM-2024', category: '半成品', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '自制', needInspect: true, standHour: '0.8000', stdLaborPrePareTime: '0.1', stdLaborProcessTime: '0.4', stdMachinePrepareTime: '0.1', stdMachineProcessTime: '0.2' },
    { id: 'm-011', code: 'P-003', name: '金属外壳', spec: 'MC-2024', category: '原材料', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: true, standHour: '0.0000' },
    { id: 'm-012', code: 'P-004', name: '电路板', spec: 'PCB-2024', category: '半成品', baseUnit: '块', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '自制', needInspect: true, standHour: '0.6000', stdLaborPrePareTime: '0.1', stdLaborProcessTime: '0.3', stdMachinePrepareTime: '0.1', stdMachineProcessTime: '0.1' },
    { id: 'm-013', code: 'P-005', name: '螺丝', spec: 'Screw-M3', category: '原材料', baseUnit: '个', status: 'enabled', createOrg: '磐枢智能制造有限公司', useOrg: '磐枢智能制造有限公司', property: '外购', needInspect: false, standHour: '0.0000' }
  ];
  localStorage.setItem('erp_materials_cache', JSON.stringify(materials));

  var suppliers = [
    { id: 's-001', code: 'SUP-001', name: '深圳电子科技有限公司', shortName: '深圳电子', contact: '张三', phone: '13800138001', address: '深圳市福田区科技园', status: 1 },
    { id: 's-002', code: 'SUP-002', name: '上海精密仪器有限公司', shortName: '上海精密', contact: '李四', phone: '13800138002', address: '上海市浦东新区', status: 1 },
    { id: 's-003', code: 'SUP-003', name: '北京半导体有限公司', shortName: '北京半导体', contact: '王五', phone: '13800138003', address: '北京市海淀区', status: 1 },
    { id: 's-004', code: 'SUP-004', name: '广州配件有限公司', shortName: '广州配件', contact: '赵六', phone: '13800138004', address: '广州市天河区', status: 1 },
    { id: 's-005', code: 'SUP-005', name: '杭州电子有限公司', shortName: '杭州电子', contact: '孙七', phone: '13800138005', address: '杭州市西湖区', status: 1 }
  ];
  localStorage.setItem('erp_suppliers_cache', JSON.stringify(suppliers));

  var customers = [
    { id: 'c-001', code: 'CUS-001', name: '北京科技集团', shortName: '北京科技', contact: '钱八', phone: '13900139001', address: '北京市朝阳区', status: 1 },
    { id: 'c-002', code: 'CUS-002', name: '上海贸易有限公司', shortName: '上海贸易', contact: '周九', phone: '13900139002', address: '上海市静安区', status: 1 },
    { id: 'c-003', code: 'CUS-003', name: '广州商贸集团', shortName: '广州商贸', contact: '吴十', phone: '13900139003', address: '广州市越秀区', status: 1 },
    { id: 'c-004', code: 'CUS-004', name: '深圳零售有限公司', shortName: '深圳零售', contact: '郑十一', phone: '13900139004', address: '深圳市南山区', status: 1 }
  ];
  localStorage.setItem('erp_customers_cache', JSON.stringify(customers));

  var warehouses = [
    { id: 'wh-001', code: 'WH-001', name: '成品仓', status: 1 },
    { id: 'wh-002', code: 'WH-002', name: '原料仓', status: 1 },
    { id: 'wh-003', code: 'WH-003', name: '半成品仓', status: 1 },
    { id: 'wh-004', code: 'WH-004', name: '辅料仓', status: 1 }
  ];
  localStorage.setItem('erp_warehouses_cache', JSON.stringify(warehouses));

  var orgs = [
    { id: 'org-001', code: 'ORG-001', name: '磐枢智能制造有限公司', status: 1 },
    { id: 'org-002', code: 'ORG-002', name: '磐枢科技分公司', status: 1 }
  ];
  localStorage.setItem('erp_orgs_cache', JSON.stringify(orgs));

  var departments = [
    { id: 'dept-001', code: 'DEPT-001', name: '采购部', orgId: 'org-001', status: 1 },
    { id: 'dept-002', code: 'DEPT-002', name: '销售部', orgId: 'org-001', status: 1 },
    { id: 'dept-003', code: 'DEPT-003', name: '生产部', orgId: 'org-001', status: 1 },
    { id: 'dept-004', code: 'DEPT-004', name: '仓库部', orgId: 'org-001', status: 1 },
    { id: 'dept-005', code: 'DEPT-005', name: '质检部', orgId: 'org-001', status: 1 }
  ];
  localStorage.setItem('erp_departments_cache', JSON.stringify(departments));

  var employees = [
    { id: 'emp-001', code: 'EMP-001', name: '管理员', deptId: 'dept-001', status: 1 },
    { id: 'emp-002', code: 'EMP-002', name: '张三', deptId: 'dept-001', status: 1 },
    { id: 'emp-003', code: 'EMP-003', name: '李四', deptId: 'dept-002', status: 1 },
    { id: 'emp-004', code: 'EMP-004', name: '王五', deptId: 'dept-003', status: 1 },
    { id: 'emp-005', code: 'EMP-005', name: '赵六', deptId: 'dept-004', status: 1 },
    { id: 'emp-006', code: 'EMP-006', name: '孙七', deptId: 'dept-005', status: 1 }
  ];
  localStorage.setItem('erp_employees_cache', JSON.stringify(employees));

  var currencies = [
    { id: 'cur-001', code: 'CNY', name: '人民币', symbol: '¥', status: 1 },
    { id: 'cur-002', code: 'USD', name: '美元', symbol: '$', status: 1 }
  ];
  localStorage.setItem('erp_currencies_cache', JSON.stringify(currencies));

  var bomList = [
    {
      id: 'bom-001',
      materialCode: 'P-LAPTOP',
      materialName: '笔记本电脑',
      version: 'V1.0',
      status: 'approved',
      createTime: new Date().toISOString(),
      details: [
        { materialCode: 'P-KEYBOARD', materialName: '键盘', qty: 1, unit: '个', seq: 1 },
        { materialCode: 'P-MOUSE', materialName: '鼠标', qty: 1, unit: '个', seq: 2 },
        { materialCode: 'P-MONITOR', materialName: '显示器', qty: 1, unit: '个', seq: 3 },
        { materialCode: 'P-MAINBOARD', materialName: '主板', qty: 1, unit: '块', seq: 4 },
        { materialCode: 'P-RAM', materialName: '内存条', qty: 1, unit: '条', seq: 5 },
        { materialCode: 'P-HDD', materialName: '硬盘', qty: 1, unit: '个', seq: 6 },
        { materialCode: 'P-CPU', materialName: 'CPU', qty: 1, unit: '个', seq: 7 }
      ]
    }
  ];
  localStorage.setItem('erp_bom_list', JSON.stringify(bomList));

  var now = new Date();
  var dateStr = now.toISOString().split('T')[0];
  var fixedId = '1784260000000';

  var salesQuotationList = [
    {
      id: 'sq-' + fixedId,
      docNo: 'SQ-20260717001',
      docDate: dateStr,
      customer: '北京科技集团',
      customerName: '北京科技集团',
      org: '磐枢智能制造有限公司',
      orgName: '磐枢智能制造有限公司',
      amount: '120000.00',
      status: 'approved',
      details: [
        { '物料编码': 'P-LAPTOP', '物料名称': '笔记本电脑', '规格型号': 'ThinkPad X1', '单位': '台', '数量': '10', '单价': '12000', '金额': '120000', '税率': '13', '税额': '15600' }
      ]
    }
  ];
  localStorage.setItem('erp_sales_quotation_list', JSON.stringify(salesQuotationList));

  var salesOrderList = [
    {
      id: 'so-' + fixedId,
      docNo: 'SO-20260717001',
      docDate: dateStr,
      customer: '北京科技集团',
      customerName: '北京科技集团',
      org: '磐枢智能制造有限公司',
      orgName: '磐枢智能制造有限公司',
      amount: '120000.00',
      status: 'approved',
      deliveryQty: '0',
      outboundQty: '0',
      undeliveredQty: '10',
      details: [
        { '物料编码': 'P-LAPTOP', '物料名称': '笔记本电脑', '规格型号': 'ThinkPad X1', '单位': '台', '数量': '10', '单价': '12000', '金额': '120000', '税率': '13', '税额': '15600', deliveryQty: '0', outboundQty: '0' }
      ],
      source_doc_id: salesQuotationList[0].id
    }
  ];
  localStorage.setItem('erp_sales_order_list', JSON.stringify(salesOrderList));

  var purchaseRequestList = [
    {
      id: 'pr-' + fixedId,
      docNo: 'PR-20260717001',
      docDate: dateStr,
      supplier: '深圳电子科技有限公司',
      supplierName: '深圳电子科技有限公司',
      org: '磐枢智能制造有限公司',
      orgName: '磐枢智能制造有限公司',
      amount: '52000.00',
      status: 'approved',
      orderQty: '0',
      receiveQty: '0',
      inboundQty: '0',
      unorderedQty: '10',
      unreceivedQty: '10',
      uninboundQty: '10',
      details: [
        { '物料编码': 'P-KEYBOARD', '物料名称': '键盘', '规格型号': 'USB有线', '单位': '个', '数量': '10', '单价': '100', '金额': '1000', '税率': '13', '税额': '130', orderQty: '0', receiveQty: '0', inboundQty: '0', unorderedQty: '10', unreceivedQty: '10', uninboundQty: '10' },
        { '物料编码': 'P-MOUSE', '物料名称': '鼠标', '规格型号': '无线蓝牙', '单位': '个', '数量': '10', '单价': '80', '金额': '800', '税率': '13', '税额': '104', orderQty: '0', receiveQty: '0', inboundQty: '0', unorderedQty: '10', unreceivedQty: '10', uninboundQty: '10' },
        { '物料编码': 'P-MONITOR', '物料名称': '显示器', '规格型号': '23.8寸', '单位': '个', '数量': '10', '单价': '800', '金额': '8000', '税率': '13', '税额': '1040', orderQty: '0', receiveQty: '0', inboundQty: '0', unorderedQty: '10', unreceivedQty: '10', uninboundQty: '10' },
        { '物料编码': 'P-MAINBOARD', '物料名称': '主板', '规格型号': 'B660', '单位': '块', '数量': '10', '单价': '1200', '金额': '12000', '税率': '13', '税额': '1560', orderQty: '0', receiveQty: '0', inboundQty: '0', unorderedQty: '10', unreceivedQty: '10', uninboundQty: '10' },
        { '物料编码': 'P-RAM', '物料名称': '内存条', '规格型号': 'DDR5 16G', '单位': '条', '数量': '10', '单价': '500', '金额': '5000', '税率': '13', '税额': '650', orderQty: '0', receiveQty: '0', inboundQty: '0', unorderedQty: '10', unreceivedQty: '10', uninboundQty: '10' },
        { '物料编码': 'P-HDD', '物料名称': '硬盘', '规格型号': 'SSD 512G', '单位': '个', '数量': '10', '单价': '400', '金额': '4000', '税率': '13', '税额': '520', orderQty: '0', receiveQty: '0', inboundQty: '0', unorderedQty: '10', unreceivedQty: '10', uninboundQty: '10' },
        { '物料编码': 'P-CPU', '物料名称': 'CPU', '规格型号': 'i7-12700H', '单位': '个', '数量': '10', '单价': '2200', '金额': '22000', '税率': '13', '税额': '2860', orderQty: '0', receiveQty: '0', inboundQty: '0', unorderedQty: '10', unreceivedQty: '10', uninboundQty: '10' }
      ],
      source_doc_id: salesOrderList[0].id
    }
  ];
  localStorage.setItem('erp_purchase_request_list', JSON.stringify(purchaseRequestList));

  var purchaseOrderList = [
    {
      id: 'po-' + fixedId,
      docNo: 'PO-20260717001',
      docDate: dateStr,
      supplier: '深圳电子科技有限公司',
      supplierName: '深圳电子科技有限公司',
      org: '磐枢智能制造有限公司',
      orgName: '磐枢智能制造有限公司',
      amount: '52000.00',
      status: 'approved',
      receiveQty: '0',
      inspectQty: '0',
      inboundQty: '0',
      unreceivedQty: '10',
      uninboundQty: '10',
      details: [
        { '物料编码': 'P-KEYBOARD', '物料名称': '键盘', '规格型号': 'USB有线', '单位': '个', '数量': '10', '单价': '100', '金额': '1000', '税率': '13', '税额': '130', receiveQty: '0', inspectQty: '0', inboundQty: '0', unreceivedQty: '10', uninboundQty: '10', source_doc_id: purchaseRequestList[0].id, source_detail_index: 0 },
        { '物料编码': 'P-MOUSE', '物料名称': '鼠标', '规格型号': '无线蓝牙', '单位': '个', '数量': '10', '单价': '80', '金额': '800', '税率': '13', '税额': '104', receiveQty: '0', inspectQty: '0', inboundQty: '0', unreceivedQty: '10', uninboundQty: '10', source_doc_id: purchaseRequestList[0].id, source_detail_index: 1 },
        { '物料编码': 'P-MONITOR', '物料名称': '显示器', '规格型号': '23.8寸', '单位': '个', '数量': '10', '单价': '800', '金额': '8000', '税率': '13', '税额': '1040', receiveQty: '0', inspectQty: '0', inboundQty: '0', unreceivedQty: '10', uninboundQty: '10', source_doc_id: purchaseRequestList[0].id, source_detail_index: 2 },
        { '物料编码': 'P-MAINBOARD', '物料名称': '主板', '规格型号': 'B660', '单位': '块', '数量': '10', '单价': '1200', '金额': '12000', '税率': '13', '税额': '1560', receiveQty: '0', inspectQty: '0', inboundQty: '0', unreceivedQty: '10', uninboundQty: '10', source_doc_id: purchaseRequestList[0].id, source_detail_index: 3 },
        { '物料编码': 'P-RAM', '物料名称': '内存条', '规格型号': 'DDR5 16G', '单位': '条', '数量': '10', '单价': '500', '金额': '5000', '税率': '13', '税额': '650', receiveQty: '0', inspectQty: '0', inboundQty: '0', unreceivedQty: '10', uninboundQty: '10', source_doc_id: purchaseRequestList[0].id, source_detail_index: 4 },
        { '物料编码': 'P-HDD', '物料名称': '硬盘', '规格型号': 'SSD 512G', '单位': '个', '数量': '10', '单价': '400', '金额': '4000', '税率': '13', '税额': '520', receiveQty: '0', inspectQty: '0', inboundQty: '0', unreceivedQty: '10', uninboundQty: '10', source_doc_id: purchaseRequestList[0].id, source_detail_index: 5 },
        { '物料编码': 'P-CPU', '物料名称': 'CPU', '规格型号': 'i7-12700H', '单位': '个', '数量': '10', '单价': '2200', '金额': '22000', '税率': '13', '税额': '2860', receiveQty: '0', inspectQty: '0', inboundQty: '0', unreceivedQty: '10', uninboundQty: '10', source_doc_id: purchaseRequestList[0].id, source_detail_index: 6 }
      ],
      source_doc_id: purchaseRequestList[0].id
    }
  ];
  localStorage.setItem('erp_purchase_order_list', JSON.stringify(purchaseOrderList));

  var purchaseReceiveList = [
    {
      id: 'prc-' + fixedId,
      docNo: 'PRC-20260717001',
      docDate: dateStr,
      supplier: '深圳电子科技有限公司',
      supplierName: '深圳电子科技有限公司',
      org: '磐枢智能制造有限公司',
      orgName: '磐枢智能制造有限公司',
      amount: '52000.00',
      status: 'approved',
      inspectQty: '0',
      qualifiedQty: '0',
      inboundQty: '0',
      uninspectQty: '10',
      uninboundQty: '10',
      details: [
        { '物料编码': 'P-KEYBOARD', '物料名称': '键盘', '规格型号': 'USB有线', '单位': '个', '数量': '10', '单价': '100', '金额': '1000', '税率': '13', '税额': '130', inspectQty: '0', qualifiedQty: '0', inboundQty: '0', uninspectQty: '10', uninboundQty: '10', source_doc_id: purchaseOrderList[0].id, source_detail_index: 0 },
        { '物料编码': 'P-MOUSE', '物料名称': '鼠标', '规格型号': '无线蓝牙', '单位': '个', '数量': '10', '单价': '80', '金额': '800', '税率': '13', '税额': '104', inspectQty: '0', qualifiedQty: '0', inboundQty: '0', uninspectQty: '10', uninboundQty: '10', source_doc_id: purchaseOrderList[0].id, source_detail_index: 1 },
        { '物料编码': 'P-MONITOR', '物料名称': '显示器', '规格型号': '23.8寸', '单位': '个', '数量': '10', '单价': '800', '金额': '8000', '税率': '13', '税额': '1040', inspectQty: '0', qualifiedQty: '0', inboundQty: '0', uninspectQty: '10', uninboundQty: '10', source_doc_id: purchaseOrderList[0].id, source_detail_index: 2 },
        { '物料编码': 'P-MAINBOARD', '物料名称': '主板', '规格型号': 'B660', '单位': '块', '数量': '10', '单价': '1200', '金额': '12000', '税率': '13', '税额': '1560', inspectQty: '0', qualifiedQty: '0', inboundQty: '0', uninspectQty: '10', uninboundQty: '10', source_doc_id: purchaseOrderList[0].id, source_detail_index: 3 },
        { '物料编码': 'P-RAM', '物料名称': '内存条', '规格型号': 'DDR5 16G', '单位': '条', '数量': '10', '单价': '500', '金额': '5000', '税率': '13', '税额': '650', inspectQty: '0', qualifiedQty: '0', inboundQty: '0', uninspectQty: '10', uninboundQty: '10', source_doc_id: purchaseOrderList[0].id, source_detail_index: 4 },
        { '物料编码': 'P-HDD', '物料名称': '硬盘', '规格型号': 'SSD 512G', '单位': '个', '数量': '10', '单价': '400', '金额': '4000', '税率': '13', '税额': '520', inspectQty: '0', qualifiedQty: '0', inboundQty: '0', uninspectQty: '10', uninboundQty: '10', source_doc_id: purchaseOrderList[0].id, source_detail_index: 5 },
        { '物料编码': 'P-CPU', '物料名称': 'CPU', '规格型号': 'i7-12700H', '单位': '个', '数量': '10', '单价': '2200', '金额': '22000', '税率': '13', '税额': '2860', inspectQty: '0', qualifiedQty: '0', inboundQty: '0', uninspectQty: '10', uninboundQty: '10', source_doc_id: purchaseOrderList[0].id, source_detail_index: 6 }
      ],
      source_doc_id: purchaseOrderList[0].id
    }
  ];
  localStorage.setItem('erp_purchase_receive_list', JSON.stringify(purchaseReceiveList));

  var productionOrderList = [
    {
      id: 'prod-' + fixedId,
      docNo: 'PROD-20260717001',
      docDate: dateStr,
      org: '磐枢智能制造有限公司',
      orgName: '磐枢智能制造有限公司',
      amount: '120000.00',
      status: 'approved',
      issueQty: '0',
      returnQty: '0',
      inboundQty: '0',
      unissuedQty: '10',
      uninboundQty: '10',
      details: [
        { '物料编码': 'P-LAPTOP', '物料名称': '笔记本电脑', '规格型号': 'ThinkPad X1', '单位': '台', '数量': '10', '单价': '12000', '金额': '120000', '税率': '13', '税额': '15600', issueQty: '0', returnQty: '0', inboundQty: '0', unissuedQty: '10', uninboundQty: '10' }
      ],
      source_doc_id: salesOrderList[0].id
    }
  ];
  localStorage.setItem('erp_production_order_list', JSON.stringify(productionOrderList));

  console.log('测试数据初始化完成！');
  alert('测试数据初始化完成！已创建以下数据：\n\n物料：13种（含笔记本电脑BOM组件）\n供应商：5家\n客户：4家\n仓库：4个\n组织：2个\n部门：5个\n员工：6人\nBOM：笔记本电脑BOM\n销售报价单：1张（10台笔记本电脑）\n销售订单：1张\n采购申请单：1张（7种物料各10个）\n采购订单：1张\n收料通知单：1张\n生产订单：1张');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initTestData };
}