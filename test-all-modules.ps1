$token = (Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body '{"username":"admin","password":"123456"}' -ContentType "application/json").data.accessToken
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "=== 基础资料模块测试 ==="
Write-Host ""

Write-Host "--- 1. 仓库管理 ---"
$data = @{warehouseCode="WH$timestamp"; warehouseName="Test Warehouse $timestamp"; address="Test Address"; status=1} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/warehouses" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增仓库: code=$($result.code), id=$($result.data.id), warehouseCode=$($result.data.warehouseCode)"
$whId = $result.data.id

Write-Host ""
Write-Host "--- 2. 计量单位管理 ---"
$data = @{unitCode="KG$timestamp"; unitName="千克$timestamp"; unitSymbol="kg"} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/units" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增计量单位: code=$($result.code), id=$($result.data.id), unitCode=$($result.data.unitCode)"
$unitId = $result.data.id

Write-Host ""
Write-Host "--- 3. 物料分类管理 ---"
$data = @{categoryCode="CAT$timestamp"; categoryName="Test Category $timestamp"} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/material-categories" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增物料分类: code=$($result.code), id=$($result.data.id), categoryCode=$($result.data.categoryCode)"
$catId = $result.data.id

Write-Host ""
Write-Host "=== HR模块测试 ==="
Write-Host ""

Write-Host "--- 4. 部门管理 ---"
$data = @{deptCode="DEPT$timestamp"; deptName="Test Department $timestamp"; parentId=""} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/departments" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增部门: code=$($result.code), id=$($result.data.id), deptCode=$($result.data.deptCode)"
$deptId = $result.data.id

Write-Host ""
Write-Host "--- 5. 员工管理 ---"
$data = @{empCode="EMP$timestamp"; empName="Test Employee $timestamp"; deptId=$deptId; hireDate="2026-07-01"; phone="13800138000"; status=1} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/employees" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增员工: code=$($result.code), id=$($result.data.id), empCode=$($result.data.empCode)"
$empId = $result.data.id

Write-Host ""
Write-Host "--- 6. 考勤管理 ---"
$data = @{empId=$empId; attendDate="2026-07-12"; clockIn="08:30"; clockOut="17:30"} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/attendances" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增考勤: code=$($result.code), id=$($result.data.id)"

Write-Host ""
Write-Host "=== PLM模块测试 ==="
Write-Host ""

Write-Host "--- 7. PLM产品管理 ---"
$data = @{productCode="PROD$timestamp"; productName="Test Product $timestamp"; productType="1"; status=1} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/plm-product" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增产品: code=$($result.code), id=$($result.data.id), productCode=$($result.data.productCode)"
$prodId = $result.data.id

Write-Host ""
Write-Host "--- 8. BOM管理 ---"
$data = @{bom=@{bomNo="BOM$timestamp"; materialId="B51E164C-457D-F111-8B2C-010101010000"; version="V$timestamp"}} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/bom" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增BOM: code=$($result.code), id=$($result.data.id), bomNo=$($result.data.bomNo)"
$bomId = $result.data.id

Write-Host ""
Write-Host "=== 财务模块测试 ==="
Write-Host ""

Write-Host "--- 9. 应收账款 ---"
$data = @{customerId="B3A9D027-457D-F111-8B2C-010101010000"; sourceType="sales_order"; amount=10000; receivableDate="2026-07-12"; dueDate="2026-08-12"} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/receivables" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增应收: code=$($result.code), id=$($result.data.id), receivableNo=$($result.data.receivableNo)"
$recvId = $result.data.id

Write-Host ""
Write-Host "--- 10. 应付账款 ---"
$data = @{supplierId="B71E164C-457D-F111-8B2C-010101010000"; sourceType="purchase_order"; amount=5000; payableDate="2026-07-12"; dueDate="2026-08-15"} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/payables" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增应付: code=$($result.code), id=$($result.data.id), payableNo=$($result.data.payableNo)"

Write-Host ""
Write-Host "=== 智能对话模块测试 ==="
Write-Host ""

Write-Host "--- 11. AI对话 ---"
$data = @{userId="B1A9D027-457D-F111-8B2C-010101010000"; sessionId="TEST$timestamp"; role="user"; content="Hello AI"} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/ai-conversations" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增对话: code=$($result.code), id=$($result.data.id)"

Write-Host ""
Write-Host "=== BI模块测试 ==="
Write-Host ""

Write-Host "--- 12. 决策分析仪表盘 ---"
$data = @{dashboardCode="DB$timestamp"; dashboardName="Test Dashboard $timestamp"; category="production"; layout="{}"} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/decision-analysis/dashboards" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $data
Write-Host "新增仪表盘: code=$($result.code), id=$($result.data.id), dashboardName=$($result.data.dashboardName)"

Write-Host ""
Write-Host "--- 13. 生产分析报告 ---"
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/decision-analysis/analysis/production" -Method GET -Headers @{Authorization="Bearer $token"}
Write-Host "生产分析: code=$($result.code)"

Write-Host ""
Write-Host "--- 14. 库存分析报告 ---"
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/decision-analysis/analysis/inventory" -Method GET -Headers @{Authorization="Bearer $token"}
Write-Host "库存分析: code=$($result.code)"

Write-Host ""
Write-Host "=== 所有模块测试完成 ==="