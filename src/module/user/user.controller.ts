import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { UserService } from "./user.service.js";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("all")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "List all users (admin only)" })
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Get user by ID (admin only)" })
  findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }
}
