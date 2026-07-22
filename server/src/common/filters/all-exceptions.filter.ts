import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = randomUUID();

    const normalized = this.normalizeException(exception);
    const location = `${request.method} ${request.url}`;
    const message = this.buildUserMessage(normalized.status, normalized.message, location, requestId);

    this.logger.error(
      `[${requestId}] ${location} - ${normalized.status} - ${normalized.message}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(normalized.status).json({
      code: normalized.code,
      message,
      error: normalized.message,
      detail: normalized.detail,
      requestId,
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString(),
      data: null,
    });
  }

  private normalizeException(exception: unknown): { status: number; code: number | string; message: string; detail?: unknown } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, any>;
        const rawMessage = body.message ?? body.error ?? exception.message;
        return {
          status,
          code: body.code ?? status,
          message: this.normalizeMessage(rawMessage),
          detail: Array.isArray(rawMessage) ? rawMessage : body.detail,
        };
      }
      return { status, code: status, message: this.normalizeMessage(res || exception.message) };
    }

    const err = exception as any;
    const code = err?.code || err?.name || 'INTERNAL_ERROR';
    const message = this.mapSystemError(err);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, code, message, detail: err?.detail };
  }

  private normalizeMessage(value: unknown): string {
    if (Array.isArray(value)) return value.map((item) => String(item)).join('；');
    if (value === null || value === undefined || value === '') return '请求处理失败，但后端未返回具体原因';
    return String(value);
  }

  private mapSystemError(error: any): string {
    const name = String(error?.name || '');
    const code = String(error?.code || '');
    const raw = String(error?.message || '');

    if (name.includes('LockNotSupportedOnGivenDriverError')) {
      return '当前数据库不支持悲观锁；请使用支持该操作的数据库，或确认本地 SQLite 兼容补丁已生效';
    }
    if (raw.includes('NOT NULL constraint failed')) {
      const match = raw.match(/NOT NULL constraint failed:\s*([^\n]+)/i);
      return `数据库必填字段缺失${match ? `：${match[1]}` : ''}；请检查前端请求字段或后端默认值`;
    }
    if (raw.includes('FOREIGN KEY constraint failed')) {
      return '数据库外键约束失败；请检查供应商、组织、币别、物料、单位或来源单据ID是否真实存在';
    }
    if (raw.includes('CHECK constraint failed')) {
      return `数据库检查约束失败：${raw}；请检查数量、金额、状态或业务类型是否在允许范围内`;
    }
    if (raw.includes('UNIQUE constraint failed')) {
      const match = raw.match(/UNIQUE constraint failed:\s*([^\n]+)/i);
      return `数据库唯一约束冲突${match ? `：${match[1]}` : ''}；请检查单号、幂等键或来源单据是否重复`;
    }
    if (code.includes('SQLITE_CONSTRAINT')) {
      return `数据库约束失败：${raw || code}；请检查请求字段、来源单据、状态或重复提交`;
    }
    if (code.includes('SQLITE_ERROR')) {
      return `数据库执行失败：${raw || code}`;
    }
    if (name.includes('QueryFailedError')) {
      return `数据库查询失败：${raw || code || name}`;
    }
    if (name.includes('EntityNotFound')) {
      return '数据不存在或已被删除；请刷新列表后重试';
    }
    if (raw) return raw;
    return '服务器内部错误：后端未提供异常原因，请查看日志中的 requestId';
  }

  private buildUserMessage(status: number, reason: string, location: string, requestId: string): string {
    const prefix = this.statusPrefix(status);
    return `${prefix}｜${reason}｜位置：${location}｜请求ID：${requestId}`;
  }

  private statusPrefix(status: number): string {
    if (status === 400) return '请求参数错误';
    if (status === 401) return '登录状态无效';
    if (status === 403) return '权限不足';
    if (status === 404) return '数据不存在';
    if (status === 409) return '业务冲突';
    if (status >= 500) return '后端执行异常';
    return `请求失败(${status})`;
  }
}
