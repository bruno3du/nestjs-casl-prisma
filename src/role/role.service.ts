import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { RolePermission, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ResourceService } from "../resource/resource.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { GrantPermissionDto } from "./dto/grant-permission.input.dto";
import { ReturnRoleDto } from "./dto/return-role.dto";

@Injectable()
export class RoleService {
    constructor(
        private readonly prismaRepository: PrismaService,
        private readonly resourceService: ResourceService,
    ) {}
    async addRole(createRoleDto: CreateRoleDto): Promise<ReturnRoleDto> {
        const roleExists = await this.prismaRepository.role.findFirst({
            where: {
                OR: [
                    {
                        name: createRoleDto.name,
                    },
                    {
                        profileId: createRoleDto.profileId,
                    },
                ],
            },
        });

        if (roleExists) {
            throw new BadRequestException("Role or Profile already exists");
        }

        return await this.prismaRepository.role.create({
            data: createRoleDto,
            select: {
                id: true,
                name: true,
                description: true,
                profileId: true,
            },
        });
    }

    async deleteRole(id: string): Promise<void> {
        await this.prismaRepository.role.delete({
            where: { id },
        });
    }

    async getRole(id: string): Promise<ReturnRoleDto> {
        const role = await this.prismaRepository.role.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                profileId: true,
            },
        });

        if (!role) {
            throw new NotFoundException("Role not found");
        }

        return role;
    }

    async grantPermission(
        roleId: string,
        { resourceId, permission }: GrantPermissionDto,
    ): Promise<RolePermission> {
        const roleExist = await this.getRole(roleId);

        if (!roleExist) {
            throw new BadRequestException("Função não encontrada");
        }

        const resource = await this.resourceService.findOne(resourceId);

        if (!resource) {
            throw new BadRequestException("Recurso não encontrado");
        }

        const permissionExists =
            await this.prismaRepository.rolePermission.findFirst({
                where: {
                    AND: [
                        {
                            resourceId,
                        },
                        {
                            roleId,
                        },
                    ],
                },
            });

        if (permissionExists) {
            throw new BadRequestException("Permissão já existe");
        }

        return await this.prismaRepository.rolePermission.create({
            data: {
                resourceId,
                roleId,
                permission,
            },
        });
    }

    async findRolePermissions(roleId: string) {
        const role = await this.prismaRepository.role.findUnique({
            where: {
                id: roleId,
            },
            include: {
                permissions: true,
            },
        });

        if (!role) {
            throw new NotFoundException("Role not found");
        }

        return role.permissions;
    }

    async revokePermission({ rolePermissionId }: { rolePermissionId: string }) {
        const rolePermissionExists =
            await this.prismaRepository.rolePermission.findUnique({
                where: {
                    id: rolePermissionId,
                },
            });

        if (!rolePermissionExists) {
            throw new NotFoundException("Permissão não encontrada");
        }

        return await this.prismaRepository.rolePermission.delete({
            where: {
                id: rolePermissionId,
            },
        });
    }

    async assignUser(userId: string, roleId: string): Promise<UserRole> {
        return await this.prismaRepository.userRole.create({
            data: {
                userId,
                roleId,
            },
        });
    }

    async deAssignUser(userId: string): Promise<void> {
        await this.prismaRepository.userRole.update({
            where: {
                userId,
            },
            data: {
                roleId: null,
            },
        });
    }

    async assignedUsers(roleId: string): Promise<UserRole[]> {
        const users = await this.prismaRepository.userRole.findMany({
            where: {
                roleId,
            },
        });

        if (!users.length) {
            throw new NotFoundException("Nenhum Usuário foi encontrado!");
        }

        return users;
    }

    async getAllRoles() {
        return await this.prismaRepository.role.findMany();
    }

    async getResourceNamesAndPermissionsFromRolePermissions(profileId: string) {
        const getRoleByProfileId = await this.prismaRepository.role.findUnique({
            where: {
                profileId,
            },
        });

        if (!getRoleByProfileId) {
            throw new NotFoundException("Role not found");
        }

        const getRolePermissions =
            await this.prismaRepository.rolePermission.findMany({
                select: {
                    resource: {
                        select: {
                            name: true,
                        },
                    },
                    permission: true,
                },
                where: {
                    roleId: getRoleByProfileId?.id,
                },
            });

        if (!getRolePermissions) {
            throw new NotFoundException("No permissions found");
        }

        const action = (text: string) => text.split(":")[0];
        const subject = (text: string) => text.split(":")[1];

        const permissions = getRolePermissions?.map(
            ({ permission, resource }) => ({
                subject: subject(resource.name),
                action: action(resource.name),
                permitted: permission,
            }),
        );

        const role = {
            permissions,
        };

        return role;
    }
}
