var confirmCallback = null;
var organizations = [];
var masterDataCache = {
  customers: [],
  suppliers: [],
  materials: [],
  employees: [],
  departments: [],
  warehouses: [],
  units: []
};
var decimalConfig = {
  price: 4,
  amount: 2,
  tax: 2,
  qty: 4
};

function isPurchasePage() {
  return /^purchase-.*\.html$/i.test(window.location.pathname.split('/').pop() || '');
}

function getCommonApiBase() {
  if (isPurchasePage()) {
    return window.PURCHASE_API_BASE || window.PURCHASE_P4_API_BASE || window.PURCHASE_P3_API_BASE || window.PURCHASE_P2_API_BASE || window.PURCHASE_P1_API_BASE || window.PURCHASE_P0_API_BASE || 'http://localhost:3003/api';
  }
  return window.ERP_API_BASE || 'http://localhost:3001/api';
}

function handleCommonAuthFailure(response) {
  if (!isPurchasePage() || !response || response.status !== 401) return false;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('erpAuthMode');
  if (!window.__purchaseAuthRedirecting) {
    window.__purchaseAuthRedirecting = true;
    setTimeout(function() {
      window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.href);
    }, 120);
  }
  return true;
}

async function loadOrganizations() {
  try {
    var response = await fetch(getCommonApiBase() + '/orgs', {
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('accessToken') || '') }
    });
    if (handleCommonAuthFailure(response)) return;
    var data = await response.json();
    if (data.code === 200 && data.data) {
      organizations = data.data.list || data.data;
    }
  } catch (e) {
    console.warn('后端组织API不可用，使用本地组织数据');
  }
  if (!organizations || organizations.length === 0) {
    organizations = getDefaultOrganizations();
  }
  if (organizations.length > 0 && !localStorage.getItem('currentOrg')) {
    localStorage.setItem('currentOrg', JSON.stringify(organizations[0]));
  }
  updateOrgSelectorDisplay();
}

function getDefaultOrganizations() {
  return [
    { id: 'org-001', name: '磐枢工业集团(总部)', code: 'PS-HQ', parentId: null, type: 'group' },
    { id: 'org-002', name: '磐枢智能制造有限公司', code: 'PS-SM', parentId: 'org-001', type: 'company' },
    { id: 'org-003', name: '磐枢电子科技有限公司', code: 'PS-ET', parentId: 'org-001', type: 'company' },
    { id: 'org-004', name: '磐枢注塑分厂', code: 'PS-IM', parentId: 'org-002', type: 'factory' },
    { id: 'org-005', name: '磐枢装配分厂', code: 'PS-AS', parentId: 'org-002', type: 'factory' }
  ];
}

function getOrg() {
  var stored = localStorage.getItem('currentOrg');
  if (stored) {
    return JSON.parse(stored);
  }
  return organizations.length > 0 ? organizations[0] : { id: '', name: '未选择组织', code: '' };
}

function isCleanOrg() {
  return false;
}

function setOrg(orgId) {
  var org = organizations.find(function(o) { return o.id === orgId; });
  if (org) {
    localStorage.setItem('currentOrg', JSON.stringify(org));
    showToast('已切换组织: ' + org.name, 'success');
    updateOrgSelectorDisplay();
    autoFillOrgFields();
  }
}

function getOrgSelectorHtml() {
  var currentOrg = getOrg();
  var html = '<div class="org-selector-wrapper">';
  html += '<select id="orgSelector" onchange="setOrg(this.value)" class="org-selector">';
  organizations.forEach(function(org) {
    var indent = org.parentId ? '&nbsp;&nbsp;&nbsp;' : '';
    html += '<option value="' + org.id + '"' + (currentOrg.id === org.id ? ' selected' : '') + '>';
    html += indent + org.name + ' (' + org.code + ')';
    html += '</option>';
  });
  html += '</select>';
  html += '</div>';
  return html;
}

function injectOrgSelector() {
  if (document.getElementById('orgSelector')) {
    return;
  }
  
  var pageHeader = document.querySelector('.page-header');
  var mainHeader = document.querySelector('.main-header');
  var docHeader = document.querySelector('.doc-header');
  var docToolbar = document.querySelector('.doc-toolbar');
  
  if (mainHeader) {
    var headerRight = mainHeader.querySelector('.header-right');
    if (headerRight) {
      var existingOrgSelect = headerRight.querySelector('#org-select');
      if (existingOrgSelect) {
        existingOrgSelect.parentElement.innerHTML = getOrgSelectorHtml().replace('<div class="org-selector-wrapper">', '').replace('</div>', '');
      } else {
        headerRight.insertAdjacentHTML('afterbegin', getOrgSelectorHtml().replace('<div class="org-selector-wrapper">', '').replace('</div>', ''));
      }
    }
  } else if (pageHeader) {
    var rightArea = pageHeader.querySelector('.page-actions');
    if (rightArea) {
      rightArea.insertAdjacentHTML('beforebegin', getOrgSelectorHtml());
    } else {
      pageHeader.insertAdjacentHTML('beforeend', '<div class="page-actions">' + getOrgSelectorHtml() + '</div>');
    }
  } else if (docHeader) {
    var rightArea = docHeader.querySelector('.doc-header-right');
    if (rightArea) {
      rightArea.insertAdjacentHTML('afterbegin', getOrgSelectorHtml());
    }
  }
}

function updateOrgSelectorDisplay() {
  var selector = document.getElementById('orgSelector');
  if (selector) {
    var currentOrg = getOrg();
    selector.value = currentOrg.id;
  }
}

function autoFillOrgFields() {
  var currentOrg = getOrg();
  document.querySelectorAll('.org-auto-fill').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      if (organizations.length > 0 && el.options.length <= 1) {
        el.innerHTML = organizations.map(function(org) {
          var indent = org.parentId ? '&nbsp;&nbsp;&nbsp;' : '';
          return '<option value="' + org.id + '">' + indent + org.name + ' (' + org.code + ')</option>';
        }).join('');
      }
      el.value = currentOrg.id;
    } else if (el.tagName === 'INPUT') {
      el.value = currentOrg.name;
    }
  });
  
  document.querySelectorAll('.org-code-auto-fill').forEach(function(el) {
    el.value = getOrg().code;
  });
}

async function loadMasterData(type) {
  if (masterDataCache[type] && masterDataCache[type].length > 0) {
    return masterDataCache[type];
  }
  var apiMap = {
    customers: '/customers',
    suppliers: '/suppliers',
    materials: '/materials',
    employees: '/employees',
    departments: '/departments',
    warehouses: '/warehouses',
    units: '/units'
  };
  var storageMap = {
    customers: 'erp_customers_cache',
    suppliers: 'erp_suppliers_cache',
    materials: 'erp_materials_cache',
    employees: 'erp_employees_cache',
    departments: 'erp_departments_cache',
    warehouses: 'erp_warehouses_cache',
    units: 'erp_units_cache'
  };
  var apiPath = apiMap[type];
  var storageKey = storageMap[type];
  if (!apiPath || !storageKey) return [];
  try {
    var response = await fetch(getCommonApiBase() + apiPath + '?pageSize=1000', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') }
    });
    if (handleCommonAuthFailure(response)) return [];
    var data = await response.json();
    if (data.code === 200 && data.data) {
      masterDataCache[type] = data.data.list || data.data || [];
      localStorage.setItem(storageKey, JSON.stringify(masterDataCache[type]));
      return masterDataCache[type];
    }
  } catch (e) {
    console.warn('后端' + type + 'API不可用，使用本地缓存数据');
  }
  var cached = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (cached.length > 0) {
    masterDataCache[type] = cached;
    return cached;
  }
  return [];
}

async function loadAllMasterData() {
  var types = ['customers', 'suppliers', 'materials', 'employees', 'departments', 'warehouses', 'units'];
  var promises = types.map(function(t) { return loadMasterData(t); });
  await Promise.all(promises);
}

function fillSelectOptions(selectEl, data, valueField, textField, placeholder) {
  if (!selectEl) return;
  var currentValue = selectEl.value;
  var html = '';
  if (placeholder) {
    html += '<option value="">' + placeholder + '</option>';
  }
  var nameFields = [
    textField,
    'name',
    'customerName', 'supplierName',
    'materialName', 'empName', 'employeeName',
    'deptName', 'departmentName',
    'warehouseName', 'whName',
    'unitName'
  ];
  var codeFields = [
    'code',
    'customerCode', 'supplierCode',
    'materialCode', 'empCode', 'employeeCode',
    'deptCode', 'departmentCode',
    'warehouseCode', 'whCode',
    'unitCode'
  ];
  data.forEach(function(item) {
    var val = item[valueField] || item.id || '';
    var nameVal = '';
    for (var i = 0; i < nameFields.length; i++) {
      if (item[nameFields[i]]) {
        nameVal = item[nameFields[i]];
        break;
      }
    }
    var codeVal = '';
    for (var j = 0; j < codeFields.length; j++) {
      if (item[codeFields[j]]) {
        codeVal = item[codeFields[j]];
        break;
      }
    }
    var specVal = item.specification || item.specModel || item.spec || '';
    var txt = nameVal || val;
    if (codeVal && nameVal && codeVal !== nameVal) {
      txt = codeVal + ' ' + nameVal;
    }
    if (specVal && specVal !== nameVal) {
      txt += ' (' + specVal + ')';
    }
    html += '<option value="' + val + '">' + txt + '</option>';
  });
  selectEl.innerHTML = html;
  if (currentValue) {
    selectEl.value = currentValue;
  }
}

async function initDocMasterData() {
  await loadAllMasterData();
  document.querySelectorAll('[data-master="customer"]').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      fillSelectOptions(el, masterDataCache.customers, 'id', 'name', '请选择客户');
    }
  });
  document.querySelectorAll('[data-master="supplier"]').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      fillSelectOptions(el, masterDataCache.suppliers, 'id', 'name', '请选择供应商');
    }
  });
  document.querySelectorAll('[data-master="material"]').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      fillSelectOptions(el, masterDataCache.materials, 'id', 'name', '请选择物料');
    }
  });
  document.querySelectorAll('[data-master="employee"]').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      fillSelectOptions(el, masterDataCache.employees, 'id', 'name', '请选择人员');
    }
  });
  document.querySelectorAll('[data-master="department"]').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      fillSelectOptions(el, masterDataCache.departments, 'id', 'name', '请选择部门');
    }
  });
  document.querySelectorAll('[data-master="warehouse"]').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      fillSelectOptions(el, masterDataCache.warehouses, 'id', 'name', '请选择仓库');
    }
  });
  document.querySelectorAll('[data-master="unit"]').forEach(function(el) {
    if (el.tagName === 'SELECT') {
      fillSelectOptions(el, masterDataCache.units, 'id', 'name', '请选择单位');
    }
  });
}

function showToast(message, type) {
  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  var icons = { success: '✓', warning: '!', error: '×', info: 'i' };
  var titles = { success: '操作成功', warning: '温馨提示', error: '系统提示', info: '系统提示' };
  var t = icons[type] ? type : 'info';
  var messageText = message == null ? '' : (typeof message === 'string' ? message : JSON.stringify(message));
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + t;

  var iconEl = document.createElement('div');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[t];

  var contentEl = document.createElement('div');
  contentEl.className = 'toast-content';

  var titleEl = document.createElement('div');
  titleEl.className = 'toast-title';
  titleEl.textContent = titles[t];

  var messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = messageText;

  contentEl.appendChild(titleEl);
  contentEl.appendChild(messageEl);
  toast.appendChild(iconEl);
  toast.appendChild(contentEl);
  container.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(18px)';
    setTimeout(function() { toast.remove(); }, 180);
  }, t === 'error' ? 9000 : 3000);
}



function stringifyApiErrorReason(input) {
  if (input == null || input === '') return '';
  if (Array.isArray(input)) return input.map(stringifyApiErrorReason).filter(Boolean).join('；');
  if (typeof input === 'object') {
    try { return JSON.stringify(input); } catch (e) { return String(input); }
  }
  return String(input);
}

function formatApiErrorMessage(input, context) {
  context = context || {};
  var method = context.method || 'GET';
  var path = context.path || '';
  var status = context.status ? ('HTTP ' + context.status) : '';
  var requestId = context.requestId ? ('请求ID：' + context.requestId) : '';
  var raw = stringifyApiErrorReason(input);
  var parts = [];
  if (context.action) parts.push('动作：' + context.action);
  if (path) parts.push('接口：' + method + ' ' + path);
  if (status) parts.push(status);
  if (raw) parts.push('原因：' + raw);
  if (requestId) parts.push(requestId);
  return parts.join('\n');
}

function createApiError(path, method, status, payload, fallback, action) {
  var message = payload && (payload.message || payload.error || payload.detail);
  var requestId = payload && payload.requestId;
  return new Error(formatApiErrorMessage(message || fallback || '接口请求失败', {
    path: path,
    method: method || 'GET',
    status: status,
    requestId: requestId,
    action: action
  }));
}

function showConfirm(message, type, callback) {
  if (typeof type === 'function') {
    callback = type;
    type = 'warning';
  }
  if (!type) type = 'warning';
  console.log('[showConfirm] 开始, message:', message, 'type:', type);
  var modal = document.getElementById('confirmModal');
  if (!modal) {
    console.log('[showConfirm] confirmModal不存在, 调用createConfirmModal');
    createConfirmModal();
  }
  setTimeout(function() {
    var msgEl = document.getElementById('confirmMessage') || document.getElementById('confirmBody');
    var titleEl = document.getElementById('confirmTitle');
    var iconEl = document.getElementById('confirmIcon');
    var modalEl = document.getElementById('confirmModal');
    if (!msgEl) {
      console.error('[showConfirm] 消息元素缺失!');
      return;
    }
    msgEl.textContent = message;
    if (titleEl) {
      titleEl.textContent = (type === 'warning') ? '温馨提示' : '系统提示';
    }
    if (iconEl) {
      iconEl.innerHTML = (type === 'warning') ? '&#9888;' : '&#10060;';
    }
    confirmCallback = callback;
    modalEl.classList.add('show');
    console.log('[showConfirm] 已添加show类, className:', modalEl.className);
  }, 10);
}

function closeConfirmModal(result) {
  document.getElementById('confirmModal').classList.remove('show');
  if (confirmCallback) {
    confirmCallback(result);
    confirmCallback = null;
  }
}

function createConfirmModal() {
  if (document.getElementById('confirmModal')) return;
  var html = '<div class="confirm-modal-overlay" id="confirmModal"><div class="confirm-modal-dialog"><div class="confirm-modal-header"><span class="confirm-modal-icon" id="confirmIcon">&#9888;</span><span class="confirm-modal-title" id="confirmTitle">温馨提示</span></div><div class="confirm-modal-body"><div class="confirm-modal-message" id="confirmMessage"></div></div><div class="confirm-modal-footer"><button class="btn-cancel" onclick="closeConfirmModal(false)">取消</button><button class="btn-confirm" onclick="closeConfirmModal(true)">确定</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
  console.log('[createConfirmModal] 确认对话框已创建, 元素存在:', !!document.getElementById('confirmModal'));
}

function toggleGroup(e, el) {
  var targetEl = el || e;
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
    e.preventDefault();
    if (!el) {
      targetEl = e.currentTarget || e.target;
    }
  }
  if (!targetEl) return;
  var group = targetEl.closest('.sidebar-menu-group');
  if (group) {
    group.classList.toggle('open');
    var arrow = targetEl.querySelector('.arrow');
    if (arrow) {
      arrow.textContent = group.classList.contains('open') ? '\u25BC' : '\u25B6';
    }
  }
}

function getPagePath(fileName) {
  var isInPagesDir = window.location.pathname.includes('/pages/');
  var isInAdminDir = window.location.pathname.includes('/admin/');
  if (isInPagesDir || isInAdminDir) {
    return fileName;
  }
  return 'pages/' + fileName;
}

function getSidebarMenuHtml(activeModule) {
  var activeClass = activeModule ? ' class="active"' : '';
  var pp = getPagePath;
  return `
  <nav class="sidebar-menu">
    <div class="sidebar-menu-item${activeModule === 'home' ? ' active' : ''}" data-module="home" onclick="showModule('home')">
      <span class="icon">&#128202;</span> 首页工作台
    </div>

    <div class="sidebar-section-title">业务模块</div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128230;</span> 供应链
        <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('sales')"><span class="icon"></span>销售管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('purchase')"><span class="icon"></span>采购管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('inventory')"><span class="icon"></span>库存管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('planning')"><span class="icon"></span>计划管理</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#127981;</span> 生产制造
        <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('engineering')"><span class="icon"></span>工程数据</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('production')"><span class="icon"></span>生产管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('outsource')"><span class="icon"></span>委外管理</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#9989;</span> MES执行
        <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('mes')"><span class="icon"></span>智慧车间</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('mes-equipment')"><span class="icon"></span>设备云</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#9989;</span> 质量管理
        <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality')"><span class="icon"></span>日常检验</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality-ncr')"><span class="icon"></span>不良品处理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality-mrb')"><span class="icon"></span>MRB评审</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality-inspect')"><span class="icon"></span>请检管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality-report')"><span class="icon"></span>质量报表</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality-master')"><span class="icon"></span>基础资料</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality-std')"><span class="icon"></span>国标资料</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('quality-param')"><span class="icon"></span>参数设置</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128176;</span> 财务会计
        <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-gl')"><span class="icon"></span>总账</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-report')"><span class="icon"></span>报表</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-ar')"><span class="icon"></span>应收管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-ap')"><span class="icon"></span>应付管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-cashier')"><span class="icon"></span>出纳管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-expense')"><span class="icon"></span>费用管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-merge')"><span class="icon"></span>合并报表</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-inventory')"><span class="icon"></span>存货核算</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-cost')"><span class="icon"></span>成本核算</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-fa')"><span class="icon"></span>固定资产</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('finance-platform')"><span class="icon"></span>会计平台</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#9638;</span> PLM管理 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('plm-coding.html')}'">编码管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('plm-rd-material.html')}'">研发物料</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('plm-project.html')}'">项目管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('plm-process-design.html')}'">工艺设计</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('plm-document.html')}'">图文档管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('plm-ecr.html')}'">变更管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('plm-knowledge-base.html')}'">知识库</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128230;</span> 售后管理 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('service-request.html')}'">售后申请</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('service-dispatch.html')}'">派工管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('service-record.html')}'">服务记录</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('service-return.html')}'">售后退货</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('service-report.html')}'">售后报表</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128189;</span> 条码管理 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('barcode-config.html')}'">条码配置</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('barcode-print.html')}'">条码打印</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('barcode-scan.html')}'">扫码作业</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('barcode-trace.html')}'">条码追溯</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#129309;</span> CRM管理 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('crm-customer.html')}'">客户管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('crm-contact.html')}'">联系人</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('crm-opportunity.html')}'">商机管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('crm-pipeline.html')}'">销售管道</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('crm-customer-360.html')}'">客户360视图</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('crm-activity.html')}'">活动管理</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128101;</span> HR管理 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-employee.html')}'">员工管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-org.html')}'">组织架构</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-attendance.html')}'">考勤管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-performance.html')}'">绩效考核</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-compensation.html')}'">薪酬管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-recruitment.html')}'">招聘管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-contract.html')}'">合同管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-social-insurance.html')}'">社保管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-tax.html')}'">个税管理</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('hr-training.html')}'">培训管理</a>
      </div>
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128295;</span> 设备管理 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('equipment-maintenance.html')}'">设备保养</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('equipment-check.html')}'">设备点检</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('equipment-calibration.html')}'">设备校准</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('equipment-statistics.html')}'">设备统计</a>
      </div>
    </div>

    <div class="sidebar-section-title">综合管理</div>

    <div class="sidebar-menu-item" data-module="dashboard" onclick="showModule('dashboard')">
      <span class="icon">&#128203;</span> 驾驶舱
    </div>

    <div class="sidebar-menu-item" onclick="window.location.href='${pp('risk-center.html')}'">
      <span class="icon">&#9888;</span> 风险预警中心
    </div>
    <div class="sidebar-menu-item" onclick="window.location.href='${pp('optimization.html')}'">
      <span class="icon">&#10004;</span> 优化建议中心
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128200;</span> 决策大屏 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('decision-sales.html')}'">销售决策</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('decision-production.html')}'">生产决策</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('decision-quality.html')}'">质量决策</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('decision-inventory.html')}'">库存决策</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('decision-finance.html')}'">财务决策</a>
      </div>
    </div>

    <div class="sidebar-menu-item" onclick="showModule('ai')">
      <span class="icon">&#129302;</span> AI智能助手
    </div>
    <div class="sidebar-menu-item" onclick="showModule('ai-analysis')">
      <span class="icon">&#128200;</span> 智能分析中心
    </div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128202;</span> BI报表 <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('bi-report-designer.html')}'">报表设计器</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('bi-dashboard.html')}'">自定义看板</a>
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='${pp('bi-subscription.html')}'">报表订阅</a>
      </div>
    </div>

    <div class="sidebar-section-title">系统</div>

    <div class="sidebar-menu-group">
      <div class="sidebar-menu-item" onclick="toggleGroup(event, this)">
        <span class="icon">&#128194;</span> 基础资料
        <span class="arrow">&#9654;</span>
      </div>
      <div class="sub-menu">
        <a class="sidebar-menu-item" href="javascript:void(0)" onclick="showModule('master-data')"><span class="icon"></span>全部资料</a>
      </div>
    </div>

    <div class="sidebar-menu-item" onclick="showModule('business-rule')">
      <span class="icon">&#128203;</span> 业务规则
    </div>

    <div class="sidebar-menu-item" onclick="showModule('aux-data')">
      <span class="icon">&#128194;</span> 辅助资料
    </div>

    <div class="sidebar-menu-item" onclick="showModule('settings')">
      <span class="icon">&#9881;</span> 系统设置
    </div>

    <a class="sidebar-menu-item" href="javascript:void(0)" onclick="window.location.href='/admin/index.html'">
      <span class="icon">&#128187;</span> 管理端
    </a>
  </nav>`;
}

function initSidebar() {
  if (window.location.pathname.includes('/admin/')) {
    return;
  }
  var sidebar = document.getElementById('sidebar');
  if (sidebar) {
    var sidebarMenu = sidebar.querySelector('.sidebar-menu');
    if (sidebarMenu) {
      sidebarMenu.outerHTML = getSidebarMenuHtml();
    }
  }
  initSidebarScroll();
}

function initSidebarScroll() {
  var sidebarMenu = document.querySelector('.sidebar-menu');
  if (sidebarMenu) {
    sidebarMenu.style.overflowY = 'auto';
    sidebarMenu.style.maxHeight = 'calc(100vh - 180px)';
  }
}

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var mainContent = document.getElementById('mainContent');
  if (sidebar) sidebar.classList.toggle('collapsed');
  if (mainContent) mainContent.classList.toggle('expanded');
}

function showModule(m) {
  var basePath = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/') ? '../index.html' : 'index.html';
  window.location.href = basePath + '?module=' + m;
}

function showPage(pageUrl) {
  window.location.href = pageUrl;
}

function handleBreadcrumbClick(url) {
  if (url && url !== '#') {
    window.location.href = url;
  }
}

async function initCommon() {
  initSidebar();
  createConfirmModal();
  // 管理中心不需要组织选择，独立运行
  if (window.location.pathname.includes('/admin/')) {
    return;
  }
  await loadOrganizations();
  injectOrgSelector();
  autoFillOrgFields();
  
  var hasMasterSelects = document.querySelector('[data-master]');
  var hasDetailTable = document.querySelector('.detail-table, #detailTable');
  if (hasMasterSelects || hasDetailTable) {
    await initDocMasterData();
  }

  document.querySelectorAll('.breadcrumb a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var url = this.getAttribute('href');
      handleBreadcrumbClick(url);
    });
  });

  document.querySelectorAll('[href="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
    });
  });

  document.querySelectorAll('[data-action]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var action = this.getAttribute('data-action');
      if (action) {
        executeAction(action, this);
      }
    });
  });
}

function executeAction(action, element) {
  try {
    switch(action) {
      case 'save':
        showToast('保存成功', 'success');
        break;
      case 'submit':
        showConfirm('确认提交审核？', 'warning', function(result) {
          if (result) showToast('已提交审核', 'success');
        });
        break;
      case 'audit':
        showConfirm('确认审核通过？', 'warning', function(result) {
          if (result) showToast('审核通过', 'success');
        });
        break;
      case 'delete':
        showConfirm('确认删除？', 'error', function(result) {
          if (result) showToast('删除成功', 'success');
        });
        break;
      case 'refresh':
        location.reload();
        break;
      case 'export':
        showToast('导出功能', 'info');
        break;
      case 'import':
        showToast('导入功能', 'info');
        break;
      case 'print':
        showToast('打印功能', 'info');
        break;
      case 'add':
        showToast('新增功能', 'info');
        break;
      case 'close':
        showConfirm('确认退出？', 'warning', function(result) {
          if (result) window.history.back();
        });
        break;
      default:
        showToast('功能开发中: ' + action, 'info');
    }
  } catch(e) {
    console.error('Action error:', e);
    showToast('操作失败: ' + e.message, 'error');
  }
}

function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    modal.classList.add('show');
  } else {
    console.error('Modal not found:', id);
  }
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    modal.classList.remove('show');
  }
}

function getUrlParam(name) {
  var url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function exitPage() {
  showConfirm('确认退出？', 'warning', function(result) {
    if (result) window.history.back();
  });
}

function exitDoc() {
  showConfirm('确认退出？', 'warning', function(result) {
    if (result) window.history.back();
  });
}

function openLookup(fieldId, type) {
  showToast('查找功能开发中', 'info');
}

function validateDoc(docType) {
  var errors = [];
  var detailRows = document.querySelectorAll('#detailBody tr');
  if (!detailRows || detailRows.length === 0) {
    errors.push('请至少添加一条明细数据');
    showToast(errors.join('\n'), 'error');
    return false;
  }
  
  var hasValidDetail = false;
  var hasMaterial = false;
  detailRows.forEach(function(row) {
    var qtyField = row.querySelector('[data-field="数量"]') || row.querySelector('[data-field="qty"]');
    var materialField = row.querySelector('[data-field="物料编码"]') || row.querySelector('[data-field="物料"]') || row.querySelector('[data-field="materialCode"]');
    if (qtyField && qtyField.value && parseFloat(qtyField.value) > 0) {
      hasValidDetail = true;
    }
    if (materialField && materialField.value) {
      hasMaterial = true;
    }
  });
  
  if (!hasMaterial) {
    errors.push('明细行中至少需要有一条已选择物料的记录');
  }
  if (!hasValidDetail) {
    errors.push('明细行中至少需要有一条数量大于0的记录');
  }
  
  var normalizedDocType = docType.replace(/_/g, '-');
  var requiredFields = {
    'production-material-request': ['生产订单', '组织', '仓库'],
    'production-material-issue': ['生产订单', '组织', '仓库'],
    'production-material-return': ['生产订单', '组织', '仓库'],
    'production-inbound': ['生产订单', '组织', '仓库'],
    'production-order': ['产品编码', '组织', '数量'],
    'purchase-order': ['供应商', '组织', '币别'],
    'purchase-request': ['物料编码', '组织', '需求数量'],
    'purchase-receive': ['供应商', '组织', '仓库'],
    'purchase-inbound': ['供应商', '组织', '仓库'],
    'sales-order': ['客户', '组织', '销售部门'],
    'sales-outbound': ['客户', '组织', '仓库'],
    'sales-delivery': ['客户', '组织', '仓库'],
    'sales-quotation': ['客户', '组织'],
    'inventory-in': ['仓库', '组织'],
    'inventory-out': ['仓库', '组织'],
    'quality-inspect': ['检验类型', '组织'],
    'quality-mrb': ['组织'],
    'quality-ncr': ['组织'],
    'production-inspect': ['生产订单', '组织']
  };
  
  var fieldsToCheck = requiredFields[normalizedDocType] || [];
  fieldsToCheck.forEach(function(fieldName) {
    var el = document.getElementById('field_' + fieldName);
    if (el && !el.value) {
      errors.push('请填写' + fieldName);
    }
  });
  
  var docDate = document.getElementById('field_日期');
  if (docDate && !docDate.value) {
    errors.push('请填写单据日期');
  }
  
  var orgField = document.getElementById('field_组织');
  if (orgField && !orgField.value) {
    errors.push('请选择组织');
  }
  
  if (errors.length > 0) {
    showToast(errors.join('\n'), 'error');
    return false;
  }
  return true;
}

function submitDoc() {
  showConfirm('确认提交审核？', 'warning', function(result) {
    if (result) showToast('已提交审核', 'success');
  });
}

function reverseApproveDoc() {
  showConfirm('确认撤销审批？', 'warning', function(result) {
    if (result) showToast('已撤销审批', 'success');
  });
}

function selectSourceDoc() {
  showToast('选择源单据功能开发中', 'info');
}

function saveDoc() {
  showToast('保存成功', 'success');
}

function editDoc(id) {
  showToast('编辑功能开发中', 'info');
}

function deleteDoc(id) {
  showConfirm('确认删除？', 'error', function(result) {
    if (result) showToast('删除成功', 'success');
  });
}

function viewDetail(id) {
  showToast('查看详情功能开发中', 'info');
}

function goToList() {
  showToast('返回列表功能开发中', 'info');
}

function dispatchDoc(id) {
  showToast('派工功能开发中', 'info');
}

function pushDownDoc(id) {
  showToast('下推功能开发中', 'info');
}

function prevDoc() {
  showToast('上一张功能开发中', 'info');
}

function nextDoc() {
  showToast('下一张功能开发中', 'info');
}

function closeDoc() {
  showConfirm('确认关闭？', function(result) {
    if (result) window.history.back();
  });
}

function handleActionBtn(el) {
  var action = el.textContent.trim();
  switch(action) {
    case '新增':
      showToast('新增功能开发中', 'info');
      break;
    case '编辑':
      showToast('编辑功能开发中', 'info');
      break;
    case '删除':
      showConfirm('确认删除？', function(result) {
        if (result) showToast('删除成功', 'success');
      });
      break;
    case '退出':
      showConfirm('确认退出？', function(result) {
        if (result) window.location.href = '../index.html';
      });
      break;
    default:
      showToast(action + '功能开发中', 'info');
  }
}

function initPurchaseSidebarExit() {
  var pageName = window.location.pathname.split('/').pop() || '';
  if (!/^purchase-.*\.html$/i.test(pageName)) return;

  var sidebar = document.querySelector('.doc-sidebar, .sidebar');
  if (!sidebar || sidebar.querySelector('.purchase-sidebar-exit')) return;

  var background = window.getComputedStyle(sidebar).backgroundColor.match(/[\d.]+/g) || [];
  var red = Number(background[0] || 0);
  var green = Number(background[1] || 0);
  var blue = Number(background[2] || 0);
  if ((red * 299 + green * 587 + blue * 114) / 1000 > 160) {
    sidebar.classList.add('purchase-sidebar-light');
  }

  var exitLink = document.createElement('a');
  exitLink.className = 'purchase-sidebar-exit';
  exitLink.href = '../index.html';
  exitLink.setAttribute('aria-label', '返回 ERP 工作台');
  exitLink.innerHTML = '<span class="purchase-sidebar-exit-icon" aria-hidden="true">&larr;</span><span>返回 ERP 工作台</span>';

  var userPanel = sidebar.querySelector(':scope > .sidebar-user');
  if (userPanel) {
    sidebar.insertBefore(exitLink, userPanel);
  } else {
    sidebar.appendChild(exitLink);
  }
}

var purchaseRowActionSequence = 0;
var purchaseOpenRowActionMenu = null;

function renderPurchaseRowActionMenu(actionHtml, label) {
  if (!actionHtml || !String(actionHtml).trim()) return '';
  purchaseRowActionSequence += 1;
  var id = 'purchaseRowActionMenu-' + purchaseRowActionSequence;
  return '<div class="purchase-row-actions">' +
    '<button class="purchase-row-action-trigger" type="button" aria-label="' + (label || '更多操作') + '" aria-haspopup="menu" aria-expanded="false" aria-controls="' + id + '" title="' + (label || '更多操作') + '" onclick="togglePurchaseRowActionMenu(event,this)"><span aria-hidden="true">&#8942;</span></button>' +
    '<div class="purchase-row-action-menu" id="' + id + '" role="menu">' + actionHtml + '</div>' +
    '</div>';
}

function closePurchaseRowActionMenu(restoreFocus) {
  var menu = purchaseOpenRowActionMenu;
  if (!menu) return;
  var owner = menu._purchaseOwner;
  var trigger = owner && owner.querySelector('.purchase-row-action-trigger');
  menu.classList.remove('show');
  menu.removeAttribute('style');
  if (owner) owner.appendChild(menu);
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  purchaseOpenRowActionMenu = null;
  if (restoreFocus && trigger) trigger.focus();
}

function togglePurchaseRowActionMenu(event, trigger) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  var owner = trigger && trigger.closest('.purchase-row-actions');
  var menu = owner && (owner._purchaseMenu || owner.querySelector('.purchase-row-action-menu'));
  if (!owner || !menu) return;
  if (purchaseOpenRowActionMenu === menu) return closePurchaseRowActionMenu(false);
  closePurchaseRowActionMenu(false);
  owner._purchaseMenu = menu;
  menu._purchaseOwner = owner;
  document.body.appendChild(menu);
  menu.classList.add('show');
  trigger.setAttribute('aria-expanded', 'true');
  purchaseOpenRowActionMenu = menu;

  var rect = trigger.getBoundingClientRect();
  var menuRect = menu.getBoundingClientRect();
  var left = Math.max(8, Math.min(window.innerWidth - menuRect.width - 8, rect.right - menuRect.width));
  var top = rect.bottom + 4;
  if (top + menuRect.height > window.innerHeight - 8) top = Math.max(8, rect.top - menuRect.height - 4);
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';

  var items = menu.querySelectorAll('button,a');
  items.forEach(function(item) {
    item.setAttribute('role', 'menuitem');
    if (/删除|取消|关闭|驳回/.test(item.textContent || '')) item.classList.add('danger');
  });
}

document.addEventListener('click', function(event) {
  if (!purchaseOpenRowActionMenu) return;
  if (event.target.closest('.purchase-row-action-menu')) {
    if (event.target.closest('button,a')) setTimeout(function() { closePurchaseRowActionMenu(false); }, 0);
    return;
  }
  if (!event.target.closest('.purchase-row-action-trigger')) closePurchaseRowActionMenu(false);
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && purchaseOpenRowActionMenu) {
    event.preventDefault();
    closePurchaseRowActionMenu(true);
  }
});

window.addEventListener('resize', function() { closePurchaseRowActionMenu(false); });
window.addEventListener('scroll', function() { closePurchaseRowActionMenu(false); }, true);

document.addEventListener('DOMContentLoaded', function() {
  initCommon();
  initPurchaseSidebarExit();
});
