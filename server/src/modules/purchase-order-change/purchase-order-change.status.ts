export enum PurchaseOrderChangeStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  CANCELED = 3,
  REJECTED = 4,
}

export const PURCHASE_ORDER_CHANGE_STATUS_META: Record<number, { code: string; name: string }> = {
  [PurchaseOrderChangeStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [PurchaseOrderChangeStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [PurchaseOrderChangeStatus.APPROVED]: { code: 'APPROVED', name: '已审核生效' },
  [PurchaseOrderChangeStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [PurchaseOrderChangeStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};

export enum PurchaseOrderChangeEffectiveStatus {
  NOT_EFFECTIVE = 'NOT_EFFECTIVE',
  EFFECTIVE = 'EFFECTIVE',
}
