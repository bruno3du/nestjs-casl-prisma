import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthorizationGuard } from "../guard/authorization.guard";

export const Authorize = (): any => {
    return applyDecorators(UseGuards(AuthorizationGuard));
};
