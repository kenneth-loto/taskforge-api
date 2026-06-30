import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ResponseMessage } from "../../common/decorators/response-message.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { CreateTaskDto } from "./dto/create-task.dto.js";
import { UpdateTaskDto } from "./dto/update-task.dto.js";
import { TaskService } from "./task.service.js";

@ApiTags("Tasks")
@ApiBearerAuth()
@Controller("projects/:projectId/tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: "List tasks for a project" })
  findAll(@Param("projectId") projectId: string, @Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.taskService.findByProject(projectId, user.id, user.role);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get task by ID" })
  findById(@Param("id") id: string, @Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.taskService.findByIdScoped(id, user.id, user.role);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Create a task (admin only)" })
  @ResponseMessage("Task created successfully")
  create(@Param("projectId") projectId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.create(dto, projectId);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update a task (admin only)" })
  @ResponseMessage("Task updated successfully")
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto);
  }

  @Post(":id/assign/:userId")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Assign a task to a user (admin only)" })
  @ResponseMessage("Task assigned successfully")
  assign(@Param("id") id: string, @Param("userId") userId: string) {
    return this.taskService.assign(id, userId);
  }

  @Delete(":id/assign")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Unassign a task (admin only)" })
  @ResponseMessage("Task unassigned successfully")
  unassign(@Param("id") id: string) {
    return this.taskService.unassign(id);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Delete a task (admin only)" })
  @ResponseMessage("Task deleted successfully")
  delete(@Param("id") id: string) {
    return this.taskService.delete(id);
  }
}
