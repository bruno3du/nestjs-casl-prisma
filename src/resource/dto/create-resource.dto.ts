import { Resource } from "@prisma/client";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateResourceDto implements Partial<Resource> {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsOptional()
    @IsBoolean()
    isGroup?: boolean;

    @IsOptional()
    @IsString()
    parentId?: string;
}
