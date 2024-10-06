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

// Read a project
app.get("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");

  try {
    const project = await prisma.project.findUnique({
      where: { projectId: projectId },
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
app.get("/:projectId/users", async (c) => {
  const projectId = c.req.param("projectId");

  try {
    const project = await prisma.project.findUnique({
      where: { projectId: projectId },
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

// Get project datasets
app.get("/:projectId/datasets", async (c) => {
  const projectId = c.req.param("projectId");

  try {
    const project = await prisma.project.findUnique({
      where: { projectId: projectId },
      include: { datasets: true, shared: true },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Get unique datasetIds
    const projectDatasetIds = project.datasets.map(
      (dataset) => dataset.datasetId
    );
    const projectSharedIds = project.shared.map((dataset) => dataset.datasetId);
    const uniqueDatasetIds = [
      ...new Set([...projectDatasetIds, ...projectSharedIds]),
    ];

    return c.json({
      id: project.id,
      projectId: project.projectId,
      datasetIds: uniqueDatasetIds,
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Error fetching project datasets" }, 500);
  }
});

// Update a project
app.put("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const { newProjectId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!newProjectId) {
    return c.json({ error: "No newProjectId provided" }, 400);
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { projectId: projectId },
      data: { projectId: newProjectId },
      include: { users: true },
    });

    return c.json(updatedProject);
  } catch (error) {
    return c.json({ error: "Project update failed" }, 400);
  }
});

// Delete a project
app.delete("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");

  try {
    await prisma.project.delete({
      where: { projectId: projectId },
    });

    return c.json({ message: "Project deleted successfully" });
  } catch (error) {
    return c.json({ error: "Project deletion failed" }, 400);
  }
});

// Update users for a project
app.put("/:projectId/users", async (c) => {
  const projectId = c.req.param("projectId");
  const { userIds } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!userIds) {
    return c.json({ error: "No userIds[] provided" }, 400);
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { projectId: projectId },
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
