import { Hono } from "hono";
import prisma from "../prisma"; // Import shared PrismaClient

const app = new Hono();

// Create a new dataset
app.post("/", async (c) => {
  const { datasetId, projectId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!datasetId || !projectId) {
    return c.json({ error: "No datasetId and/or projectId provided" }, 400);
  }

  try {
    // First lookup project
    const project = await prisma.project.findUnique({
      where: { projectId: projectId },
      include: { users: true },
    });

    if (!project) {
      throw Error(`Project ${projectId} not found`);
    }

    // Now create dataset linked to project
    const newDataset = await prisma.dataset.create({
      data: {
        datasetId: datasetId,
        projectId: project.id,
      },
    });
    return c.json(newDataset);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Dataset creation failed" }, 400);
  }
});

// Read all datasets
app.get("", async (c) => {
  const datasets = await prisma.dataset.findMany({
    include: {
      project: true,
      shared: true,
    },
  });
  return c.json(datasets);
});

// Read a dataset by ID
app.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id: id },
      include: {
        project: true,
        shared: true,
      },
    });

    if (!dataset) {
      return c.json({ error: "Dataset not found" }, 404);
    }

    return c.json(dataset);
  } catch (error) {
    return c.json({ error: "Error fetching dataset" }, 500);
  }
});

// Get dataset users
app.get("/:id/users", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    // Fetch the dataset with related project and shared projects, including users
    const dataset = await prisma.dataset.findUnique({
      where: { id: id },
      include: {
        project: { include: { users: true } },
        shared: { include: { users: true } },
      },
    });

    if (!dataset) {
      return c.json({ error: "Dataset not found" }, 404);
    }

    // Get unique userIds
    const projectUserIds = dataset.project.users.map((user) => user.userId);
    const sharedProjectUserIds = dataset.shared.flatMap((project) =>
      project.users.map((user) => user.userId)
    );
    const uniqueUserIds = [
      ...new Set([...projectUserIds, ...sharedProjectUserIds]),
    ];

    // Return the desired structure
    return c.json({
      id: dataset.id,
      datasetId: dataset.datasetId,
      userIds: uniqueUserIds,
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Error fetching dataset users" }, 500);
  }
});

// Update a dataset by ID
app.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { newDatasetId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!newDatasetId) {
    return c.json({ error: "No newDatasetId provided" }, 400);
  }

  try {
    const updatedDataset = await prisma.dataset.update({
      where: { id: id },
      data: { datasetId: newDatasetId },
      include: { project: { include: { users: true } } },
    });

    return c.json(updatedDataset);
  } catch (error) {
    return c.json({ error: "Dataset update failed" }, 400);
  }
});

// Delete a dataset by ID
app.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    await prisma.dataset.delete({
      where: { id: id },
    });

    return c.json({ message: "Dataset deleted successfully" });
  } catch (error) {
    return c.json({ error: "Dataset deletion failed" }, 400);
  }
});

// Share a dataset with another project
app.post("/:id/share", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { projectId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!projectId) {
    return c.json({ error: "No projectId provided" }, 400);
  }

  try {
    // Find the dataset
    const dataset = await prisma.dataset.findUnique({
      where: { id: id },
    });

    if (!dataset) {
      return c.json({ error: "Dataset not found" }, 404);
    }

    // Find the project to share with
    const projectToShare = await prisma.project.findUnique({
      where: { projectId: projectId },
    });

    if (!projectToShare) {
      return c.json({ error: `Project ${projectId} not found` }, 404);
    }

    // Update the dataset's shared field to include the new project
    const updatedDataset = await prisma.dataset.update({
      where: { id: id },
      data: {
        shared: {
          connect: { id: projectToShare.id },
        },
      },
      include: { shared: true },
    });

    return c.json(updatedDataset);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Error sharing dataset" }, 500);
  }
});

// Remove sharing of a dataset with a project
app.post("/:id/unshare", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { projectId } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!projectId) {
    return c.json({ error: "No projectId provided" }, 400);
  }

  try {
    // Find the dataset by ID
    const dataset = await prisma.dataset.findUnique({
      where: { id: id },
    });

    if (!dataset) {
      return c.json({ error: "Dataset not found" }, 404);
    }

    // Find the project by ID to unshare
    const projectToUnshare = await prisma.project.findUnique({
      where: { projectId: projectId },
    });

    if (!projectToUnshare) {
      return c.json({ error: `Project ${projectId} not found` }, 404);
    }

    // Update the dataset's shared field to disconnect the project
    const updatedDataset = await prisma.dataset.update({
      where: { id: id },
      data: {
        shared: {
          disconnect: { id: projectToUnshare.id }, // Remove the project from the shared list
        },
      },
      include: { shared: true },
    });

    return c.json(updatedDataset);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Error unsharing dataset" }, 500);
  }
});

export default app;
