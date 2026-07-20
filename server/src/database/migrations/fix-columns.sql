IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_cost_center') AND name = 'is_enabled')
BEGIN
  ALTER TABLE fin_cost_center ADD is_enabled int NOT NULL DEFAULT 1
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_cost_center') AND name = 'org_id')
BEGIN
  ALTER TABLE fin_cost_center ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_cost_allocation') AND name = 'org_id')
BEGIN
  ALTER TABLE fin_cost_allocation ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_cost_allocation') AND name = 'data_center_id')
BEGIN
  ALTER TABLE fin_cost_allocation ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_cost_allocation') AND name = 'is_deleted')
BEGIN
  ALTER TABLE fin_cost_allocation ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_budget') AND name = 'org_id')
BEGIN
  ALTER TABLE fin_budget ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_budget') AND name = 'data_center_id')
BEGIN
  ALTER TABLE fin_budget ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_budget') AND name = 'is_deleted')
BEGIN
  ALTER TABLE fin_budget ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_budget_item') AND name = 'org_id')
BEGIN
  ALTER TABLE fin_budget_item ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_budget_item') AND name = 'data_center_id')
BEGIN
  ALTER TABLE fin_budget_item ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_budget_item') AND name = 'is_deleted')
BEGIN
  ALTER TABLE fin_budget_item ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_fixed_asset') AND name = 'org_id')
BEGIN
  ALTER TABLE fin_fixed_asset ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_fixed_asset') AND name = 'data_center_id')
BEGIN
  ALTER TABLE fin_fixed_asset ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_fixed_asset') AND name = 'is_deleted')
BEGIN
  ALTER TABLE fin_fixed_asset ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_depreciation') AND name = 'org_id')
BEGIN
  ALTER TABLE fin_depreciation ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_depreciation') AND name = 'data_center_id')
BEGIN
  ALTER TABLE fin_depreciation ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_depreciation') AND name = 'is_deleted')
BEGIN
  ALTER TABLE fin_depreciation ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_product_cost') AND name = 'org_id')
BEGIN
  ALTER TABLE fin_product_cost ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_product_cost') AND name = 'data_center_id')
BEGIN
  ALTER TABLE fin_product_cost ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('fin_product_cost') AND name = 'is_deleted')
BEGIN
  ALTER TABLE fin_product_cost ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_optimization_suggestion') AND name = 'org_id')
BEGIN
  ALTER TABLE ai_optimization_suggestion ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_optimization_suggestion') AND name = 'data_center_id')
BEGIN
  ALTER TABLE ai_optimization_suggestion ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_optimization_suggestion') AND name = 'is_deleted')
BEGIN
  ALTER TABLE ai_optimization_suggestion ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_document_process') AND name = 'org_id')
BEGIN
  ALTER TABLE ai_document_process ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_document_process') AND name = 'data_center_id')
BEGIN
  ALTER TABLE ai_document_process ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_document_process') AND name = 'is_deleted')
BEGIN
  ALTER TABLE ai_document_process ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_base') AND name = 'org_id')
BEGIN
  ALTER TABLE ai_knowledge_base ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_base') AND name = 'data_center_id')
BEGIN
  ALTER TABLE ai_knowledge_base ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_base') AND name = 'is_deleted')
BEGIN
  ALTER TABLE ai_knowledge_base ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_document') AND name = 'org_id')
BEGIN
  ALTER TABLE ai_knowledge_document ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_document') AND name = 'data_center_id')
BEGIN
  ALTER TABLE ai_knowledge_document ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_document') AND name = 'is_deleted')
BEGIN
  ALTER TABLE ai_knowledge_document ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_chunk') AND name = 'org_id')
BEGIN
  ALTER TABLE ai_knowledge_chunk ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_chunk') AND name = 'data_center_id')
BEGIN
  ALTER TABLE ai_knowledge_chunk ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_knowledge_chunk') AND name = 'is_deleted')
BEGIN
  ALTER TABLE ai_knowledge_chunk ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_qa_record') AND name = 'org_id')
BEGIN
  ALTER TABLE ai_qa_record ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_qa_record') AND name = 'data_center_id')
BEGIN
  ALTER TABLE ai_qa_record ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_qa_record') AND name = 'is_deleted')
BEGIN
  ALTER TABLE ai_qa_record ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_analysis_report') AND name = 'org_id')
BEGIN
  ALTER TABLE ai_analysis_report ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_analysis_report') AND name = 'data_center_id')
BEGIN
  ALTER TABLE ai_analysis_report ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ai_analysis_report') AND name = 'is_deleted')
BEGIN
  ALTER TABLE ai_analysis_report ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('risk_alert') AND name = 'org_id')
BEGIN
  ALTER TABLE risk_alert ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('risk_alert') AND name = 'data_center_id')
BEGIN
  ALTER TABLE risk_alert ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('risk_alert') AND name = 'is_deleted')
BEGIN
  ALTER TABLE risk_alert ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('risk_alert_rule') AND name = 'org_id')
BEGIN
  ALTER TABLE risk_alert_rule ADD org_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('risk_alert_rule') AND name = 'data_center_id')
BEGIN
  ALTER TABLE risk_alert_rule ADD data_center_id varchar(36) NULL
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('risk_alert_rule') AND name = 'is_deleted')
BEGIN
  ALTER TABLE risk_alert_rule ADD is_deleted bit NOT NULL DEFAULT 0
END
GO

PRINT 'Columns fixed'