import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { FakeUser } from "src/casl/decorators/fake-user.decorator";
import { Permission } from "src/casl/permission.check";
import { Authorize, CheckPermissions } from "../casl/decorators";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { ResourceReturnDto } from "./dto/return-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";
import { ResourceService } from "./resource.service";

@Authorize()
@Controller("resource")
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {}

    @FakeUser({
        userId: "1001",
        profileId: "008",
    })
    @CheckPermissions(new Permission("create", "recursos"))
    @UsePipes(ValidationPipe)
    @Post()
    async create(@Body() createResourceDto: CreateResourceDto) {
        const resource = await this.resourceService.create(createResourceDto);

        return new ResourceReturnDto(resource);
    }

    @FakeUser({
        profileId: "008",
        userId: "1001",
    })
    @CheckPermissions(new Permission("read", "recursos"))
    @Get("/all")
    async findAll() {
        const resources = await this.resourceService.findAll();

        return resources.map((resource) => new ResourceReturnDto(resource));
    }

    @FakeUser({
        userId: "1001",
        profileId: "008",
    })
    @CheckPermissions(new Permission("read", "recursos"))
    @Get("/top-level")
    async getResourcesTopLevel() {
        const resources = await this.resourceService.findResourceTopLevel();
        return resources;
    }

    @FakeUser({
        userId: "1001",
        profileId: "008",
    })
    @CheckPermissions(new Permission("update", "recursos"))
    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updateResourceDto: UpdateResourceDto,
    ) {
        const resource = await this.resourceService.update(
            id,
            updateResourceDto,
        );

        return new ResourceReturnDto(resource);
    }

    @FakeUser({
        userId: "1001",
        profileId: "008",
    })
    @CheckPermissions(new Permission("delete", "recursos"))
    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.resourceService.remove(id);
    }
}
