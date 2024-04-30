import { Test, TestingModule } from "@nestjs/testing";
import { Resource, UserPermission } from "@prisma/client";
import createPrismaMock from "prisma-mock";
import { PrismaService } from "../../prisma/prisma.service";
import { UserPermissionService } from "../user-permission.service";

const createUser =
    ({ prismaRepository }: { prismaRepository: PrismaService }) =>
    async ({
        userId,
    }: {
        userId: string;
    }): Promise<{
        userPermission: UserPermission;
        resource: Resource;
    }> => {
        const resource = await prismaRepository.resource.create({
            data: {
                name: "edit:banners",
                description: "Editar Banners para o site",
            },
        });

        const userPermission = await prismaRepository.userPermission.create({
            data: {
                userId,
                resourceId: resource.id,
                permission: "PERMITTED",
            },
        });

        return { userPermission, resource };
    };

describe("UserPermissionService", () => {
    let service: UserPermissionService;
    let prismaRepository: PrismaService;
    let userInstance: ({ userId }: { userId: string }) => Promise<{
        userPermission: UserPermission;
        resource: Resource;
    }>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserPermissionService,
                {
                    provide: PrismaService,
                    useValue: {
                        ...createPrismaMock(),
                    },
                },
            ],
        }).compile();

        prismaRepository = module.get<PrismaService>(PrismaService);
        service = module.get<UserPermissionService>(UserPermissionService);
        userInstance = createUser({ prismaRepository });
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to create a user permission", async () => {
        const userId = "100";
        const user = await userInstance({ userId });
        const checkUserPermission =
            await prismaRepository.userPermission.findFirst({
                where: {
                    userId,
                },
            });

        expect(checkUserPermission).toEqual(
            expect.objectContaining({
                id: user.userPermission.id,
                userId,
                resourceId: user.resource.id,
                permission: "PERMITTED",
            }),
        );
    });

    it("should be able to update a user permission", async () => {
        const userId = "100";

        const user = await userInstance({ userId });

        const updatedUserPermission = await service.updateUserPermission(
            user.userPermission.id,
            {
                permission: "DENY",
            },
        );

        expect(updatedUserPermission).toEqual(
            expect.objectContaining({
                permission: "DENY",
                resourceId: user.resource.id,
                userId,
            }),
        );
    });

    it("should be able to get all resources names of user permissions", async () => {
        const userId = "100";

        const user = await userInstance({ userId });

        const resourceNames =
            await service.getResourceNamesAndPermissionsFromUserPermissions(
                userId,
            );

        expect(resourceNames.permissions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    action: user.resource.name.split(":")[0],
                    subject: user.resource.name.split(":")[1],
                    permitted: "PERMITTED",
                }),
            ]),
        );
    });

    it("permission should be deleted if resource is deleted", async () => {
        const userId = "100";

        const user = await userInstance({ userId });

        const userPermission = await prismaRepository.userPermission.findFirst({
            where: {
                userId,
            },
        });

        expect(userPermission).toEqual(
            expect.objectContaining({
                userId,
                resourceId: user.resource.id,
                permission: "PERMITTED",
            }),
        );

        await prismaRepository.resource.delete({
            where: {
                id: user.resource.id,
            },
        });

        const checkUserPermission =
            await prismaRepository.userPermission.findFirst({
                where: {
                    userId,
                },
            });

        expect(checkUserPermission).toBeNull();
    });
});
