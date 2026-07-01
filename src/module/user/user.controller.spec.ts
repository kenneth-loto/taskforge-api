import { jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller.js";
import { UserService } from "./user.service.js";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "MEMBER",
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UserController", () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
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

    controller = module.get<UserController>(UserController);
    service = module.get(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("calls service.findAll", async () => {
      service.findAll.mockResolvedValue([mockUser]);
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("calls service.findById with the id", async () => {
      service.findById.mockResolvedValue(mockUser);
      const result = await controller.findById("user-1");
      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith("user-1");
    });
  });

  describe("create", () => {
    it("calls service.create with the dto", async () => {
      const dto = {
        email: "new@example.com",
        name: "New User",
        role: "MEMBER" as const,
      };
      service.create.mockResolvedValue({
        ...mockUser,
        email: "new@example.com",
        name: "New User",
      });

      const result = await controller.create(dto);

      expect(result).toEqual({
        ...mockUser,
        email: "new@example.com",
        name: "New User",
      });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("update", () => {
    it("calls service.update with id and dto", async () => {
      const dto = { name: "Updated" };
      service.update.mockResolvedValue({ ...mockUser, name: "Updated" });

      const result = await controller.update("user-1", dto);

      expect(result).toEqual({ ...mockUser, name: "Updated" });
      expect(service.update).toHaveBeenCalledWith("user-1", dto);
    });
  });

  describe("delete", () => {
    it("calls service.delete with the id", async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete("user-1");

      expect(result).toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith("user-1");
    });
  });
});
