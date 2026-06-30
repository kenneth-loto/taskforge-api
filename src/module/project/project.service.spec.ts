import { jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaService } from "../../lib/database/prisma.service.js";
import { ProjectService } from "./project.service.js";

const mockProject = {
  id: "proj-1",
  name: "Test Project",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockPrisma = {
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient["project"]>,
};

describe("ProjectService", () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all projects with user info", async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);

      const result = await service.findAll();

      expect(result).toEqual([mockProject]);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });
  });

  describe("findById", () => {
    it("returns the project when found", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findById("proj-1");

      expect(result).toEqual(mockProject);
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: "proj-1" },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });

    it("throws NotFoundException when not found", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("creates a project with the given dto and userId", async () => {
      const dto = { name: "New Project" };
      const created = { ...mockProject, name: "New Project" };
      mockPrisma.project.create.mockResolvedValue(created);

      const result = await service.create(dto, "user-1");

      expect(result).toEqual(created);
      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: { name: "New Project", userId: "user-1" },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });
  });

  describe("update", () => {
    it("updates the project when found", async () => {
      const dto = { name: "Updated Project" };
      const updated = { ...mockProject, name: "Updated Project" };
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.project.update.mockResolvedValue(updated);

      const result = await service.update("proj-1", dto);

      expect(result).toEqual(updated);
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: "proj-1" },
        data: { name: "Updated Project" },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });

    it("throws NotFoundException when project does not exist", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", { name: "Nope" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("deletes the project when found", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.project.delete.mockResolvedValue(mockProject);

      await service.delete("proj-1");

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: "proj-1" },
      });
    });

    it("throws NotFoundException when project does not exist", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.delete("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
