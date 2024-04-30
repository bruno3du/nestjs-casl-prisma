import { CreateAbility, MongoAbility, createMongoAbility } from "@casl/ability";
import { ResourceTupleType } from "./resources";

export type AppAbility = MongoAbility<ResourceTupleType>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export interface IPermissionHandler {
    handle(ability: AppAbility): boolean;
}

export type PermissionHandlerCallback = (ability: AppAbility) => boolean;

export type PermissionHandler = IPermissionHandler | PermissionHandlerCallback;
