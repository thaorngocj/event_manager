import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type RequestUser = {
  role: string;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<{
      user: RequestUser;
    }>();

    return roles.includes(request.user.role);
  }
}
