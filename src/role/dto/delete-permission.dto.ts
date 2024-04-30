import { IsString } from "class-validator";

export class DeleteRolePermissionDto {
    @IsString()
    permissionId!: string;
}
