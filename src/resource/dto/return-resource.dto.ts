import { Resource } from "@prisma/client";

export class ResourceReturnDto
    implements Pick<Resource, "parentId" | "name" | "description" | "id">
{
    id: string;
    parentId: string | null;
    name: string;
    description: string;

    constructor(resource: Resource) {
        this.id = resource.id;
        this.parentId = resource.parentId;
        this.name = resource.name;
        this.description = resource.description;
    }
}
