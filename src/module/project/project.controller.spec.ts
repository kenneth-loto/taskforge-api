import { jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { ProjectController } from "./project.controller.js";
import { ProjectService } from "./project.service.js";

const mockProject = {
  id: "proj-1",
  name: "Test Project",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockUser: Express.User = {
  id: "user-1",
  email: "test@example.com",
  role: "MEMBER",
};

describe("ProjectController", () => {
  let controller: ProjectController;
  let service: jest.Mocked<ProjectService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get(ProjectService) as jest.Mocked<ProjectService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("calls service.findAll", async () => {
      service.findAll.mockResolvedValue([mockProject]);
      const result = await controller.findAll();
      expect(result).toEqual([mockProject]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("calls service.findById with the id", async () => {
      service.findById.mockResolvedValue(mockProject);
      const result = await controller.findById("proj-1");
      expect(result).toEqual(mockProject);
      expect(service.findById).toHaveBeenCalledWith("proj-1");
    });
  });

  describe("create", () => {
    it("calls service.create with dto and req.user.id", async () => {
      const dto = { name: "New Project" };

      service.create.mockResolvedValue({ ...mockProject, name: "New Project" });
      const result = await controller.create(dto, mockUser);

      expect(result).toEqual({ ...mockProject, name: "New Project" });
      expect(service.create).toHaveBeenCalledWith(dto, "user-1");
    });
  });

  describe("update", () => {
    it("calls service.update with id and dto", async () => {
      const dto = { name: "Updated" };
      service.update.mockResolvedValue({ ...mockProject, name: "Updated" });
      const result = await controller.update("proj-1", dto);
      expect(result).toEqual({ ...mockProject, name: "Updated" });
      expect(service.update).toHaveBeenCalledWith("proj-1", dto);
    });
  });

  describe("delete", () => {
    it("calls service.delete with the id", async () => {
      service.delete.mockResolvedValue(undefined);
      const result = await controller.delete("proj-1");
      expect(result).toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith("proj-1");
    });
  });
});
