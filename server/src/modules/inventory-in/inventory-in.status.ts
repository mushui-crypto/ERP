export enum InventoryInStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  CANCELED = 3,
  REJECTED = 4,
}

export enum InventoryInType {
  PURCHASE = 1,
  PRODUCTION = 2,
  SALES_RETURN = 3,
  OTHER = 4,
}

export enum PayableGenerationStatus {
  NOT_GENERATED = 'NOT_GENERATED',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED',
}

export const INVENTORY_IN_STATUS_META: Record<number, { code: string; name: string }> = {
  [InventoryInStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [InventoryInStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [InventoryInStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [InventoryInStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [InventoryInStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};

export function withInventoryInStatus<T extends { status: number }>(value: T) {
  const meta = INVENTORY_IN_STATUS_META[value.status] || { code: 'UNKNOWN', name: '未知状态' };
  return { ...value, statusCode: meta.code, statusName: meta.name };
}
