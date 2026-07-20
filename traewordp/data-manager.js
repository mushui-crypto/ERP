var DataManager = (function() {
  var ORG_DATA = {};
  var CLEAN_ORG_ID = 'org-panshu';
  
  function isCleanOrg() {
    var org = getOrg();
    return org && org.id === CLEAN_ORG_ID;
  }
  
  function registerData(orgId, dataType, data) {
    if (!ORG_DATA[orgId]) ORG_DATA[orgId] = {};
    ORG_DATA[orgId][dataType] = data;
  }
  
  function getData(dataType) {
    var org = getOrg();
    var orgId = org ? org.id : 'default';
    
    if (ORG_DATA[orgId] && ORG_DATA[orgId][dataType]) {
      return ORG_DATA[orgId][dataType];
    }
    
    if (ORG_DATA['default'] && ORG_DATA['default'][dataType]) {
      if (isCleanOrg()) {
        return [];
      }
      return ORG_DATA['default'][dataType];
    }
    
    return [];
  }
  
  function getOptions(dataType, valueField, labelField) {
    var data = getData(dataType);
    return data.map(function(item) {
      return {
        value: item[valueField] || item.id || item.code,
        label: item[labelField] || item.name || item.label
      };
    });
  }
  
  function renderTable(tableId, dataType, columns) {
    var table = document.getElementById(tableId);
    if (!table) return;
    
    var data = getData(dataType);
    var tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="' + columns.length + '" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';
      return;
    }
    
    var html = '';
    data.forEach(function(row) {
      html += '<tr>';
      columns.forEach(function(col) {
        var value = row[col.field];
        if (col.render) {
          value = col.render(value, row);
        }
        html += '<td>' + (value || '') + '</td>';
      });
      html += '</tr>';
    });
    tbody.innerHTML = html;
  }
  
  function populateSelect(selectId, dataType) {
    var select = document.getElementById(selectId);
    if (!select) return;
    
    var options = getOptions(dataType, 'code', 'name');
    select.innerHTML = '<option value="">请选择</option>' +
      options.map(function(opt) {
        return '<option value="' + opt.value + '">' + opt.label + '</option>';
      }).join('');
  }
  
  return {
    register: registerData,
    get: getData,
    getOptions: getOptions,
    renderTable: renderTable,
    populateSelect: populateSelect,
    isCleanOrg: isCleanOrg
  };
})();

function loadMockData() {
  var mockData = {
    'default': {
      materials: [
        { code: 'M001', name: '电子元件A', spec: '规格A', category: '原材料', unit: 'PCS', status: '已审核' },
        { code: 'M002', name: '电子元件B', spec: '规格B', category: '原材料', unit: 'PCS', status: '已审核' },
        { code: 'M003', name: '外壳组件', spec: '塑料外壳', category: '半成品', unit: 'PCS', status: '待审核' },
        { code: 'M004', name: '电路板', spec: 'PCB-001', category: '半成品', unit: 'PCS', status: '已审核' },
        { code: 'M005', name: '成品整机', spec: '型号X', category: '成品', unit: '台', status: '已审核' },
      ],
      suppliers: [
        { code: 'S001', name: '供应商A', shortName: 'A公司', category: '电子元件', contact: '张三', phone: '13800000001', status: '已审核' },
        { code: 'S002', name: '供应商B', shortName: 'B公司', category: '塑料件', contact: '李四', phone: '13800000002', status: '已审核' },
        { code: 'S003', name: '供应商C', shortName: 'C公司', category: '五金件', contact: '王五', phone: '13800000003', status: '待审核' },
      ],
      customers: [
        { code: 'C001', name: '客户A', shortName: 'A集团', category: '经销商', contact: '赵六', phone: '13900000001', status: '已审核' },
        { code: 'C002', name: '客户B', shortName: 'B公司', category: '终端客户', contact: '钱七', phone: '13900000002', status: '已审核' },
      ],
      employees: [
        { code: 'EMP001', name: '张小明', gender: '男', department: '研发部', position: '工程师', level: 'P3', status: '在职' },
        { code: 'EMP002', name: '李小红', gender: '女', department: '财务部', position: '会计', level: 'P2', status: '在职' },
        { code: 'EMP003', name: '王小华', gender: '男', department: '生产部', position: '主管', level: 'M1', status: '在职' },
      ],
      departments: [
        { code: 'D001', name: '研发部', parent: '总部', manager: '张经理', type: '管理部门', status: '启用' },
        { code: 'D002', name: '财务部', parent: '总部', manager: '李经理', type: '管理部门', status: '启用' },
        { code: 'D003', name: '生产车间', parent: '总部', manager: '王主管', type: '基本生产部门', status: '启用' },
        { code: 'D004', name: '质检部', parent: '总部', manager: '刘主管', type: '辅助生产部门', status: '启用' },
      ],
      orgs: [
        { code: 'G001', name: '测试集团', shortName: '测试集团', type: '集团公司', parent: '', status: '启用' },
        { code: 'G002', name: '测试子公司', shortName: '测试子公司', type: '三级公司', parent: 'G001', status: '启用' },
      ],
      banks: [
        { code: 'B001', name: '测试银行总行', shortName: '测试银行', swiftCode: 'TESTBANK' },
        { code: 'B002', name: '测试银行分行', shortName: '测试分行', swiftCode: 'TESTBRANCH' },
      ],
      bankAccounts: [
        { id: 'BA001', bankCode: 'B001', accountNo: '1234567890123456789', accountName: '测试账户', currency: 'CNY' },
      ],
      currencies: [
        { code: 'CNY', name: '人民币', symbol: '¥', rate: 1.0 },
        { code: 'USD', name: '美元', symbol: '$', rate: 7.2 },
        { code: 'EUR', name: '欧元', symbol: '€', rate: 7.8 },
      ],
      paymentTerms: [
        { code: 'PT001', name: '月结30天', description: '发货后30天付款' },
        { code: 'PT002', name: '月结60天', description: '发货后60天付款' },
        { code: 'PT003', name: '预付50%', description: '预付款50%，发货前付清' },
      ],
      receiptTerms: [
        { code: 'RT001', name: '货到付款', description: '货到后立即付款' },
        { code: 'RT002', name: '款到发货', description: '付款后发货' },
      ],
      categories: [
        { code: 'CAT001', name: '原材料', parent: '', description: '生产用原材料' },
        { code: 'CAT002', name: '半成品', parent: '', description: '未完成的中间产品' },
        { code: 'CAT003', name: '成品', parent: '', description: '可销售的成品' },
      ],
      units: [
        { code: 'PCS', name: '个', shortName: '个', conversion: 1 },
        { code: 'KG', name: '千克', shortName: 'kg', conversion: 1 },
        { code: 'M', name: '米', shortName: 'm', conversion: 1 },
        { code: '台', name: '台', shortName: '台', conversion: 1 },
      ],
      positions: [
        { code: 'P1', name: '初级工程师', level: '初级' },
        { code: 'P2', name: '中级工程师', level: '中级' },
        { code: 'P3', name: '高级工程师', level: '高级' },
        { code: 'M1', name: '主管', level: '管理' },
        { code: 'M2', name: '经理', level: '管理' },
      ],
      salespersons: [
        { code: 'SP001', name: '销售人员A', department: '销售部', phone: '13700000001', status: '启用' },
        { code: 'SP002', name: '销售人员B', department: '销售部', phone: '13700000002', status: '启用' },
      ],
      contacts: [
        { code: 'CON001', name: '联系人A', company: '客户A', phone: '13600000001', email: 'a@test.com' },
        { code: 'CON002', name: '联系人B', company: '客户B', phone: '13600000002', email: 'b@test.com' },
      ],
      costCenters: [
        { code: 'CC001', name: '财务中心', responsible: '财务部' },
        { code: 'CC002', name: '研发中心', responsible: '研发部' },
        { code: 'CC003', name: '生产中心', responsible: '生产部' },
      ],
      docTypes: [
        { code: 'PO', name: '采购订单', category: '采购', status: '启用' },
        { code: 'SO', name: '销售订单', category: '销售', status: '启用' },
        { code: 'MO', name: '生产订单', category: '生产', status: '启用' },
        { code: 'IO', name: '库存出库', category: '库存', status: '启用' },
        { code: 'II', name: '库存入库', category: '库存', status: '启用' },
      ],
      exchangeRates: [
        { currency: 'USD', rate: 7.2, date: '2026-07-01' },
        { currency: 'EUR', rate: 7.8, date: '2026-07-01' },
      ],
      expenseItems: [
        { code: 'EI001', name: '差旅费', category: '费用' },
        { code: 'EI002', name: '办公用品', category: '费用' },
        { code: 'EI003', name: '交通费', category: '费用' },
      ],
      salaryItems: [
        { code: 'SI001', name: '基本工资', type: '固定' },
        { code: 'SI002', name: '岗位工资', type: '固定' },
        { code: 'SI003', name: '绩效工资', type: '浮动' },
      ],
      shifts: [
        { code: 'S001', name: '早班', startTime: '08:00', endTime: '16:00' },
        { code: 'S002', name: '晚班', startTime: '16:00', endTime: '24:00' },
        { code: 'S003', name: '夜班', startTime: '00:00', endTime: '08:00' },
      ],
      codeRules: [
        { code: 'CR001', name: '物料编码规则', prefix: 'M', length: 6, increment: 1 },
        { code: 'CR002', name: '供应商编码规则', prefix: 'S', length: 6, increment: 1 },
      ],
    }
  };
  
  Object.keys(mockData).forEach(function(orgId) {
    Object.keys(mockData[orgId]).forEach(function(dataType) {
      DataManager.register(orgId, dataType, mockData[orgId][dataType]);
    });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataManager;
}