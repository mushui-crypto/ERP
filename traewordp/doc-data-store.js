/**
 * 单据数据共享层 - 基于localStorage模拟数据库
 * 实现单据CRUD、下推、数量控制、上游反写
 * 所有数据按组织(orgId)隔离
 */

var DocDataStore = (function() {

  var STORAGE_PREFIX = 'erp_docs_';
  var SEQ_PREFIX = 'erp_seq_';

  // 单据类型定义
  var DOC_TYPES = {
    sales_quote: { prefix: 'SQ', name: '销售报价单' },
    sales_order: { prefix: 'SO', name: '销售订单' },
    sales_delivery: { prefix: 'DN', name: '发货通知单' },
    sales_outbound: { prefix: 'OUT', name: '销售出库单' },
    sales_return_notice: { prefix: 'SRN', name: '退货通知单' },
    sales_return: { prefix: 'SR', name: '销售退货单' },
    purchase_request: { prefix: 'PR', name: '采购申请单' },
    purchase_order: { prefix: 'PO', name: '采购订单' },
    purchase_receive: { prefix: 'RCV', name: '收料通知请检单' },
    purchase_inspect: { prefix: 'INS', name: '检验单' },
    purchase_inbound: { prefix: 'PIN', name: '采购入库单' },
    // 生产流程单据
    production_order: { prefix: 'MO', name: '生产订单' },
    material_list: { prefix: 'ML', name: '用料清单' },
    material_requisition: { prefix: 'MR', name: '领料单' },
    completion_report: { prefix: 'CR', name: '完工汇报' },
    production_inspect: { prefix: 'PQI', name: '生产检验单' },
    production_inbound: { prefix: 'PRD', name: '生产入库单' },
    process_plan: { prefix: 'PP', name: '工序计划' },
    process_report: { prefix: 'PRP', name: '工序汇报' }
  };

  // 单据状态: 0=草稿, 1=已提交, 2=已审核, 3=已下推/已出库, 4=已关闭, 5=已取消
  var STATUS = {
    DRAFT: 0,
    SUBMITTED: 1,
    APPROVED: 2,
    PUSHED: 3,
    CLOSED: 4,
    CANCELLED: 5
  };

  var STATUS_LABELS = {
    0: '草稿',
    1: '待审核',
    2: '已审核',
    3: '已下推',
    4: '已关闭',
    5: '已取消'
  };

  // 生产订单专用状态: 审核后进入确认→下达→开工→完工→结案→结算
  var PROD_STATUS = {
    DRAFT: 0,
    SUBMITTED: 1,
    APPROVED: 2,       // 已审核
    CONFIRMED: 10,     // 已确认
    RELEASED: 11,      // 已下达
    STARTED: 12,       // 已开工
    COMPLETED: 13,     // 已完工
    CLOSED: 14,        // 已结案
    SETTLED: 15,       // 已结算
    CANCELLED: 5       // 已取消
  };

  var PROD_STATUS_LABELS = {
    0: '草稿',
    1: '待审核',
    2: '已审核',
    10: '已确认',
    11: '已下达',
    12: '已开工',
    13: '已完工',
    14: '已结案',
    15: '已结算',
    5: '已取消'
  };

  // 生产订单状态流转顺序（审核后）
  var PROD_FLOW = [2, 10, 11, 12, 13, 14, 15];

  // 入库类型
  var INBOUND_TYPES = {
    direct: '直接入库',
    report: '汇报入库',
    process: '工序汇报入库'
  };

  // ===== BOM数据（模拟） =====
  var BOM_STORAGE_KEY = 'erp_bom_data';

  function getBomData() {
    var data = localStorage.getItem(BOM_STORAGE_KEY);
    if (data) return JSON.parse(data);
    // 默认BOM数据
    var defaultBoms = [
      {
        productId: 'mat-005', productCode: 'P-003', productName: '智能控制器',
        specification: 'IC-V3', unit: '台',
        components: [
          { materialId: 'mat-010', materialCode: 'M-010', materialName: 'PCB电路板', specification: 'FR-4双层', unit: '块', baseQty: 1 },
          { materialId: 'mat-011', materialCode: 'M-011', materialName: '贴片电阻', specification: '10KΩ 0603', unit: '个', baseQty: 50 },
          { materialId: 'mat-012', materialCode: 'M-012', materialName: '贴片电容', specification: '100μF 0805', unit: '个', baseQty: 20 },
          { materialId: 'mat-008', materialCode: 'M-004', materialName: '螺丝', specification: 'M4x10', unit: '包', baseQty: 2, inspectType: '0' }
        ]
      },
      {
        productId: 'mat-006', productCode: 'P-004', productName: '电源模块',
        specification: 'PM-500W', unit: '个',
        components: [
          { materialId: 'mat-013', materialCode: 'M-013', materialName: '变压器', specification: '220V→12V', unit: '个', baseQty: 1 },
          { materialId: 'mat-014', materialCode: 'M-014', materialName: '散热片', specification: '铝制40x40', unit: '片', baseQty: 2 },
          { materialId: 'mat-011', materialCode: 'M-011', materialName: '贴片电阻', specification: '10KΩ 0603', unit: '个', baseQty: 15 }
        ]
      },
      {
        productId: 'mat-020', productCode: 'P-010', productName: '工业网关',
        specification: 'GW-2000', unit: '台',
        components: [
          { materialId: 'mat-010', materialCode: 'M-010', materialName: 'PCB电路板', specification: 'FR-4四层', unit: '块', baseQty: 1 },
          { materialId: 'mat-015', materialCode: 'M-015', materialName: '主控芯片', specification: 'ARM-A53', unit: '片', baseQty: 1, inspectType: '1' },
          { materialId: 'mat-016', materialCode: 'M-016', materialName: '通信模组', specification: '4G+WiFi', unit: '个', baseQty: 1, inspectType: '1' },
          { materialId: 'mat-011', materialCode: 'M-011', materialName: '贴片电阻', specification: '10KΩ 0603', unit: '个', baseQty: 100 }
        ]
      }
    ];
    localStorage.setItem(BOM_STORAGE_KEY, JSON.stringify(defaultBoms));
    return defaultBoms;
  }

  function getBomByProduct(productId) {
    var boms = getBomData();
    return boms.find(function(b) { return b.productId === productId; }) || null;
  }

  function getOrgId() {
    var org = null;
    try { org = JSON.parse(localStorage.getItem('currentOrg') || '{}'); } catch(e) {}
    var orgId = org.id || 'org-001';
    // 同步到全局变量，确保一致性
    if (!localStorage.getItem('currentOrg')) {
      localStorage.setItem('currentOrg', JSON.stringify({ id: 'org-001', name: '磐枢工业集团(总部)', code: 'PS-HQ' }));
    }
    return orgId;
  }

  function getStorageKey(docType) {
    return STORAGE_PREFIX + docType + '_' + getOrgId();
  }

  function getAllDocs(docType) {
    var key = getStorageKey(docType);
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  function saveAllDocs(docType, docs) {
    var key = getStorageKey(docType);
    localStorage.setItem(key, JSON.stringify(docs));
  }

  function genDocNo(docType) {
    var def = DOC_TYPES[docType];
    if (!def) return '';
    var seqKey = SEQ_PREFIX + docType;
    var seq = parseInt(localStorage.getItem(seqKey) || '0') + 1;
    localStorage.setItem(seqKey, String(seq));
    var dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return def.prefix + dateStr + String(seq).padStart(4, '0');
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * 新建单据
   */
  function createDoc(docType, header, details) {
    var docs = getAllDocs(docType);
    var doc = {
      id: genId(),
      docNo: header.docNo || genDocNo(docType),
      docType: docType,
      status: STATUS.DRAFT,
      header: Object.assign({}, header, {
        docNo: header.docNo || genDocNo(docType),
        createDate: new Date().toISOString(),
        createBy: (JSON.parse(localStorage.getItem('userInfo') || '{}')).username || '系统'
      }),
      details: details || [],
      // 下游关联追踪字段
      downstream: {
        pushedTo: null,       // 下推到的单据类型
        pushedDocNo: null,    // 下推生成的单据号
        pushedQty: 0          // 已下推数量
      }
    };
    docs.unshift(doc);
    saveAllDocs(docType, docs);
    return doc;
  }

  /**
   * 更新单据
   */
  function updateDoc(docType, docId, header, details) {
    var docs = getAllDocs(docType);
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) return null;
    if (header) {
      Object.assign(docs[idx].header, header);
    }
    if (details) {
      docs[idx].details = details;
    }
    saveAllDocs(docType, docs);
    return docs[idx];
  }

  /**
   * 更新单据状态
   */
  function updateStatus(docType, docId, newStatus) {
    var docs = getAllDocs(docType);
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) return null;
    docs[idx].status = newStatus;
    saveAllDocs(docType, docs);
    return docs[idx];
  }

  /**
   * 删除单据(软删除)
   */
  function deleteDoc(docType, docId) {
    var docs = getAllDocs(docType);
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) return false;
    if (docs[idx].status >= STATUS.SUBMITTED) return false;
    docs.splice(idx, 1);
    saveAllDocs(docType, docs);
    return true;
  }

  /**
   * 获取单据
   */
  function getDoc(docType, docId) {
    var docs = getAllDocs(docType);
    return docs.find(function(d) { return d.id === docId; });
  }

  /**
   * 按单据号获取
   */
  function getDocByNo(docType, docNo) {
    var docs = getAllDocs(docType);
    return docs.find(function(d) { return d.docNo === docNo; });
  }

  /**
   * 获取单据列表(支持筛选)
   */
  function listDocs(docType, filters) {
    var docs = getAllDocs(docType);
    if (!filters) return docs;
    return docs.filter(function(d) {
      if (filters.status !== undefined && d.status !== filters.status) return false;
      if (filters.docNo && !d.docNo.includes(filters.docNo)) return false;
      if (filters.customerName && (!d.header.customerName || !d.header.customerName.includes(filters.customerName))) return false;
      if (filters.supplierName && (!d.header.supplierName || !d.header.supplierName.includes(filters.supplierName))) return false;
      return true;
    });
  }

  /**
   * 获取已审核的、可下推的单据列表
   */
  function getPushableDocs(docType) {
    var docs = getAllDocs(docType);
    return docs.filter(function(d) {
      return d.status === STATUS.APPROVED || d.status === STATUS.PUSHED;
    });
  }

  /**
   * 计算单据明细行的下游数量字段
   * 每行detail需要有: qty(订单数量), pushedQty(已下推数量)
   */
  function calcDetailRemaining(detail) {
    var qty = parseFloat(detail.qty) || 0;
    var pushedQty = parseFloat(detail.pushedQty) || 0;
    return Math.max(0, qty - pushedQty);
  }

  /**
   * 下推单据：从上游单据生成下游单据
   * @param {string} srcType - 源单据类型
   * @param {array} selectedRows - 选中的源单据行 [{docId, detailIndex, qty}]
   * @param {string} targetType - 目标单据类型
   * @param {object} targetHeader - 目标单据头信息
   * @returns {object} 生成的下游单据
   */
  function pushDown(srcType, selectedRows, targetType, targetHeader) {
    var srcDocs = getAllDocs(srcType);
    var targetDetails = [];
    var totalQty = 0;
    var totalAmount = 0;
    var totalTax = 0;

    selectedRows.forEach(function(sel) {
      var srcDoc = srcDocs.find(function(d) { return d.id === sel.docId; });
      if (!srcDoc) return;

      var detail = srcDoc.details[sel.detailIndex];
      if (!detail) return;

      // 数量控制：不能超过未下推数量
      var remaining = calcDetailRemaining(detail);
      var pushQty = parseFloat(sel.qty) || 0;
      if (pushQty > remaining) {
        throw new Error('下推数量(' + pushQty + ')超过可下推数量(' + remaining + ')，物料：' + (detail.materialName || ''));
      }

      // 构建下游单据明细行
      var targetDetail = {
        id: genId(),
        sourceDocId: srcDoc.id,
        sourceDocNo: srcDoc.docNo,
        sourceDetailId: detail.id || sel.detailIndex,
        sourceRowNum: sel.detailIndex + 1,
        materialId: detail.materialId || '',
        materialCode: detail.materialCode || '',
        materialName: detail.materialName || '',
        specification: detail.specification || detail.specModel || '',
        unit: detail.unit || '',
        qty: pushQty,
        unitPrice: detail.unitPrice || 0,
        amount: pushQty * (detail.unitPrice || 0),
        taxRate: detail.taxRate || 0,
        taxAmount: pushQty * (detail.unitPrice || 0) * (detail.taxRate || 0) / 100,
        totalAmount: pushQty * (detail.unitPrice || 0) * (1 + (detail.taxRate || 0) / 100),
        // 保留上游关联信息
        orderQty: detail.qty || 0,
        isGift: detail.isGift || false,
        // 下游追踪
        pushedQty: 0
      };

      targetDetails.push(targetDetail);
      totalQty += pushQty;
      totalAmount += targetDetail.amount;
      totalTax += targetDetail.taxAmount;

      // 更新上游单据明细行的已下推数量
      if (!detail.pushedQty) detail.pushedQty = 0;
      detail.pushedQty += pushQty;

      // 更新上游单据状态为"已下推"（当所有行都下推完）
      var allPushed = srcDoc.details.every(function(d) {
        return (parseFloat(d.pushedQty) || 0) >= (parseFloat(d.qty) || 0);
      });
      if (allPushed) {
        srcDoc.status = STATUS.PUSHED;
      } else {
        srcDoc.status = STATUS.PUSHED;
      }
    });

    // 保存更新后的源单据
    saveAllDocs(srcType, srcDocs);

    // 创建下游单据
    var targetDoc = createDoc(targetType, Object.assign({}, targetHeader, {
      sourceDocType: srcType,
      sourceDocNo: selectedRows.length > 0 ? (srcDocs.find(function(d) { return d.id === selectedRows[0].docId; }) || {}).docNo : '',
      totalQty: totalQty,
      totalAmount: totalAmount,
      totalTax: totalTax,
      totalNetAmount: totalAmount + totalTax
    }), targetDetails);

    return targetDoc;
  }

  /**
   * 反写上游单据（当下游单据审核时，更新上游单据的执行数量）
   * @param {string} docType - 下游单据类型
   * @param {object} doc - 下游单据
   * @param {string} backfillType - 反写类型: 'notify'(通知), 'outbound'(出库), 'inbound'(入库)
   */
  function backfillUpstream(docType, doc, backfillType) {
    if (!doc.details || doc.details.length === 0) return;

    // 确定上游单据类型
    var srcType = doc.header.sourceDocType;
    if (!srcType) return;

    var srcDocs = getAllDocs(srcType);

    doc.details.forEach(function(detail) {
      if (!detail.sourceDocId) return;
      var srcDoc = srcDocs.find(function(d) { return d.id === detail.sourceDocId; });
      if (!srcDoc) return;

      var srcDetail = srcDoc.details.find(function(d) {
        return d.id === detail.sourceDetailId || d === srcDoc.details[detail.sourceRowNum - 1];
      });
      if (!srcDetail) return;

      // 根据反写类型更新不同字段
      if (backfillType === 'notify') {
        // 发货通知反写销售订单
        srcDetail.notifiedQty = (parseFloat(srcDetail.notifiedQty) || 0) + (parseFloat(detail.qty) || 0);
        srcDetail.unNotifiedQty = Math.max(0, (parseFloat(srcDetail.qty) || 0) - (parseFloat(srcDetail.notifiedQty) || 0));
      } else if (backfillType === 'outbound') {
        // 出库反写发货通知单
        srcDetail.outboundQty = (parseFloat(srcDetail.outboundQty) || 0) + (parseFloat(detail.qty) || 0);
        srcDetail.unOutboundQty = Math.max(0, (parseFloat(srcDetail.qty) || 0) - (parseFloat(srcDetail.outboundQty) || 0));
        // 同时反写销售订单的出库数量
        backfillToOrder(srcDoc, detail, 'outbound');
      } else if (backfillType === 'inbound') {
        // 入库反写收料请检单
        srcDetail.inboundQty = (parseFloat(srcDetail.inboundQty) || 0) + (parseFloat(detail.qty) || 0);
        srcDetail.unInboundQty = Math.max(0, (parseFloat(srcDetail.qty) || 0) - (parseFloat(srcDetail.inboundQty) || 0));
        // 同时反写采购订单
        backfillToOrder(srcDoc, detail, 'inbound');
      } else if (backfillType === 'return') {
        // 退货反写出库单
        srcDetail.returnQty = (parseFloat(srcDetail.returnQty) || 0) + (parseFloat(detail.qty) || 0);
      }
    });

    saveAllDocs(srcType, srcDocs);
  }

  /**
   * 反写到更上游的单据（如出库单→发货通知→销售订单，需要穿透反写）
   */
  function backfillToOrder(midDoc, detail, type) {
    if (!midDoc.header.sourceDocType) return;
    var orderType = midDoc.header.sourceDocType;
    var orderDocs = getAllDocs(orderType);
    var orderDoc = orderDocs.find(function(d) { return d.id === midDoc.header.sourceDocId || d.docNo === midDoc.header.sourceDocNo; });
    if (!orderDoc) return;

    // 通过中间单据的明细找到原始订单明细
    midDoc.details.forEach(function(midDetail) {
      if (midDetail.id === detail.id || midDetail === detail) {
        var orderDetail = orderDoc.details.find(function(d) {
          return d.id === midDetail.sourceDetailId || d === orderDoc.details[midDetail.sourceRowNum - 1];
        });
        if (orderDetail) {
          if (type === 'outbound') {
            orderDetail.outboundQty = (parseFloat(orderDetail.outboundQty) || 0) + (parseFloat(detail.qty) || 0);
            orderDetail.unOutboundQty = Math.max(0, (parseFloat(orderDetail.qty) || 0) - (parseFloat(orderDetail.outboundQty) || 0));
          } else if (type === 'inbound') {
            orderDetail.inboundQty = (parseFloat(orderDetail.inboundQty) || 0) + (parseFloat(detail.qty) || 0);
            orderDetail.unInboundQty = Math.max(0, (parseFloat(orderDetail.qty) || 0) - (parseFloat(orderDetail.inboundQty) || 0));
          }
        }
      }
    });

    saveAllDocs(orderType, orderDocs);
  }

  /**
   * 审核单据（含反写上游逻辑）
   */
  function approveDoc(docType, docId) {
    var docs = getAllDocs(docType);
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) throw new Error('单据不存在');
    if (docs[idx].status !== STATUS.SUBMITTED) throw new Error('只能审核待审核状态的单据');

    docs[idx].status = STATUS.APPROVED;
    docs[idx].header.approveDate = new Date().toISOString();
    docs[idx].header.approveBy = (JSON.parse(localStorage.getItem('userInfo') || '{}')).username || '系统';
    saveAllDocs(docType, docs);

    // 根据单据类型执行反写
    var backfillMap = {
      sales_delivery: 'notify',
      sales_outbound: 'outbound',
      purchase_inbound: 'inbound',
      sales_return: 'return'
    };
    if (backfillMap[docType]) {
      backfillUpstream(docType, docs[idx], backfillMap[docType]);
    }
    // 生产流程专用反写
    if (docType === 'material_requisition') {
      backfillMaterialList(docs[idx]);
    } else if (docType === 'production_inbound') {
      backfillProductionOrder(docs[idx]);
    }

    return docs[idx];
  }

  /**
   * 提交单据
   */
  function submitDoc(docType, docId) {
    var docs = getAllDocs(docType);
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) throw new Error('单据不存在');
    if (docs[idx].status !== STATUS.DRAFT) throw new Error('只能提交草稿状态的单据');
    docs[idx].status = STATUS.SUBMITTED;
    docs[idx].header.submitDate = new Date().toISOString();
    saveAllDocs(docType, docs);
    return docs[idx];
  }

  /**
   * 反审核
   */
  function rejectDoc(docType, docId) {
    var docs = getAllDocs(docType);
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) throw new Error('单据不存在');
    if (docs[idx].status !== STATUS.APPROVED) throw new Error('只能反审核已审核状态的单据');
    // 如果已下推，不允许反审核
    if (docs[idx].status === STATUS.PUSHED) throw new Error('已下推的单据不允许反审核');
    docs[idx].status = STATUS.SUBMITTED;
    saveAllDocs(docType, docs);
    return docs[idx];
  }

  /**
   * 关闭单据
   */
  function closeDoc(docType, docId) {
    var docs = getAllDocs(docType);
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) throw new Error('单据不存在');
    docs[idx].status = STATUS.CLOSED;
    saveAllDocs(docType, docs);
    return docs[idx];
  }

  /**
   * 检查物料是否需要来料检验
   */
  function needsInspection(material) {
    if (!material) return false;
    // 根据物料的检验属性判断
    var inspectType = material.inspectType || material.inspectionType || '0';
    return inspectType === '1' || inspectType === 'mandatory' || material.needInspection === true;
  }

  /**
   * 获取物料默认信息
   */
  function getMaterialInfo(materialId) {
    var materials = JSON.parse(localStorage.getItem('erp_materials_cache') || '[]');
    return materials.find(function(m) { return m.id === materialId; }) || null;
  }

  /**
   * 获取单据流转链（上查/下查）
   */
  function getDocChain(docType, docId, direction) {
    var chain = [];
    if (direction === 'up') {
      var doc = getDoc(docType, docId);
      while (doc && doc.header.sourceDocType) {
        var upDoc = null;
        var upDocs = getAllDocs(doc.header.sourceDocType);
        if (doc.header.sourceDocId) {
          upDoc = upDocs.find(function(d) { return d.id === doc.header.sourceDocId; });
        }
        if (!upDoc && doc.header.sourceDocNo) {
          upDoc = upDocs.find(function(d) { return d.docNo === doc.header.sourceDocNo; });
        }
        if (upDoc) {
          chain.push({
            docType: doc.header.sourceDocType,
            docNo: upDoc.docNo,
            status: upDoc.status,
            statusLabel: STATUS_LABELS[upDoc.status]
          });
          doc = upDoc;
        } else {
          break;
        }
      }
    } else if (direction === 'down') {
      // 查找所有下游单据
      var downTypes = {
        sales_quote: ['sales_order'],
        sales_order: ['sales_delivery', 'sales_outbound'],
        sales_delivery: ['sales_outbound'],
        sales_outbound: ['sales_return_notice'],
        sales_return_notice: ['sales_return'],
        purchase_request: ['purchase_order'],
        purchase_order: ['purchase_receive'],
        purchase_receive: ['purchase_inspect', 'purchase_inbound'],
        purchase_inspect: ['purchase_inbound'],
        // 生产流程
        production_order: ['material_list', 'material_requisition', 'completion_report', 'production_inbound', 'process_plan'],
        material_list: ['material_requisition'],
        completion_report: ['production_inspect', 'production_inbound'],
        production_inspect: ['production_inbound'],
        process_plan: ['process_report'],
        process_report: ['completion_report']
      };
      var children = downTypes[docType] || [];
      children.forEach(function(ct) {
        var cDocs = getAllDocs(ct);
        cDocs.forEach(function(cd) {
          if ((cd.header.sourceDocId && cd.header.sourceDocId === docId) ||
              (cd.header.sourceDocNo && cd.header.sourceDocNo === getDoc(docType, docId)?.docNo)) {
            chain.push({
              docType: ct,
              docNo: cd.docNo,
              status: cd.status,
              statusLabel: STATUS_LABELS[cd.status]
            });
          }
        });
      });
    }
    return chain;
  }

  // ===== 生产流程专用函数 =====

  /**
   * 获取生产订单状态标签
   */
  function getProdStatusLabel(status) {
    return PROD_STATUS_LABELS[status] || '未知';
  }

  /**
   * 生产订单状态流转
   * 审核后: 确认→下达→开工→完工→结案→结算
   */
  function advanceProdStatus(docId) {
    var docs = getAllDocs('production_order');
    var idx = docs.findIndex(function(d) { return d.id === docId; });
    if (idx < 0) throw new Error('生产订单不存在');

    var currentStatus = docs[idx].status;
    var currentFlowIdx = PROD_FLOW.indexOf(currentStatus);
    if (currentFlowIdx < 0) throw new Error('当前状态不允许流转: ' + getProdStatusLabel(currentStatus));
    if (currentFlowIdx >= PROD_FLOW.length - 1) throw new Error('已是最终状态(已结算)');

    var nextStatus = PROD_FLOW[currentFlowIdx + 1];
    docs[idx].status = nextStatus;
    var statusActionMap = { 10: 'confirmDate', 11: 'releaseDate', 12: 'startDate', 13: 'completeDate', 14: 'closeDate', 15: 'settleDate' };
    if (statusActionMap[nextStatus]) {
      docs[idx].header[statusActionMap[nextStatus]] = new Date().toISOString();
    }
    saveAllDocs('production_order', docs);
    return docs[idx];
  }

  /**
   * 从生产订单生成用料清单（BOM展开 × 订单数量）
   */
  function generateMaterialList(orderId) {
    var order = getDoc('production_order', orderId);
    if (!order) throw new Error('生产订单不存在');
    if (order.status < PROD_STATUS.APPROVED) throw new Error('生产订单必须先审核');

    // 检查是否已生成用料清单
    var existing = getAllDocs('material_list').find(function(ml) {
      return ml.header.sourceDocId === orderId;
    });
    if (existing) throw new Error('该生产订单已生成用料清单: ' + existing.docNo);

    var details = [];
    order.details.forEach(function(orderDetail) {
      var bom = getBomByProduct(orderDetail.materialId);
      if (bom && bom.components) {
        var orderQty = parseFloat(orderDetail.qty) || 0;
        bom.components.forEach(function(comp) {
          var requiredQty = (parseFloat(comp.baseQty) || 0) * orderQty;
          details.push({
            id: genId(),
            productId: orderDetail.materialId,
            productCode: orderDetail.materialCode,
            productName: orderDetail.materialName,
            materialId: comp.materialId,
            materialCode: comp.materialCode,
            materialName: comp.materialName,
            specification: comp.specification,
            unit: comp.unit,
            baseQty: parseFloat(comp.baseQty) || 0,
            orderQty: orderQty,
            requiredQty: Math.round(requiredQty * 10000) / 10000,
            requisitionedQty: 0,
            unRequisitionedQty: Math.round(requiredQty * 10000) / 10000,
            inspectType: comp.inspectType || '0'
          });
        });
      } else {
        // 无BOM的产品，仅记录产品本身
        details.push({
          id: genId(),
          productId: orderDetail.materialId,
          productCode: orderDetail.materialCode,
          productName: orderDetail.materialName,
          materialId: orderDetail.materialId,
          materialCode: orderDetail.materialCode,
          materialName: orderDetail.materialName,
          specification: orderDetail.specification || '',
          unit: orderDetail.unit || '',
          baseQty: 1,
          orderQty: parseFloat(orderDetail.qty) || 0,
          requiredQty: parseFloat(orderDetail.qty) || 0,
          requisitionedQty: 0,
          unRequisitionedQty: parseFloat(orderDetail.qty) || 0,
          inspectType: orderDetail.inspectType || '0'
        });
      }
    });

    var mlDoc = createDoc('material_list', {
      sourceDocType: 'production_order',
      sourceDocId: orderId,
      sourceDocNo: order.docNo,
      productNames: order.details.map(function(d) { return d.materialName; }).join(', '),
      orderDate: order.header.orderDate,
      remark: '从生产订单 ' + order.docNo + ' 自动生成'
    }, details);
    return mlDoc;
  }

  /**
   * 更新用料清单明细（可修改变更）
   */
  function updateMaterialList(docId, details) {
    return updateDoc('material_list', docId, null, details);
  }

  /**
   * 领料单审核时反写用料清单
   */
  function backfillMaterialList(reqDoc) {
    if (!reqDoc.details || reqDoc.details.length === 0) return;
    var mlDocs = getAllDocs('material_list');
    var mlDoc = mlDocs.find(function(d) { return d.id === reqDoc.header.sourceDocId; });
    if (!mlDoc) return;

    reqDoc.details.forEach(function(reqDetail) {
      var mlDetail = mlDoc.details.find(function(d) {
        return d.id === reqDetail.sourceDetailId || d.materialId === reqDetail.materialId;
      });
      if (mlDetail) {
        mlDetail.requisitionedQty = Math.round(((parseFloat(mlDetail.requisitionedQty) || 0) + (parseFloat(reqDetail.qty) || 0)) * 10000) / 10000;
        mlDetail.unRequisitionedQty = Math.round(Math.max(0, (parseFloat(mlDetail.requiredQty) || 0) - (parseFloat(mlDetail.requisitionedQty) || 0)) * 10000) / 10000;
      }
    });
    saveAllDocs('material_list', mlDoc ? [mlDoc] : mlDocs);
    if (mlDoc) {
      var all = getAllDocs('material_list');
      var idx = all.findIndex(function(d) { return d.id === mlDoc.id; });
      if (idx >= 0) { all[idx] = mlDoc; saveAllDocs('material_list', all); }
    }
  }

  /**
   * 生产入库单审核时反写生产订单
   */
  function backfillProductionOrder(inboundDoc) {
    console.log('[backfillProductionOrder] 开始, inboundDoc:', inboundDoc.docNo, 'header.sourceDocId:', inboundDoc.header.sourceDocId);
    if (!inboundDoc.details || inboundDoc.details.length === 0) {
      console.log('[backfillProductionOrder] 无明细, 返回');
      return;
    }
    var orderDocs = getAllDocs('production_order');
    // 从header或details中获取sourceDocId
    var sourceDocId = inboundDoc.header.sourceDocId || (inboundDoc.details[0] && inboundDoc.details[0].sourceDocId);
    console.log('[backfillProductionOrder] sourceDocId:', sourceDocId);
    if (!sourceDocId) {
      console.error('[backfillProductionOrder] 未找到sourceDocId');
      return;
    }
    var orderDoc = orderDocs.find(function(d) { return d.id === sourceDocId; });
    console.log('[backfillProductionOrder] 找到订单:', !!orderDoc, orderDoc ? orderDoc.docNo : '');
    if (!orderDoc) {
      console.error('[backfillProductionOrder] 未找到生产订单:', sourceDocId);
      return;
    }

    inboundDoc.details.forEach(function(inboundDetail) {
      console.log('[backfillProductionOrder] 处理明细, materialName:', inboundDetail.materialName, 'inboundQty:', inboundDetail.inboundQty);
      var orderDetail = orderDoc.details.find(function(d) {
        return d.id === inboundDetail.sourceDetailId || d.materialId === inboundDetail.materialId;
      });
      console.log('[backfillProductionOrder] 找到订单明细:', !!orderDetail, orderDetail ? orderDetail.materialName : '');
      if (orderDetail) {
        var qty = parseFloat(inboundDetail.inboundQty || inboundDetail.qty) || 0;
        var oldInboundQty = parseFloat(orderDetail.inboundQty) || 0;
        orderDetail.inboundQty = Math.round((oldInboundQty + qty) * 10000) / 10000;
        orderDetail.unInboundQty = Math.round(Math.max(0, (parseFloat(orderDetail.qty) || 0) - (parseFloat(orderDetail.inboundQty) || 0)) * 10000) / 10000;
        console.log('[backfillProductionOrder] 反写完成, oldInboundQty:', oldInboundQty, 'newInboundQty:', orderDetail.inboundQty, 'unInboundQty:', orderDetail.unInboundQty);
      }
    });

    var idx = orderDocs.findIndex(function(d) { return d.id === orderDoc.id; });
    if (idx >= 0) { orderDocs[idx] = orderDoc; saveAllDocs('production_order', orderDocs); }
    console.log('[backfillProductionOrder] 完成, 已保存');
  }

  /**
   * 完工汇报审核时：判断是否需要检验
   * 如果产品物料inspectType='1'，需先生成检验单；否则可直接生成入库单
   */
  function completionReportNeedsInspection(reportDoc) {
    if (!reportDoc.details) return false;
    return reportDoc.details.some(function(d) {
      return d.inspectType === '1' || d.needInspection === true;
    });
  }

  /**
   * 获取生产订单可用的下推动作
   */
  function getProductionOrderActions(orderDoc) {
    var actions = [];
    if (!orderDoc) return actions;
    var status = orderDoc.status;
    var inboundType = orderDoc.header.inboundType || 'direct';

    // 已审核/已确认/已下达/已开工状态可生成用料清单
    if (status >= PROD_STATUS.APPROVED && status <= PROD_STATUS.STARTED) {
      var hasML = getAllDocs('material_list').some(function(ml) { return ml.header.sourceDocId === orderDoc.id; });
      if (!hasML) actions.push({ key: 'material_list', label: '生成用料清单' });
    }

    // 已下达/已开工可领料
    if (status >= PROD_STATUS.RELEASED && status <= PROD_STATUS.STARTED) {
      actions.push({ key: 'material_requisition', label: '领料' });
    }

    // 直接入库类型：已下达后可直接入库
    if (inboundType === 'direct' && status >= PROD_STATUS.RELEASED && status <= PROD_STATUS.COMPLETED) {
      actions.push({ key: 'production_inbound', label: '生产入库' });
    }

    // 汇报入库类型：需先完工汇报
    if (inboundType === 'report' && status >= PROD_STATUS.RELEASED && status <= PROD_STATUS.COMPLETED) {
      actions.push({ key: 'completion_report', label: '完工汇报' });
    }

    // 工序汇报入库类型：需先工序计划
    if (inboundType === 'process' && status >= PROD_STATUS.RELEASED && status <= PROD_STATUS.COMPLETED) {
      actions.push({ key: 'process_plan', label: '工序计划' });
    }

    return actions;
  }

  /**
   * 初始化测试数据
   */
  function initTestData() {
    // 始终确保生产测试数据已初始化（独立标志）
    initProductionTestData();

    // === 基础资料缓存初始化 ===
    // 始终检查并初始化基础资料，不依赖初始化标志
    if (!localStorage.getItem('erp_customers_cache')) {
      localStorage.setItem('erp_customers_cache', JSON.stringify([
        { id: 'cust-001', name: '上海宏远电子科技有限公司', code: 'C-001', status: 1 },
        { id: 'cust-002', name: '北京中科智能装备有限公司', code: 'C-002', status: 1 },
        { id: 'cust-003', name: '广州智能制造研究院', code: 'C-003', status: 1 },
        { id: 'cust-004', name: '苏州工业园区科技有限公司', code: 'C-004', status: 1 }
      ]));
    }
    if (!localStorage.getItem('erp_suppliers_cache')) {
      localStorage.setItem('erp_suppliers_cache', JSON.stringify([
        { id: 'supp-001', name: '深圳鑫达电子有限公司', code: 'S-001', status: 1 },
        { id: 'supp-002', name: '东莞精密五金制品厂', code: 'S-002', status: 1 },
        { id: 'supp-003', name: '杭州半导体材料有限公司', code: 'S-003', status: 1 },
        { id: 'supp-004', name: '南京精密机械有限公司', code: 'S-004', status: 1 }
      ]));
    }
    if (!localStorage.getItem('erp_materials_cache')) {
      localStorage.setItem('erp_materials_cache', JSON.stringify([
        { id: 'mat-001', name: '高频传感器模块', code: 'P-001', specification: 'HT-2026', unit: '个', inspectType: '0', status: 1 },
        { id: 'mat-002', name: '控制电路板', code: 'P-002', specification: 'CB-2026', unit: '块', inspectType: '0', status: 1 },
        { id: 'mat-005', name: '智能控制器', code: 'P-003', specification: 'IC-V3', unit: '台', inspectType: '0', status: 1 },
        { id: 'mat-006', name: '电源模块', code: 'P-004', specification: 'PM-500W', unit: '个', inspectType: '0', status: 1 },
        { id: 'mat-020', name: '工业网关', code: 'P-010', specification: 'GW-2000', unit: '台', inspectType: '1', status: 1 },
        { id: 'mat-010', name: 'PCB电路板', code: 'M-010', specification: 'FR-4双层', unit: '块', inspectType: '0', status: 1 },
        { id: 'mat-011', name: '贴片电阻', code: 'M-011', specification: '10KΩ 0603', unit: '个', inspectType: '0', status: 1 },
        { id: 'mat-012', name: '贴片电容', code: 'M-012', specification: '100μF 0805', unit: '个', inspectType: '0', status: 1 },
        { id: 'mat-008', name: '螺丝', code: 'M-004', specification: 'M4x10', unit: '包', inspectType: '0', status: 1 },
        { id: 'mat-013', name: '变压器', code: 'M-013', specification: '220V→12V', unit: '个', inspectType: '0', status: 1 },
        { id: 'mat-014', name: '散热片', code: 'M-014', specification: '铝制40x40', unit: '片', inspectType: '0', status: 1 },
        { id: 'mat-015', name: '主控芯片', code: 'M-015', specification: 'ARM-A53', unit: '片', inspectType: '1', status: 1 },
        { id: 'mat-016', name: '通信模组', code: 'M-016', specification: '4G+WiFi', unit: '个', inspectType: '1', status: 1 }
      ]));
    }
    if (!localStorage.getItem('erp_warehouses_cache')) {
      localStorage.setItem('erp_warehouses_cache', JSON.stringify([
        { id: 'wh-001', name: '成品仓', code: 'WH-001', status: 1 },
        { id: 'wh-002', name: '原料仓', code: 'WH-002', status: 1 },
        { id: 'wh-003', name: '半成品仓', code: 'WH-003', status: 1 },
        { id: 'wh-004', name: '辅料仓', code: 'WH-004', status: 1 }
      ]));
    }
    if (!localStorage.getItem('erp_departments_cache')) {
      localStorage.setItem('erp_departments_cache', JSON.stringify([
        { id: 'dept-001', name: '销售一部', code: 'D-S01', status: 1 },
        { id: 'dept-002', name: '销售二部', code: 'D-S02', status: 1 },
        { id: 'dept-003', name: '采购部', code: 'D-P01', status: 1 },
        { id: 'dept-004', name: '生产一部', code: 'D-M01', status: 1 },
        { id: 'dept-005', name: '生产二部', code: 'D-M02', status: 1 },
        { id: 'dept-006', name: '质量部', code: 'D-Q01', status: 1 },
        { id: 'dept-007', name: '仓库管理部', code: 'D-W01', status: 1 }
      ]));
    }
    if (!localStorage.getItem('erp_employees_cache')) {
      localStorage.setItem('erp_employees_cache', JSON.stringify([
        { id: 'emp-001', name: '张明', code: 'EMP-001', department: '销售一部', status: 1 },
        { id: 'emp-002', name: '王芳', code: 'EMP-002', department: '销售二部', status: 1 },
        { id: 'emp-003', name: '李强', code: 'EMP-003', department: '采购部', status: 1 },
        { id: 'emp-004', name: '陈刚', code: 'EMP-004', department: '生产一部', status: 1 },
        { id: 'emp-005', name: '林芳', code: 'EMP-005', department: '生产二部', status: 1 },
        { id: 'emp-006', name: '赵伟', code: 'EMP-006', department: '质量部', status: 1 }
      ]));
    }
    if (!localStorage.getItem('erp_units_cache')) {
      localStorage.setItem('erp_units_cache', JSON.stringify([
        { id: 'unit-001', name: '个', code: 'PC' },
        { id: 'unit-002', name: '台', code: 'SET' },
        { id: 'unit-003', name: '块', code: 'BLK' },
        { id: 'unit-004', name: '包', code: 'PKG' },
        { id: 'unit-005', name: '片', code: 'SHT' }
      ]));
    }

    var org = getOrgId();

    // === 销售流程测试数据 ===
    // 1. 创建销售报价单（已审核，可下推）
    var quote = createDoc('sales_quote', {
      customerName: '上海宏远电子科技有限公司',
      customerCode: 'C-001',
      customerId: 'cust-001',
      quoteDate: new Date().toISOString().slice(0, 10),
      validUntil: '2026-12-31',
      salesPerson: '张明',
      department: '销售一部',
      currency: 'CNY',
      exchangeRate: 1,
      remark: '测试报价单-可下推'
    }, [
      {
        id: genId(),
        materialId: 'mat-001', materialCode: 'P-001', materialName: '高频传感器模块',
        specification: 'HT-2026', unit: '个', qty: 100, unitPrice: 150, amount: 15000,
        taxRate: 13, taxAmount: 1950, totalAmount: 16950, pushedQty: 0
      },
      {
        id: genId(),
        materialId: 'mat-002', materialCode: 'P-002', materialName: '控制电路板',
        specification: 'CB-2026', unit: '块', qty: 200, unitPrice: 85, amount: 17000,
        taxRate: 13, taxAmount: 2210, totalAmount: 19210, pushedQty: 0
      }
    ]);
    updateStatus('sales_quote', quote.id, STATUS.SUBMITTED);
    approveDoc('sales_quote', quote.id);

    // 2. 创建一个已审核的销售订单（可直接下推发货通知）
    var order = createDoc('sales_order', {
      customerName: '北京中科智能装备有限公司',
      customerCode: 'C-002',
      customerId: 'cust-002',
      orderDate: new Date().toISOString().slice(0, 10),
      deliveryDate: '2026-08-15',
      salesPerson: '王芳',
      department: '销售二部',
      currency: 'CNY',
      exchangeRate: 1,
      taxRate: 13,
      remark: '测试订单-可下推发货通知'
    }, [
      {
        id: genId(),
        materialId: 'mat-005', materialCode: 'P-003', materialName: '智能控制器',
        specification: 'IC-V3', unit: '台', qty: 50, unitPrice: 2800, amount: 140000,
        taxRate: 13, taxAmount: 18200, totalAmount: 158200, pushedQty: 0,
        notifiedQty: 0, unNotifiedQty: 50, outboundQty: 0, unOutboundQty: 50
      },
      {
        id: genId(),
        materialId: 'mat-006', materialCode: 'P-004', materialName: '电源模块',
        specification: 'PM-500W', unit: '个', qty: 100, unitPrice: 320, amount: 32000,
        taxRate: 13, taxAmount: 4160, totalAmount: 36160, pushedQty: 0,
        notifiedQty: 0, unNotifiedQty: 100, outboundQty: 0, unOutboundQty: 100
      }
    ]);
    updateStatus('sales_order', order.id, STATUS.SUBMITTED);
    approveDoc('sales_order', order.id);

    // 3. 创建一个已审核的发货通知单（可直接下推出库）
    var delivery = createDoc('sales_delivery', {
      customerName: '北京中科智能装备有限公司',
      customerCode: 'C-002',
      customerId: 'cust-002',
      deliveryDate: new Date().toISOString().slice(0, 10),
      warehouse: '成品仓',
      logisticsMethod: '快递',
      trackingNo: 'SF1234567890',
      shippingAddress: '北京市海淀区中关村大街1号',
      remark: '测试发货通知-可下推出库',
      sourceDocType: 'sales_order',
      sourceDocNo: order.docNo,
      sourceDocId: order.id
    }, [
      {
        id: genId(),
        sourceDocId: order.id,
        sourceDocNo: order.docNo,
        sourceDetailId: order.details[0].id,
        sourceRowNum: 1,
        materialId: 'mat-005', materialCode: 'P-003', materialName: '智能控制器',
        specification: 'IC-V3', unit: '台', qty: 30, orderQty: 50, unitPrice: 2800, amount: 84000,
        outboundQty: 0, unOutboundQty: 30
      }
    ]);
    updateStatus('sales_delivery', delivery.id, STATUS.SUBMITTED);
    approveDoc('sales_delivery', delivery.id);

    // === 采购流程测试数据 ===
    // 1. 创建采购申请单（已审核，可下推）
    var pr = createDoc('purchase_request', {
      supplierName: '深圳鑫达电子有限公司',
      supplierCode: 'S-001',
      supplierId: 'supp-001',
      requestDate: new Date().toISOString().slice(0, 10),
      needDate: '2026-08-01',
      department: '采购部',
      buyer: '李强',
      currency: 'CNY',
      exchangeRate: 1,
      remark: '测试采购申请-可下推'
    }, [
      {
        id: genId(),
        materialId: 'mat-003', materialCode: 'M-001', materialName: '铜线',
        specification: '1.5mm', unit: '米', qty: 5000, unitPrice: 2.5, amount: 12500,
        taxRate: 13, taxAmount: 1625, totalAmount: 14125, pushedQty: 0,
        needInspection: true, inspectType: '1'
      },
      {
        id: genId(),
        materialId: 'mat-004', materialCode: 'M-002', materialName: '包装盒',
        specification: '300x200x100', unit: '个', qty: 1000, unitPrice: 3, amount: 3000,
        taxRate: 13, taxAmount: 390, totalAmount: 3390, pushedQty: 0,
        needInspection: false, inspectType: '0'
      }
    ]);
    updateStatus('purchase_request', pr.id, STATUS.SUBMITTED);
    approveDoc('purchase_request', pr.id);

    // 2. 创建已审核的采购订单（可下推收料请检）
    var po = createDoc('purchase_order', {
      supplierName: '东莞精密五金制品厂',
      supplierCode: 'S-002',
      supplierId: 'supp-002',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate: '2026-07-25',
      department: '采购部',
      buyer: '赵伟',
      currency: 'CNY',
      exchangeRate: 1,
      taxRate: 13,
      remark: '测试采购订单-可下推收料'
    }, [
      {
        id: genId(),
        materialId: 'mat-007', materialCode: 'M-003', materialName: '不锈钢板材',
        specification: '304 2mm', unit: '千克', qty: 2000, unitPrice: 18, amount: 36000,
        taxRate: 13, taxAmount: 4680, totalAmount: 40680, pushedQty: 0,
        needInspection: true, inspectType: '1',
        receivedQty: 0, unReceivedQty: 2000, inboundQty: 0, unInboundQty: 2000
      },
      {
        id: genId(),
        materialId: 'mat-008', materialCode: 'M-004', materialName: '螺丝',
        specification: 'M4x10', unit: '包', qty: 500, unitPrice: 5, amount: 2500,
        taxRate: 13, taxAmount: 325, totalAmount: 2825, pushedQty: 0,
        needInspection: false, inspectType: '0',
        receivedQty: 0, unReceivedQty: 500, inboundQty: 0, unInboundQty: 500
      }
    ]);
    updateStatus('purchase_order', po.id, STATUS.SUBMITTED);
    approveDoc('purchase_order', po.id);

    localStorage.setItem('erp_test_data_initialized_' + getOrgId(), 'true');

    // === 生产流程测试数据（独立初始化标志）===
    initProductionTestData();
  }

  function initProductionTestData() {
    if (localStorage.getItem('erp_prod_data_initialized_' + getOrgId())) return;

    // 初始化BOM数据
    getBomData();

    // 1. 创建已审核的生产订单（直接入库类型，可生成用料清单）
    var mo1 = createDoc('production_order', {
      orderDate: new Date().toISOString().slice(0, 10),
      plannedStart: '2026-07-20',
      plannedFinish: '2026-08-10',
      department: '生产一部',
      workshop: '一车间',
      productionManager: '陈刚',
      inboundType: 'direct',
      remark: '测试生产订单-智能控制器-直接入库'
    }, [
      {
        id: genId(),
        materialId: 'mat-005', materialCode: 'P-003', materialName: '智能控制器',
        specification: 'IC-V3', unit: '台', qty: 100, unitPrice: 2800, amount: 280000,
        pushedQty: 0, inboundQty: 0, unInboundQty: 100, inspectType: '0'
      }
    ]);
    updateStatus('production_order', mo1.id, STATUS.SUBMITTED);
    approveDoc('production_order', mo1.id);

    // 2. 创建已审核且已确认的生产订单（汇报入库类型，需完工汇报+检验）
    var mo2 = createDoc('production_order', {
      orderDate: new Date().toISOString().slice(0, 10),
      plannedStart: '2026-07-18',
      plannedFinish: '2026-08-05',
      department: '生产二部',
      workshop: '二车间',
      productionManager: '林芳',
      inboundType: 'report',
      remark: '测试生产订单-工业网关-汇报入库(需检验)'
    }, [
      {
        id: genId(),
        materialId: 'mat-020', materialCode: 'P-010', materialName: '工业网关',
        specification: 'GW-2000', unit: '台', qty: 50, unitPrice: 3500, amount: 175000,
        pushedQty: 0, inboundQty: 0, unInboundQty: 50, inspectType: '1'
      }
    ]);
    updateStatus('production_order', mo2.id, STATUS.SUBMITTED);
    approveDoc('production_order', mo2.id);
    advanceProdStatus(mo2.id); // → 已确认

    // 3. 创建已下达的生产订单（工序汇报入库类型）
    var mo3 = createDoc('production_order', {
      orderDate: new Date().toISOString().slice(0, 10),
      plannedStart: '2026-07-15',
      plannedFinish: '2026-07-30',
      department: '生产一部',
      workshop: '一车间',
      productionManager: '陈刚',
      inboundType: 'process',
      remark: '测试生产订单-电源模块-工序汇报入库'
    }, [
      {
        id: genId(),
        materialId: 'mat-006', materialCode: 'P-004', materialName: '电源模块',
        specification: 'PM-500W', unit: '个', qty: 200, unitPrice: 320, amount: 64000,
        pushedQty: 0, inboundQty: 0, unInboundQty: 200, inspectType: '0'
      }
    ]);
    updateStatus('production_order', mo3.id, STATUS.SUBMITTED);
    approveDoc('production_order', mo3.id);
    advanceProdStatus(mo3.id); // → 已确认
    advanceProdStatus(mo3.id); // → 已下达

    localStorage.setItem('erp_prod_data_initialized_' + getOrgId(), 'true');
  }

  /**
   * 重置测试数据（清除所有单据数据并重新初始化）
   */
  function resetTestData() {
    var orgId = getOrgId();
    Object.keys(DOC_TYPES).forEach(function(docType) {
      localStorage.removeItem(STORAGE_PREFIX + docType + '_' + orgId);
    });
    localStorage.removeItem('erp_test_data_initialized_' + orgId);
    localStorage.removeItem('erp_prod_data_initialized_' + orgId);
    // 重置序号
    Object.keys(DOC_TYPES).forEach(function(docType) {
      localStorage.removeItem(SEQ_PREFIX + docType);
    });
    initTestData();
  }

  // 公开API
  return {
    DOC_TYPES: DOC_TYPES,
    STATUS: STATUS,
    STATUS_LABELS: STATUS_LABELS,
    PROD_STATUS: PROD_STATUS,
    PROD_STATUS_LABELS: PROD_STATUS_LABELS,
    PROD_FLOW: PROD_FLOW,
    INBOUND_TYPES: INBOUND_TYPES,
    createDoc: createDoc,
    updateDoc: updateDoc,
    updateStatus: updateStatus,
    deleteDoc: deleteDoc,
    getDoc: getDoc,
    getDocByNo: getDocByNo,
    listDocs: listDocs,
    getPushableDocs: getPushableDocs,
    calcDetailRemaining: calcDetailRemaining,
    pushDown: pushDown,
    backfillUpstream: backfillUpstream,
    approveDoc: approveDoc,
    submitDoc: submitDoc,
    rejectDoc: rejectDoc,
    closeDoc: closeDoc,
    needsInspection: needsInspection,
    getMaterialInfo: getMaterialInfo,
    getDocChain: getDocChain,
    genDocNo: genDocNo,
    genId: genId,
    initTestData: initTestData,
    resetTestData: resetTestData,
    getOrgId: getOrgId,
    // 生产流程API
    getProdStatusLabel: getProdStatusLabel,
    advanceProdStatus: advanceProdStatus,
    generateMaterialList: generateMaterialList,
    updateMaterialList: updateMaterialList,
    backfillMaterialList: backfillMaterialList,
    backfillProductionOrder: backfillProductionOrder,
    completionReportNeedsInspection: completionReportNeedsInspection,
    getProductionOrderActions: getProductionOrderActions,
    getBomData: getBomData,
    getBomByProduct: getBomByProduct
  };
})();
