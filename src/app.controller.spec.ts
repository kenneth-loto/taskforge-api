import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller.js";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("returns welcome message with docs link", () => {
      expect(appController.getRoot()).toEqual({
        message: "Welcome to the Taskforge API",
        docs: "Visit /docs for interactive documentation and endpoint details",
      });
    });
  });
});
