import { Global, Module } from "@nestjs/common";
import { UserPermissionModule } from "../user-permission/user-permission.module";
import { AuthorizationAbilityFactory } from "./authorization-ability.factory";
import { AuthorizationGuard } from "./guard/authorization.guard";

@Global()
@Module({
    imports: [UserPermissionModule],
    providers: [AuthorizationAbilityFactory, AuthorizationGuard],
    exports: [AuthorizationAbilityFactory, AuthorizationGuard],
})
export class AuthorizationModule {}
