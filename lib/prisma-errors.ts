import { Prisma } from "@prisma/client";

export function isPrismaInitializationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  return error instanceof Error && error.name === "PrismaClientInitializationError";
}

