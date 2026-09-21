import { z } from "zod";

export const userListQuerySchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  plan: z.enum(["FREE", "PREMIUM"]).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["createdAt", "usedBytes", "taskCount", "email"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  plan: z.enum(["FREE", "PREMIUM"]).optional(),
});

export const userRoleUpdateSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;