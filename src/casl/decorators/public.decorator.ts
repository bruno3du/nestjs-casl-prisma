import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const isPublic = (): CustomDecorator<string> =>
    SetMetadata(IS_PUBLIC_KEY, true);
