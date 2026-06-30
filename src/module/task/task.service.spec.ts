import { jest } from "@jest/globals";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaService } from "../../lib/database/prisma.service.js";
import { TaskService } from "./task.service.js";

const mockTask = {
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

const mockUnassignedTask = {
  ...mockTask,
  assigneeId: null,
  assignee: null,
};

const mockProjectRef = {
  id: "proj-1",
  name: "Test Project",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "MEMBER" as const,
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  project: {
    findUnique: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient["project"]>,
  user: {
    findUnique: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient["user"]>,
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient["task"]>,
};

describe("TaskService", () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByProject", () => {
    it("returns all tasks for admin", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProjectRef);
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.findByProject("proj-1", "admin-id", "ADMIN");

      expect(result).toEqual([mockTask]);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId: "proj-1" },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("returns only assigned tasks for member", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProjectRef);
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.findByProject("proj-1", "user-1", "MEMBER");

      expect(result).toEqual([mockTask]);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId: "proj-1", assigneeId: "user-1" },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws NotFoundException when project does not exist", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.findByProject("nonexistent", "user-1", "MEMBER"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findById", () => {
    it("returns the task when found", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findById("task-1");

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: "task-1" },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws NotFoundException when not found", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByIdScoped", () => {
    it("allows admin to view any task", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findByIdScoped(
        "task-1",
        "admin-id",
        "ADMIN",
      );

      expect(result).toEqual(mockTask);
    });

    it("allows member to view their own task", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findByIdScoped("task-1", "user-1", "MEMBER");

      expect(result).toEqual(mockTask);
    });

    it("throws ForbiddenException when member views another user's task", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(
        service.findByIdScoped("task-1", "other-user", "MEMBER"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws NotFoundException when task does not exist", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.findByIdScoped("nonexistent", "user-1", "MEMBER"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    const dto = {
      title: "New Task",
      description: "Description",
      assigneeId: "user-1",
    };

    it("creates a task under the given project", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProjectRef);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create(dto, "proj-1");

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "New Task",
          description: "Description",
          status: undefined,
          priority: undefined,
          projectId: "proj-1",
          assigneeId: "user-1",
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws NotFoundException when project does not exist", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws NotFoundException when assignee does not exist", async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProjectRef);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, "proj-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    const dto = { title: "Updated Task" };

    it("updates the task when found", async () => {
      const updated = { ...mockTask, title: "Updated Task" };
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(updated);

      const result = await service.update("task-1", dto);

      expect(result).toEqual(updated);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: {
          title: "Updated Task",
          description: undefined,
          status: undefined,
          priority: undefined,
          projectId: undefined,
          assigneeId: undefined,
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws NotFoundException when task does not exist", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.update("nonexistent", dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("validates project exists when projectId is provided", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.update("task-1", { projectId: "nonexistent" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("validates assignee exists when assigneeId is provided", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.project.findUnique.mockResolvedValue(mockProjectRef);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update("task-1", { assigneeId: "nonexistent" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("assign", () => {
    it("assigns a user to an unassigned task", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockUnassignedTask);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.update.mockResolvedValue(mockTask);

      const result = await service.assign("task-1", "user-1");

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: { assigneeId: "user-1" },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws ConflictException when task already has an assignee", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.assign("task-1", "user-2")).rejects.toThrow(
        ConflictException,
      );
    });

    it("throws NotFoundException when task does not exist", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.assign("nonexistent", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws NotFoundException when user does not exist", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockUnassignedTask);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.assign("task-1", "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("canAccessTask", () => {
    it("allows admin to access any task", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.canAccessTask("task-1", "admin-id", "ADMIN");

      expect(result).toEqual(mockTask);
    });

    it("allows member to access their own task", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.canAccessTask("task-1", "user-1", "MEMBER");

      expect(result).toEqual(mockTask);
    });

    it("throws ForbiddenException when member accesses another user's task", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(
        service.canAccessTask("task-1", "other-user", "MEMBER"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws NotFoundException when task does not exist", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.canAccessTask("nonexistent", "user-1", "MEMBER"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("unassign", () => {
    it("removes the assignee from the task", async () => {
      const unassigned = { ...mockTask, assigneeId: null, assignee: null };
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(unassigned);

      const result = await service.unassign("task-1");

      expect(result).toEqual(unassigned);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: { assigneeId: null },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws NotFoundException when task does not exist", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.unassign("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("delete", () => {
    it("deletes the task when found", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await service.delete("task-1");

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1" },
      });
    });

    it("throws NotFoundException when task does not exist", async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.delete("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
