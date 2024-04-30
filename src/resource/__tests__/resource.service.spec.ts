import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../../prisma/prisma.service";

import { BadRequestException } from "@nestjs/common";
import createPrismaMock from "prisma-mock";
import { ResourceService } from "../resource.service";

describe("ResourceService", () => {
    let service: ResourceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourceService,
                {
                    provide: PrismaService,
                    useValue: {
                        ...createPrismaMock(),
                    },
                },
            ],
        }).compile();

        service = module.get<ResourceService>(ResourceService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should be able to create a resource", async () => {
        const resource = await service.create({
            name: "create:banners",
            description: "Banners para o site",
        });

        expect(resource).toEqual(
            expect.objectContaining({
                name: "create:banners",
                description: "Banners para o site",
            }),
        );
    });

    it("should throw an error if resource name format is invalid", async () => {
        await expect(
            service.create({
                name: "banners",
                description: "Banners para o site",
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it("should not be able to create a already existing resource", async () => {
        await service.create({
            name: "create:banners",
            description: "Banners para o site",
        });

        await expect(
            service.create({
                name: "create:banners",
                description: "Banners para o site",
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it("should be able to update a resource", async () => {
        const resource = await service.create({
            name: "create:banners",
            description: "Banners para o site",
        });

        const resourceUpdated = await service.update(resource.id, {
            name: "create:banners",
            description: "Banners para o outro site",
        });

        expect(resourceUpdated).toEqual(
            expect.objectContaining({
                name: "create:banners",
                description: "Banners para o outro site",
            }),
        );
    });
});
