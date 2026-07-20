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
const reportPath = path.join('D:', '开发测试', 'hub-erp-v0', 'traewordp', 'finance-final-report.txt');

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
    
    // Fix: Change handleActionBtn function signature to use el.textContent instead of second parameter
    content = content.replace(
        /function handleActionBtn\(el, actionText\) \{[\s\S]*?actionText = actionText\.trim\(\);/,
        'function handleActionBtn(el) {\n    var actionText = el.textContent.trim();'
    );
    
    // Remove the old document.querySelector('.action-btn').addEventListener for 新增 button
    // This is redundant now that all action buttons have onclick handlers
    content = content.replace(
        /document\.querySelector\('\.action-btn'\)\.addEventListener\('click', function\(\)\{ if\(this\.textContent\.includes\('新增'\)\) openModal\('voucherModal'\); \}\);/,
        ''
    );
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fixedFiles++;
        reportLines.push(`Fixed: ${page}`);
    } else {
        reportLines.push(`No changes needed: ${page}`);
    }
});

reportLines.push('');
reportLines.push('===== Summary =====');
reportLines.push(`Total files processed: ${pages.length}`);
reportLines.push(`Files fixed: ${fixedFiles}`);

fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
console.log(`Final fix completed. Report saved to: ${reportPath}`);