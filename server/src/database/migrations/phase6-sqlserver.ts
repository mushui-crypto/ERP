import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase6SqlServer1783770000002 implements MigrationInterface {
  name = 'Phase6SqlServer1783770000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE [ai_conversation] (
      [id] varchar(36) NOT NULL,
      [created_at] datetime NOT NULL DEFAULT GETDATE(),
      [updated_at] datetime NOT NULL DEFAULT GETDATE(),
      [created_by] varchar(36) NULL,
      [updated_by] varchar(36) NULL,
      [data_center_id] varchar(36) NULL,
      [org_id] varchar(36) NULL,
      [is_deleted] bit NOT NULL DEFAULT 0,
      [conversation_no] varchar(50) NOT NULL,
      [user_id] varchar(36) NOT NULL,
      [user_name] varchar(50) NOT NULL,
      [title] varchar(200) NULL,
      [model_type] varchar(50) NOT NULL DEFAULT 'gpt-4',
      [status] int NOT NULL DEFAULT 1,
      [total_tokens] int NOT NULL DEFAULT 0,
      [last_message_time] datetime NULL,
      [remark] varchar(500) NULL,
      CONSTRAINT [PK_ai_conversation] PRIMARY KEY ([id]),
      CONSTRAINT [UQ_ai_conversation_conversation_no] UNIQUE ([conversation_no])
    )`);

    await queryRunner.query(`CREATE TABLE [ai_message] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [ai_knowledge_base] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [ai_knowledge_document] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [ai_knowledge_chunk] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [ai_qa_record] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [ai_analysis_report] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [risk_alert] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [risk_alert_rule] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [optimization_suggestion] (
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
    )`);

    await queryRunner.query(`CREATE TABLE [document_process] (
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
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE [document_process]`);
    await queryRunner.query(`DROP TABLE [optimization_suggestion]`);
    await queryRunner.query(`DROP TABLE [risk_alert_rule]`);
    await queryRunner.query(`DROP TABLE [risk_alert]`);
    await queryRunner.query(`DROP TABLE [ai_analysis_report]`);
    await queryRunner.query(`DROP TABLE [ai_qa_record]`);
    await queryRunner.query(`DROP TABLE [ai_knowledge_chunk]`);
    await queryRunner.query(`DROP TABLE [ai_knowledge_document]`);
    await queryRunner.query(`DROP TABLE [ai_knowledge_base]`);
    await queryRunner.query(`DROP TABLE [ai_message]`);
    await queryRunner.query(`DROP TABLE [ai_conversation]`);
  }
}