import { Role } from "@prisma/client";

export class ReturnRoleDto {
    id: string;
    name: string;
    description: string;
    profileId: string;

    constructor(role: Role) {
        this.id = role.id;
        this.name = role.name;
        this.description = role.description;
        this.profileId = role.profileId;
    }
}
