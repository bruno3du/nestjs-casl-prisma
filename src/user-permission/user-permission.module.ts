import { Global, Module } from "@nestjs/common";
import { UserPermissionController } from "./user-permission.controller";
import { UserPermissionService } from "./user-permission.service";

@Global()
@Module({
    controllers: [UserPermissionController],
    providers: [UserPermissionService],
    exports: [UserPermissionService],
})
export class UserPermissionModule {}
