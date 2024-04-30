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
import { CreateRoleDto } from "./dto/create-role.dto";
import { GrantPermissionDto } from "./dto/grant-permission.input.dto";
import { RoleService } from "./role.service";

@Controller("role")
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @UsePipes(ValidationPipe)
    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.addRole(createRoleDto);
    }

    @Get()
    findAll() {
        return this.roleService.getAllRoles();
    }

    @Get(":roleId/permissions")
    findRolePermissions(@Param("roleId") roleId: string) {
        return this.roleService.findRolePermissions(roleId);
    }

    @UsePipes(ValidationPipe)
    @Post(":roleId/permission")
    grantPermissions(
        @Param("roleId") roleId: string,
        @Body()
        grantPermissionDto: GrantPermissionDto,
    ) {
        return this.roleService.grantPermission(roleId, {
            permission: grantPermissionDto.permission,
            resourceId: grantPermissionDto.resourceId,
        });
    }

    @Delete(":rolePermissionId/permission")
    deletePermission(@Param("rolePermissionId") rolePermissionId: string) {
        return this.roleService.revokePermission({
            rolePermissionId,
        });
    }

    @Delete(":roleId")
    deleteRole(@Param("roleId") roleId: string) {
        return this.roleService.deleteRole(roleId);
    }

    @Get(":roleId/user")
    assignedUsers(@Param("roleId") roleId: string) {
        return this.roleService.assignedUsers(roleId);
    }

    @Put(":roleId/user")
    assignUser(
        @Param("roleId") roleId: string,
        @Body() { userId }: { userId: string },
    ) {
        return this.roleService.assignUser(userId, roleId);
    }

    @Delete("/user")
    deAssignUser(@Body() { userId }: { userId: string }) {
        return this.roleService.deAssignUser(userId);
    }
}
