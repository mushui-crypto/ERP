$pages = @(
    "finance-voucher.html", "finance-voucher-summary.html", "finance-voucher-query.html", 
    "finance-voucher-post.html", "finance-voucher-entry.html", "finance-voucher-audit.html", 
    "finance-receivable.html", "finance-travel-request.html", "finance-receipt.html", 
    "finance-receipt-writeoff.html", "finance-platform-voucher-gen.html", "finance-platform-reconcile.html", 
    "finance-payment.html", "finance-payment-writeoff.html", "finance-payment-request.html", 
    "finance-payable.html", "finance-merge-scheme.html", "finance-merge-progress.html", 
    "finance-merge-equity.html", "finance-merge-elim-entry.html", "finance-merge-adj-entry.html", 
    "finance-ledger.html", "finance-inventory-rpt-summary.html", "finance-inventory-rpt-detail.html", 
    "finance-inventory-report.html", "finance-inventory-purchase-cost.html", "finance-inventory-purchase-calc.html", 
    "finance-inventory-period-adj.html", "finance-inventory-outbound-cost.html", "finance-inventory-outbound-calc.html", 
    "finance-inventory-inbound-cost.html", "finance-inventory-calc.html", "finance-income-statement.html", 
    "finance-gl-trial-balance.html", "finance-gl-subject-init.html", "finance-gl-sub-ledger.html", 
    "finance-gl-period-close.html", "finance-gl-multi-col-ledger.html", "finance-gl-init.html", 
    "finance-gl-general-ledger.html", "finance-gl-dimension-ledger.html", "finance-gl-dimension-balance.html", 
    "finance-gl-balance.html", "finance-fa-inventory.html", "finance-fa-inventory-plan.html", 
    "finance-fa-disposal.html", "finance-fa-depreciation.html", "finance-fa-change.html", 
    "finance-fa-category.html", "finance-fa-card.html", "finance-expense-travel-std.html", 
    "finance-expense-request.html", "finance-expense-reimburse.html", "finance-expense-loan.html", 
    "finance-cost.html", "finance-cost-std-define.html", "finance-cost-report.html", 
    "finance-cost-order.html", "finance-cost-data-collect.html", "finance-cost-calculate.html", 
    "finance-cashier-transfer.html", "finance-cashier-report.html", "finance-cashier-manual-journal.html", 
    "finance-cashier-journal.html", "finance-cashier-deposit.html", "finance-cashier-daily.html", 
    "finance-cashier-count.html", "finance-cashier-bank-stmt.html", "finance-cashier-bank-reconcile.html", 
    "finance-cashier-balance-adj.html", "finance-cashflow-statement.html", "finance-balance-sheet.html", 
    "finance-baddebt.html", "finance-ar-writeoff.html", "finance-ar-transfer.html", 
    "finance-ar-report.html", "finance-ar-refund.html", "finance-ar-receivable.html", 
    "finance-ar-receipt.html", "finance-ar-other.html", "finance-ar-due-debt.html", 
    "finance-ar-customer-stmt.html", "finance-ar-aging.html", "finance-ap-writeoff.html", 
    "finance-ap-transfer.html", "finance-ap-report.html", "finance-ap-refund.html", 
    "finance-ap-payment.html", "finance-ap-payable.html", "finance-ap-other.html", 
    "finance-ap-due-debt.html", "finance-ap-aging.html"
)

$basePath = "D:\开发测试\hub-erp-v0\traewordp\pages"
$reportPath = "D:\开发测试\hub-erp-v0\traewordp\finance-pages-report.txt"

if (Test-Path $reportPath) { Remove-Item $reportPath -Force }

$totalIssues = 0
$issueTypes = @{
    MissingLookupOnclick = 0
    MissingValidateForm = 0
    MissingValidateCall = 0
    MissingCurrentStatus = 0
    MissingDeleteOnclick = 0
}

foreach ($page in $pages) {
    $filePath = Join-Path $basePath $page
    if (-not (Test-Path $filePath)) {
        Add-Content $reportPath "File not found: $page"
        continue
    }
    
    $content = Get-Content $filePath -Raw
    $issues = @()
    
    if ($content -match 'lookup-btn' -and $content -notmatch 'lookup-btn.*onclick') {
        $issues += "Missing onclick event for lookup-btn"
        $issueTypes.MissingLookupOnclick++
    }
    
    if ($content -notmatch 'function validateForm') {
        $issues += "Missing validateForm() function"
        $issueTypes.MissingValidateForm++
    }
    
    if ($content -match '[保存提交审核]' -and $content -notmatch 'validateForm\(\)') {
        $issues += "Save/Submit/Audit does not call validateForm()"
        $issueTypes.MissingValidateCall++
    }
    
    if ($content -notmatch 'currentStatus') {
        $issues += "Missing currentStatus variable"
        $issueTypes.MissingCurrentStatus++
    }
    
    if ($content -match '删除' -and ($content -notmatch '删除.*onclick' -or $content -notmatch 'showConfirm.*删除')) {
        $issues += "Delete button missing onclick or confirm dialog"
        $issueTypes.MissingDeleteOnclick++
    }
    
    if ($issues.Count -gt 0) {
        Add-Content $reportPath "===== $page ====="
        foreach ($issue in $issues) {
            Add-Content $reportPath "  - $issue"
            $totalIssues++
        }
        Add-Content $reportPath ""
    }
}

Add-Content $reportPath "===== Summary ====="
Add-Content $reportPath "Total files: $($pages.Count)"
Add-Content $reportPath "Total issues: $totalIssues"
Add-Content $reportPath ""
Add-Content $reportPath "Issue distribution:"
Add-Content $reportPath "  - lookup-btn missing onclick: $($issueTypes.MissingLookupOnclick)"
Add-Content $reportPath "  - Missing validateForm(): $($issueTypes.MissingValidateForm)"
Add-Content $reportPath "  - Save/Submit/Audit not calling validateForm(): $($issueTypes.MissingValidateCall)"
Add-Content $reportPath "  - Missing currentStatus: $($issueTypes.MissingCurrentStatus)"
Add-Content $reportPath "  - Delete button missing onclick/confirm: $($issueTypes.MissingDeleteOnclick)"

Write-Host "Check completed. Report saved to: $reportPath"