import { PermissionType, UserPermission } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class GrantUserPermissionDto implements Partial<UserPermission> {
    @IsEnum({
        PERMITTED: "PERMITTED",
        NOTPERMITTED: "NOTPERMITTED",
        DENY: "DENY",
    })
    permission!: PermissionType;

    @IsString()
    resourceId!: string;
}
