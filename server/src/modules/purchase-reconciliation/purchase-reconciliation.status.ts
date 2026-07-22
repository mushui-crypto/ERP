export enum PurchaseReconciliationStatus {
  GENERATED = 0,
  CONFIRMED = 1,
  CANCELED = 2,
}

export const PURCHASE_RECONCILIATION_STATUS_META: Record<number, { code: string; name: string }> = {
  [PurchaseReconciliationStatus.GENERATED]: { code: 'GENERATED', name: '未确认' },
  [PurchaseReconciliationStatus.CONFIRMED]: { code: 'CONFIRMED', name: '已确认' },
  [PurchaseReconciliationStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
};
