#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

PAGES_DIR = r"D:\开发测试\hub-erp-v0\traewordp\pages"

def generate_material_page():
    html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>物料管理 - 基础资料</title>
<link rel="stylesheet" href="../common.css">
<script src="../common.js"></script>
<style>
.page-header { margin-bottom: 0; }
.search-area { background: #fff; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px; }
.search-row { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
.search-item { display: flex; align-items: center; gap: 8px; }
.search-item label { font-size: 13px; color: #666; }
.search-item input, .search-item select { padding: 6px 10px; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 13px; }
.search-btn { padding: 6px 16px; background: #1890ff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.search-btn:hover { background: #40a9ff; }
.table-wrapper { background: #fff; border-radius: 6px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e8e8e8; font-size: 13px; }
.data-table th { background: #fafafa; font-weight: 600; color: #333; }
.data-table tr:hover { background: #f5f5f5; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.badge-success { background: #f6ffed; color: #52c41a; }
.badge-warning { background: #fffbe6; color: #faad14; }

.modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:flex-start; padding-top:40px; }
.modal-overlay.show { display:flex; }
.modal-dialog { background:#fff; border:1px solid #e8e8e8; border-radius:4px; width:920px; max-height:85vh; overflow-y:auto; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #e8e8e8; position:sticky; top:0; background:#fff; z-index:2; }
.modal-title { font-size:16px; font-weight:600; color:#333; }
.modal-close { cursor:pointer; font-size:22px; color:#666; background:none; border:none; line-height:1; padding:0 4px; }
.modal-close:hover { color:#f5222d; }
.modal-body { padding:0; }
.modal-footer { display:flex; justify-content:flex-end; gap:8px; padding:12px 20px; border-top:1px solid #e8e8e8; }

.modal-toolbar { display:flex; align-items:center; gap:0; padding:6px 20px; background:#f5f5f5; border-bottom:1px solid #e8e8e8; }
.modal-tool-btn { display:flex; align-items:center; gap:4px; padding:6px 14px; border:none; background:transparent; font-size:13px; color:#333; cursor:pointer; border-radius:4px; transition:all 0.2s; white-space:nowrap; }
.modal-tool-btn:hover { background:#e8e8e8; }
.modal-tool-btn.primary { color:#1890ff; font-weight:500; }
.modal-tool-btn.danger { color:#f5222d; }
.modal-tool-separator { width:1px; height:20px; background:#e8e8e8; margin:0 4px; }

.form-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px 16px; padding:20px; }
.form-grid .form-group { margin-bottom:0; }
.form-grid .full-row { grid-column:1/-1; }

.tab-header { display:flex; border-bottom:1px solid #e8e8e8; background:#fafafa; }
.tab-item { padding:12px 20px; cursor:pointer; font-size:13px; color:#666; border-bottom:2px solid transparent; transition:all 0.2s; }
.tab-item:hover { color:#1890ff; }
.tab-item.active { color:#1890ff; border-bottom-color:#1890ff; background:#fff; }
.tab-content { display:none; }
.tab-content.active { display:block; }

.column-settings-modal { width:400px; }
.column-settings-list { max-height:300px; overflow-y:auto; }
.column-setting-item { display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #f0f0f0; }
.column-setting-item:hover { background:#f5f5f5; }
.column-setting-item label { font-size:13px; color:#333; cursor:pointer; flex:1; }
.column-setting-item input[type="checkbox"] { width:16px; height:16px; }
</style>
</head>
<body>
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <img src="../images/logo.png" alt="磐枢工业智能平台" style="width: 100%; max-width: 200px; margin-bottom: 8px;">
    <h1 style="font-size: 16px; margin: 0;">磐枢HubPang</h1>
  </div>
  <nav class="sidebar-menu"></nav>
  <div class="sidebar-user"><div class="avatar">管理员</div></div>
</aside>
<div class="main-content" id="mainContent">
  <div class="page-header">
    <div>
      <div class="flex items-center gap-8">
        <button class="sidebar-toggle" onclick="toggleSidebar()">&#9776;</button>
        <div>
          <h2>物料管理</h2>
          <div class="breadcrumb"><a href="../index.html">首页</a> <span>/</span> <span>基础资料</span></div>
        </div>
      </div>
    </div>
    <div class="page-actions"></div>
  </div>

  <div class="list-action-bar">
    <button class="action-btn primary-action" onclick="openMatModal('add')">+ 新增</button>
    <button class="action-btn" onclick="editSelected()">编辑</button>
    <button class="action-btn danger-action" onclick="deleteSelected()">删除</button>
    <button class="action-btn success-action" onclick="auditSelected()">审核</button>
    <button class="action-btn" onclick="unAuditSelected()">反审核</button>
    <div class="action-separator"></div>
    <button class="action-btn" onclick="searchData()">查询</button>
    <button class="action-btn" onclick="refreshData()">刷新</button>
    <button class="action-btn" onclick="exportData()">导出</button>
    <button class="action-btn" onclick="importData()">导入</button>
    <button class="action-btn" onclick="openColumnSettings()">显示/隐藏</button>
  </div>

  <div class="page-body">
    <div class="search-area">
      <div class="search-row">
        <div class="search-item"><label>物料编码</label><input type="text" placeholder="请输入物料编码"></div>
        <div class="search-item"><label>物料名称</label><input type="text" placeholder="请输入物料名称"></div>
        <div class="search-item"><label>物料类别</label><input type="text" placeholder="请输入物料类别"></div>
        <div class="search-item"><label>状态</label><select><option>全部状态</option><option>已启用</option><option>未启用</option></select></div>
      </div>
      <button class="search-btn" onclick="searchData()">查询</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" onclick="selectAll()"></th>
            <th>物料编码</th><th>物料名称</th><th>规格型号</th><th>物料类别</th><th>基本单位</th><th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><input type="checkbox" value="1"></td><td>P-001</td><td>智能控制器</td><td>IC-2024</td><td>成品</td><td>个</td><td><span class="badge badge-success">已启用</span></td></tr>
          <tr><td><input type="checkbox" value="2"></td><td>P-002</td><td>传感器模块</td><td>SM-2024</td><td>半成品</td><td>个</td><td><span class="badge badge-success">已启用</span></td></tr>
          <tr><td><input type="checkbox" value="3"></td><td>P-003</td><td>金属外壳</td><td>MC-2024</td><td>原材料</td><td>个</td><td><span class="badge badge-success">已启用</span></td></tr>
          <tr><td><input type="checkbox" value="4"></td><td>P-004</td><td>电路板</td><td>PCB-2024</td><td>半成品</td><td>块</td><td><span class="badge badge-success">已启用</span></td></tr>
          <tr><td><input type="checkbox" value="5"></td><td>P-005</td><td>螺丝</td><td>Screw-M3</td><td>原材料</td><td>个</td><td><span class="badge badge-success">已启用</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 新增/编辑弹窗 -->
  <div class="modal-overlay" id="matModal">
    <div class="modal-dialog">
      <div class="modal-header">
        <div class="modal-title" id="matModalTitle">新增物料</div>
        <button class="modal-close" onclick="closeModal('matModal')">×</button>
      </div>
      <div class="modal-toolbar">
        <button class="modal-tool-btn" onclick="resetForm()">↺ 重置</button>
        <button class="modal-tool-btn primary" onclick="saveItem()">✓ 保存</button>
        <button class="modal-tool-btn" onclick="submitItem()">提交</button>
        <button class="modal-tool-btn" onclick="auditItem()">审核</button>
        <button class="modal-tool-btn" onclick="unAuditItem()">反审核</button>
        <div class="modal-tool-separator"></div>
        <button class="modal-tool-btn" onclick="closeModal('matModal')">关闭</button>
      </div>
      <div class="modal-body">
        <div class="tab-header">
          <div class="tab-item active" onclick="switchTab('basic')">基本</div>
          <div class="tab-item" onclick="switchTab('purchase')">采购</div>
          <div class="tab-item" onclick="switchTab('inventory')">库存</div>
          <div class="tab-item" onclick="switchTab('production')">生产</div>
          <div class="tab-item" onclick="switchTab('sales')">销售</div>
          <div class="tab-item" onclick="switchTab('planning')">计划</div>
          <div class="tab-item" onclick="switchTab('quality')">质量</div>
        </div>

        <form id="matModalForm">
          <input type="hidden" id="matModalId">

          <!-- 基本信息 -->
          <div class="tab-content active" id="tab-basic">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">物料编码 <span style="color:#f5222d;">*</span></label><input type="text" class="form-input" id="matCode" placeholder="请输入物料编码"></div>
              <div class="form-group"><label class="form-label">物料名称 <span style="color:#f5222d;">*</span></label><input type="text" class="form-input" id="matName" placeholder="请输入物料名称"></div>
              <div class="form-group"><label class="form-label">创建组织 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matCreateOrg"><option value="磐枢智能制造有限公司">磐枢智能制造有限公司</option></select></div>
              <div class="form-group"><label class="form-label">使用组织 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matUseOrg"><option value="磐枢智能制造有限公司">磐枢智能制造有限公司</option></select></div>
              <div class="form-group"><label class="form-label">规格型号</label><input type="text" class="form-input" id="matSpec" placeholder="请输入规格型号"></div>
              <div class="form-group"><label class="form-label">助记码</label><input type="text" class="form-input" id="matMnemonic" placeholder="请输入助记码"></div>
              <div class="form-group"><label class="form-label">物料属性 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matProperty"><option value="外购">外购</option><option value="自制">自制</option><option value="委外">委外</option><option value="虚拟件">虚拟件</option></select></div>
              <div class="form-group"><label class="form-label">基本单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matBaseUnit"><option value="个">个</option><option value="件">件</option><option value="千克">千克</option><option value="米">米</option><option value="升">升</option></select></div>
              <div class="form-group"><label class="form-label">存货类别 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matCategory"><option value="原材料">原材料</option><option value="半成品">半成品</option><option value="成品">成品</option></select></div>
              <div class="form-group"><label class="form-label">允许库存</label><select class="form-select" id="matIsInventory"><option value="是">是</option><option value="否">否</option></select></div>
              <div class="form-group"><label class="form-label">允许销售</label><select class="form-select" id="matIsSale"><option value="是">是</option><option value="否">否</option></select></div>
              <div class="form-group"><label class="form-label">允许采购</label><select class="form-select" id="matIsPurchase"><option value="是">是</option><option value="否">否</option></select></div>
              <div class="form-group"><label class="form-label">允许生产</label><select class="form-select" id="matIsProduce"><option value="是">是</option><option value="否">否</option></select></div>
              <div class="form-group"><label class="form-label">允许委外</label><select class="form-select" id="matIsSubContract"><option value="是">是</option><option value="否">否</option></select></div>
              <div class="form-group"><label class="form-label">套件 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matSuite"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">特征件子项 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matFeatureItem"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">默认税率(%)</label><input type="number" class="form-input" id="matTaxRate" placeholder="请输入默认税率"></div>
              <div class="form-group"><label class="form-label">毛重</label><input type="number" class="form-input" id="matGrossWeight" placeholder="请输入毛重"></div>
              <div class="form-group"><label class="form-label">净重</label><input type="number" class="form-input" id="matNetWeight" placeholder="请输入净重"></div>
              <div class="form-group"><label class="form-label">长</label><input type="number" class="form-input" id="matLength" placeholder="请输入长度"></div>
              <div class="form-group"><label class="form-label">宽</label><input type="number" class="form-input" id="matWidth" placeholder="请输入宽度"></div>
              <div class="form-group"><label class="form-label">高</label><input type="number" class="form-input" id="matHeight" placeholder="请输入高度"></div>
              <div class="form-group"><label class="form-label">体积</label><input type="number" class="form-input" id="matVolume" placeholder="请输入体积"></div>
              <div class="form-group full-row"><label class="form-label">描述</label><textarea class="form-textarea" id="matDesc" placeholder="请输入描述"></textarea></div>
            </div>
          </div>

          <!-- 采购信息 -->
          <div class="tab-content" id="tab-purchase">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">采购单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matPurUnit"><option value="个">个</option><option value="件">件</option><option value="千克">千克</option></select></div>
              <div class="form-group"><label class="form-label">采购计价单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matPurPriceUnit"><option value="个">个</option><option value="件">件</option><option value="千克">千克</option></select></div>
              <div class="form-group"><label class="form-label">配额方式 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matQuotaType"><option value="无">无</option><option value="比例配额">比例配额</option><option value="数量配额">数量配额</option></select></div>
              <div class="form-group"><label class="form-label">采购员</label><input type="text" class="form-input" id="matPurchaser" placeholder="请输入采购员"></div>
              <div class="form-group"><label class="form-label">默认供应商</label><input type="text" class="form-input" id="matDefaultVendor" placeholder="请输入默认供应商"></div>
              <div class="form-group"><label class="form-label">货源控制</label><select class="form-select" id="matIsSourceControl"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">需要请购</label><select class="form-select" id="matIsPR"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">收货提前天数</label><input type="number" class="form-input" id="matReceiveAdvanceDays" placeholder="请输入收货提前天数"></div>
              <div class="form-group"><label class="form-label">收货延迟天数</label><input type="number" class="form-input" id="matReceiveDelayDays" placeholder="请输入收货延迟天数"></div>
              <div class="form-group"><label class="form-label">收货下限比例(%)</label><input type="number" class="form-input" id="matReceiveMinScale" placeholder="请输入收货下限比例"></div>
              <div class="form-group"><label class="form-label">收货上限比例(%)</label><input type="number" class="form-input" id="matReceiveMaxScale" placeholder="请输入收货上限比例"></div>
              <div class="form-group"><label class="form-label">最小拆分数量</label><input type="number" class="form-input" id="matMinSplitQty" placeholder="请输入最小拆分数量"></div>
              <div class="form-group"><label class="form-label">最小包装数</label><input type="number" class="form-input" id="matMinPackCount" placeholder="请输入最小包装数"></div>
              <div class="form-group"><label class="form-label">采购提前期(天)</label><input type="number" class="form-input" id="matPurLeadTime" placeholder="请输入采购提前期"></div>
              <div class="form-group"><label class="form-label">采购最小批量</label><input type="number" class="form-input" id="matPurMinQty" placeholder="请输入采购最小批量"></div>
              <div class="form-group"><label class="form-label">采购批量增量</label><input type="number" class="form-input" id="matPurIncQty" placeholder="请输入采购批量增量"></div>
              <div class="form-group"><label class="form-label">供应商资质</label><select class="form-select" id="matIsVendorQualification"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">允许退料</label><select class="form-select" id="matIsReturnMaterial"><option value="否">否</option><option value="是">是</option></select></div>
            </div>
          </div>

          <!-- 库存信息 -->
          <div class="tab-content" id="tab-inventory">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">库存单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matStoreUnit"><option value="个">个</option><option value="件">件</option><option value="千克">千克</option></select></div>
              <div class="form-group"><label class="form-label">辅助单位</label><select class="form-select" id="matAuxUnit"><option value="">无</option><option value="个">个</option><option value="件">件</option></select></div>
              <div class="form-group"><label class="form-label">币别 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matCurrency"><option value="人民币">人民币</option><option value="美元">美元</option></select></div>
              <div class="form-group"><label class="form-label">换算方向 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matConvertDir"><option value="主单位到辅单位">主单位到辅单位</option><option value="辅单位到主单位">辅单位到主单位</option></select></div>
              <div class="form-group"><label class="form-label">启用批号管理</label><select class="form-select" id="matIsBatchManage"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">启用保质期管理</label><select class="form-select" id="matIsKFPeriod"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">保质期(天)</label><input type="number" class="form-input" id="matExpPeriod" placeholder="请输入保质期"></div>
              <div class="form-group"><label class="form-label">保质期单位</label><select class="form-select" id="matExpUnit"><option value="天">天</option><option value="月">月</option><option value="年">年</option></select></div>
              <div class="form-group"><label class="form-label">启用序列号管理</label><select class="form-select" id="matIsSNManage"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">序列号生成时机 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matSNGenerateTime"><option value="入库时">入库时</option><option value="出库时">出库时</option></select></div>
              <div class="form-group"><label class="form-label">业务范围 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matSNManageType"><option value="生产">生产</option><option value="采购">采购</option><option value="销售">销售</option><option value="全部">全部</option></select></div>
              <div class="form-group"><label class="form-label">参考成本</label><input type="number" class="form-input" id="matRefCost" placeholder="请输入参考成本"></div>
              <div class="form-group"><label class="form-label">安全库存</label><input type="number" class="form-input" id="matSafeStock" placeholder="请输入安全库存"></div>
              <div class="form-group"><label class="form-label">再订货点</label><input type="number" class="form-input" id="matReOrderGood" placeholder="请输入再订货点"></div>
              <div class="form-group"><label class="form-label">最小库存</label><input type="number" class="form-input" id="matMinStock" placeholder="请输入最小库存"></div>
              <div class="form-group"><label class="form-label">最大库存</label><input type="number" class="form-input" id="matMaxStock" placeholder="请输入最大库存"></div>
              <div class="form-group"><label class="form-label">可锁库</label><select class="form-select" id="matIsLockStock"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">启用盘点周期</label><select class="form-select" id="matIsCycleCounting"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">盘点周期</label><input type="number" class="form-input" id="matCountDay" placeholder="请输入盘点周期"></div>
            </div>
          </div>

          <!-- 生产信息 -->
          <div class="tab-content" id="tab-production">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">发料方式 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matIssueType"><option value="领料">领料</option><option value="倒冲">倒冲</option><option value="配套领料">配套领料</option></select></div>
              <div class="form-group"><label class="form-label">超发控制方式 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matOverControlMode"><option value="不控制">不控制</option><option value="按比例控制">按比例控制</option><option value="严格控制">严格控制</option></select></div>
              <div class="form-group"><label class="form-label">生产单位</label><select class="form-select" id="matProduceUnit"><option value="个">个</option><option value="件">件</option><option value="千克">千克</option></select></div>
              <div class="form-group"><label class="form-label">发料仓库</label><input type="text" class="form-input" id="matPickStock" placeholder="请输入发料仓库"></div>
              <div class="form-group"><label class="form-label">生产车间</label><input type="text" class="form-input" id="matWorkShop" placeholder="请输入生产车间"></div>
              <div class="form-group"><label class="form-label">默认工艺路线</label><input type="text" class="form-input" id="matDefaultRouting" placeholder="请输入默认工艺路线"></div>
              <div class="form-group"><label class="form-label">是否关键件</label><select class="form-select" id="matIsKitting"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">标准工时</label><input type="number" class="form-input" id="matStandHour" placeholder="请输入标准工时"></div>
              <div class="form-group"><label class="form-label">标准人员准备工时</label><input type="number" class="form-input" id="matStdLaborPrePareTime" placeholder="请输入标准人员准备工时"></div>
              <div class="form-group"><label class="form-label">标准人员实作工时</label><input type="number" class="form-input" id="matStdLaborProcessTime" placeholder="请输入标准人员实作工时"></div>
              <div class="form-group"><label class="form-label">标准机器准备工时</label><input type="number" class="form-input" id="matStdMachinePrepareTime" placeholder="请输入标准机器准备工时"></div>
              <div class="form-group"><label class="form-label">标准机器实作工时</label><input type="number" class="form-input" id="matStdMachineProcessTime" placeholder="请输入标准机器实作工时"></div>
              <div class="form-group"><label class="form-label">最小发料批量</label><input type="number" class="form-input" id="matMinIssueQty" placeholder="请输入最小发料批量"></div>
              <div class="form-group"><label class="form-label">最小发料批量单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matMinIssueUnit"><option value="个">个</option><option value="件">件</option></select></div>
              <div class="form-group"><label class="form-label">工时单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matStandHourUnit"><option value="小时">小时</option><option value="分钟">分钟</option></select></div>
              <div class="form-group"><label class="form-label">倒冲数量 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matBackFlushType"><option value="全部倒冲">全部倒冲</option><option value="部分倒冲">部分倒冲</option></select></div>
              <div class="form-group"><label class="form-label">固定损耗</label><input type="number" class="form-input" id="matFixLoss" placeholder="请输入固定损耗"></div>
              <div class="form-group"><label class="form-label">变动损耗率(%)</label><input type="number" class="form-input" id="matLossPercent" placeholder="请输入变动损耗率"></div>
              <div class="form-group"><label class="form-label">入库超收比例(%)</label><input type="number" class="form-input" id="matFinishReceiptOverRate" placeholder="请输入入库超收比例"></div>
              <div class="form-group"><label class="form-label">入库欠收比例(%)</label><input type="number" class="form-input" id="matFinishReceiptShortRate" placeholder="请输入入库欠收比例"></div>
            </div>
          </div>

          <!-- 销售信息 -->
          <div class="tab-content" id="tab-sales">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">销售计价单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matSalePriceUnit"><option value="个">个</option><option value="件">件</option><option value="千克">千克</option></select></div>
              <div class="form-group"><label class="form-label">销售单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matSaleUnit"><option value="个">个</option><option value="件">件</option><option value="千克">千克</option></select></div>
              <div class="form-group"><label class="form-label">可开票</label><select class="form-select" id="matIsInvoice"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">允许退货</label><select class="form-select" id="matIsReturn"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">起订量</label><input type="number" class="form-input" id="matOrderQty" placeholder="请输入起订量"></div>
              <div class="form-group"><label class="form-label">最小批量</label><input type="number" class="form-input" id="matMinQty" placeholder="请输入最小批量"></div>
              <div class="form-group"><label class="form-label">最大批量</label><input type="number" class="form-input" id="matMaxQty" placeholder="请输入最大批量"></div>
              <div class="form-group"><label class="form-label">超发上限(%)</label><input type="number" class="form-input" id="matOutStockLmtH" placeholder="请输入超发上限"></div>
              <div class="form-group"><label class="form-label">超发下限(%)</label><input type="number" class="form-input" id="matOutStockLmtL" placeholder="请输入超发下限"></div>
              <div class="form-group"><label class="form-label">ATP检查</label><select class="form-select" id="matIsATPCheck"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">是否保修</label><select class="form-select" id="matIsWarranted"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">保修期</label><input type="number" class="form-input" id="matWarranty" placeholder="请输入保修期"></div>
              <div class="form-group"><label class="form-label">保修期单位</label><select class="form-select" id="matWarrantyUnit"><option value="天">天</option><option value="月">月</option><option value="年">年</option></select></div>
              <div class="form-group"><label class="form-label">启用售后服务</label><select class="form-select" id="matIsAfterSale"><option value="否">否</option><option value="是">是</option></select></div>
            </div>
          </div>

          <!-- 计划信息 -->
          <div class="tab-content" id="tab-planning">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">计划策略 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matPlanningStrategy"><option value="MPS">MPS</option><option value="MRP">MRP</option><option value="无">无</option></select></div>
              <div class="form-group"><label class="form-label">订货策略 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matOrderPolicy"><option value="按需订货">按需订货</option><option value="批量订货">批量订货</option><option value="周期订货">周期订货</option></select></div>
              <div class="form-group"><label class="form-label">计划员</label><input type="text" class="form-input" id="matPlaner" placeholder="请输入计划员"></div>
              <div class="form-group"><label class="form-label">固定提前期单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matFixLeadTimeType"><option value="天">天</option><option value="小时">小时</option></select></div>
              <div class="form-group"><label class="form-label">固定提前期</label><input type="number" class="form-input" id="matFixLeadTime" placeholder="请输入固定提前期"></div>
              <div class="form-group"><label class="form-label">变动提前期单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matVarLeadTimeType"><option value="天">天</option><option value="小时">小时</option></select></div>
              <div class="form-group"><label class="form-label">变动提前期</label><input type="number" class="form-input" id="matVarLeadTime" placeholder="请输入变动提前期"></div>
              <div class="form-group"><label class="form-label">检验提前期单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matCheckLeadTimeType"><option value="天">天</option><option value="小时">小时</option></select></div>
              <div class="form-group"><label class="form-label">检验提前期</label><input type="number" class="form-input" id="matCheckLeadTime" placeholder="请输入检验提前期"></div>
              <div class="form-group"><label class="form-label">订货间隔期单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matOrderIntervalTimeType"><option value="天">天</option><option value="周">周</option></select></div>
              <div class="form-group"><label class="form-label">订货间隔期</label><input type="number" class="form-input" id="matOrderIntervalTime" placeholder="请输入订货间隔期"></div>
              <div class="form-group"><label class="form-label">预留类型 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matReserveType"><option value="专项预留">专项预留</option><option value="普通预留">普通预留</option></select></div>
              <div class="form-group"><label class="form-label">时间单位 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matPlanOffsetTimeType"><option value="天">天</option><option value="小时">小时</option></select></div>
              <div class="form-group"><label class="form-label">偏置时间</label><input type="number" class="form-input" id="matPlanOffsetTime" placeholder="请输入偏置时间"></div>
              <div class="form-group"><label class="form-label">最小订货量</label><input type="number" class="form-input" id="matMinPOQty" placeholder="请输入最小订货量"></div>
              <div class="form-group"><label class="form-label">最大订货量</label><input type="number" class="form-input" id="matMaxPOQty" placeholder="请输入最大订货量"></div>
              <div class="form-group"><label class="form-label">安全库存</label><input type="number" class="form-input" id="matPlanSafeStock" placeholder="请输入安全库存"></div>
              <div class="form-group"><label class="form-label">固定/经济批量</label><input type="number" class="form-input" id="matEOQ" placeholder="请输入固定/经济批量"></div>
            </div>
          </div>

          <!-- 质量信息 -->
          <div class="tab-content" id="tab-quality">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">首检控制方式 <span style="color:#f5222d;">*</span></label><select class="form-select" id="matFirstQCControlType"><option value="不控制">不控制</option><option value="严格控制">严格控制</option><option value="宽松控制">宽松控制</option></select></div>
              <div class="form-group"><label class="form-label">来料检验</label><select class="form-select" id="matCheckIncoming"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">产品检验</label><select class="form-select" id="matCheckProduct"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">库存检验</label><select class="form-select" id="matCheckStock"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">发货检验</label><select class="form-select" id="matCheckDelivery"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">退货检验</label><select class="form-select" id="matCheckReturn"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">生产退料检验</label><select class="form-select" id="matCheckReturnMtrl"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">委外退料检验</label><select class="form-select" id="matCheckSubRtnMtrl"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">其他检验</label><select class="form-select" id="matCheckOther"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">产品首检</label><select class="form-select" id="matIsFirstInspect"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">启用库存周期复检</label><select class="form-select" id="matEnableCyclistQCSTK"><option value="否">否</option><option value="是">是</option></select></div>
              <div class="form-group"><label class="form-label">复检周期</label><input type="number" class="form-input" id="matStockCycle" placeholder="请输入复检周期"></div>
              <div class="form-group"><label class="form-label">提醒提前期</label><input type="number" class="form-input" id="matEWLeadDay" placeholder="请输入提醒提前期"></div>
              <div class="form-group"><label class="form-label">质检组</label><input type="text" class="form-input" id="matInspectGroup" placeholder="请输入质检组"></div>
              <div class="form-group"><label class="form-label">质检员</label><input type="text" class="form-input" id="matInspector" placeholder="请输入质检员"></div>
              <div class="form-group"><label class="form-label">抽样方案</label><input type="text" class="form-input" id="matIncSampScheme" placeholder="请输入抽样方案"></div>
              <div class="form-group"><label class="form-label">质检方案</label><input type="text" class="form-input" id="matIncQcScheme" placeholder="请输入质检方案"></div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="closeModal('matModal')">取消</button>
        <button class="btn btn-primary btn-sm" onclick="saveItem()">确认保存</button>
      </div>
    </div>
  </div>

  <!-- 列显示/隐藏设置弹窗 -->
  <div class="modal-overlay" id="columnSettingsModal">
    <div class="modal-dialog column-settings-modal">
      <div class="modal-header">
        <div class="modal-title">列显示设置</div>
        <button class="modal-close" onclick="closeModal('columnSettingsModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="column-settings-list" id="columnSettingsList">
          <div class="column-setting-item"><input type="checkbox" id="col2" value="2" checked><label for="col2">物料编码</label></div>
          <div class="column-setting-item"><input type="checkbox" id="col3" value="3" checked><label for="col3">物料名称</label></div>
          <div class="column-setting-item"><input type="checkbox" id="col4" value="4" checked><label for="col4">规格型号</label></div>
          <div class="column-setting-item"><input type="checkbox" id="col5" value="5" checked><label for="col5">物料类别</label></div>
          <div class="column-setting-item"><input type="checkbox" id="col6" value="6" checked><label for="col6">基本单位</label></div>
          <div class="column-setting-item"><input type="checkbox" id="col7" value="7" checked><label for="col7">状态</label></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="closeModal('columnSettingsModal')">取消</button>
        <button class="btn btn-primary btn-sm" onclick="applyColumnSettings()">应用</button>
      </div>
    </div>
  </div>
</div>
<script>
var matModalMode = 'add';
var visibleColumns = [true, true, true, true, true, true];

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function openMatModal(mode) {
  matModalMode = mode;
  document.getElementById('matModalTitle').textContent = mode === 'add' ? '新增物料' : '编辑物料';
  resetForm();
  switchTab('basic');
  openModal('matModal');
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-item').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
  document.querySelector('.tab-item[onclick="switchTab(\\\'' + tabName + '\\\')"]').classList.add('active');
  document.getElementById('tab-' + tabName).classList.add('active');
}

function resetForm() {
  document.getElementById('matModalForm').reset();
  document.getElementById('matModalId').value = '';
}

function validateForm() {
  var matCode = document.getElementById('matCode').value.trim();
  if (!matCode) {
    showToast('请输入物料编码', 'warning');
    document.getElementById('matCode').focus();
    return false;
  }
  var matName = document.getElementById('matName').value.trim();
  if (!matName) {
    showToast('请输入物料名称', 'warning');
    document.getElementById('matName').focus();
    return false;
  }
  return true;
}

function saveItem() {
  if (!validateForm()) return;
  showToast('物料' + (matModalMode === 'add' ? '新增成功' : '编辑成功'), 'success');
  closeModal('matModal');
  refreshData();
}

function submitItem() {
  showConfirm('确认提交审核？', 'warning', function(result) {
    if (result) {
      showToast('已提交审核', 'success');
      closeModal('matModal');
      refreshData();
    }
  });
}

function auditItem() {
  showConfirm('确认审核通过？', 'warning', function(result) {
    if (result) showToast('审核通过', 'success');
  });
}

function unAuditItem() {
  showConfirm('确认反审核？', 'warning', function(result) {
    if (result) showToast('反审核成功', 'success');
  });
}

function selectAll() {
  var master = document.querySelector('.data-table th input');
  var checkboxes = document.querySelectorAll('.data-table tbody input[type="checkbox"]');
  checkboxes.forEach(function(cb) { cb.checked = master.checked; });
}

function getSelectedIds() {
  var ids = [];
  document.querySelectorAll('.data-table tbody input[type="checkbox"]:checked').forEach(function(cb) {
    ids.push(cb.value);
  });
  return ids;
}

function editSelected() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要编辑的物料', 'warning');
    return;
  }
  if (ids.length > 1) {
    showToast('只能选择一条记录进行编辑', 'warning');
    return;
  }
  openMatModal('edit');
}

function deleteSelected() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要删除的物料', 'warning');
    return;
  }
  showConfirm('确认删除选中的物料？', 'error', function(result) {
    if (result) {
      showToast('删除成功', 'success');
      refreshData();
    }
  });
}

function auditSelected() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要审核的物料', 'warning');
    return;
  }
  showConfirm('确认审核通过？', 'warning', function(result) {
    if (result) showToast('审核通过', 'success');
  });
}

function unAuditSelected() {
  var ids = getSelectedIds();
  if (ids.length === 0) {
    showToast('请选择要反审核的物料', 'warning');
    return;
  }
  showConfirm('确认反审核？', 'warning', function(result) {
    if (result) showToast('反审核成功', 'success');
  });
}

function openColumnSettings() {
  openModal('columnSettingsModal');
}

function applyColumnSettings() {
  var checkboxes = document.querySelectorAll('#columnSettingsList input[type="checkbox"]');
  checkboxes.forEach(function(cb) {
    var colIndex = parseInt(cb.value);
    var cells = document.querySelectorAll('.data-table th:nth-child(' + (colIndex + 1) + '), .data-table td:nth-child(' + (colIndex + 1) + ')');
    cells.forEach(function(cell) {
      cell.style.display = cb.checked ? '' : 'none';
    });
    visibleColumns[colIndex - 1] = cb.checked;
  });
  localStorage.setItem('master-material_visible_columns', JSON.stringify(visibleColumns));
  closeModal('columnSettingsModal');
  showToast('列设置已保存', 'success');
}

function loadColumnSettings() {
  var saved = localStorage.getItem('master-material_visible_columns');
  if (saved) {
    visibleColumns = JSON.parse(saved);
    var checkboxes = document.querySelectorAll('#columnSettingsList input[type="checkbox"]');
    checkboxes.forEach(function(cb) {
      var colIndex = parseInt(cb.value);
      cb.checked = visibleColumns[colIndex - 1];
      if (!visibleColumns[colIndex - 1]) {
        var cells = document.querySelectorAll('.data-table th:nth-child(' + (colIndex + 1) + '), .data-table td:nth-child(' + (colIndex + 1) + ')');
        cells.forEach(function(cell) {
          cell.style.display = 'none';
        });
      }
    });
  }
}

function searchData() {
  showToast('查询成功', 'success');
}

function refreshData() {
  location.reload();
}

function exportData() {
  showToast('导出功能开发中', 'info');
}

function importData() {
  showToast('导入功能开发中', 'info');
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(function(m) {
      m.classList.remove('show');
    });
  }
});

document.addEventListener('DOMContentLoaded', loadColumnSettings);
</script>
</body>
</html>'''
    return html

def update_page_with_column_settings(page_path):
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'openColumnSettings' in content:
        return
    
    insert_pos = content.find('<button class="action-btn" onclick="importData()">导入</button>')
    if insert_pos != -1:
        content = content[:insert_pos + len('<button class="action-btn" onclick="importData()">导入</button>')] + \
                  '<button class="action-btn" onclick="openColumnSettings()">显示/隐藏</button>' + \
                  content[insert_pos + len('<button class="action-btn" onclick="importData()">导入</button>'):]
    
    column_settings_html = '''
  <!-- 列显示/隐藏设置弹窗 -->
  <div class="modal-overlay" id="columnSettingsModal">
    <div class="modal-dialog column-settings-modal">
      <div class="modal-header">
        <div class="modal-title">列显示设置</div>
        <button class="modal-close" onclick="closeModal('columnSettingsModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="column-settings-list" id="columnSettingsList">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="closeModal('columnSettingsModal')">取消</button>
        <button class="btn btn-primary btn-sm" onclick="applyColumnSettings()">应用</button>
      </div>
    </div>
  </div>'''
    
    insert_pos = content.find('</div>\n<script>')
    if insert_pos != -1:
        content = content[:insert_pos] + column_settings_html + content[insert_pos:]
    
    column_settings_css = '''
.column-settings-modal { width:400px; }
.column-settings-list { max-height:300px; overflow-y:auto; }
.column-setting-item { display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #f0f0f0; }
.column-setting-item:hover { background:#f5f5f5; }
.column-setting-item label { font-size:13px; color:#333; cursor:pointer; flex:1; }
.column-setting-item input[type="checkbox"] { width:16px; height:16px; }'''
    
    insert_pos = content.find('</style>')
    if insert_pos != -1:
        content = content[:insert_pos] + column_settings_css + content[insert_pos:]
    
    column_settings_js = '''
function openColumnSettings() {
  var headers = document.querySelectorAll('.data-table th');
  var list = document.getElementById('columnSettingsList');
  list.innerHTML = '';
  headers.forEach(function(th, index) {
    if (index === 0) return;
    var text = th.textContent.trim();
    if (text && text !== '操作') {
      list.innerHTML += '<div class="column-setting-item"><input type="checkbox" id="col' + (index + 1) + '" value="' + (index + 1) + '" checked><label for="col' + (index + 1) + '">' + text + '</label></div>';
    }
  });
  openModal('columnSettingsModal');
}

function applyColumnSettings() {
  var checkboxes = document.querySelectorAll('#columnSettingsList input[type="checkbox"]');
  checkboxes.forEach(function(cb) {
    var colIndex = parseInt(cb.value);
    var cells = document.querySelectorAll('.data-table th:nth-child(' + colIndex + '), .data-table td:nth-child(' + colIndex + ')');
    cells.forEach(function(cell) {
      cell.style.display = cb.checked ? '' : 'none';
    });
  });
  closeModal('columnSettingsModal');
  showToast('列设置已保存', 'success');
}
    
document.addEventListener('DOMContentLoaded', function() {
  var saved = localStorage.getItem('column_settings_' + window.location.pathname);
  if (saved) {
    var settings = JSON.parse(saved);
    settings.forEach(function(visible, index) {
      if (!visible) {
        var cells = document.querySelectorAll('.data-table th:nth-child(' + (index + 1) + '), .data-table td:nth-child(' + (index + 1) + ')');
        cells.forEach(function(cell) {
          cell.style.display = 'none';
        });
      }
    });
  }
});'''
    
    insert_pos = content.find('document.addEventListener(')
    if insert_pos != -1:
        content = content[:insert_pos] + column_settings_js + '\n' + content[insert_pos:]
    
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    material_path = os.path.join(PAGES_DIR, 'master-material.html')
    html_content = generate_material_page()
    with open(material_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print('已生成: master-material.html')
    
    list_pages = [
        'sales-quotation-list.html',
        'sales-contract-list.html',
        'sales-split-delivery-list.html',
        'purchase-receive-inspect-list.html',
        'quality-stock-inspect-list.html',
        'quality-prod-return-inspect-list.html',
        'quality-outsource-return-inspect-list.html',
        'quality-other-inspect-list.html',
        'quality-ncr-list.html',
        'quality-mrb-list.html',
        'quality-inspect-list.html',
        'production-report-inspect-list.html',
        'production-material-set-supplement-list.html',
        'production-material-set-return-list.html',
        'production-material-set-pick-list.html',
        'production-material-issue-list.html',
        'outsource-supplement-list.html',
        'outsource-return-list.html',
        'outsource-receive-notice-list.html',
        'outsource-pick-list.html',
        'outsource-overuse-list.html',
    ]
    
    base_pages = [
        'base-org.html',
        'base-department.html',
        'base-employee.html',
        'base-position.html',
        'base-category.html',
        'base-unit.html',
        'base-salesperson.html',
        'base-payment-term.html',
        'base-receipt-term.html',
    ]
    
    for page in list_pages + base_pages:
        page_path = os.path.join(PAGES_DIR, page)
        if os.path.exists(page_path):
            update_page_with_column_settings(page_path)
            print('已更新: ' + page)

if __name__ == '__main__':
    main()