import { Global, Module } from "@nestjs/common";
import { ResourceController } from "./resource.controller";
import { ResourceService } from "./resource.service";

@Global()
@Module({
    controllers: [ResourceController],
    providers: [ResourceService],
    exports: [ResourceService],
})
export class ResourceModule {}
