import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ExpenseAcceptanceLineDto {
  @IsNotEmpty() @IsString()
  sourceEntryId: string;

  @IsNumber() @Min(0.0001)
  acceptanceQty: number;

  @IsOptional() @IsString()
  departmentId?: string;

  @IsOptional() @IsString() @MaxLength(500)
  remark?: string;
}

export class CreateExpenseAcceptanceDto {
  @IsNotEmpty() @IsString() @MaxLength(100)
  idempotencyKey: string;

  @IsNotEmpty() @IsString()
  sourceId: string;

  @IsNotEmpty() @IsString()
  settleOrgId: string;

  @IsOptional() @IsDateString()
  acceptanceDate?: string;

  @IsOptional() @IsString()
  departmentId?: string;

  @IsOptional() @IsString()
  acceptorId?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  remark?: string;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ExpenseAcceptanceLineDto)
  entries: ExpenseAcceptanceLineDto[];
}

export class UpdateExpenseAcceptanceDto {
  @IsOptional() @IsDateString()
  acceptanceDate?: string;

  @IsOptional() @IsString()
  departmentId?: string;

  @IsOptional() @IsString()
  acceptorId?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  remark?: string;

  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ExpenseAcceptanceLineDto)
  entries?: ExpenseAcceptanceLineDto[];
}

export class ApproveExpenseAcceptanceDto {
  @IsOptional() @IsString() @MaxLength(50)
  approvedBy?: string;
}
