import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { ExpenseAcceptanceEntry } from '../../database/entities/expense-acceptance-entry.entity';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PayableEntry } from '../../database/entities/payable-entry.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReportQueryDto } from './dto/purchase-report-query.dto';

type EntryMetric = {
  inboundQty: number;
  inboundUntaxedAmount: number;
  inboundTaxAmount: number;
  inboundTotalAmount: number;
  returnQty: number;
  returnUntaxedAmount: number;
  returnTaxAmount: number;
  returnTotalAmount: number;
  assetAcceptedQty: number;
  assetUntaxedAmount: number;
  assetTaxAmount: number;
  assetTotalAmount: number;
  expenseAcceptedQty: number;
  expenseUntaxedAmount: number;
  expenseTaxAmount: number;
  expenseTotalAmount: number;
  payableQty: number;
  payableUntaxedAmount: number;
  payableTaxAmount: number;
  payableTotalAmount: number;
};

@Injectable()
export class PurchaseReportService {
  constructor(private readonly dataSource: DataSource) {}

  private round(value: number, digits: number) {
    return Number(Number(value || 0).toFixed(digits));
  }

  private paging(query: PurchaseReportQueryDto) {
    return {
      page: Math.max(1, Number(query.page) || 1),
      pageSize: Math.min(200, Math.max(1, Number(query.pageSize) || 20)),
    };
  }

  private dateRange(query: PurchaseReportQueryDto) {
    const start = query.dateFrom ? new Date(query.dateFrom) : null;
    const end = query.dateTo ? new Date(query.dateTo) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) {
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
    }
    return { start, end };
  }

  private applyOrderFilters<T>(builder: SelectQueryBuilder<T>, query: PurchaseReportQueryDto, alias = 'header') {
    if (query.purchaseOrgId) builder.andWhere(`${alias}.purchaseOrgId = :purchaseOrgId`, { purchaseOrgId: query.purchaseOrgId });
    if (query.supplierId) builder.andWhere(`${alias}.supplierId = :supplierId`, { supplierId: query.supplierId });
    if (query.buyerId) builder.andWhere(`${alias}.buyerId = :buyerId`, { buyerId: query.buyerId });
    if (query.businessType) builder.andWhere(`${alias}.businessType = :businessType`, { businessType: query.businessType });
    if (query.orderStatus !== undefined) builder.andWhere(`${alias}.status = :orderStatus`, { orderStatus: query.orderStatus });
    if (query.orderNo) builder.andWhere(`${alias}.orderNo LIKE :orderNo`, { orderNo: `%${query.orderNo}%` });
    const { start, end } = this.dateRange(query);
    if (start) builder.andWhere(`${alias}.orderDate >= :orderDateStart`, { orderDateStart: start });
    if (end) builder.andWhere(`${alias}.orderDate < :orderDateEnd`, { orderDateEnd: end });
    return builder;
  }

  private blankMetric(): EntryMetric {
    return {
      inboundQty: 0, inboundUntaxedAmount: 0, inboundTaxAmount: 0, inboundTotalAmount: 0,
      returnQty: 0, returnUntaxedAmount: 0, returnTaxAmount: 0, returnTotalAmount: 0,
      assetAcceptedQty: 0, assetUntaxedAmount: 0, assetTaxAmount: 0, assetTotalAmount: 0,
      expenseAcceptedQty: 0, expenseUntaxedAmount: 0, expenseTaxAmount: 0, expenseTotalAmount: 0,
      payableQty: 0, payableUntaxedAmount: 0, payableTaxAmount: 0, payableTotalAmount: 0,
    };
  }

  private mergeRows(map: Map<string, EntryMetric>, rows: any[], fields: Array<[keyof EntryMetric, string]>) {
    rows.forEach((row) => {
      const metric = map.get(row.key) || this.blankMetric();
      fields.forEach(([target, source]) => { metric[target] = Number(row[source] || 0); });
      map.set(row.key, metric);
    });
  }

  private async loadMetrics(entryIds: string[]) {
    const map = new Map<string, EntryMetric>();
    if (!entryIds.length) return map;
    const inbound = await this.dataSource.getRepository(InventoryInEntry).createQueryBuilder('entry')
      .innerJoin('entry.inventoryIn', 'header', 'header.isDeleted = 0 AND header.status = 2')
      .select('entry.sourceOrderEntryId', 'key').addSelect('SUM(entry.quantity)', 'qty')
      .addSelect('SUM(entry.amount)', 'untaxed').addSelect('SUM(entry.taxAmount)', 'tax').addSelect('SUM(entry.totalAmount)', 'total')
      .where('entry.isDeleted = 0').andWhere('entry.sourceOrderEntryId IN (:...entryIds)', { entryIds })
      .groupBy('entry.sourceOrderEntryId').getRawMany();
    this.mergeRows(map, inbound, [['inboundQty', 'qty'], ['inboundUntaxedAmount', 'untaxed'], ['inboundTaxAmount', 'tax'], ['inboundTotalAmount', 'total']]);

    const returns = await this.dataSource.getRepository(PurchaseReturnEntry).createQueryBuilder('entry')
      .innerJoin('entry.purchaseReturn', 'header', 'header.isDeleted = 0 AND header.status = 2')
      .select('entry.sourceOrderEntryId', 'key').addSelect('SUM(entry.returnQty)', 'qty')
      .addSelect('SUM(entry.amount)', 'untaxed').addSelect('SUM(entry.taxAmount)', 'tax').addSelect('SUM(entry.totalAmount)', 'total')
      .where('entry.isDeleted = 0').andWhere('entry.sourceOrderEntryId IN (:...entryIds)', { entryIds })
      .groupBy('entry.sourceOrderEntryId').getRawMany();
    this.mergeRows(map, returns, [['returnQty', 'qty'], ['returnUntaxedAmount', 'untaxed'], ['returnTaxAmount', 'tax'], ['returnTotalAmount', 'total']]);

    const assets = await this.dataSource.getRepository(AssetAcceptanceEntry).createQueryBuilder('entry')
      .innerJoin('entry.assetAcceptance', 'header', 'header.isDeleted = 0 AND header.status = 2')
      .select('entry.sourceOrderEntryId', 'key').addSelect('SUM(entry.passedQty)', 'qty')
      .addSelect('SUM(entry.amount)', 'untaxed').addSelect('SUM(entry.taxAmount)', 'tax').addSelect('SUM(entry.totalAmount)', 'total')
      .where('entry.isDeleted = 0').andWhere('entry.sourceOrderEntryId IN (:...entryIds)', { entryIds })
      .groupBy('entry.sourceOrderEntryId').getRawMany();
    this.mergeRows(map, assets, [['assetAcceptedQty', 'qty'], ['assetUntaxedAmount', 'untaxed'], ['assetTaxAmount', 'tax'], ['assetTotalAmount', 'total']]);

    const expenses = await this.dataSource.getRepository(ExpenseAcceptanceEntry).createQueryBuilder('entry')
      .innerJoin('entry.expenseAcceptance', 'header', 'header.isDeleted = 0 AND header.status = 2')
      .select('entry.sourceOrderEntryId', 'key').addSelect('SUM(entry.acceptanceQty)', 'qty')
      .addSelect('SUM(entry.amount)', 'untaxed').addSelect('SUM(entry.taxAmount)', 'tax').addSelect('SUM(entry.totalAmount)', 'total')
      .where('entry.isDeleted = 0').andWhere('entry.sourceOrderEntryId IN (:...entryIds)', { entryIds })
      .groupBy('entry.sourceOrderEntryId').getRawMany();
    this.mergeRows(map, expenses, [['expenseAcceptedQty', 'qty'], ['expenseUntaxedAmount', 'untaxed'], ['expenseTaxAmount', 'tax'], ['expenseTotalAmount', 'total']]);

    const payables = await this.dataSource.getRepository(PayableEntry).createQueryBuilder('entry')
      .innerJoin('entry.payable', 'header', 'header.isDeleted = 0')
      .select('entry.sourceOrderEntryId', 'key').addSelect('SUM(entry.quantity)', 'qty')
      .addSelect('SUM(entry.untaxedAmount)', 'untaxed').addSelect('SUM(entry.taxAmount)', 'tax').addSelect('SUM(entry.totalAmount)', 'total')
      .where('entry.isDeleted = 0').andWhere('entry.sourceOrderEntryId IN (:...entryIds)', { entryIds })
      .groupBy('entry.sourceOrderEntryId').getRawMany();
    this.mergeRows(map, payables, [['payableQty', 'qty'], ['payableUntaxedAmount', 'untaxed'], ['payableTaxAmount', 'tax'], ['payableTotalAmount', 'total']]);
    entryIds.forEach((id) => { if (!map.has(id)) map.set(id, this.blankMetric()); });
    return map;
  }

  private actualQty(businessType: string, entry: PurchaseOrderEntry, metric: EntryMetric) {
    if (businessType === 'ASSET_NO_INBOUND') return metric.assetAcceptedQty;
    if (businessType === 'ASSET_INBOUND') return metric.assetAcceptedQty;
    if (businessType === 'EXPENSE_PURCHASE') return metric.expenseAcceptedQty;
    return Number(entry.stockedQty || metric.inboundQty || 0);
  }

  private actualAmount(businessType: string, metric: EntryMetric) {
    if (businessType === 'ASSET_NO_INBOUND') return metric.assetTotalAmount;
    if (businessType === 'EXPENSE_PURCHASE') return metric.expenseTotalAmount;
    return this.round(metric.inboundTotalAmount - metric.returnTotalAmount, 2);
  }

  async orderExecutionDetail(query: PurchaseReportQueryDto) {
    const { page, pageSize } = this.paging(query);
    const builder = this.dataSource.getRepository(PurchaseOrderEntry).createQueryBuilder('entry')
      .innerJoinAndSelect('entry.purchaseOrder', 'header')
      .where('entry.isDeleted = 0').andWhere('header.isDeleted = 0');
    this.applyOrderFilters(builder, query);
    if (query.materialId) builder.andWhere('entry.materialId = :materialId', { materialId: query.materialId });
    if (query.expenseItemName) builder.andWhere('entry.expenseItemName LIKE :expenseItemName', { expenseItemName: `%${query.expenseItemName}%` });
    const [entries, total] = await builder.orderBy('header.orderDate', 'DESC').addOrderBy('header.orderNo', 'ASC').addOrderBy('entry.lineNo', 'ASC')
      .skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    const metrics = await this.loadMetrics(entries.map((entry) => entry.id));
    const list = entries.map((entry) => {
      const header = entry.purchaseOrder;
      const metric = metrics.get(entry.id) || this.blankMetric();
      const executedQty = this.actualQty(header.businessType, entry, metric);
      return {
        purchaseOrderId: header.id,
        orderNo: header.orderNo,
        orderDate: header.orderDate,
        purchaseOrgId: header.purchaseOrgId,
        supplierId: header.supplierId,
        buyerId: header.buyerId,
        currencyId: header.currencyId,
        billType: header.billType,
        businessType: header.businessType,
        orderStatus: header.status,
        orderEntryId: entry.id,
        lineNo: entry.lineNo,
        sourceRequestId: entry.sourceRequestId,
        sourceRequestNo: entry.sourceRequestNo,
        sourceRequestEntryId: entry.sourceRequestEntryId,
        materialId: entry.materialId,
        materialCode: entry.materialCode,
        materialName: entry.materialName,
        materialModel: entry.materialModel,
        expenseItemCode: entry.expenseItemCode,
        expenseItemName: entry.expenseItemName,
        unitId: entry.unitId,
        unitCode: entry.unitCode,
        unitName: entry.unitName,
        deliveryDate: entry.deliveryDate,
        warehouseId: entry.warehouseId,
        orderQty: Number(entry.orderQty),
        receivedQty: Number(entry.receivedQty || 0),
        stockedQty: Number(entry.stockedQty || 0),
        returnedQty: Number(entry.returnedQty || 0),
        assetAcceptedQty: metric.assetAcceptedQty,
        expenseAcceptedQty: metric.expenseAcceptedQty,
        executedQty,
        remainingQty: this.round(Math.max(0, Number(entry.orderQty) - executedQty), 4),
        executionRate: Number(entry.orderQty) > 0 ? this.round(Math.min(100, executedQty / Number(entry.orderQty) * 100), 2) : 0,
        unitPrice: Number(entry.unitPrice),
        orderTotalAmount: Number(entry.netAmount || 0),
        actualTotalAmount: this.actualAmount(header.businessType, metric),
        payableTotalAmount: metric.payableTotalAmount,
        ...metric,
      };
    });
    return { list, total, page, pageSize };
  }

  async orderExecutionSummary(query: PurchaseReportQueryDto) {
    const { page, pageSize } = this.paging(query);
    const builder = this.dataSource.getRepository(PurchaseOrder).createQueryBuilder('header')
      .leftJoinAndSelect('header.entries', 'entry', 'entry.isDeleted = 0')
      .where('header.isDeleted = 0');
    this.applyOrderFilters(builder, query);
    if (query.materialId) builder.andWhere('entry.materialId = :materialId', { materialId: query.materialId });
    if (query.expenseItemName) builder.andWhere('entry.expenseItemName LIKE :expenseItemName', { expenseItemName: `%${query.expenseItemName}%` });
    const [orders, total] = await builder.orderBy('header.orderDate', 'DESC').addOrderBy('header.orderNo', 'ASC')
      .skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    const allEntries = orders.flatMap((order) => order.entries || []);
    const metrics = await this.loadMetrics(allEntries.map((entry) => entry.id));
    const list = orders.map((order) => {
      const unitGroups = new Map<string, any>();
      let completedLineCount = 0;
      let actualTotalAmount = 0;
      let payableTotalAmount = 0;
      let overdue = false;
      (order.entries || []).forEach((entry) => {
        const metric = metrics.get(entry.id) || this.blankMetric();
        const executedQty = this.actualQty(order.businessType, entry, metric);
        if (executedQty + 0.0001 >= Number(entry.orderQty)) completedLineCount += 1;
        if (entry.deliveryDate && new Date(entry.deliveryDate).getTime() < Date.now() && executedQty + 0.0001 < Number(entry.orderQty)) overdue = true;
        actualTotalAmount += this.actualAmount(order.businessType, metric);
        payableTotalAmount += metric.payableTotalAmount;
        const key = entry.unitId || entry.unitName || 'NO_UNIT';
        const group = unitGroups.get(key) || {
          unitId: entry.unitId, unitCode: entry.unitCode, unitName: entry.unitName,
          orderQty: 0, receivedQty: 0, stockedQty: 0, returnedQty: 0, assetAcceptedQty: 0, expenseAcceptedQty: 0,
        };
        group.orderQty += Number(entry.orderQty);
        group.receivedQty += Number(entry.receivedQty || 0);
        group.stockedQty += Number(entry.stockedQty || 0);
        group.returnedQty += Number(entry.returnedQty || 0);
        group.assetAcceptedQty += metric.assetAcceptedQty;
        group.expenseAcceptedQty += metric.expenseAcceptedQty;
        unitGroups.set(key, group);
      });
      const lineCount = order.entries?.length || 0;
      return {
        purchaseOrderId: order.id,
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        supplierId: order.supplierId,
        purchaseOrgId: order.purchaseOrgId,
        buyerId: order.buyerId,
        currencyId: order.currencyId,
        billType: order.billType,
        businessType: order.businessType,
        status: order.status,
        lineCount,
        completedLineCount,
        lineCompletionRate: lineCount ? this.round(completedLineCount / lineCount * 100, 2) : 0,
        orderTotalAmount: Number(order.totalNetAmount || 0),
        actualTotalAmount: this.round(actualTotalAmount, 2),
        payableTotalAmount: this.round(payableTotalAmount, 2),
        overdue,
        unitGroups: [...unitGroups.values()].map((group) => Object.fromEntries(Object.entries(group).map(([key, value]) => [key, typeof value === 'number' ? this.round(value, 4) : value]))),
      };
    });
    return { list, total, page, pageSize };
  }

  private applySourceOrderFilters<T>(builder: SelectQueryBuilder<T>, query: PurchaseReportQueryDto, orderAlias = 'purchaseOrder') {
    if (query.purchaseOrgId) builder.andWhere(`${orderAlias}.purchaseOrgId = :purchaseOrgId`, { purchaseOrgId: query.purchaseOrgId });
    if (query.supplierId) builder.andWhere(`${orderAlias}.supplierId = :supplierId`, { supplierId: query.supplierId });
    if (query.buyerId) builder.andWhere(`${orderAlias}.buyerId = :buyerId`, { buyerId: query.buyerId });
    if (query.businessType) builder.andWhere(`${orderAlias}.businessType = :businessType`, { businessType: query.businessType });
    if (query.orderStatus !== undefined) builder.andWhere(`${orderAlias}.status = :orderStatus`, { orderStatus: query.orderStatus });
    if (query.orderNo) builder.andWhere(`${orderAlias}.orderNo LIKE :orderNo`, { orderNo: `%${query.orderNo}%` });
    return builder;
  }

  private async buildConsumeRows(query: PurchaseReportQueryDto) {
    const { start, end } = this.dateRange(query);
    const rows: any[] = [];
    const inbound = this.dataSource.getRepository(InventoryInEntry).createQueryBuilder('entry')
      .innerJoin('entry.inventoryIn', 'source', 'source.isDeleted = 0 AND source.status = 2')
      .innerJoin(PurchaseOrder, 'purchaseOrder', 'purchaseOrder.id = entry.sourceOrderId AND purchaseOrder.isDeleted = 0')
      .where('entry.isDeleted = 0');
    this.applySourceOrderFilters(inbound, query);
    if (start) inbound.andWhere('source.inDate >= :sourceStart', { sourceStart: start });
    if (end) inbound.andWhere('source.inDate < :sourceEnd', { sourceEnd: end });
    if (query.materialId) inbound.andWhere('entry.materialId = :materialId', { materialId: query.materialId });
    const inboundRows = await inbound.select([
      'purchaseOrder.purchase_org_id AS purchaseOrgId', 'purchaseOrder.supplier_id AS supplierId', 'purchaseOrder.business_type AS businessType',
      'purchaseOrder.currency_id AS currencyId', 'entry.material_id AS materialId', 'entry.material_code AS materialCode',
      'entry.material_name AS materialName', 'entry.unit_id AS unitId', 'entry.unit_code AS unitCode', 'entry.unit_name AS unitName',
      'entry.quantity AS quantity', 'entry.amount AS untaxedAmount', 'entry.tax_amount AS taxAmount', 'entry.total_amount AS totalAmount',
    ]).getRawMany();
    rows.push(...inboundRows.map((row) => ({ ...row, expenseItemCode: null, expenseItemName: null })));

    const returns = this.dataSource.getRepository(PurchaseReturnEntry).createQueryBuilder('entry')
      .innerJoin('entry.purchaseReturn', 'source', 'source.isDeleted = 0 AND source.status = 2')
      .innerJoin(PurchaseOrder, 'purchaseOrder', 'purchaseOrder.id = entry.sourceOrderId AND purchaseOrder.isDeleted = 0')
      .where('entry.isDeleted = 0');
    this.applySourceOrderFilters(returns, query);
    if (start) returns.andWhere('source.returnDate >= :sourceStart', { sourceStart: start });
    if (end) returns.andWhere('source.returnDate < :sourceEnd', { sourceEnd: end });
    if (query.materialId) returns.andWhere('entry.materialId = :materialId', { materialId: query.materialId });
    const returnRows = await returns.select([
      'purchaseOrder.purchase_org_id AS purchaseOrgId', 'purchaseOrder.supplier_id AS supplierId', 'purchaseOrder.business_type AS businessType',
      'purchaseOrder.currency_id AS currencyId', 'entry.material_id AS materialId', 'entry.material_code AS materialCode',
      'entry.material_name AS materialName', 'entry.unit_id AS unitId', 'entry.unit_code AS unitCode', 'entry.unit_name AS unitName',
      '-entry.return_qty AS quantity', '-entry.amount AS untaxedAmount', '-entry.tax_amount AS taxAmount', '-entry.total_amount AS totalAmount',
    ]).getRawMany();
    rows.push(...returnRows.map((row) => ({ ...row, expenseItemCode: null, expenseItemName: null })));

    const assets = this.dataSource.getRepository(AssetAcceptanceEntry).createQueryBuilder('entry')
      .innerJoin('entry.assetAcceptance', 'source', "source.isDeleted = 0 AND source.status = 2 AND source.businessType = 'ASSET_NO_INBOUND'")
      .innerJoin(PurchaseOrder, 'purchaseOrder', 'purchaseOrder.id = entry.sourceOrderId AND purchaseOrder.isDeleted = 0')
      .where('entry.isDeleted = 0');
    this.applySourceOrderFilters(assets, query);
    if (start) assets.andWhere('source.acceptanceDate >= :sourceStart', { sourceStart: start });
    if (end) assets.andWhere('source.acceptanceDate < :sourceEnd', { sourceEnd: end });
    if (query.materialId) assets.andWhere('entry.materialId = :materialId', { materialId: query.materialId });
    const assetRows = await assets.select([
      'purchaseOrder.purchase_org_id AS purchaseOrgId', 'purchaseOrder.supplier_id AS supplierId', 'purchaseOrder.business_type AS businessType',
      'purchaseOrder.currency_id AS currencyId', 'entry.material_id AS materialId', 'entry.material_code AS materialCode',
      'entry.material_name AS materialName', 'entry.unit_id AS unitId', 'entry.unit_code AS unitCode', 'entry.unit_name AS unitName',
      'entry.passed_qty AS quantity', 'entry.amount AS untaxedAmount', 'entry.tax_amount AS taxAmount', 'entry.total_amount AS totalAmount',
    ]).getRawMany();
    rows.push(...assetRows.map((row) => ({ ...row, expenseItemCode: null, expenseItemName: null })));

    const expenses = this.dataSource.getRepository(ExpenseAcceptanceEntry).createQueryBuilder('entry')
      .innerJoin('entry.expenseAcceptance', 'source', 'source.isDeleted = 0 AND source.status = 2')
      .innerJoin(PurchaseOrder, 'purchaseOrder', 'purchaseOrder.id = entry.sourceOrderId AND purchaseOrder.isDeleted = 0')
      .where('entry.isDeleted = 0');
    this.applySourceOrderFilters(expenses, query);
    if (start) expenses.andWhere('source.acceptanceDate >= :sourceStart', { sourceStart: start });
    if (end) expenses.andWhere('source.acceptanceDate < :sourceEnd', { sourceEnd: end });
    if (query.materialId) expenses.andWhere('entry.materialId = :materialId', { materialId: query.materialId });
    if (query.expenseItemName) expenses.andWhere('entry.expenseItemName LIKE :expenseItemName', { expenseItemName: `%${query.expenseItemName}%` });
    const expenseRows = await expenses.select([
      'purchaseOrder.purchase_org_id AS purchaseOrgId', 'purchaseOrder.supplier_id AS supplierId', 'purchaseOrder.business_type AS businessType',
      'purchaseOrder.currency_id AS currencyId', 'entry.expense_item_code AS expenseItemCode', 'entry.expense_item_name AS expenseItemName',
      'entry.material_id AS materialId', 'entry.material_code AS materialCode', 'entry.material_name AS materialName',
      'entry.unit_id AS unitId', 'entry.unit_code AS unitCode', 'entry.unit_name AS unitName', 'entry.acceptance_qty AS quantity',
      'entry.amount AS untaxedAmount', 'entry.tax_amount AS taxAmount', 'entry.total_amount AS totalAmount',
    ]).getRawMany();
    rows.push(...expenseRows);
    return rows;
  }

  async consumeSummary(query: PurchaseReportQueryDto) {
    const { page, pageSize } = this.paging(query);
    const rows = await this.buildConsumeRows(query);
    const grouped = new Map<string, any>();
    rows.forEach((row) => {
      const key = [row.purchaseOrgId, row.supplierId, row.businessType, row.currencyId, row.materialId || '', row.expenseItemName || '', row.unitId || row.unitName || ''].join('|');
      const target = grouped.get(key) || {
        purchaseOrgId: row.purchaseOrgId, supplierId: row.supplierId, businessType: row.businessType, currencyId: row.currencyId,
        materialId: row.materialId, materialCode: row.materialCode, materialName: row.materialName,
        expenseItemCode: row.expenseItemCode, expenseItemName: row.expenseItemName,
        unitId: row.unitId, unitCode: row.unitCode, unitName: row.unitName,
        quantity: 0, untaxedAmount: 0, taxAmount: 0, totalAmount: 0,
      };
      target.quantity += Number(row.quantity || 0);
      target.untaxedAmount += Number(row.untaxedAmount || 0);
      target.taxAmount += Number(row.taxAmount || 0);
      target.totalAmount += Number(row.totalAmount || 0);
      grouped.set(key, target);
    });
    const list = [...grouped.values()].map((item) => ({
      ...item,
      quantity: this.round(item.quantity, 4),
      untaxedAmount: this.round(item.untaxedAmount, 2),
      taxAmount: this.round(item.taxAmount, 2),
      totalAmount: this.round(item.totalAmount, 2),
    })).sort((left, right) => String(left.purchaseOrgId).localeCompare(String(right.purchaseOrgId)) || String(left.materialCode || left.expenseItemName).localeCompare(String(right.materialCode || right.expenseItemName)));
    const total = list.length;
    const summary = {
      quantityByUnit: [...list.reduce((map, item) => {
        const key = item.unitId || item.unitName || 'NO_UNIT';
        map.set(key, { unitId: item.unitId, unitName: item.unitName, quantity: this.round((map.get(key)?.quantity || 0) + item.quantity, 4) });
        return map;
      }, new Map<string, any>()).values()],
      untaxedAmount: this.round(list.reduce((sum, item) => sum + item.untaxedAmount, 0), 2),
      taxAmount: this.round(list.reduce((sum, item) => sum + item.taxAmount, 0), 2),
      totalAmount: this.round(list.reduce((sum, item) => sum + item.totalAmount, 0), 2),
    };
    return { list: list.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, summary };
  }

  async overview(query: PurchaseReportQueryDto) {
    const orderBuilder = this.dataSource.getRepository(PurchaseOrder).createQueryBuilder('header').where('header.isDeleted = 0');
    this.applyOrderFilters(orderBuilder, query);
    const orders = await orderBuilder.leftJoinAndSelect('header.entries', 'entry', 'entry.isDeleted = 0').getMany();
    const consumeRows = await this.buildConsumeRows(query);
    const orderEntryIds = orders.flatMap((order) => order.entries || []).map((entry) => entry.id);
    let estimatedPayableAmount = 0;
    let redPayableAmount = 0;
    if (orderEntryIds.length) {
      const payableRows = await this.dataSource.getRepository(PayableEntry).createQueryBuilder('entry')
        .innerJoin('entry.payable', 'header', 'header.isDeleted = 0')
        .select('header.payableType', 'type').addSelect('SUM(entry.totalAmount)', 'amount')
        .where('entry.isDeleted = 0').andWhere('entry.sourceOrderEntryId IN (:...orderEntryIds)', { orderEntryIds })
        .groupBy('header.payableType').getRawMany();
      payableRows.forEach((row) => {
        if (row.type === 'RED') redPayableAmount += Number(row.amount || 0);
        if (row.type === 'ESTIMATED') estimatedPayableAmount += Number(row.amount || 0);
      });
    }
    const businessAmount = this.round(consumeRows.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0), 2);
    const returnAmount = this.round(consumeRows.filter((row) => Number(row.totalAmount) < 0).reduce((sum, row) => sum + Math.abs(Number(row.totalAmount)), 0), 2);
    const incomplete = orders.filter((order) => order.status === 2).length;
    const overdue = orders.filter((order) => (order.entries || []).some((entry) => entry.deliveryDate && new Date(entry.deliveryDate).getTime() < Date.now() && Number(entry.receivedQty || 0) + 0.0001 < Number(entry.orderQty))).length;
    return {
      orderCount: orders.length,
      currentOrderAmount: this.round(orders.reduce((sum, order) => sum + Number(order.totalNetAmount || 0), 0), 2),
      executedBusinessAmount: businessAmount,
      returnAmount,
      estimatedPayableAmount: this.round(estimatedPayableAmount, 2),
      redPayableAmount: this.round(redPayableAmount, 2),
      netPayableAmount: this.round(estimatedPayableAmount + redPayableAmount, 2),
      incompleteOrderCount: incomplete,
      overdueOrderCount: overdue,
    };
  }
}
