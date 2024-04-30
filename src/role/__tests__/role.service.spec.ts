import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import createPrismaMock from "prisma-mock";
import { PrismaService } from "../../prisma/prisma.service";
import { ResourceService } from "../../resource/resource.service";
import { UserPermissionService } from "../../user-permission/user-permission.service";
import { RoleService } from "../role.service";

describe("RoleService", () => {
    let service: RoleService;
    let resourceService: ResourceService;
    let prismaRepository: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleService,
                ResourceService,
                UserPermissionService,
                {
                    provide: PrismaService,
                    useValue: {
                        ...createPrismaMock(),
                    },
                },
            ],
        }).compile();

        service = module.get<RoleService>(RoleService);
        resourceService = module.get<ResourceService>(ResourceService);
        prismaRepository = module.get<PrismaService>(PrismaService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(resourceService).toBeDefined();
        expect(prismaRepository).toBeDefined();
    });

    it("should be able to create a role", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        expect(role).toEqual(
            expect.objectContaining({
                description: "Administrador do sistema",
                name: "Admin",
            }),
        );

        expect(role.id).toBeDefined();

        expect(await prismaRepository.role.findMany()).toEqual([
            expect.objectContaining({
                description: "Administrador do sistema",
                name: "Admin",
                profileId: "1",
            }),
        ]);
    });

    it("should not be able to create a already existing role", async () => {
        await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        await service.addRole({
            description: "Administrador do sistema",
            name: "Vendas",
            profileId: "2",
        });

        await expect(
            service.addRole({
                description: "Administrador do sistema",
                name: "Admin",
                profileId: "1",
            }),
        ).rejects.toThrow(BadRequestException);

        expect(await prismaRepository.role.findMany()).toHaveLength(2);
    });

    it("should be able to grant a permission to a role", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        const resource = await resourceService.create({
            name: "create:banners",
            description: "Banners para o site",
        });

        const permission = await service.grantPermission(role.id, {
            resourceId: resource.id,
            permission: "PERMITTED",
        });

        expect(permission).toEqual(
            expect.objectContaining({
                resourceId: resource.id,
                permission: "PERMITTED",
                roleId: role.id,
            }),
        );

        const checkRolePermission = await prismaRepository.role.findFirst({
            where: {
                id: role.id,
                permissions: {
                    some: {
                        id: permission.id,
                    },
                },
            },
            include: { permissions: true },
        });

        expect(checkRolePermission?.permissions).toContainEqual(permission);
        expect(checkRolePermission?.permissions).toHaveLength(1);
    });

    it("should be able to revoke a permission of a role", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        const resource = await prismaRepository.resource.create({
            data: {
                name: "Banners",
                description: "Banners para o site",
            },
        });

        const rolePermission = await service.grantPermission(role.id, {
            resourceId: resource.id,
            permission: "PERMITTED",
        });

        const roleWithPermission = await prismaRepository.role.findUnique({
            where: { id: role.id },
            include: { permissions: true },
        });

        expect(roleWithPermission).toEqual(
            expect.objectContaining({
                permissions: expect.arrayContaining([rolePermission]),
            }),
        );

        expect(roleWithPermission?.permissions).toHaveLength(1);

        await service.revokePermission({
            rolePermissionId: rolePermission.id,
        });

        const roleWithoutPermission = await prismaRepository.role.findUnique({
            where: { id: role.id },
            include: { permissions: true },
        });

        expect(roleWithoutPermission).toEqual(
            expect.objectContaining({
                permissions: [],
            }),
        );

        expect(roleWithoutPermission?.permissions).toHaveLength(0);
    });

    it("should be able to find role permissions", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        await prismaRepository.resource.createMany({
            data: [
                {
                    name: "Banners",
                    description: "Banners para o site",
                },
                {
                    name: "ver_banners",
                    description: "Visualização de banners",
                },
                {
                    name: "criar_banners",
                    description: "Criação de banners",
                },
            ],
        });

        const resourceList = await prismaRepository.resource.findMany();

        await service.grantPermission(role.id, {
            resourceId: resourceList[0].id,
            permission: "PERMITTED",
        });

        await service.grantPermission(role.id, {
            resourceId: resourceList[1].id,
            permission: "PERMITTED",
        });

        await service.grantPermission(role.id, {
            resourceId: resourceList[2].id,
            permission: "PERMITTED",
        });

        const permissions = await service.findRolePermissions(role.id);

        expect(permissions).toHaveLength(3);

        expect(permissions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    resourceId: resourceList[0].id,
                    permission: "PERMITTED",
                    roleId: role.id,
                }),
                expect.objectContaining({
                    resourceId: resourceList[1].id,
                    permission: "PERMITTED",
                    roleId: role.id,
                }),
                expect.objectContaining({
                    resourceId: resourceList[2].id,
                    permission: "PERMITTED",
                    roleId: role.id,
                }),
            ]),
        );
    });

    it("should be able to delete a role", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        await service.deleteRole(role.id);

        const deletedRole = await prismaRepository.role.findUnique({
            where: { id: role.id },
        });

        expect(deletedRole).toBeNull();
    });

    it("should not create a role with a already used profileId", async () => {
        await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        await expect(
            service.addRole({
                description: "Administrador do sistema",
                name: "Admin",
                profileId: "1",
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it("should not be able to create a role permission if already exists a permission with the same role and resource", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        const resource = await prismaRepository.resource.create({
            data: {
                name: "Banners",
                description: "Banners para o site",
            },
        });

        await service.grantPermission(role.id, {
            resourceId: resource.id,
            permission: "PERMITTED",
        });

        await expect(
            service.grantPermission(role.id, {
                resourceId: resource.id,
                permission: "DENY",
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it("should be able to assign a role to a user", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        await service.assignUser("1", role.id);

        const user = await prismaRepository.userRole.findUnique({
            where: {
                userId: "1",
            },
        });

        expect(user?.roleId).toEqual(role.id);
    });
    it("should be able to remove a role from a user", async () => {
        const role = await service.addRole({
            description: "Administrador do sistema",
            name: "Admin",
            profileId: "1",
        });

        await service.assignUser("1", role.id);

        const userRole = await prismaRepository.userRole.findUnique({
            where: {
                userId: "1",
            },
        });
        expect(userRole).toEqual(
            expect.objectContaining({
                userId: "1",
                roleId: role.id,
            }),
        );

        await service.deAssignUser("1");

        const user = await prismaRepository.userRole.findUnique({
            where: {
                userId: "1",
            },
        });

        expect(user?.roleId).toBeNull();
    });
});
