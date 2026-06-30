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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ResponseMessage } from "../../common/decorators/response-message.decorator.js";
import { CommentService } from "./comment.service.js";
import { CreateCommentDto } from "./dto/create-comment.dto.js";
import { UpdateCommentDto } from "./dto/update-comment.dto.js";

@ApiTags("Comments")
@ApiBearerAuth()
@Controller("projects/:projectId/tasks/:taskId/comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: "List comments for a task" })
  findAll(@Param("taskId") taskId: string, @Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.commentService.findByTask(taskId, user.id, user.role);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get comment by ID" })
  findById(
    @Param("taskId") _taskId: string,
    @Param("id") id: string,
    @Req() req: Request,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.commentService.findByIdScoped(id, user.id, user.role);
  }

  @Post()
  @ApiOperation({ summary: "Create a comment" })
  @ResponseMessage("Comment created successfully")
  create(
    @Param("taskId") taskId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.commentService.create(dto, taskId, user.id, user.role);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update own comment" })
  @ResponseMessage("Comment updated successfully")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.commentService.update(id, dto, user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a comment (author or admin)" })
  @ResponseMessage("Comment deleted successfully")
  delete(@Param("id") id: string, @Req() req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.commentService.delete(id, user.id, user.role);
  }
}
