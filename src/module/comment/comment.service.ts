import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../lib/database/prisma.service.js";
import { TaskService } from "../task/task.service.js";
import { CreateCommentDto } from "./dto/create-comment.dto.js";
import { UpdateCommentDto } from "./dto/update-comment.dto.js";

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taskService: TaskService,
  ) {}

  private include = {
    author: { select: { id: true, name: true, email: true } },
  } as const;

  async findByTask(taskId: string, userId?: string, role?: string) {
    await this.taskService.canAccessTask(taskId, userId, role);

    return this.prisma.comment.findMany({
      where: { taskId },
      include: this.include,
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: this.include,
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    return comment;
  }

  async findByIdScoped(id: string, userId?: string, role?: string) {
    const comment = await this.findById(id);
    await this.taskService.canAccessTask(comment.taskId, userId, role);
    return comment;
  }

  async create(
    dto: CreateCommentDto,
    taskId: string,
    authorId: string,
    role?: string,
  ) {
    await this.taskService.canAccessTask(taskId, authorId, role);
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        taskId,
        authorId,
      },
      include: this.include,
    });
  }

  async update(id: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.findById(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException("You can only edit your own comments");
    }

    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
      include: this.include,
    });
  }

  async delete(id: string, userId: string, role?: string) {
    const comment = await this.findById(id);

    if (comment.authorId !== userId && role !== "ADMIN") {
      throw new ForbiddenException("You can only delete your own comments");
    }

    await this.prisma.comment.delete({ where: { id } });
  }
}
