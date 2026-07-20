export enum ExpenseAcceptanceStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  CANCELED = 3,
  REJECTED = 4,
}

export enum ExpensePayableGenerationStatus {
  NOT_GENERATED = 'NOT_GENERATED',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED',
}

export const EXPENSE_ACCEPTANCE_STATUS_META: Record<number, { code: string; name: string }> = {
  [ExpenseAcceptanceStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [ExpenseAcceptanceStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [ExpenseAcceptanceStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [ExpenseAcceptanceStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [ExpenseAcceptanceStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};
