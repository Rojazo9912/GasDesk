import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { userContextStorage } from './user-context';

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      return new Observable((subscriber) => {
        userContextStorage.run({ userId: user.sub || user.id, tenantId: user.tenantId }, () => {
          next.handle().subscribe(subscriber);
        });
      });
    }

    return next.handle();
  }
}
