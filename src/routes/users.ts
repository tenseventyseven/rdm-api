import { Hono } from "hono";
import prisma from "../prisma"; // Import shared PrismaClient

const app = new Hono();

// Create a new user
app.post("/", async (c) => {
  const { userId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!userId) {
    return c.json({ error: "No userId provided" }, 400);
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        userId,
      },
    });
    return c.json(newUser);
  } catch (error) {
    return c.json({ error: "User creation failed" }, 400);
  }
});

// Read all users
app.get("/", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

// Read a user by ID
app.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: { projects: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (error) {
    return c.json({ error: "Error fetching user" }, 500);
  }
});

// Update a user by ID
app.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const { newUserId } = body;

  // If necessary fields are missing, return an error
  if (!newUserId) {
    return c.json({ error: "No newUserId provided" }, 400);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { userId: newUserId },
    });

    return c.json(updatedUser);
  } catch (error) {
    return c.json({ error: "User update failed" }, 400);
  }
});

// Delete a user by ID
app.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    await prisma.user.delete({
      where: { id: id },
    });

    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    return c.json({ error: "User deletion failed" }, 400);
  }
});

export default app;
