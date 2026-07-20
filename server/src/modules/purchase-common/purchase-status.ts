export enum PurchaseRequestStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  FULLY_ORDERED = 3,
  CANCELED = 4,
  CLOSED = 5,
  REJECTED = 6,
}

export enum PurchaseOrderStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  FULLY_STOCKED = 3,
  CLOSED = 4,
  CANCELED = 5,
  REJECTED = 6,
}

export enum PurchaseOrderSourceType {
  MANUAL = 'MANUAL',
  PURCHASE_REQUEST = 'PURCHASE_REQUEST',
}

export enum PurchaseBillType {
  STANDARD_PURCHASE = 'STANDARD_PURCHASE',
  ASSET_PURCHASE = 'ASSET_PURCHASE',
}

export enum PurchaseBusinessType {
  STANDARD = 'STANDARD',
  ASSET_NO_INBOUND = 'ASSET_NO_INBOUND',
  ASSET_INBOUND = 'ASSET_INBOUND',
}

export enum PurchaseReceiveNoticeStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  CANCELED = 3,
  CLOSED = 4,
  REJECTED = 5,
  REVERSED = 6,
}

export enum PurchaseReturnStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  CANCELED = 4,
  CLOSED = 5,
  REJECTED = 6,
}

export enum PurchaseReturnMode {
  REPLENISH = 'REPLENISH',
  DEDUCTION = 'DEDUCTION',
}

export enum PurchaseReturnSourceType {
  INVENTORY_IN = 'INVENTORY_IN',
  RETURN_REQUEST = 'RETURN_REQUEST',
}

export enum RedPayableGenerationStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  NOT_GENERATED = 'NOT_GENERATED',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED',
}

export const PURCHASE_REQUEST_STATUS_META: Record<number, { code: string; name: string }> = {
  [PurchaseRequestStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [PurchaseRequestStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [PurchaseRequestStatus.APPROVED]: { code: 'APPROVED', name: '已批准' },
  [PurchaseRequestStatus.FULLY_ORDERED]: { code: 'FULLY_ORDERED', name: '已全部下单' },
  [PurchaseRequestStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [PurchaseRequestStatus.CLOSED]: { code: 'CLOSED', name: '已关闭' },
  [PurchaseRequestStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};

export const PURCHASE_RECEIVE_NOTICE_STATUS_META: Record<number, { code: string; name: string }> = {
  [PurchaseReceiveNoticeStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [PurchaseReceiveNoticeStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [PurchaseReceiveNoticeStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [PurchaseReceiveNoticeStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [PurchaseReceiveNoticeStatus.CLOSED]: { code: 'CLOSED', name: '已关闭' },
  [PurchaseReceiveNoticeStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
  [PurchaseReceiveNoticeStatus.REVERSED]: { code: 'REVERSED', name: '已冲销' },
};

export const PURCHASE_ORDER_STATUS_META: Record<number, { code: string; name: string }> = {
  [PurchaseOrderStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [PurchaseOrderStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [PurchaseOrderStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [PurchaseOrderStatus.FULLY_STOCKED]: { code: 'FULLY_STOCKED', name: '已全部入库' },
  [PurchaseOrderStatus.CLOSED]: { code: 'CLOSED', name: '已关闭' },
  [PurchaseOrderStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [PurchaseOrderStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};

export const PURCHASE_RETURN_STATUS_META: Record<number, { code: string; name: string }> = {
  [PurchaseReturnStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [PurchaseReturnStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [PurchaseReturnStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [PurchaseReturnStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [PurchaseReturnStatus.CLOSED]: { code: 'CLOSED', name: '已关闭' },
  [PurchaseReturnStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};

export function withStatusMeta<T extends { status: number }>(
  value: T,
  meta: Record<number, { code: string; name: string }>,
) {
  const statusMeta = meta[value.status] || { code: 'UNKNOWN', name: '未知状态' };
  return {
    ...value,
    statusCode: statusMeta.code,
    statusName: statusMeta.name,
  };
}

export function generateDocumentNo(prefix: string): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const time = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
    String(now.getMilliseconds()).padStart(3, '0'),
  ].join('');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}${date}${time}${random}`;
}
