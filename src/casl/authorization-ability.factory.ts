import {
    AbilityBuilder,
    CreateAbility,
    MongoAbility,
    createMongoAbility,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { IPermission } from "./interfaces/permission.interface";
import { ResourceTupleType } from "./interfaces/resources";

export type AppAbility = MongoAbility<ResourceTupleType>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

@Injectable()
export class AuthorizationAbilityFactory {
    async createForUser({
        userPermissions,
        rolePermissions,
    }: {
        userPermissions: IPermission[];
        rolePermissions: IPermission[];
    }) {
        const builder = new AbilityBuilder(
            createMongoAbility as CreateAbility<AppAbility>,
        );

        rolePermissions?.forEach((permission) => {
            if (permission.permitted === "PERMITTED") {
                builder.can(permission.action, permission.subject);
            }
        });

        userPermissions?.forEach((permission) => {
            if (permission.permitted === "PERMITTED") {
                builder.can(permission.action, permission.subject);
            }

            if (permission.permitted === "DENY") {
                builder.cannot(permission.action, permission.subject);
            }
        });

        const ability = builder.build();

        return ability;
    }
}
