import { Controller, Get } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
  @Get()
  @AllowAnonymous()
  getRoot() {
    return {
      message: "Welcome to the Taskforge API",
      docs: "Visit /docs for interactive documentation and endpoint details",
    };
  }
}
