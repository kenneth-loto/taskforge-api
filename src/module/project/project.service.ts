import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../lib/database/prisma.service.js";
import { CreateProjectDto } from "./dto/create-project.dto.js";
import { UpdateProjectDto } from "./dto/update-project.dto.js";

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    return project;
  }

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findById(id);

    return this.prisma.project.update({
      where: { id },
      data: { name: dto.name },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.project.delete({ where: { id } });
  }
}
