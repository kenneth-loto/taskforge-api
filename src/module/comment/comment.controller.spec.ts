import { jest } from "@jest/globals";
import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { Request } from "express";
import { CommentController } from "./comment.controller.js";
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

describe("CommentController", () => {
  let controller: CommentController;
  let commentService: jest.Mocked<CommentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            findByTask: jest.fn(),
            findByIdScoped: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get(CommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns comments for the task", async () => {
      const req = {
        user: { id: "user-1", email: "test@example.com", role: "MEMBER" },
      } as unknown as Request;
      commentService.findByTask.mockResolvedValue([mockComment]);

      const result = await controller.findAll("task-1", req);

      expect(result).toEqual([mockComment]);
      expect(commentService.findByTask).toHaveBeenCalledWith(
        "task-1",
        "user-1",
        "MEMBER",
      );
    });

    it("throws UnauthorizedException when no user on request", () => {
      const req = { user: undefined } as unknown as Request;

      expect(() => controller.findAll("task-1", req)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("findById", () => {
    it("returns a single comment", async () => {
      const req = {
        user: { id: "user-1", email: "test@example.com", role: "MEMBER" },
      } as unknown as Request;
      commentService.findByIdScoped.mockResolvedValue(mockComment);

      const result = await controller.findById("task-1", "comment-1", req);

      expect(result).toEqual(mockComment);
      expect(commentService.findByIdScoped).toHaveBeenCalledWith(
        "comment-1",
        "user-1",
        "MEMBER",
      );
    });

    it("throws UnauthorizedException when no user on request", () => {
      const req = { user: undefined } as unknown as Request;

      expect(() => controller.findById("task-1", "comment-1", req)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("create", () => {
    const dto = { content: "New comment" };

    it("returns the created comment", async () => {
      const req = {
        user: { id: "user-1", email: "test@example.com", role: "MEMBER" },
      } as unknown as Request;
      commentService.create.mockResolvedValue(mockComment);

      const result = await controller.create("task-1", dto, req);

      expect(result).toEqual(mockComment);
      expect(commentService.create).toHaveBeenCalledWith(
        dto,
        "task-1",
        "user-1",
        "MEMBER",
      );
    });

    it("throws UnauthorizedException when no user on request", () => {
      const req = { user: undefined } as unknown as Request;

      expect(() => controller.create("task-1", dto, req)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("update", () => {
    const dto = { content: "Updated" };

    it("returns the updated comment", async () => {
      const updated = { ...mockComment, content: "Updated" };
      const req = {
        user: { id: "user-1", email: "test@example.com", role: "MEMBER" },
      } as unknown as Request;
      commentService.update.mockResolvedValue(updated);

      const result = await controller.update("comment-1", dto, req);

      expect(result).toEqual(updated);
      expect(commentService.update).toHaveBeenCalledWith(
        "comment-1",
        dto,
        "user-1",
      );
    });

    it("throws UnauthorizedException when no user on request", () => {
      const req = { user: undefined } as unknown as Request;

      expect(() => controller.update("comment-1", dto, req)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("delete", () => {
    it("deletes the comment", async () => {
      const req = {
        user: { id: "user-1", email: "test@example.com", role: "MEMBER" },
      } as unknown as Request;
      await controller.delete("comment-1", req);

      expect(commentService.delete).toHaveBeenCalledWith(
        "comment-1",
        "user-1",
        "MEMBER",
      );
    });

    it("throws UnauthorizedException when no user on request", () => {
      const req = { user: undefined } as unknown as Request;

      expect(() => controller.delete("comment-1", req)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
