import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator.js";
import { SkipArcjet } from "./common/guards/arcjet-optional.guard.js";

@Controller()
export class AppController {
  @Get()
  @Public()
  @SkipArcjet()
  getRoot() {
    return {
      message: "Welcome to the Taskforge API",
      docs: "Visit /docs for interactive documentation and endpoint details",
    };
  }
}
