import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Resource } from "@prisma/client";
import { Action } from "../casl/interfaces/resources";
import { PrismaService } from "../prisma/prisma.service";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";

@Injectable()
export class ResourceService {
    constructor(private readonly prismaRepository: PrismaService) {}

    async create(createResourceDto: CreateResourceDto) {
        const verifyNameFormat = /\b(\w+):(\w+)\b/.test(createResourceDto.name);
        const action = createResourceDto.name.split(":")[0];
        const isAnActionVerbValid = Action.safeParse(action);

        if (!verifyNameFormat || !isAnActionVerbValid.success) {
            throw new BadRequestException(
                "Resource name is invalid, check actions verbs or format (action:resource)",
            );
        }

        if (createResourceDto.parentId) {
            const parent = await this.findOne(createResourceDto.parentId);

            if (!parent) {
                throw new NotFoundException("Parent resource not found");
            }
        }

        const resource = await this.findResourceByName(createResourceDto.name);

        if (resource) {
            throw new BadRequestException("Resource already exists");
        }

        return await this.prismaRepository.resource.create({
            data: createResourceDto,
        });
    }

    async findResourceByName(name: string) {
        return await this.prismaRepository.resource.findUnique({
            where: {
                name,
            },
        });
    }

    async findAll() {
        return await this.prismaRepository.resource.findMany();
    }

    async findOne(id: string): Promise<Resource> {
        const resource = await this.prismaRepository.resource.findFirst({
            where: {
                id,
            },
        });

        if (!resource) {
            throw new BadRequestException("Resource not found");
        }

        return resource;
    }

    async update(id: string, updateResourceDto: UpdateResourceDto) {
        await this.findOne(id);

        return await this.prismaRepository.resource.update({
            where: {
                id,
            },
            data: updateResourceDto,
        });
    }

    async remove(id: string) {
        return await this.prismaRepository.resource.delete({
            where: {
                id,
            },
        });
    }

    async findResourceTopLevel() {
        const resources = await this.prismaRepository.resource.findMany();

        const mappedTreeResources = createDataTree(resources);

        return mappedTreeResources;
    }
}

const createDataTree = <T extends { id: string; parentId?: string | null }>(
    data: T[],
): T[] => {
    const resourceMap: { [id: string]: T & { children: T[] } } = data.reduce(
        (acc, resource) => {
            acc[resource.id] = { ...resource, children: [] };
            return acc;
        },
        {},
    );

    data.forEach((resource) => {
        const parent = resourceMap[resource.parentId || ""] || null;
        if (parent) {
            parent.children.push(resourceMap[resource.id]);
        }
    });

    return Object.values(resourceMap).filter((resource) => !resource.parentId);
};
