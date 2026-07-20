export enum AssetOutRequestStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  PUSHED = 3,
  CANCELED = 4,
  REJECTED = 5,
}

export const ASSET_OUT_REQUEST_STATUS_META: Record<number, { code: string; name: string }> = {
  [AssetOutRequestStatus.DRAFT]: { code: 'DRAFT', name: '草稿' },
  [AssetOutRequestStatus.SUBMITTED]: { code: 'SUBMITTED', name: '待审核' },
  [AssetOutRequestStatus.APPROVED]: { code: 'APPROVED', name: '已审核' },
  [AssetOutRequestStatus.PUSHED]: { code: 'PUSHED', name: '已下推' },
  [AssetOutRequestStatus.CANCELED]: { code: 'CANCELED', name: '已取消' },
  [AssetOutRequestStatus.REJECTED]: { code: 'REJECTED', name: '已驳回' },
};
