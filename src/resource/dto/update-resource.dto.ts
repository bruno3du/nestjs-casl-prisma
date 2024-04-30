import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { CreateResourceDto } from "./create-resource.dto";

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isGroup?: boolean;

    @IsOptional()
    @IsString()
    parentId?: string;
}
