import { jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
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

const mockUser: Express.User = {
  id: "user-1",
  email: "test@example.com",
  role: "MEMBER",
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
    commentService = module.get(CommentService) as jest.Mocked<CommentService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns comments for the task", async () => {
      commentService.findByTask.mockResolvedValue([mockComment]);

      const result = await controller.findAll("task-1", mockUser);

      expect(result).toEqual([mockComment]);
      expect(commentService.findByTask).toHaveBeenCalledWith(
        "task-1",
        "user-1",
        "MEMBER",
      );
    });
  });

  describe("findById", () => {
    it("returns a single comment", async () => {
      commentService.findByIdScoped.mockResolvedValue(mockComment);

      const result = await controller.findById("task-1", "comment-1", mockUser);

      expect(result).toEqual(mockComment);
      expect(commentService.findByIdScoped).toHaveBeenCalledWith(
        "comment-1",
        "user-1",
        "MEMBER",
      );
    });
  });

  describe("create", () => {
    const dto = { content: "New comment" };

    it("returns the created comment", async () => {
      commentService.create.mockResolvedValue(mockComment);

      const result = await controller.create("task-1", dto, mockUser);

      expect(result).toEqual(mockComment);
      expect(commentService.create).toHaveBeenCalledWith(
        dto,
        "task-1",
        "user-1",
        "MEMBER",
      );
    });
  });

  describe("update", () => {
    const dto = { content: "Updated" };

    it("returns the updated comment", async () => {
      const updated = { ...mockComment, content: "Updated" };
      commentService.update.mockResolvedValue(updated);

      const result = await controller.update("comment-1", dto, mockUser);

      expect(result).toEqual(updated);
      expect(commentService.update).toHaveBeenCalledWith(
        "comment-1",
        dto,
        "user-1",
      );
    });
  });

  describe("delete", () => {
    it("deletes the comment", async () => {
      await controller.delete("comment-1", mockUser);

      expect(commentService.delete).toHaveBeenCalledWith(
        "comment-1",
        "user-1",
        "MEMBER",
      );
    });
  });
});
