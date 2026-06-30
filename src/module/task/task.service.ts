import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../lib/database/prisma.service.js";
import { CreateTaskDto } from "./dto/create-task.dto.js";
import { UpdateTaskDto } from "./dto/update-task.dto.js";

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  private include = {
    project: { select: { id: true, name: true } },
    assignee: { select: { id: true, name: true, email: true } },
  } as const;

  async findByProject(projectId: string, userId?: string, role?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    const where: Record<string, unknown> = { projectId };
    if (role !== "ADMIN") {
      where.assigneeId = userId;
    }

    return this.prisma.task.findMany({
      where,
      include: this.include,
    });
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: this.include,
    });

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }

    return task;
  }

  async findByIdScoped(id: string, userId?: string, role?: string) {
    const task = await this.findById(id);

    if (role !== "ADMIN" && task.assigneeId !== userId) {
      throw new ForbiddenException("You do not have access to this task");
    }

    return task;
  }

  async create(dto: CreateTaskDto, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    if (dto.assigneeId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assigneeId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with id "${dto.assigneeId}" not found`,
        );
      }
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        projectId,
        assigneeId: dto.assigneeId,
      },
      include: this.include,
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findById(id);

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!project) {
        throw new NotFoundException(
          `Project with id "${dto.projectId}" not found`,
        );
      }
    }

    if (dto.assigneeId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assigneeId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with id "${dto.assigneeId}" not found`,
        );
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
      },
      include: this.include,
    });
  }

  async assign(id: string, userId: string) {
    const task = await this.findById(id);

    if (task.assigneeId) {
      throw new ConflictException(
        `Task is already assigned to user "${task.assigneeId}"`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    return this.prisma.task.update({
      where: { id },
      data: { assigneeId: userId },
      include: this.include,
    });
  }

  async unassign(id: string) {
    await this.findById(id);

    return this.prisma.task.update({
      where: { id },
      data: { assigneeId: null },
      include: this.include,
    });
  }

  async canAccessTask(taskId: string, userId?: string, role?: string) {
    const task = await this.findById(taskId);
    if (role !== "ADMIN" && task.assigneeId !== userId) {
      throw new ForbiddenException("You do not have access to this task");
    }
    return task;
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.task.delete({ where: { id } });
  }
}
