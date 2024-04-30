import { PermissionType } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateUserPermissionDto {
    @IsEnum({
        PERMITTED: "PERMITTED",
        NOTPERMITTED: "NOTPERMITTED",
        DENY: "DENY",
    })
    permission!: PermissionType;
}
