import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../enums/auth.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.some((role: Role) => user.role?.includes(role));
  }
}

@Injectable()
export class IsOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.method === 'GET' || request.method === 'DELETE') {
      return true;
    }

    const user = request.user;
    const body = request.body;

    if (body && !Object.keys(body).includes('userId')) {
      throw new BadRequestException(
        "The given resource doesn't have key: 'userId'",
      );
    }

    if (body.userId !== user.userId) {
      throw new ForbiddenException('Forbidden Resource');
    }

    return true;
  }
}
