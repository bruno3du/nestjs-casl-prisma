import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { GrantUserPermissionDto } from "./dto/grant-user-permission.dto";
import { UserPermissionService } from "./user-permission.service";
import { UpdateUserPermissionDto } from "./dto/update-user-permission.dto";

@Controller("user-permission")
export class UserPermissionController {
    constructor(
        private readonly userPermissionService: UserPermissionService,
    ) {}

    @UsePipes(ValidationPipe)
    @Post(":userId")
    grantPermissionToUser(
        @Param("userId") userId: string,
        @Body() grantPermissionToUser: GrantUserPermissionDto,
    ) {
        return this.userPermissionService.grantPermissionToUser(
            userId,
            grantPermissionToUser,
        );
    }

    @Get(":userId")
    findUserPermissions(@Param("userId") userId: string) {
        return this.userPermissionService.findAllUserPermissions(userId);
    }

    @UsePipes(ValidationPipe)
    @Put(":userPermissionId")
    updateUserPermission(
        @Param("userPermissionId") userPermissionId: string,
        @Body() updateUserPermissionDto: UpdateUserPermissionDto,
    ) {
        return this.userPermissionService.updateUserPermission(
            userPermissionId,
            updateUserPermissionDto,
        );
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.userPermissionService.deleteUserPermission(id);
    }
}
