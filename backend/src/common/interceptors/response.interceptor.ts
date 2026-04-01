import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface StandardResponse<T> {
  sukses: boolean;
  data: T;
  pesan?: string;
  meta?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        if (duration > 500) {
          this.logger.warn(`[${req.method}] ${req.url} took ${duration}ms`);
        }
      }),
      map((data) => {
        // Jika sudah dalam format standard, langsung return
        if (data && typeof data === 'object' && 'sukses' in data) {
          return data;
        }

        return {
          sukses: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
