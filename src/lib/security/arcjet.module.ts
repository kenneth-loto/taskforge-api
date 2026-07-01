import type { ArcjetNest } from "@arcjet/nest";
import {
  ARCJET,
  ArcjetModule,
  cloudflare,
  detectBot,
  shield,
  slidingWindow,
} from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { ArcjetOptionalGuard } from "../../common/guards/arcjet-optional.guard.js";

@Module({
  imports: [
    ArcjetModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        key: configService.getOrThrow("ARCJET_KEY"),
        proxies: [cloudflare()],
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
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (aj: ArcjetNest, reflector: Reflector) =>
        new ArcjetOptionalGuard(aj, reflector),
      inject: [ARCJET, Reflector],
    },
  ],
})
export class ArcjetSecurityModule {}
