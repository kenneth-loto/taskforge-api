import { Module } from "@nestjs/common";
import { TaskModule } from "../task/task.module.js";
import { CommentController } from "./comment.controller.js";
import { CommentService } from "./comment.service.js";

@Module({
  imports: [TaskModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
