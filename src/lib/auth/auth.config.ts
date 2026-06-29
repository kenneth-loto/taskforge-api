import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import type { PrismaClient } from "../../generated/prisma/client.js";

export function createAuth(prisma: PrismaClient) {
  return betterAuth({
    appName: "Taskforge",
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "MEMBER",
          input: false,
        },
      },
    },
  });
}
