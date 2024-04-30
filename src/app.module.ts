import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthorizationModule } from "./casl/authorization.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ResourceModule } from "./resource/resource.module";
import { RoleModule } from "./role/role.module";
import { UserPermissionModule } from "./user-permission/user-permission.module";

@Module({
    imports: [
        PrismaModule,
        AuthorizationModule,
        ResourceModule,
        UserPermissionModule,
        RoleModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
