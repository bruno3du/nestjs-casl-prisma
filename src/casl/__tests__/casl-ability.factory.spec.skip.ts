import { Test, TestingModule } from "@nestjs/testing";
import createPrismaMock from "prisma-mock";
import { PrismaService } from "../../prisma/prisma.service";
import { UserPermissionService } from "../../user-permission/user-permission.service";

describe("CaslAbilityFactory", () => {
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
    });
});
