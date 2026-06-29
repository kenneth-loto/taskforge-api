import {
  ArcjetGuard,
  ArcjetModule,
  detectBot,
  shield,
  slidingWindow,
} from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [
    ArcjetModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        key: configService.getOrThrow("ARCJET_KEY"),
        rules: [
          detectBot({
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
          }),
          shield({ mode: "LIVE" }),
          slidingWindow({
            mode: "LIVE",
            interval: "2s",
            max: 5,
          }),
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ArcjetGuard }],
})
export class ArcjetSecurityModule {}
