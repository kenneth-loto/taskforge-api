import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { UserService } from "./user.service.js";

@Controller("user")
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("all")
  @Roles("ADMIN")
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }
}
