import { Test, TestingModule } from "@nestjs/testing";
import { UserPermissionController } from "../user-permission.controller";
import { UserPermissionService } from "../user-permission.service";

describe("UserPermissionController", () => {
    let controller: UserPermissionController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserPermissionController],
            providers: [UserPermissionService],
        }).compile();

        controller = module.get<UserPermissionController>(
            UserPermissionController,
        );
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
