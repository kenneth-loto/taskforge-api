import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { Public } from "./common/decorators/public.decorator.js";
import { SkipArcjet } from "./common/guards/arcjet-optional.guard.js";

@Controller()
export class AppController {
  @Get()
  @Public()
  @AllowAnonymous()
  @SkipArcjet()
  getRoot() {
    return {
      message: "Welcome to the Taskforge API",
      docs: "Visit /docs for interactive documentation and endpoint details",
    };
  }
}
