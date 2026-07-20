export enum AssetAcceptanceStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  CANCELED = 3,
  REJECTED = 4,
}

export enum DownstreamGenerationStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  NOT_GENERATED = 'NOT_GENERATED',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED',
}

export const ASSET_ACCEPTANCE_STATUS_META: Record<number, { code: string; name: string }> = {
  [AssetAcceptanceStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [AssetAcceptanceStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [AssetAcceptanceStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [AssetAcceptanceStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [AssetAcceptanceStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};
