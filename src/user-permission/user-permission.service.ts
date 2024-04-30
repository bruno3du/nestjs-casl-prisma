import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { UserPermission } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { GrantUserPermissionDto } from "./dto/grant-user-permission.dto";
import { UpdateUserPermissionDto } from "./dto/update-user-permission.dto";

@Injectable()
export class UserPermissionService {
    constructor(private readonly prismaRepository: PrismaService) {}

    async grantPermissionToUser(
        userId: string,
        grantUserPermissionDto: GrantUserPermissionDto,
    ): Promise<UserPermission> {
        const resource = await this.prismaRepository.resource.findUnique({
            where: {
                id: grantUserPermissionDto.resourceId,
            },
        });

        if (!resource) {
            throw new NotFoundException("Resource not found");
        }

        const userPermission =
            await this.prismaRepository.userPermission.findFirst({
                where: {
                    AND: [
                        {
                            resourceId: resource.id,
                        },
                        {
                            userId,
                        },
                    ],
                },
            });

        if (userPermission) {
            throw new BadRequestException("User Permission already exists");
        }

        return await this.prismaRepository.userPermission.create({
            data: { userId, ...grantUserPermissionDto },
        });
    }

    async findAllUserPermissions(userId: string) {
        const userPermission =
            await this.prismaRepository.userPermission.findMany({
                where: {
                    userId,
                },
                include: {
                    resource: true,
                },
            });

        if (!userPermission) {
            throw new NotFoundException("User Permission not found");
        }

        return userPermission;
    }

    async findUserPermissionByUserId(userId: string) {
        const userPermission =
            await this.prismaRepository.userPermission.findFirst({
                where: {
                    userId,
                },
            });

        if (!userPermission) {
            throw new NotFoundException("Não foi possível encontrar o Usuário");
        }

        return userPermission;
    }

    async updateUserPermission(
        userPermissionId: string,
        updateUserPermissionDto: UpdateUserPermissionDto,
    ) {
        const userPermission =
            await this.prismaRepository.userPermission.findUnique({
                where: {
                    id: userPermissionId,
                },
            });

        if (!userPermission) {
            throw new NotFoundException("Permission not found");
        }

        if (updateUserPermissionDto.permission === "NOTPERMITTED") {
            await this.deleteUserPermission(userPermissionId);
            return { message: "Permission deleted", status: "ok" };
        }

        return await this.prismaRepository.userPermission.update({
            where: { id: userPermissionId },
            data: {
                permission: updateUserPermissionDto.permission,
            },
        });
    }

    async deleteUserPermission(userPermissionId: string) {
        const userPermission =
            await this.prismaRepository.userPermission.findUnique({
                where: {
                    id: userPermissionId,
                },
            });

        if (!userPermission) {
            throw new NotFoundException("Permission not found");
        }

        return this.prismaRepository.userPermission.delete({
            where: { id: userPermissionId },
        });
    }

    async getResourceNamesAndPermissionsFromUserPermissions(userId: string) {
        const getPermissions = await this.prismaRepository.userPermission
            .findMany({
                select: {
                    resource: {
                        select: {
                            name: true,
                        },
                    },
                    permission: true,
                },
                where: {
                    userId,
                },
            })
            .catch(() => undefined);

        const action = (text: string) => text.split(":")[0];
        const subject = (text: string) => text.split(":")[1];

        const permissions = getPermissions?.map(({ permission, resource }) => ({
            subject: subject(resource.name),
            action: action(resource.name),
            permitted: permission,
        }));

        const user = {
            permissions,
        };

        return user;
    }
}
