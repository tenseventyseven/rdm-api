import { Hono } from "hono";
import prisma from "../prisma"; // Import shared PrismaClient

const app = new Hono();

// Create a new instrument
app.post("/", async (c) => {
  const { instrumentId, displayName } = await c.req.json();

  // If necessary fields are missing, return an error
  if (!instrumentId || !displayName) {
    return c.json(
      { error: "No instrumentId and/or displayName provided" },
      400
    );
  }

  try {
    const newInstrument = await prisma.instrument.create({
      data: {
        instrumentId,
        displayName,
      },
    });
    return c.json(newInstrument);
  } catch (error) {
    return c.json({ error: "Instrument creation failed" }, 400);
  }
});

// Read all instruments
app.get("/", async (c) => {
  try {
    const instruments = await prisma.instrument.findMany();
    return c.json(instruments);
  } catch (error) {
    return c.json({ error: "Error fetching instruments" }, 500);
  }
});

// Read an instrument by ID
app.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    const instrument = await prisma.instrument.findUnique({
      where: { id: id },
    });

    if (!instrument) {
      return c.json({ error: "Instrument not found" }, 404);
    }

    return c.json(instrument);
  } catch (error) {
    return c.json({ error: "Error fetching instrument" }, 500);
  }
});

// Update an instrument by ID
app.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { newInstrumentId, newDisplayName } = await c.req.json();

  // If no fields to update, return an error
  if (!newInstrumentId && !newDisplayName) {
    return c.json(
      {
        error:
          "At least one of newInstrumentId or newDisplayName must be provided",
      },
      400
    );
  }

  try {
    const updatedInstrument = await prisma.instrument.update({
      where: { id: id },
      data: {
        ...(newInstrumentId && { newInstrumentId }), // Update instrumentId if provided
        ...(newDisplayName && { newDisplayName }), // Update displayName if provided
      },
    });

    return c.json(updatedInstrument);
  } catch (error) {
    return c.json({ error: "Instrument update failed" }, 400);
  }
});

// Delete an instrument by ID
app.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  try {
    await prisma.instrument.delete({
      where: { id: id },
    });

    return c.json({ message: "Instrument deleted successfully" });
  } catch (error) {
    return c.json({ error: "Instrument deletion failed" }, 400);
  }
});

export default app;
