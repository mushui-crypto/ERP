export enum QualityInspectionStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export enum QualityInspectionResult {
  PENDING = 0,
  QUALIFIED = 1,
  UNQUALIFIED = 2,
  CONCESSION_ACCEPTED = 3,
}

export const QUALITY_INSPECTION_STATUS_META: Record<number, { code: string; name: string }> = {
  [QualityInspectionStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [QualityInspectionStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [QualityInspectionStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [QualityInspectionStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};
