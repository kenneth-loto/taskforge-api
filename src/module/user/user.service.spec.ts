import { jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaService } from "../../lib/database/prisma.service.js";
import { UserService } from "./user.service.js";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "MEMBER" as const,
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient["user"]>,
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all users", async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("returns the user when found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById("user-1");

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
    });

    it("throws NotFoundException when not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("creates a user with the given dto", async () => {
      const dto = { email: "new@example.com", name: "New User" };
      const created = {
        ...mockUser,
        email: "new@example.com",
        name: "New User",
      };
      mockPrisma.user.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: "new@example.com", name: "New User", role: "MEMBER" },
      });
    });

    it("creates a user with specified role", async () => {
      const dto = {
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN" as const,
      };
      const created = {
        ...mockUser,
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
      };
      mockPrisma.user.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: "admin@example.com", name: "Admin", role: "ADMIN" },
      });
    });
  });

  describe("update", () => {
    it("updates the user when found", async () => {
      const dto = { name: "Updated Name" };
      const updated = { ...mockUser, name: "Updated Name" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.update("user-1", dto);

      expect(result).toEqual(updated);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { email: undefined, name: "Updated Name", role: undefined },
      });
    });

    it("throws NotFoundException when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", { name: "Nope" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("deletes the user when found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await service.delete("user-1");

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
    });

    it("throws NotFoundException when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.delete("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
