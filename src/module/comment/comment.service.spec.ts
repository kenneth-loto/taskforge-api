import { jest } from "@jest/globals";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaService } from "../../lib/database/prisma.service.js";
import { TaskService } from "../task/task.service.js";
import { CommentService } from "./comment.service.js";

const mockComment = {
  id: "comment-1",
  content: "Test comment",
  taskId: "task-1",
  authorId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockPrisma = {
  comment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient["comment"]>,
};

const mockAccessibleTask = {
  id: "task-1",
  title: "Test Task",
  description: "A test task",
  status: "TODO" as const,
  priority: "LOW" as const,
  projectId: "proj-1",
  assigneeId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  project: { id: "proj-1", name: "Test Project" },
  assignee: { id: "user-1", name: "Test User", email: "test@example.com" },
};

describe("CommentService", () => {
  let service: CommentService;
  let taskService: jest.Mocked<TaskService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: TaskService,
          useValue: {
            canAccessTask: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    taskService = module.get(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByTask", () => {
    it("returns all comments for a task the user can access", async () => {
      taskService.canAccessTask.mockResolvedValue(mockAccessibleTask);
      mockPrisma.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.findByTask("task-1", "user-1", "MEMBER");

      expect(result).toEqual([mockComment]);
      expect(taskService.canAccessTask).toHaveBeenCalledWith(
        "task-1",
        "user-1",
        "MEMBER",
      );
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: { taskId: "task-1" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    });
  });

  describe("findById", () => {
    it("returns the comment when found", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

      const result = await service.findById("comment-1");

      expect(result).toEqual(mockComment);
      expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: "comment-1" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws NotFoundException when not found", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByIdScoped", () => {
    it("returns the comment when user can access the task", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
      taskService.canAccessTask.mockResolvedValue(mockAccessibleTask);

      const result = await service.findByIdScoped(
        "comment-1",
        "user-1",
        "MEMBER",
      );

      expect(result).toEqual(mockComment);
      expect(taskService.canAccessTask).toHaveBeenCalledWith(
        "task-1",
        "user-1",
        "MEMBER",
      );
    });

    it("throws NotFoundException when comment not found", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.findByIdScoped("nonexistent", "user-1", "MEMBER"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    const dto = { content: "New comment" };

    it("creates a comment", async () => {
      taskService.canAccessTask.mockResolvedValue(mockAccessibleTask);
      mockPrisma.comment.create.mockResolvedValue(mockComment);

      const result = await service.create(dto, "task-1", "user-1", "MEMBER");

      expect(result).toEqual(mockComment);
      expect(taskService.canAccessTask).toHaveBeenCalledWith(
        "task-1",
        "user-1",
        "MEMBER",
      );
      expect(mockPrisma.comment.create).toHaveBeenCalledWith({
        data: { content: "New comment", taskId: "task-1", authorId: "user-1" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });
    });
  });

  describe("update", () => {
    const dto = { content: "Updated comment" };

    it("updates the comment when user is the author", async () => {
      const updated = { ...mockComment, content: "Updated comment" };
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
      mockPrisma.comment.update.mockResolvedValue(updated);

      const result = await service.update("comment-1", dto, "user-1");

      expect(result).toEqual(updated);
      expect(mockPrisma.comment.update).toHaveBeenCalledWith({
        where: { id: "comment-1" },
        data: { content: "Updated comment" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws ForbiddenException when user is not the author", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.update("comment-1", dto, "other-user"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws NotFoundException when comment does not exist", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", dto, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("deletes the comment when user is the author", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

      await service.delete("comment-1", "user-1");

      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
        where: { id: "comment-1" },
      });
    });

    it("allows admin to delete any comment", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

      await service.delete("comment-1", "admin-id", "ADMIN");

      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
        where: { id: "comment-1" },
      });
    });

    it("throws ForbiddenException when user is not the author nor admin", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.delete("comment-1", "other-user", "MEMBER"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws NotFoundException when comment does not exist", async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.delete("nonexistent", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
