import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { createAuth } from "./lib/auth/auth.config.js";
import { envValidationSchema } from "./lib/config/env.config.js";
import { PrismaModule } from "./lib/database/prisma.module.js";
import { PrismaService } from "./lib/database/prisma.service.js";
import { ArcjetSecurityModule } from "./lib/security/arcjet.module.js";
import { CommentModule } from "./module/comment/comment.module.js";
import { ProjectModule } from "./module/project/project.module.js";
import { TaskModule } from "./module/task/task.module.js";
import { UserModule } from "./module/user/user.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    AuthModule.forRootAsync({
      useFactory: (prismaService: PrismaService) => ({
        auth: createAuth(prismaService),
      }),
      inject: [PrismaService],
    }),
    PrismaModule,
    UserModule,
    ProjectModule,
    TaskModule,
    CommentModule,
    ArcjetSecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
