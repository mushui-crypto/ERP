IF EXISTS (SELECT * FROM sys.tables WHERE name = 'cost_center')
BEGIN
  EXEC sp_rename 'cost_center', 'fin_cost_center'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'cost_allocation')
BEGIN
  EXEC sp_rename 'cost_allocation', 'fin_cost_allocation'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'budget')
BEGIN
  EXEC sp_rename 'budget', 'fin_budget'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'budget_item')
BEGIN
  EXEC sp_rename 'budget_item', 'fin_budget_item'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'fixed_asset')
BEGIN
  EXEC sp_rename 'fixed_asset', 'fin_fixed_asset'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'asset_depreciation')
BEGIN
  EXEC sp_rename 'asset_depreciation', 'fin_depreciation'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'product_cost')
BEGIN
  EXEC sp_rename 'product_cost', 'fin_product_cost'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'optimization_suggestion')
BEGIN
  EXEC sp_rename 'optimization_suggestion', 'ai_optimization_suggestion'
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'document_process')
BEGIN
  EXEC sp_rename 'document_process', 'ai_document_process'
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fin_cost_center')
BEGIN
CREATE TABLE [fin_cost_center] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [cost_center_code] varchar(50) NOT NULL,
  [cost_center_name] varchar(200) NOT NULL,
  [parent_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [department_id] varchar(36) NULL,
  [description] text NULL,
  [is_enabled] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_fin_cost_center] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fin_cost_center_cost_center_code] UNIQUE ([cost_center_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fin_cost_allocation')
BEGIN
CREATE TABLE [fin_cost_allocation] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [allocation_no] varchar(50) NOT NULL,
  [source_center_id] varchar(36) NOT NULL,
  [source_center_code] varchar(50) NOT NULL,
  [source_center_name] varchar(200) NOT NULL,
  [target_center_id] varchar(36) NOT NULL,
  [target_center_code] varchar(50) NOT NULL,
  [target_center_name] varchar(200) NOT NULL,
  [allocation_type] varchar(50) NOT NULL,
  [allocation_amount] decimal(18,4) NOT NULL,
  [allocation_ratio] decimal(5,2) NULL,
  [allocation_date] datetime NOT NULL,
  [description] text NULL,
  [status] int NOT NULL DEFAULT 1,
  CONSTRAINT [PK_fin_cost_allocation] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fin_cost_allocation_allocation_no] UNIQUE ([allocation_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fin_budget')
BEGIN
CREATE TABLE [fin_budget] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [budget_no] varchar(50) NOT NULL,
  [budget_name] varchar(200) NOT NULL,
  [budget_type] varchar(50) NOT NULL,
  [cost_center_id] varchar(36) NULL,
  [cost_center_code] varchar(50) NULL,
  [cost_center_name] varchar(200) NULL,
  [period_type] varchar(20) NOT NULL DEFAULT 'year',
  [period_start] datetime NOT NULL,
  [period_end] datetime NOT NULL,
  [total_amount] decimal(18,4) NOT NULL,
  [used_amount] decimal(18,4) NOT NULL DEFAULT 0,
  [balance_amount] decimal(18,4) NOT NULL DEFAULT 0,
  [status] int NOT NULL DEFAULT 0,
  [approved_by] varchar(36) NULL,
  [approved_name] varchar(50) NULL,
  [approved_time] datetime NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_fin_budget] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fin_budget_budget_no] UNIQUE ([budget_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fin_budget_item')
BEGIN
CREATE TABLE [fin_budget_item] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [budget_id] varchar(36) NOT NULL,
  [budget_no] varchar(50) NOT NULL,
  [item_no] varchar(50) NOT NULL,
  [item_name] varchar(200) NOT NULL,
  [item_code] varchar(50) NULL,
  [category] varchar(50) NULL,
  [budget_amount] decimal(18,4) NOT NULL,
  [used_amount] decimal(18,4) NOT NULL DEFAULT 0,
  [balance_amount] decimal(18,4) NOT NULL DEFAULT 0,
  [variance_amount] decimal(18,4) NOT NULL DEFAULT 0,
  [variance_ratio] decimal(5,2) NOT NULL DEFAULT 0,
  [description] text NULL,
  CONSTRAINT [PK_fin_budget_item] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fin_budget_item_item_no] UNIQUE ([item_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fin_fixed_asset')
BEGIN
CREATE TABLE [fin_fixed_asset] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [asset_no] varchar(50) NOT NULL,
  [asset_name] varchar(200) NOT NULL,
  [asset_code] varchar(50) NOT NULL,
  [asset_type] varchar(50) NOT NULL,
  [category] varchar(50) NULL,
  [brand] varchar(100) NULL,
  [model] varchar(100) NULL,
  [serial_no] varchar(100) NULL,
  [purchase_date] datetime NOT NULL,
  [purchase_price] decimal(18,4) NOT NULL,
  [current_value] decimal(18,4) NOT NULL,
  [depreciation_method] varchar(50) NOT NULL DEFAULT 'straight_line',
  [depreciation_rate] decimal(5,2) NULL,
  [useful_life] int NOT NULL DEFAULT 5,
  [used_years] int NOT NULL DEFAULT 0,
  [accumulated_depreciation] decimal(18,4) NOT NULL DEFAULT 0,
  [location] varchar(200) NULL,
  [responsible_id] varchar(36) NULL,
  [responsible_name] varchar(50) NULL,
  [department_id] varchar(36) NULL,
  [department_name] varchar(200) NULL,
  [status] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_fin_fixed_asset] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fin_fixed_asset_asset_no] UNIQUE ([asset_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fin_depreciation')
BEGIN
CREATE TABLE [fin_depreciation] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [depreciation_no] varchar(50) NOT NULL,
  [asset_id] varchar(36) NOT NULL,
  [asset_no] varchar(50) NOT NULL,
  [asset_name] varchar(200) NOT NULL,
  [period_type] varchar(20) NOT NULL DEFAULT 'month',
  [period_start] datetime NOT NULL,
  [period_end] datetime NOT NULL,
  [depreciation_amount] decimal(18,4) NOT NULL,
  [accumulated_amount] decimal(18,4) NOT NULL,
  [book_value] decimal(18,4) NOT NULL,
  [depreciation_rate] decimal(5,2) NOT NULL,
  [status] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_fin_depreciation] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fin_depreciation_depreciation_no] UNIQUE ([depreciation_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fin_product_cost')
BEGIN
CREATE TABLE [fin_product_cost] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [cost_no] varchar(50) NOT NULL,
  [product_id] varchar(36) NOT NULL,
  [product_code] varchar(50) NOT NULL,
  [product_name] varchar(200) NOT NULL,
  [product_version] varchar(20) NULL,
  [material_cost] decimal(18,4) NOT NULL DEFAULT 0,
  [labor_cost] decimal(18,4) NOT NULL DEFAULT 0,
  [overhead_cost] decimal(18,4) NOT NULL DEFAULT 0,
  [total_cost] decimal(18,4) NOT NULL DEFAULT 0,
  [cost_date] datetime NOT NULL,
  [cost_method] varchar(50) NOT NULL DEFAULT 'standard',
  [batch_no] varchar(50) NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_fin_product_cost] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fin_product_cost_cost_no] UNIQUE ([cost_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_optimization_suggestion')
BEGIN
CREATE TABLE [ai_optimization_suggestion] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [suggestion_no] varchar(50) NOT NULL,
  [suggestion_type] varchar(50) NOT NULL,
  [module_type] varchar(50) NOT NULL,
  [title] varchar(200) NOT NULL,
  [description] text NOT NULL,
  [analysis_data] text NULL,
  [recommendation] text NOT NULL,
  [expected_benefit] varchar(500) NULL,
  [priority] int NOT NULL DEFAULT 2,
  [status] int NOT NULL DEFAULT 0,
  [adopted_by] varchar(36) NULL,
  [adopted_name] varchar(50) NULL,
  [adopted_time] datetime NULL,
  [rejected_reason] text NULL,
  CONSTRAINT [PK_ai_optimization_suggestion] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_optimization_suggestion_suggestion_no] UNIQUE ([suggestion_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_document_process')
BEGIN
CREATE TABLE [ai_document_process] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [process_no] varchar(50) NOT NULL,
  [file_name] varchar(200) NOT NULL,
  [file_path] varchar(500) NOT NULL,
  [file_type] varchar(50) NULL,
  [file_size] bigint NOT NULL DEFAULT 0,
  [process_type] varchar(50) NOT NULL,
  [original_content] text NULL,
  [processed_content] text NULL,
  [summary] text NULL,
  [corrections] text NULL,
  [extracted_data] text NULL,
  [status] int NOT NULL DEFAULT 1,
  [processed_by] varchar(36) NOT NULL,
  [processed_name] varchar(50) NOT NULL,
  [tokens] int NOT NULL DEFAULT 0,
  CONSTRAINT [PK_ai_document_process] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_document_process_process_no] UNIQUE ([process_no])
)
END
GO

PRINT '表名修正完成'