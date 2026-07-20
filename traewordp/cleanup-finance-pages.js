const fs = require('fs');
const path = require('path');

const pages = [
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
];

const basePath = path.join('D:', '开发测试', 'hub-erp-v0', 'traewordp', 'pages');
const reportPath = path.join('D:', '开发测试', 'hub-erp-v0', 'traewordp', 'finance-cleanup-report.txt');

let fixedFiles = 0;
const reportLines = [];

pages.forEach(page => {
    const filePath = path.join(basePath, page);
    if (!fs.existsSync(filePath)) {
        reportLines.push(`File not found: ${page}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove duplicate onclick attributes (keep only the first one)
    content = content.replace(/onclick="[^"]*"\s+onclick="[^"]*"/g, 'onclick="handleActionBtn(this)"');
    
    // Remove any remaining duplicate onclick patterns
    content = content.replace(/(\bonclick="[^"]*")\s+\1/g, '$1');
    
    // Remove onclick="handleActionBtn(this, '$1')" pattern that didn't capture correctly
    content = content.replace(/onclick="handleActionBtn\(this,\s*'\$1'\)"/g, 'onclick="handleActionBtn(this)"');
    
    // Clean up onclick="handleActionBtn(this, '新增')" to onclick="handleActionBtn(this)"
    content = content.replace(/onclick="handleActionBtn\(this,\s*'[^']*'\)"/g, 'onclick="handleActionBtn(this)"');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fixedFiles++;
        reportLines.push(`Cleaned: ${page}`);
    } else {
        reportLines.push(`No cleanup needed: ${page}`);
    }
});

reportLines.push('');
reportLines.push('===== Summary =====');
reportLines.push(`Total files processed: ${pages.length}`);
reportLines.push(`Files cleaned: ${fixedFiles}`);

fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
console.log(`Cleanup completed. Report saved to: ${reportPath}`);