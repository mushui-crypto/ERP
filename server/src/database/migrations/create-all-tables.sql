IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_workflow_definition')
BEGIN
CREATE TABLE [sys_workflow_definition] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [workflow_code] varchar(50) NOT NULL,
  [workflow_name] varchar(200) NOT NULL,
  [description] text NULL,
  [business_type] varchar(100) NOT NULL,
  [start_form_id] varchar(36) NULL,
  [is_enabled] int NOT NULL DEFAULT 1,
  [is_default] int NOT NULL DEFAULT 0,
  [version] int NOT NULL DEFAULT 1,
  CONSTRAINT [PK_sys_workflow_definition] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_sys_workflow_definition_workflow_code] UNIQUE ([workflow_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_workflow_node')
BEGIN
CREATE TABLE [sys_workflow_node] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [workflow_id] varchar(36) NOT NULL,
  [workflow_code] varchar(50) NOT NULL,
  [node_code] varchar(50) NOT NULL,
  [node_name] varchar(100) NOT NULL,
  [node_type] varchar(50) NOT NULL,
  [sort_order] int NOT NULL,
  [parent_node_id] varchar(36) NULL,
  [assignee_type] varchar(50) NOT NULL,
  [assignee_ids] varchar(500) NULL,
  [assignee_names] varchar(500) NULL,
  [approval_type] varchar(50) NOT NULL DEFAULT 'single',
  [timeout_hours] int NULL,
  [can_reject] int NOT NULL DEFAULT 1,
  [can_delegate] int NOT NULL DEFAULT 1,
  CONSTRAINT [PK_sys_workflow_node] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_sys_workflow_node_node_code] UNIQUE ([node_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_workflow_line')
BEGIN
CREATE TABLE [sys_workflow_line] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [workflow_id] varchar(36) NOT NULL,
  [source_node_id] varchar(36) NOT NULL,
  [target_node_id] varchar(36) NOT NULL,
  [condition_type] varchar(50) NULL,
  [condition_expression] text NULL,
  [line_name] varchar(100) NULL,
  [is_default] int NOT NULL DEFAULT 0,
  CONSTRAINT [PK_sys_workflow_line] PRIMARY KEY ([id])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_workflow_instance')
BEGIN
CREATE TABLE [sys_workflow_instance] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [instance_no] varchar(50) NOT NULL,
  [workflow_id] varchar(36) NOT NULL,
  [workflow_code] varchar(50) NOT NULL,
  [workflow_name] varchar(200) NOT NULL,
  [business_type] varchar(100) NOT NULL,
  [business_id] varchar(36) NOT NULL,
  [business_no] varchar(50) NULL,
  [business_title] varchar(500) NULL,
  [creator_id] varchar(36) NOT NULL,
  [creator_name] varchar(50) NOT NULL,
  [current_node_id] varchar(36) NOT NULL,
  [current_node_name] varchar(100) NOT NULL,
  [status] int NOT NULL DEFAULT 1,
  [start_time] datetime NOT NULL,
  [end_time] datetime NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_sys_workflow_instance] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_sys_workflow_instance_instance_no] UNIQUE ([instance_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_workflow_task')
BEGIN
CREATE TABLE [sys_workflow_task] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [task_no] varchar(50) NOT NULL,
  [instance_id] varchar(36) NOT NULL,
  [instance_no] varchar(50) NOT NULL,
  [workflow_id] varchar(36) NOT NULL,
  [workflow_code] varchar(50) NOT NULL,
  [node_id] varchar(36) NOT NULL,
  [node_code] varchar(50) NOT NULL,
  [node_name] varchar(100) NOT NULL,
  [business_type] varchar(100) NOT NULL,
  [business_id] varchar(36) NOT NULL,
  [business_no] varchar(50) NULL,
  [business_title] varchar(500) NULL,
  [assignee_id] varchar(36) NOT NULL,
  [assignee_name] varchar(50) NOT NULL,
  [status] int NOT NULL DEFAULT 1,
  [priority] int NOT NULL DEFAULT 2,
  [create_time] datetime NOT NULL,
  [claim_time] datetime NULL,
  [complete_time] datetime NULL,
  [action] varchar(50) NULL,
  [comment] text NULL,
  [timeout_time] datetime NULL,
  CONSTRAINT [PK_sys_workflow_task] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_sys_workflow_task_task_no] UNIQUE ([task_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_workflow_history')
BEGIN
CREATE TABLE [sys_workflow_history] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [instance_id] varchar(36) NOT NULL,
  [instance_no] varchar(50) NOT NULL,
  [node_id] varchar(36) NOT NULL,
  [node_code] varchar(50) NOT NULL,
  [node_name] varchar(100) NOT NULL,
  [action] varchar(50) NOT NULL,
  [operator_id] varchar(36) NOT NULL,
  [operator_name] varchar(50) NOT NULL,
  [operate_time] datetime NOT NULL,
  [comment] text NULL,
  [business_type] varchar(100) NOT NULL,
  [business_id] varchar(36) NOT NULL,
  CONSTRAINT [PK_sys_workflow_history] PRIMARY KEY ([id])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_message')
BEGIN
CREATE TABLE [sys_message] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [message_no] varchar(50) NOT NULL,
  [sender_id] varchar(36) NOT NULL,
  [sender_name] varchar(50) NOT NULL,
  [receiver_id] varchar(36) NOT NULL,
  [receiver_name] varchar(50) NOT NULL,
  [message_type] varchar(50) NOT NULL,
  [title] varchar(200) NOT NULL,
  [content] text NOT NULL,
  [business_type] varchar(100) NULL,
  [business_id] varchar(36) NULL,
  [business_no] varchar(50) NULL,
  [link_url] varchar(500) NULL,
  [is_read] bit NOT NULL DEFAULT 0,
  [read_time] datetime NULL,
  [is_pinned] bit NOT NULL DEFAULT 0,
  [priority] int NOT NULL DEFAULT 2,
  CONSTRAINT [PK_sys_message] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_sys_message_message_no] UNIQUE ([message_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_task')
BEGIN
CREATE TABLE [sys_task] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [task_no] varchar(50) NOT NULL,
  [title] varchar(200) NOT NULL,
  [description] text NULL,
  [task_type] varchar(50) NOT NULL,
  [priority] int NOT NULL DEFAULT 2,
  [status] int NOT NULL DEFAULT 0,
  [assignee_id] varchar(36) NULL,
  [assignee_name] varchar(50) NULL,
  [start_date] datetime NULL,
  [end_date] datetime NULL,
  [complete_date] datetime NULL,
  [progress] int NOT NULL DEFAULT 0,
  [parent_id] varchar(36) NULL,
  [business_type] varchar(100) NULL,
  [business_id] varchar(36) NULL,
  [business_no] varchar(50) NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_sys_task] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_sys_task_task_no] UNIQUE ([task_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hr_recruitment_requirement')
BEGIN
CREATE TABLE [hr_recruitment_requirement] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [requirement_no] varchar(50) NOT NULL,
  [department_id] varchar(36) NOT NULL,
  [department_name] varchar(200) NOT NULL,
  [position_id] varchar(36) NOT NULL,
  [position_name] varchar(200) NOT NULL,
  [headcount] int NOT NULL,
  [hired_count] int NOT NULL DEFAULT 0,
  [requirement_type] int NOT NULL,
  [education] varchar(50) NOT NULL,
  [work_experience] varchar(50) NOT NULL,
  [salary_min] decimal(12,2) NOT NULL,
  [salary_max] decimal(12,2) NOT NULL,
  [job_description] text NOT NULL,
  [requirements] text NOT NULL,
  [recruitment_channel] varchar(500) NULL,
  [expected_start_date] datetime NOT NULL,
  [requester_id] varchar(36) NOT NULL,
  [requester_name] varchar(50) NOT NULL,
  [status] int NOT NULL DEFAULT 0,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_hr_recruitment_requirement] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_hr_recruitment_requirement_requirement_no] UNIQUE ([requirement_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hr_recruitment_candidate')
BEGIN
CREATE TABLE [hr_recruitment_candidate] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [candidate_no] varchar(50) NOT NULL,
  [requirement_id] varchar(36) NOT NULL,
  [requirement_no] varchar(50) NOT NULL,
  [position_name] varchar(200) NOT NULL,
  [name] varchar(50) NOT NULL,
  [gender] int NOT NULL,
  [age] int NOT NULL,
  [education] varchar(50) NOT NULL,
  [work_experience] varchar(50) NOT NULL,
  [phone] varchar(20) NOT NULL,
  [email] varchar(100) NULL,
  [resume_url] varchar(500) NULL,
  [source_channel] varchar(100) NOT NULL,
  [current_salary] decimal(12,2) NULL,
  [expected_salary] decimal(12,2) NULL,
  [status] int NOT NULL DEFAULT 0,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_hr_recruitment_candidate] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_hr_recruitment_candidate_candidate_no] UNIQUE ([candidate_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hr_training_plan')
BEGIN
CREATE TABLE [hr_training_plan] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [plan_no] varchar(50) NOT NULL,
  [department_id] varchar(36) NOT NULL,
  [department_name] varchar(200) NOT NULL,
  [title] varchar(200) NOT NULL,
  [training_type] varchar(50) NOT NULL,
  [start_date] datetime NOT NULL,
  [end_date] datetime NOT NULL,
  [location] varchar(200) NOT NULL,
  [trainer_id] varchar(36) NOT NULL,
  [trainer_name] varchar(50) NOT NULL,
  [content] text NOT NULL,
  [expected_count] int NOT NULL,
  [actual_count] int NOT NULL DEFAULT 0,
  [budget] decimal(12,2) NOT NULL,
  [actual_cost] decimal(12,2) NOT NULL DEFAULT 0,
  [status] int NOT NULL DEFAULT 0,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_hr_training_plan] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_hr_training_plan_plan_no] UNIQUE ([plan_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hr_performance_plan')
BEGIN
CREATE TABLE [hr_performance_plan] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [plan_no] varchar(50) NOT NULL,
  [department_id] varchar(36) NOT NULL,
  [department_name] varchar(200) NOT NULL,
  [title] varchar(200) NOT NULL,
  [plan_type] varchar(50) NOT NULL,
  [period] varchar(20) NOT NULL,
  [start_date] datetime NOT NULL,
  [end_date] datetime NOT NULL,
  [self_assessment_deadline] datetime NOT NULL,
  [supervisor_assessment_deadline] datetime NOT NULL,
  [review_deadline] datetime NOT NULL,
  [description] text NULL,
  [status] int NOT NULL DEFAULT 0,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_hr_performance_plan] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_hr_performance_plan_plan_no] UNIQUE ([plan_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'hr_performance_result')
BEGIN
CREATE TABLE [hr_performance_result] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [result_no] varchar(50) NOT NULL,
  [plan_id] varchar(36) NOT NULL,
  [plan_no] varchar(50) NOT NULL,
  [plan_title] varchar(200) NOT NULL,
  [emp_id] varchar(36) NOT NULL,
  [emp_name] varchar(50) NOT NULL,
  [department_id] varchar(36) NOT NULL,
  [department_name] varchar(200) NOT NULL,
  [position_id] varchar(36) NOT NULL,
  [position_name] varchar(200) NOT NULL,
  [self_score] decimal(5,2) NULL,
  [self_comment] text NULL,
  [supervisor_score] decimal(5,2) NULL,
  [supervisor_comment] text NULL,
  [final_score] decimal(5,2) NULL,
  [performance_level] varchar(20) NULL,
  [bonus_ratio] decimal(5,2) NULL,
  [improvement_suggestion] text NULL,
  [status] int NOT NULL DEFAULT 0,
  CONSTRAINT [PK_hr_performance_result] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_hr_performance_result_result_no] UNIQUE ([result_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'crm_customer_category')
BEGIN
CREATE TABLE [crm_customer_category] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [category_code] varchar(50) NOT NULL,
  [category_name] varchar(100) NOT NULL,
  [parent_id] varchar(36) NULL,
  [sort_order] int NOT NULL DEFAULT 0,
  [enabled] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_crm_customer_category] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_crm_customer_category_category_code] UNIQUE ([category_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'crm_customer_contact')
BEGIN
CREATE TABLE [crm_customer_contact] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [contact_no] varchar(50) NOT NULL,
  [customer_id] varchar(36) NOT NULL,
  [customer_no] varchar(50) NOT NULL,
  [customer_name] varchar(200) NOT NULL,
  [name] varchar(50) NOT NULL,
  [position] varchar(100) NULL,
  [phone] varchar(20) NOT NULL,
  [email] varchar(100) NULL,
  [qq] varchar(20) NULL,
  [wechat] varchar(100) NULL,
  [is_primary] bit NOT NULL DEFAULT 0,
  [enabled] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_crm_customer_contact] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_crm_customer_contact_contact_no] UNIQUE ([contact_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'crm_customer_followup')
BEGIN
CREATE TABLE [crm_customer_followup] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [followup_no] varchar(50) NOT NULL,
  [customer_id] varchar(36) NOT NULL,
  [customer_no] varchar(50) NOT NULL,
  [customer_name] varchar(200) NOT NULL,
  [contact_id] varchar(36) NULL,
  [contact_name] varchar(50) NULL,
  [followup_type] varchar(50) NOT NULL,
  [followup_result] varchar(50) NOT NULL,
  [content] text NOT NULL,
  [next_followup_date] datetime NULL,
  [followup_user_id] varchar(36) NOT NULL,
  [followup_user_name] varchar(50) NOT NULL,
  [is_returned] bit NOT NULL DEFAULT 0,
  CONSTRAINT [PK_crm_customer_followup] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_crm_customer_followup_followup_no] UNIQUE ([followup_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'crm_sales_stage')
BEGIN
CREATE TABLE [crm_sales_stage] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [stage_code] varchar(50) NOT NULL,
  [stage_name] varchar(100) NOT NULL,
  [sort_order] int NOT NULL,
  [probability] decimal(5,2) NOT NULL,
  [enabled] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_crm_sales_stage] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_crm_sales_stage_stage_code] UNIQUE ([stage_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'crm_opportunity_activity')
BEGIN
CREATE TABLE [crm_opportunity_activity] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [activity_no] varchar(50) NOT NULL,
  [opportunity_id] varchar(36) NOT NULL,
  [opportunity_no] varchar(50) NOT NULL,
  [activity_type] varchar(50) NOT NULL,
  [title] varchar(200) NOT NULL,
  [activity_time] datetime NOT NULL,
  [content] text NOT NULL,
  [next_action] text NULL,
  [next_action_time] datetime NULL,
  [activity_user_id] varchar(36) NOT NULL,
  [activity_user_name] varchar(50) NOT NULL,
  CONSTRAINT [PK_crm_opportunity_activity] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_crm_opportunity_activity_activity_no] UNIQUE ([activity_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_message')
BEGIN
CREATE TABLE [ai_message] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [conversation_id] varchar(36) NOT NULL,
  [message_no] varchar(50) NOT NULL,
  [role] varchar(20) NOT NULL,
  [content] text NOT NULL,
  [tokens] int NOT NULL DEFAULT 0,
  [status] int NOT NULL DEFAULT 1,
  [error_message] text NULL,
  CONSTRAINT [PK_ai_message] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_message_message_no] UNIQUE ([message_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_knowledge_base')
BEGIN
CREATE TABLE [ai_knowledge_base] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [kb_code] varchar(50) NOT NULL,
  [kb_name] varchar(200) NOT NULL,
  [description] text NULL,
  [source_type] varchar(50) NOT NULL,
  [status] int NOT NULL DEFAULT 1,
  [document_count] int NOT NULL DEFAULT 0,
  [chunk_count] int NOT NULL DEFAULT 0,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_ai_knowledge_base] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_knowledge_base_kb_code] UNIQUE ([kb_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_knowledge_document')
BEGIN
CREATE TABLE [ai_knowledge_document] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [kb_id] varchar(36) NOT NULL,
  [kb_code] varchar(50) NOT NULL,
  [document_no] varchar(50) NOT NULL,
  [title] varchar(200) NOT NULL,
  [file_name] varchar(200) NOT NULL,
  [file_path] varchar(500) NOT NULL,
  [file_size] bigint NOT NULL DEFAULT 0,
  [file_type] varchar(50) NULL,
  [content] text NULL,
  [status] int NOT NULL DEFAULT 1,
  [chunk_count] int NOT NULL DEFAULT 0,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_ai_knowledge_document] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_knowledge_document_document_no] UNIQUE ([document_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_knowledge_chunk')
BEGIN
CREATE TABLE [ai_knowledge_chunk] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [document_id] varchar(36) NOT NULL,
  [chunk_no] varchar(50) NOT NULL,
  [content] text NOT NULL,
  [embedding] text NULL,
  [tokens] int NOT NULL DEFAULT 0,
  [status] int NOT NULL DEFAULT 1,
  CONSTRAINT [PK_ai_knowledge_chunk] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_knowledge_chunk_chunk_no] UNIQUE ([chunk_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_qa_record')
BEGIN
CREATE TABLE [ai_qa_record] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [qa_no] varchar(50) NOT NULL,
  [user_id] varchar(36) NOT NULL,
  [user_name] varchar(50) NOT NULL,
  [question] text NOT NULL,
  [answer] text NOT NULL,
  [module_type] varchar(50) NULL,
  [source_type] varchar(50) NOT NULL DEFAULT 'database',
  [sources] text NULL,
  [confidence] decimal(5,2) NULL,
  [status] int NOT NULL DEFAULT 1,
  [tokens] int NOT NULL DEFAULT 0,
  CONSTRAINT [PK_ai_qa_record] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_qa_record_qa_no] UNIQUE ([qa_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_analysis_report')
BEGIN
CREATE TABLE [ai_analysis_report] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [report_no] varchar(50) NOT NULL,
  [report_name] varchar(200) NOT NULL,
  [report_type] varchar(50) NOT NULL,
  [period_type] varchar(20) NOT NULL DEFAULT 'month',
  [period_start] datetime NOT NULL,
  [period_end] datetime NOT NULL,
  [data_summary] text NULL,
  [analysis_content] text NOT NULL,
  [suggestions] text NULL,
  [chart_data] text NULL,
  [status] int NOT NULL DEFAULT 1,
  [generated_by] varchar(36) NOT NULL,
  [generated_name] varchar(50) NOT NULL,
  CONSTRAINT [PK_ai_analysis_report] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_ai_analysis_report_report_no] UNIQUE ([report_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'risk_alert')
BEGIN
CREATE TABLE [risk_alert] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [alert_no] varchar(50) NOT NULL,
  [alert_type] varchar(50) NOT NULL,
  [alert_level] varchar(20) NOT NULL DEFAULT 'warning',
  [title] varchar(200) NOT NULL,
  [description] text NOT NULL,
  [source_module] varchar(50) NOT NULL,
  [source_id] varchar(36) NULL,
  [source_no] varchar(50) NULL,
  [threshold] decimal(18,4) NULL,
  [actual_value] decimal(18,4) NULL,
  [status] int NOT NULL DEFAULT 0,
  [acknowledged_by] varchar(36) NULL,
  [acknowledged_name] varchar(50) NULL,
  [acknowledged_time] datetime NULL,
  [resolved_by] varchar(36) NULL,
  [resolved_name] varchar(50) NULL,
  [resolved_time] datetime NULL,
  [resolve_note] text NULL,
  CONSTRAINT [PK_risk_alert] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_risk_alert_alert_no] UNIQUE ([alert_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'risk_alert_rule')
BEGIN
CREATE TABLE [risk_alert_rule] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [rule_code] varchar(50) NOT NULL,
  [rule_name] varchar(200) NOT NULL,
  [alert_type] varchar(50) NOT NULL,
  [module_type] varchar(50) NOT NULL,
  [threshold_type] varchar(20) NOT NULL DEFAULT 'comparison',
  [threshold_value] decimal(18,4) NULL,
  [threshold_min] decimal(18,4) NULL,
  [threshold_max] decimal(18,4) NULL,
  [comparison_operator] varchar(20) NULL,
  [enabled] bit NOT NULL DEFAULT 1,
  [alert_level] varchar(20) NOT NULL DEFAULT 'warning',
  [description] text NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_risk_alert_rule] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_risk_alert_rule_rule_code] UNIQUE ([rule_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'optimization_suggestion')
BEGIN
CREATE TABLE [optimization_suggestion] (
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
  CONSTRAINT [PK_optimization_suggestion] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_optimization_suggestion_suggestion_no] UNIQUE ([suggestion_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'document_process')
BEGIN
CREATE TABLE [document_process] (
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
  CONSTRAINT [PK_document_process] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_document_process_process_no] UNIQUE ([process_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cost_center')
BEGIN
CREATE TABLE [cost_center] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [center_code] varchar(50) NOT NULL,
  [center_name] varchar(200) NOT NULL,
  [center_type] varchar(50) NOT NULL,
  [parent_id] varchar(36) NULL,
  [responsible_id] varchar(36) NULL,
  [responsible_name] varchar(50) NULL,
  [enabled] bit NOT NULL DEFAULT 1,
  [description] text NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_cost_center] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_cost_center_center_code] UNIQUE ([center_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cost_allocation')
BEGIN
CREATE TABLE [cost_allocation] (
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
  CONSTRAINT [PK_cost_allocation] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_cost_allocation_allocation_no] UNIQUE ([allocation_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_cost')
BEGIN
CREATE TABLE [product_cost] (
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
  CONSTRAINT [PK_product_cost] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_product_cost_cost_no] UNIQUE ([cost_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'budget')
BEGIN
CREATE TABLE [budget] (
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
  CONSTRAINT [PK_budget] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_budget_budget_no] UNIQUE ([budget_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'budget_item')
BEGIN
CREATE TABLE [budget_item] (
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
  CONSTRAINT [PK_budget_item] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_budget_item_item_no] UNIQUE ([item_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'fixed_asset')
BEGIN
CREATE TABLE [fixed_asset] (
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
  CONSTRAINT [PK_fixed_asset] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_fixed_asset_asset_no] UNIQUE ([asset_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'asset_depreciation')
BEGIN
CREATE TABLE [asset_depreciation] (
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
  CONSTRAINT [PK_asset_depreciation] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_asset_depreciation_depreciation_no] UNIQUE ([depreciation_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'plm_product')
BEGIN
CREATE TABLE [plm_product] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [product_code] varchar(50) NOT NULL,
  [product_name] varchar(200) NOT NULL,
  [product_type] varchar(50) NULL,
  [brand] varchar(100) NULL,
  [model] varchar(100) NULL,
  [specification] text NULL,
  [version] varchar(20) NOT NULL DEFAULT 'V1.0',
  [version_desc] text NULL,
  [weight] decimal(12,4) NULL,
  [unit] varchar(20) NULL,
  [category_id] varchar(36) NULL,
  [category_name] varchar(200) NULL,
  [status] int NOT NULL DEFAULT 0,
  [effective_date] datetime NULL,
  [obsolete_date] datetime NULL,
  [description] text NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_plm_product] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_plm_product_product_code] UNIQUE ([product_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'plm_material')
BEGIN
CREATE TABLE [plm_material] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [material_code] varchar(50) NOT NULL,
  [material_name] varchar(200) NOT NULL,
  [material_type] varchar(50) NOT NULL,
  [specification] text NULL,
  [unit] varchar(20) NULL,
  [category_id] varchar(36) NULL,
  [category_name] varchar(200) NULL,
  [brand] varchar(100) NULL,
  [model] varchar(100) NULL,
  [weight] decimal(12,4) NULL,
  [volume] decimal(12,4) NULL,
  [batch_control] bit NOT NULL DEFAULT 0,
  [serial_control] bit NOT NULL DEFAULT 0,
  [expiry_control] bit NOT NULL DEFAULT 0,
  [safety_stock] decimal(18,4) NULL,
  [min_stock] decimal(18,4) NULL,
  [max_stock] decimal(18,4) NULL,
  [lead_time] int NULL,
  [status] int NOT NULL DEFAULT 1,
  [description] text NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_plm_material] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_plm_material_material_code] UNIQUE ([material_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'svc_service_order')
BEGIN
CREATE TABLE [svc_service_order] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [order_no] varchar(50) NOT NULL,
  [service_id] varchar(36) NOT NULL,
  [service_no] varchar(50) NOT NULL,
  [customer_id] varchar(36) NOT NULL,
  [customer_name] varchar(200) NOT NULL,
  [contact_person] varchar(50) NOT NULL,
  [contact_phone] varchar(20) NOT NULL,
  [product_id] varchar(36) NULL,
  [product_name] varchar(200) NULL,
  [product_code] varchar(50) NULL,
  [product_serial] varchar(100) NULL,
  [service_type] varchar(50) NOT NULL,
  [service_desc] text NOT NULL,
  [service_address] varchar(500) NULL,
  [service_date] datetime NULL,
  [technician_id] varchar(36) NULL,
  [technician_name] varchar(50) NULL,
  [material_cost] decimal(18,4) NOT NULL DEFAULT 0,
  [labor_cost] decimal(18,4) NOT NULL DEFAULT 0,
  [total_cost] decimal(18,4) NOT NULL DEFAULT 0,
  [status] int NOT NULL DEFAULT 0,
  [start_time] datetime NULL,
  [end_time] datetime NULL,
  [completion_note] text NULL,
  [settlement_amount] decimal(18,4) NULL,
  [settlement_time] datetime NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_svc_service_order] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_svc_service_order_order_no] UNIQUE ([order_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'svc_complaint')
BEGIN
CREATE TABLE [svc_complaint] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [complaint_no] varchar(50) NOT NULL,
  [customer_id] varchar(36) NOT NULL,
  [customer_name] varchar(200) NOT NULL,
  [contact_person] varchar(50) NOT NULL,
  [contact_phone] varchar(20) NOT NULL,
  [product_id] varchar(36) NULL,
  [product_name] varchar(200) NULL,
  [product_code] varchar(50) NULL,
  [complaint_type] varchar(50) NOT NULL,
  [severity] varchar(20) NOT NULL DEFAULT 'normal',
  [content] text NOT NULL,
  [evidence_files] text NULL,
  [status] int NOT NULL DEFAULT 0,
  [handle_user_id] varchar(36) NULL,
  [handle_user_name] varchar(50) NULL,
  [handle_time] datetime NULL,
  [solution] text NULL,
  [compensation_amount] decimal(18,4) NULL,
  [satisfaction] int NULL,
  [close_time] datetime NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_svc_complaint] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_svc_complaint_complaint_no] UNIQUE ([complaint_no])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_barcode')
BEGIN
CREATE TABLE [sys_barcode] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [barcode_value] varchar(100) NOT NULL,
  [rule_id] varchar(36) NOT NULL,
  [rule_code] varchar(50) NOT NULL,
  [target_type] varchar(50) NOT NULL,
  [target_id] varchar(36) NULL,
  [target_no] varchar(50) NULL,
  [target_name] varchar(200) NULL,
  [batch_no] varchar(50) NULL,
  [expiry_date] datetime NULL,
  [status] int NOT NULL DEFAULT 1,
  [use_count] int NOT NULL DEFAULT 0,
  [max_use_count] int NULL,
  [first_use_time] datetime NULL,
  [last_use_time] datetime NULL,
  [printed_count] int NOT NULL DEFAULT 0,
  [print_template_id] varchar(36) NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_sys_barcode] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_sys_barcode_barcode_value] UNIQUE ([barcode_value])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bi_dashboard')
BEGIN
CREATE TABLE [bi_dashboard] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [dashboard_code] varchar(50) NOT NULL,
  [dashboard_name] varchar(200) NOT NULL,
  [description] text NULL,
  [layout] text NULL,
  [widget_ids] text NULL,
  [category] varchar(50) NULL,
  [is_public] bit NOT NULL DEFAULT 0,
  [is_default] bit NOT NULL DEFAULT 0,
  [sort_order] int NOT NULL DEFAULT 0,
  [status] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_bi_dashboard] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_bi_dashboard_dashboard_code] UNIQUE ([dashboard_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bi_widget')
BEGIN
CREATE TABLE [bi_widget] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [widget_code] varchar(50) NOT NULL,
  [widget_name] varchar(200) NOT NULL,
  [widget_type] varchar(50) NOT NULL,
  [dashboard_id] varchar(36) NULL,
  [data_source] varchar(100) NULL,
  [query_params] text NULL,
  [chart_config] text NULL,
  [x_field] varchar(100) NULL,
  [y_fields] text NULL,
  [filters] text NULL,
  [sort_config] text NULL,
  [layout_position] varchar(50) NULL,
  [width] int NULL,
  [height] int NULL,
  [refresh_interval] int NULL,
  [status] int NOT NULL DEFAULT 1,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_bi_widget] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_bi_widget_widget_code] UNIQUE ([widget_code])
)
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bi_report')
BEGIN
CREATE TABLE [bi_report] (
  [id] varchar(36) NOT NULL,
  [created_at] datetime NOT NULL DEFAULT GETDATE(),
  [updated_at] datetime NOT NULL DEFAULT GETDATE(),
  [created_by] varchar(36) NULL,
  [updated_by] varchar(36) NULL,
  [data_center_id] varchar(36) NULL,
  [org_id] varchar(36) NULL,
  [is_deleted] bit NOT NULL DEFAULT 0,
  [report_code] varchar(50) NOT NULL,
  [report_name] varchar(200) NOT NULL,
  [report_type] varchar(50) NOT NULL,
  [description] text NULL,
  [data_source] varchar(100) NULL,
  [query_template] text NULL,
  [display_template] text NULL,
  [period_type] varchar(20) NOT NULL DEFAULT 'month',
  [filters] text NULL,
  [columns] text NULL,
  [is_public] bit NOT NULL DEFAULT 0,
  [status] int NOT NULL DEFAULT 1,
  [schedule_config] text NULL,
  [remark] varchar(500) NULL,
  CONSTRAINT [PK_bi_report] PRIMARY KEY ([id]),
  CONSTRAINT [UQ_bi_report_report_code] UNIQUE ([report_code])
)
END
GO

PRINT '所有表创建完成'