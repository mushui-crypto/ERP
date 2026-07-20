var ConversionRules = [
  {"source_doc":"purchase_request","target_doc":"purchase_order","name":"采购申请单下推采购订单","quantity_control":"allow_over_ratio","max_over_ratio":0.1,"reverse_write":{"order_qty":"订单数量","receive_qty":"收料数量","inbound_qty":"入库数量","unordered_qty":"未订货数量","unreceived_qty":"未到货数量","uninbound_qty":"未入库数量"}},
  {"source_doc":"purchase_order","target_doc":"purchase_receive","name":"采购订单下推收料通知单","quantity_control":"no_over","reverse_write":{"receive_qty":"收料数量","inspect_qty":"检验数量","inbound_qty":"入库数量","unreceived_qty":"未到货数量","uninbound_qty":"未入库数量"}},
  {"source_doc":"purchase_receive","target_doc":"purchase_inspect","name":"收料通知单下推检验单","condition":"material_need_inspect","quantity_control":"no_over","reverse_write":{"inspect_qty":"检验数量","qualified_qty":"合格数量","inbound_qty":"入库数量","uninspect_qty":"未检验数量","uninbound_qty":"未入库数量"}},
  {"source_doc":"purchase_inspect","target_doc":"purchase_inbound","name":"检验单下推采购入库单","quantity_control":"no_over_qualified","reverse_write":{"inbound_qty":"入库数量","uninbound_qty":"未入库数量"}},
  {"source_doc":"purchase_receive","target_doc":"purchase_inbound","name":"收料通知单直接下推采购入库单","condition":"material_no_inspect","quantity_control":"no_over","reverse_write":{"inbound_qty":"入库数量","uninbound_qty":"未入库数量"}},
  {"source_doc":"sales_quotation","target_doc":"sales_order","name":"销售报价单下推销售订单","quantity_control":"no_over","reverse_write":{}},
  {"source_doc":"sales_order","target_doc":"sales_delivery","name":"销售订单下推销售发货单","quantity_control":"no_over","reverse_write":{"delivery_qty":"发货数量","outbound_qty":"出库数量","undelivered_qty":"未发货数量"}},
  {"source_doc":"sales_delivery","target_doc":"sales_outbound","name":"销售发货单下推销售出库单","quantity_control":"no_over","reverse_write":{"outbound_qty":"出库数量","unoutbound_qty":"未出库数量"}},
  {"source_doc":"production_order","target_doc":"production_material_request","name":"生产订单下推生产领料单","quantity_control":"no_over","reverse_write":{"issue_qty":"领料数量","return_qty":"退料数量","unissued_qty":"未领料数量"}},
  {"source_doc":"production_material_request","target_doc":"production_material_return","name":"生产领料单下推生产退料单","quantity_control":"no_over_issued","reverse_write":{"return_qty":"退料数量"}},
  {"source_doc":"production_order","target_doc":"production_inbound","name":"生产订单下推生产入库单","quantity_control":"no_over","reverse_write":{"inbound_qty":"入库数量","uninbound_qty":"未入库数量"}},
  {"source_doc":"production_order","target_doc":"production_inspect","name":"生产订单下推生产汇报请检单","quantity_control":"no_over","reverse_write":{"inspect_qty":"送检数量","qualified_qty":"合格数量"}},
  {"source_doc":"production_inspect","target_doc":"production_inbound","name":"生产汇报请检单下推生产入库单","quantity_control":"no_over_qualified","reverse_write":{"inbound_qty":"入库数量","uninbound_qty":"未入库数量"}}
];

function logConversion(message, data) {
  var timestamp = new Date().toISOString().replace('T', ' ').slice(0, 23);
  var logMsg = '[CONVERSION] [' + timestamp + '] ' + message;
  if (data !== undefined) {
    console.log(logMsg, data);
  } else {
    console.log(logMsg);
  }
}

function getConversionRule(sourceDocType, targetDocType) {
  logConversion('getConversionRule', { sourceDocType: sourceDocType, targetDocType: targetDocType });
  var rule = ConversionRules.find(function(r) {
    return r.source_doc === sourceDocType && r.target_doc === targetDocType;
  });
  logConversion('转换规则查询结果', rule ? rule.name : '未找到');
  return rule;
}

function getSourceRules(targetDocType) {
  logConversion('getSourceRules', { targetDocType: targetDocType });
  var rules = ConversionRules.filter(function(r) {
    return r.target_doc === targetDocType;
  });
  logConversion('源规则查询结果', { count: rules.length, rules: rules.map(function(r) { return r.name; }) });
  return rules;
}

function getTargetRules(sourceDocType) {
  logConversion('getTargetRules', { sourceDocType: sourceDocType });
  var rules = ConversionRules.filter(function(r) {
    return r.source_doc === sourceDocType;
  });
  logConversion('目标规则查询结果', { count: rules.length, rules: rules.map(function(r) { return r.name; }) });
  return rules;
}

function getLinkageRecords() {
  var data = localStorage.getItem('erp_doc_linkage');
  var records = data ? JSON.parse(data) : [];
  logConversion('getLinkageRecords', { count: records.length });
  return records;
}

function saveLinkageRecord(record) {
  logConversion('saveLinkageRecord', record);
  var records = getLinkageRecords();
  records.push(record);
  localStorage.setItem('erp_doc_linkage', JSON.stringify(records));
  logConversion('关联记录保存成功', { totalRecords: records.length });
}

function getSourceDocUsedQty(sourceDocId, sourceDetailIndex) {
  logConversion('getSourceDocUsedQty', { sourceDocId: sourceDocId, sourceDetailIndex: sourceDetailIndex });
  var records = getLinkageRecords();
  var totalUsed = 0;
  records.forEach(function(r) {
    if (r.source_doc_id === sourceDocId && r.source_detail_index === sourceDetailIndex) {
      totalUsed += parseFloat(r.converted_qty) || 0;
    }
  });
  logConversion('已使用数量计算结果', { totalUsed: totalUsed });
  return totalUsed;
}

function validateConvertQuantity(sourceDocType, sourceDetail, targetQty) {
  logConversion('validateConvertQuantity START', { sourceDocType: sourceDocType, sourceDetailIndex: sourceDetail.detail_index, targetQty: targetQty });
  var rules = getTargetRules(sourceDocType);
  if (!rules || rules.length === 0) {
    logConversion('validateConvertQuantity END', { valid: true, reason: '无转换规则' });
    return { valid: true, message: '' };
  }
  
  var rule = rules[0];
  var sourceQty = parseFloat(sourceDetail.数量) || 0;
  var usedQty = getSourceDocUsedQty(sourceDetail.doc_id || sourceDetail.source_doc_id, sourceDetail.detail_index);
  var remainingQty = sourceQty - usedQty;
  
  logConversion('数量校验参数', { sourceQty: sourceQty, usedQty: usedQty, remainingQty: remainingQty, quantityControl: rule.quantity_control });
  
  var result;
  
  if (rule.quantity_control === 'no_over') {
    if (targetQty > remainingQty) {
      result = { valid: false, message: '下推数量不能超过剩余数量，剩余数量: ' + remainingQty.toFixed(2) };
    } else {
      result = { valid: true, message: '' };
    }
  } else if (rule.quantity_control === 'allow_over_ratio') {
    var maxOverQty = sourceQty * (rule.max_over_ratio || 0);
    var maxAllowed = sourceQty + maxOverQty;
    logConversion('超比例校验', { maxOverRatio: rule.max_over_ratio, maxOverQty: maxOverQty, maxAllowed: maxAllowed });
    if (usedQty + targetQty > maxAllowed) {
      result = { valid: false, message: '下推数量超过允许比例，最大允许: ' + maxAllowed.toFixed(2) };
    } else {
      result = { valid: true, message: '' };
    }
  } else if (rule.quantity_control === 'no_over_qualified') {
    var qualifiedQty = parseFloat(sourceDetail.合格数量) || parseFloat(sourceDetail.qualified_qty) || 0;
    var usedQualified = getSourceDocUsedQty(sourceDetail.doc_id || sourceDetail.source_doc_id, sourceDetail.detail_index);
    var remainingQualified = qualifiedQty - usedQualified;
    logConversion('合格数量校验', { qualifiedQty: qualifiedQty, usedQualified: usedQualified, remainingQualified: remainingQualified });
    if (targetQty > remainingQualified) {
      result = { valid: false, message: '入库数量不能超过合格数量，剩余合格数量: ' + remainingQualified.toFixed(2) };
    } else {
      result = { valid: true, message: '' };
    }
  } else if (rule.quantity_control === 'no_over_issued') {
    var issuedQty = parseFloat(sourceDetail.领料数量) || parseFloat(sourceDetail.issue_qty) || sourceQty;
    var returnedQty = 0;
    var records = getLinkageRecords();
    records.forEach(function(r) {
      if (r.source_doc_id === (sourceDetail.doc_id || sourceDetail.source_doc_id) && r.source_detail_index === sourceDetail.detail_index && r.target_doc === 'production_material_return') {
        returnedQty += parseFloat(r.converted_qty) || 0;
      }
    });
    var remainingIssued = issuedQty - returnedQty;
    logConversion('已领料校验', { issuedQty: issuedQty, returnedQty: returnedQty, remainingIssued: remainingIssued });
    if (targetQty > remainingIssued) {
      result = { valid: false, message: '退料数量不能超过已领料数量，剩余可退: ' + remainingIssued.toFixed(2) };
    } else {
      result = { valid: true, message: '' };
    }
  } else {
    result = { valid: true, message: '' };
  }
  
  logConversion('validateConvertQuantity END', result);
  return result;
}

function checkMaterialNeedInspect(materialCode) {
  logConversion('checkMaterialNeedInspect', { materialCode: materialCode });
  var materials = JSON.parse(localStorage.getItem('erp_materials_cache') || '[]');
  var material = materials.find(function(m) {
    return m.code === materialCode;
  });
  var needInspect = material ? (material.needInspect === true || material.need_inspect === '1') : false;
  logConversion('物料检验判断结果', { materialCode: materialCode, needInspect: needInspect, materialName: material ? material.name : '未找到' });
  return needInspect;
}

function executeReverseWrite(targetDoc) {
  logConversion('executeReverseWrite START', { targetDocId: targetDoc.id, targetDocType: targetDoc.docType });
  var linkageRecords = getLinkageRecords();
  var relatedRecords = linkageRecords.filter(function(r) {
    return r.target_doc_id === targetDoc.id;
  });
  
  logConversion('关联记录查询', { totalLinkageRecords: linkageRecords.length, relatedRecords: relatedRecords.length });
  
  if (relatedRecords.length === 0) {
    logConversion('executeReverseWrite END', { reason: '无关联记录，跳过反写' });
    return;
  }
  
  relatedRecords.forEach(function(record) {
    logConversion('处理关联记录', record);
    
    var sourceDocType = record.source_doc;
    var sourceDocId = record.source_doc_id;
    var sourceDetailIndex = record.source_detail_index;
    var convertedQty = parseFloat(record.converted_qty) || 0;
    
    var rule = getConversionRule(sourceDocType, record.target_doc);
    if (!rule) {
      logConversion('警告', { reason: '未找到转换规则', sourceDocType: sourceDocType, targetDocType: record.target_doc });
      return;
    }
    
    if (!rule.reverse_write || Object.keys(rule.reverse_write).length === 0) {
      logConversion('跳过反写', { reason: '转换规则无反写字段', ruleName: rule.name });
      return;
    }
    
    var sourceListKey = 'erp_' + sourceDocType + '_list';
    logConversion('读取源单据列表', { sourceListKey: sourceListKey });
    var sourceList = JSON.parse(localStorage.getItem(sourceListKey) || '[]');
    var sourceDoc = sourceList.find(function(d) { return d.id === sourceDocId; });
    
    if (!sourceDoc) {
      logConversion('错误', { reason: '未找到源单据', sourceDocId: sourceDocId, sourceListKey: sourceListKey });
      return;
    }
    
    if (!sourceDoc.details || !sourceDoc.details[sourceDetailIndex]) {
      logConversion('错误', { reason: '未找到源单据明细行', sourceDetailIndex: sourceDetailIndex, totalDetails: sourceDoc.details ? sourceDoc.details.length : 0 });
      return;
    }
    
    var sourceDetail = sourceDoc.details[sourceDetailIndex];
    var sourceQty = parseFloat(sourceDetail.数量) || 0;
    
    logConversion('反写前明细状态', { sourceQty: sourceQty, convertedQty: convertedQty, detailIndex: sourceDetailIndex });
    
    var changedFields = [];
    
    Object.keys(rule.reverse_write).forEach(function(key) {
      var fieldName = rule.reverse_write[key];
      
      if (key === 'order_qty') {
        sourceDetail.订单数量 = (parseFloat(sourceDetail.订单数量) || 0) + convertedQty;
        sourceDetail.未订货数量 = Math.max(0, sourceQty - parseFloat(sourceDetail.订单数量));
        changedFields.push({ field: fieldName, value: sourceDetail.订单数量 });
      } else if (key === 'receive_qty') {
        sourceDetail.收料数量 = (parseFloat(sourceDetail.收料数量) || 0) + convertedQty;
        sourceDetail.未到货数量 = Math.max(0, (parseFloat(sourceDetail.数量) || 0) - parseFloat(sourceDetail.收料数量));
        changedFields.push({ field: fieldName, value: sourceDetail.收料数量 });
      } else if (key === 'inspect_qty') {
        sourceDetail[fieldName] = (parseFloat(sourceDetail[fieldName]) || 0) + convertedQty;
        changedFields.push({ field: fieldName, value: sourceDetail[fieldName] });
      } else if (key === 'qualified_qty') {
        sourceDetail[fieldName] = (parseFloat(sourceDetail[fieldName]) || 0) + convertedQty;
        changedFields.push({ field: fieldName, value: sourceDetail[fieldName] });
      } else if (key === 'inbound_qty') {
        sourceDetail.入库数量 = (parseFloat(sourceDetail.入库数量) || 0) + convertedQty;
        sourceDetail.未入库数量 = Math.max(0, (parseFloat(sourceDetail.数量) || 0) - parseFloat(sourceDetail.入库数量));
        changedFields.push({ field: fieldName, value: sourceDetail.入库数量 });
      } else if (key === 'delivery_qty') {
        sourceDetail.发货数量 = (parseFloat(sourceDetail.发货数量) || 0) + convertedQty;
        sourceDetail.未发货数量 = Math.max(0, (parseFloat(sourceDetail.数量) || 0) - parseFloat(sourceDetail.发货数量));
        changedFields.push({ field: fieldName, value: sourceDetail.发货数量 });
      } else if (key === 'outbound_qty') {
        sourceDetail.出库数量 = (parseFloat(sourceDetail.出库数量) || 0) + convertedQty;
        sourceDetail.未出库数量 = Math.max(0, (parseFloat(sourceDetail.数量) || 0) - parseFloat(sourceDetail.出库数量));
        changedFields.push({ field: fieldName, value: sourceDetail.出库数量 });
      } else if (key === 'issue_qty') {
        sourceDetail.领料数量 = (parseFloat(sourceDetail.领料数量) || 0) + convertedQty;
        sourceDetail.未领料数量 = Math.max(0, (parseFloat(sourceDetail.数量) || 0) - parseFloat(sourceDetail.领料数量));
        changedFields.push({ field: fieldName, value: sourceDetail.领料数量 });
      } else if (key === 'return_qty') {
        sourceDetail.退料数量 = (parseFloat(sourceDetail.退料数量) || 0) + convertedQty;
        changedFields.push({ field: fieldName, value: sourceDetail.退料数量 });
      }
    });
    
    logConversion('反写后明细状态', { changedFields: changedFields });
    
    localStorage.setItem(sourceListKey, JSON.stringify(sourceList));
    logConversion('源单据列表已更新', { sourceListKey: sourceListKey });
  });
  
  logConversion('executeReverseWrite END');
}

function calculateHeaderReverseWriteFields(doc) {
  logConversion('calculateHeaderReverseWriteFields START', { docId: doc.id, detailCount: doc.details ? doc.details.length : 0 });
  if (!doc.details || doc.details.length === 0) {
    logConversion('calculateHeaderReverseWriteFields END', { reason: '无明细数据' });
    return;
  }
  
  var totals = {};
  doc.details.forEach(function(detail) {
    ['订单数量', '收料数量', '入库数量', '未订货数量', '未到货数量', '未入库数量', '检验数量', '合格数量', '不合格数量', '未检验数量', '发货数量', '出库数量', '未发货数量', '未出库数量', '领料数量', '退料数量', '未领料数量'].forEach(function(field) {
      totals[field] = (totals[field] || 0) + (parseFloat(detail[field]) || 0);
    });
  });
  
  var updatedFields = [];
  Object.keys(totals).forEach(function(field) {
    if (doc[field] !== undefined) {
      doc[field] = totals[field].toFixed(2);
      updatedFields.push({ field: field, value: doc[field] });
    }
  });
  
  logConversion('表头反写字段汇总', { updatedFields: updatedFields });
  logConversion('calculateHeaderReverseWriteFields END');
}

function getBOMByMaterialCode(materialCode) {
  logConversion('getBOMByMaterialCode', { materialCode: materialCode });
  var bomList = JSON.parse(localStorage.getItem('erp_bom_list') || '[]');
  var bom = bomList.find(function(b) {
    return b.materialCode === materialCode;
  });
  logConversion('BOM查询结果', { found: bom !== undefined, version: bom ? bom.version : '无' });
  return bom;
}

function getQuantityFieldName(targetDocType) {
  var fieldMap = {
    'purchase_inspect': '送检数量',
    'production_inspect': '送检数量',
    'production_material_request': '数量',
    'production_material_return': '数量',
    'production_inbound': '数量'
  };
  return fieldMap[targetDocType] || '数量';
}

function prepareConvertData(sourceDoc, targetDocType) {
  logConversion('prepareConvertData START', { sourceDocId: sourceDoc.id, sourceDocNo: sourceDoc.docNo, targetDocType: targetDocType });
  var result = { header: {}, details: [] };
  
  var sourceDocCode = sourceDoc.docNo || sourceDoc['单据编号'] || '';
  result.header.sourceDocNo = sourceDocCode;
  
  if (sourceDoc.供应商) result.header.供应商 = sourceDoc.供应商;
  if (sourceDoc.客户) result.header.客户 = sourceDoc.客户;
  if (sourceDoc.组织) result.header.组织 = sourceDoc.组织;
  if (sourceDoc.币别) result.header.币别 = sourceDoc.币别;
  if (sourceDoc.汇率) result.header.汇率 = sourceDoc.汇率;
  if (sourceDoc.税率) result.header.税率 = sourceDoc.税率;
  
  logConversion('表头数据携带', result.header);
  
  var qtyField = getQuantityFieldName(targetDocType);
  logConversion('数量字段确定', { targetDocType: targetDocType, qtyField: qtyField });
  
  if (sourceDoc.details) {
    sourceDoc.details.forEach(function(detail, index) {
      var remainingQty = parseFloat(detail.数量) || 0;
      var usedQty = getSourceDocUsedQty(sourceDoc.id, index);
      remainingQty = remainingQty - usedQty;
      
      var needInspect = checkMaterialNeedInspect(detail['物料编码']);
      
      logConversion('明细行处理', { index: index, materialCode: detail['物料编码'], originalQty: parseFloat(detail.数量) || 0, usedQty: usedQty, remainingQty: remainingQty, needInspect: needInspect });
      
      if (remainingQty > 0 || (sourceDoc.docType === 'production_order' && (targetDocType === 'production_inbound' || targetDocType === 'production_inspect'))) {
        if (sourceDoc.docType === 'production_order' && targetDocType === 'production_material_request') {
          var bom = getBOMByMaterialCode(detail['物料编码']);
          if (bom && bom.details) {
            logConversion('BOM展开', { materialCode: detail['物料编码'], bomVersion: bom.version, bomDetailCount: bom.details.length });
            bom.details.forEach(function(bomItem) {
              var bomQty = parseFloat(bomItem.qty) || 0;
              var totalQty = (bomQty * remainingQty).toFixed(2);
              var row = {
                '物料编码': bomItem.materialCode || '',
                '物料名称': bomItem.materialName || '',
                '规格型号': '',
                '单位': bomItem.unit || '',
                '单价': '',
                '金额': '',
                '税率': '',
                '税额': '',
                'source_doc_id': sourceDoc.id,
                'source_detail_index': index,
                'remaining_qty': totalQty,
                'need_inspect': false,
                'qualified_qty': 0
              };
              row[qtyField] = totalQty;
              result.details.push(row);
            });
          } else {
            logConversion('警告', { reason: '未找到BOM，直接携带物料', materialCode: detail['物料编码'] });
            var orderQty = parseFloat(detail.数量) || 0;
            var row = {
              '物料编码': detail['物料编码'] || '',
              '物料名称': detail['物料名称'] || '',
              '规格型号': detail['规格型号'] || '',
              '单位': detail['单位'] || '',
              '单价': detail['单价'] || '',
              '金额': detail['金额'] || '',
              '税率': detail['税率'] || '',
              '税额': detail['税额'] || '',
              'source_doc_id': sourceDoc.id,
              'source_detail_index': index,
              'remaining_qty': orderQty.toFixed(2),
              'need_inspect': needInspect,
              'qualified_qty': detail['合格数量'] || 0
            };
            row[qtyField] = orderQty.toFixed(2);
            result.details.push(row);
          }
        } else if (sourceDoc.docType === 'production_order' && (targetDocType === 'production_inbound' || targetDocType === 'production_inspect')) {
          logConversion('生产入库/请检单特殊处理', { reason: '直接携带成品物料，不检查已领料数量', materialCode: detail['物料编码'], targetDocType: targetDocType });
          var inboundQty = parseFloat(detail.数量) || 0;
          var row = {
            '物料编码': detail['物料编码'] || '',
            '物料名称': detail['物料名称'] || '',
            '规格型号': detail['规格型号'] || '',
            '单位': detail['单位'] || '',
            '单价': detail['单价'] || '',
            '金额': detail['金额'] || '',
            '税率': detail['税率'] || '',
            '税额': detail['税额'] || '',
            'source_doc_id': sourceDoc.id,
            'source_detail_index': index,
            'remaining_qty': inboundQty.toFixed(2),
            'need_inspect': needInspect,
            'qualified_qty': detail['合格数量'] || 0
          };
          row[qtyField] = inboundQty.toFixed(2);
          result.details.push(row);
        } else {
          var row = {
            '物料编码': detail['物料编码'] || '',
            '物料名称': detail['物料名称'] || '',
            '规格型号': detail['规格型号'] || '',
            '单位': detail['单位'] || '',
            '单价': detail['单价'] || '',
            '金额': detail['金额'] || '',
            '税率': detail['税率'] || '',
            '税额': detail['税额'] || '',
            'source_doc_id': sourceDoc.id,
            'source_detail_index': index,
            'remaining_qty': remainingQty.toFixed(2),
            'need_inspect': needInspect,
            'qualified_qty': detail['合格数量'] || 0
          };
          row[qtyField] = remainingQty.toFixed(2);
          result.details.push(row);
        }
      } else {
        logConversion('跳过明细行', { reason: '剩余数量为0', index: index, materialCode: detail['物料编码'] });
      }
    });
  } else {
    logConversion('警告', { reason: '源单据无明细数据' });
  }
  
  logConversion('prepareConvertData END', { detailCount: result.details.length });
  return result;
}