import { $Enums } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class GrantPermissionDto {
    @IsString()
    resourceId!: string;

    @IsEnum({
        PERMITTED: "PERMITTED",
        NOTPERMITTED: "NOTPERMITTED",
        DENIED: "DENIED",
    })
    permission!: $Enums.PermissionType;
}
