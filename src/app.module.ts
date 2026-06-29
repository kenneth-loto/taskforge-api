import { ArcjetGuard, ArcjetModule, fixedWindow, shield } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { createAuth } from "./lib/auth/auth.config.js";
import { envValidationSchema } from "./lib/config/env.config.js";
import { PrismaModule } from "./lib/database/prisma.module.js";
import { PrismaService } from "./lib/database/prisma.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule.forRootAsync({
      useFactory: (prismaService: PrismaService) => ({
        auth: createAuth(prismaService),
        bodyParser: {
          json: { enabled: true },
          urlencoded: { enabled: true, extended: true },
        },
      }),
      inject: [PrismaService],
    }),
    ArcjetModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        key: configService.getOrThrow("ARCJET_KEY"),
        rules: [
          shield({ mode: "LIVE" }),
          fixedWindow({
            mode: "LIVE",
            window: "60s",
            max: 10,
          }),
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule {}
