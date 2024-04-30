import { AppAbility } from "./authorization-ability.factory";
import { IPermissionHandler } from "./interfaces/permission-handler.interface";
import { ActionType, ResourceType } from "./interfaces/resources";

export class Permission implements IPermissionHandler {
    constructor(
        readonly action: ActionType,
        readonly subject: ResourceType,
    ) {}

    handle(ability: AppAbility) {
        return ability.can(this.action, this.subject);
    }
}
