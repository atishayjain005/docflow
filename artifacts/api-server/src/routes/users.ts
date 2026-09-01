import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { ListUsersResponse } from "@workspace/api-zod";
import { seedDemoData } from "../lib/seed";

const router: IRouter = Router();

router.get("/users", async (_req, res): Promise<void> => {
  await seedDemoData();
  const users = await db.select().from(usersTable).orderBy(usersTable.name);
  res.json(ListUsersResponse.parse(users));
});

export default router;