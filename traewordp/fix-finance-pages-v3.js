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
const reportPath = path.join('D:', '开发测试', 'hub-erp-v0', 'traewordp', 'finance-fix-report-v3.txt');

let fixedFiles = 0;
let totalIssues = 0;
const reportLines = [];

const helperScripts = `

var currentStatus = 'draft';

function validateForm() {
    var requiredFields = document.querySelectorAll('.form-input[required], .form-select[required], textarea[required]');
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!field.value || field.value.trim() === '') {
            var label = field.parentElement.querySelector('.form-label');
            var fieldName = label ? label.textContent : '该字段';
            showToast(fieldName + '不能为空', 'error');
            field.focus();
            return false;
        }
    }
    return true;
}

function validateAndSave() {
    if (validateForm()) {
        showToast('保存成功', 'success');
        closeModal();
    }
}

function validateAndSubmit() {
    if (validateForm()) {
        showConfirm('确认提交审核？', 'warning', function(result) {
            if (result) {
                currentStatus = 'submitted';
                showToast('已提交审核', 'success');
                closeModal();
            }
        });
    }
}

function handleActionBtn(el) {
    var actionText = el.textContent.trim();
    switch(actionText) {
        case '新增':
            var modalId = el.getAttribute('data-modal-id') || 'addModal';
            openModal(modalId);
            break;
        case '删除':
            handleDelete();
            break;
        case '提交':
            handleSubmit();
            break;
        case '审核':
            handleAudit();
            break;
        case '刷新':
            location.reload();
            break;
        case '查询':
            showToast('查询功能', 'info');
            break;
        case '重置':
            document.querySelectorAll('input, select, textarea').forEach(function(f){
                if(!f.readOnly) f.value = '';
            });
            break;
        case '退出':
            showConfirm('确认退出？', 'warning', function(result) {
                if (result) window.history.back();
            });
            break;
        default:
            showToast(actionText + '功能', 'info');
    }
}

function handleDelete() {
    showConfirm('确认删除？', 'error', function(result) {
        if (result) showToast('删除成功', 'success');
    });
}

function handleSubmit() {
    if (validateForm()) {
        showConfirm('确认提交审核？', 'warning', function(result) {
            if (result) {
                currentStatus = 'submitted';
                showToast('已提交审核', 'success');
            }
        });
    }
}

function handleAudit() {
    showConfirm('确认审核通过？', 'warning', function(result) {
        if (result) {
            currentStatus = 'audited';
            showToast('审核通过', 'success');
        }
    });
}

`;

pages.forEach(page => {
    const filePath = path.join(basePath, page);
    if (!fs.existsSync(filePath)) {
        reportLines.push(`File not found: ${page}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let issuesFixed = 0;
    
    // Fix 1: Remove all existing onclick attributes from action-btn elements
    content = content.replace(/<button class="action-btn"[^>]*onclick="[^"]*"([^>]*)>/g, '<button class="action-btn"$1>');
    
    // Fix 2: Add onclick="handleActionBtn(this)" to all action-btn buttons
    content = content.replace(/<button class="action-btn"([^>]*)>([^<]+)<\/button>/g, '<button class="action-btn"$1 onclick="handleActionBtn(this)">$2</button>');
    
    // Fix 3: Replace span.action-btn with button with onclick
    content = content.replace(/<span class="action-btn">([^<]+)<\/span>/g, '<button class="action-btn" onclick="handleActionBtn(this)">$1</button>');
    
    // Fix 4: Fix save button
    content = content.replace(/<button class="btn btn-primary"[^>]*>保存<\/button>/g, '<button class="btn btn-primary" onclick="validateAndSave()">保存</button>');
    
    // Fix 5: Fix save and submit button
    content = content.replace(/<button class="btn btn-primary"[^>]*>保存并提交<\/button>/g, '<button class="btn btn-primary" onclick="validateAndSubmit()">保存并提交</button>');
    
    // Fix 6: Add onclick to lookup-btn elements
    content = content.replace(/<button class="lookup-btn"([^>]*)>/g, '<button class="lookup-btn"$1 onclick="handleLookup(this)">');
    
    // Fix 7: Add validateForm() and helper functions
    if (!content.includes('function validateForm')) {
        content = content.replace(/<\/script>/, helperScripts + '\n</script>');
        issuesFixed++;
    }
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fixedFiles++;
        totalIssues += issuesFixed;
        reportLines.push(`Fixed: ${page} (issues: ${issuesFixed})`);
    } else {
        reportLines.push(`Skipped: ${page} (no changes needed)`);
    }
});

reportLines.push('');
reportLines.push('===== Summary =====');
reportLines.push(`Total files processed: ${pages.length}`);
reportLines.push(`Files fixed: ${fixedFiles}`);
reportLines.push(`Total issues fixed: ${totalIssues}`);

fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
console.log(`Fix completed. Report saved to: ${reportPath}`);