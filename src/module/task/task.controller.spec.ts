import { jest } from "@jest/globals";
import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { Request } from "express";
import { TaskController } from "./task.controller.js";
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

describe("TaskController", () => {
  let controller: TaskController;
  let taskService: jest.Mocked<TaskService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            findByProject: jest.fn(),
            findById: jest.fn(),
            findByIdScoped: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            assign: jest.fn(),
            unassign: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns tasks for the user", async () => {
      const req = {
        user: { id: "user-1", email: "test@example.com", role: "MEMBER" },
      } as unknown as Request;
      taskService.findByProject.mockResolvedValue([mockTask]);

      const result = await controller.findAll("proj-1", req);

      expect(result).toEqual([mockTask]);
      expect(taskService.findByProject).toHaveBeenCalledWith(
        "proj-1",
        "user-1",
        "MEMBER",
      );
    });

    it("throws UnauthorizedException when no user on request", () => {
      const req = { user: undefined } as unknown as Request;

      expect(() => controller.findAll("proj-1", req)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("findById", () => {
    it("returns a single task for authorized user", async () => {
      const req = {
        user: { id: "user-1", email: "test@example.com", role: "MEMBER" },
      } as unknown as Request;
      taskService.findByIdScoped.mockResolvedValue(mockTask);

      const result = await controller.findById("task-1", req);

      expect(result).toEqual(mockTask);
      expect(taskService.findByIdScoped).toHaveBeenCalledWith(
        "task-1",
        "user-1",
        "MEMBER",
      );
    });

    it("throws UnauthorizedException when no user on request", () => {
      const req = { user: undefined } as unknown as Request;

      expect(() => controller.findById("task-1", req)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("create", () => {
    const dto = {
      title: "New Task",
      description: "Description",
    };

    it("returns the created task", async () => {
      taskService.create.mockResolvedValue(mockTask);

      const result = await controller.create("proj-1", dto);

      expect(result).toEqual(mockTask);
      expect(taskService.create).toHaveBeenCalledWith(dto, "proj-1");
    });
  });

  describe("update", () => {
    const dto = { title: "Updated" };

    it("returns the updated task", async () => {
      const updated = { ...mockTask, title: "Updated" };
      taskService.update.mockResolvedValue(updated);

      const result = await controller.update("task-1", dto);

      expect(result).toEqual(updated);
      expect(taskService.update).toHaveBeenCalledWith("task-1", dto);
    });
  });

  describe("assign", () => {
    it("assigns user to task", async () => {
      taskService.assign.mockResolvedValue(mockTask);

      const result = await controller.assign("task-1", "user-1");

      expect(result).toEqual(mockTask);
      expect(taskService.assign).toHaveBeenCalledWith("task-1", "user-1");
    });
  });

  describe("unassign", () => {
    it("unassigns the task", async () => {
      const unassigned = { ...mockTask, assigneeId: null, assignee: null };
      taskService.unassign.mockResolvedValue(unassigned);

      const result = await controller.unassign("task-1");

      expect(result).toEqual(unassigned);
      expect(taskService.unassign).toHaveBeenCalledWith("task-1");
    });
  });

  describe("delete", () => {
    it("deletes the task", async () => {
      await controller.delete("task-1");

      expect(taskService.delete).toHaveBeenCalledWith("task-1");
    });
  });
});
