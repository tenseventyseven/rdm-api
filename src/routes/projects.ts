import { Hono } from "hono";
import prisma from "../prisma"; // Import shared PrismaClient

const app = new Hono();

// Create a new project
app.post("/", async (c) => {
  const { projectId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!projectId) {
    return c.json({ error: "No projectId provided" }, 400);
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        projectId,
      },
    });
    return c.json(newProject);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Project creation failed" }, 400);
  }
});

// Read all projects
app.get("", async (c) => {
  const projects = await prisma.project.findMany({
    include: { users: true, datasets: true, shared: true },
  });
  return c.json(projects);
});

// Read a project by ID
app.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: { users: true, datasets: true, shared: true },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    return c.json(project);
  } catch (error) {
    return c.json({ error: "Error fetching project" }, 500);
  }
});

// Get project users
app.get("/:id/users", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    const project = await prisma.project.findUnique({
      where: { id: id },
      include: { users: true },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Get unique userIds
    const projectUserIds = project.users.map((user) => user.userId);
    const uniqueUserIds = [...new Set([...projectUserIds])];

    return c.json({
      id: project.id,
      projectId: project.projectId,
      userIds: uniqueUserIds,
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Error fetching project users" }, 500);
  }
});

// Update a project by ID
app.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { newProjectId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!newProjectId) {
    return c.json({ error: "No newProjectId provided" }, 400);
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: { projectId: newProjectId },
      include: { users: true },
    });

    return c.json(updatedProject);
  } catch (error) {
    return c.json({ error: "Project update failed" }, 400);
  }
});

// Delete a project by ID
app.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    await prisma.project.delete({
      where: { id: id },
    });

    return c.json({ message: "Project deleted successfully" });
  } catch (error) {
    return c.json({ error: "Project deletion failed" }, 400);
  }
});

// Update users for a project by ID
app.put("/:id/users", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { userIds } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!userIds) {
    return c.json({ error: "No userIds[] provided" }, 400);
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: {
        users: {
          set: userIds.map((userId: string) => ({ userId: userId })),
        },
      },
      include: { users: true },
    });

    return c.json(updatedProject);
  } catch (error) {
    return c.json({ error: "Project update failed" }, 400);
  }
});

export default app;
