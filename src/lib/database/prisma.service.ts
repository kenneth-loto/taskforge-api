import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const pool = new PrismaPg({
      connectionString: configService.getOrThrow("DATABASE_URL"),
    });
    super({ adapter: pool });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Connected to Database");
    } catch (error) {
      this.logger.error("Failed to connect to Database", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from Database");
  }
}
