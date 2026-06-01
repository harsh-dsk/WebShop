import type { Role, User } from "@prisma/client";

export type SessionUser = User;

export type UserPublicMetadata = {
  role?: Role;
  dbUserId?: string;
};
