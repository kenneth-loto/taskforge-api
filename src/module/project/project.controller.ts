import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ResponseMessage } from "../../common/decorators/response-message.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { CreateProjectDto } from "./dto/create-project.dto.js";
import { UpdateProjectDto } from "./dto/update-project.dto.js";
import { ProjectService } from "./project.service.js";

@ApiTags("Projects")
@ApiBearerAuth()
@Controller("projects")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: "List all projects" })
  findAll() {
    return this.projectService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  findById(@Param("id") id: string) {
    return this.projectService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Create a project (admin only)" })
  @ResponseMessage("Project created successfully")
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: Express.User) {
    return this.projectService.create(dto, user.id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update a project (admin only)" })
  @ResponseMessage("Project updated successfully")
  update(@Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Delete a project (admin only)" })
  @ResponseMessage("Project deleted successfully")
  delete(@Param("id") id: string) {
    return this.projectService.delete(id);
  }
}
