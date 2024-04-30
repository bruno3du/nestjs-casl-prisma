import { PermissionType } from "@prisma/client";
import { ActionType, ResourceType } from "./resources";

export interface IPermission {
    action: ActionType;
    subject: ResourceType;
    permitted: PermissionType;
}
