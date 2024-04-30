import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { RoleService } from "src/role/role.service";
import { UserPermissionService } from "src/user-permission/user-permission.service";
import {
    AppAbility,
    AuthorizationAbilityFactory,
} from "../authorization-ability.factory";
import { CHECK_PERMISSIONS_KEY } from "../decorators";
import { USER_KEY } from "../decorators/fake-user.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PermissionHandler } from "../interfaces/permission-handler.interface";
import { IPermission } from "../interfaces/permission.interface";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authorizationAbilityFactory: AuthorizationAbilityFactory,
        private userPermissions: UserPermissionService,
        private rolePermissions: RoleService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // if public then return true
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true;
        }
        // decorator that get permissions to check
        const policyHandlers =
            this.reflector.get<PermissionHandler[]>(
                CHECK_PERMISSIONS_KEY,
                context.getHandler(),
            ) || [];

        const getUser = this.reflector.getAllAndOverride<{
            userId: string;
            profileId: string;
        }>(USER_KEY, [context.getHandler(), context.getClass()]);

        if (!getUser) {
            return false;
        }

        const user =
            await this.userPermissions.getResourceNamesAndPermissionsFromUserPermissions(
                getUser?.userId,
            );

        const role = await this.rolePermissions
            .getResourceNamesAndPermissionsFromRolePermissions(
                getUser?.profileId,
            )
            .catch(() => null);

        const ability = await this.authorizationAbilityFactory.createForUser({
            userPermissions: user?.permissions?.map((permission) => ({
                action: permission.action,
                permitted: permission.permitted,
                subject: permission.subject,
            })) as IPermission[],
            rolePermissions: role?.permissions.map((permission) => ({
                action: permission.action,
                permitted: permission.permitted,
                subject: permission.subject,
            })) as IPermission[],
        });

        const permitted = policyHandlers.some((handler) =>
            this.execPermissionHandler(handler, ability),
        );

        return permitted;
    }

    private execPermissionHandler(
        handler: PermissionHandler,
        ability: AppAbility,
    ) {
        if (typeof handler === "function") {
            return handler(ability);
        }

        return handler.handle(ability);
    }
}
