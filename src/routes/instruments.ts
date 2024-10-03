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

// Read an instrument
app.get("/:instrumentId", async (c) => {
  const instrumentId = c.req.param("instrumentId");

  try {
    const instrument = await prisma.instrument.findUnique({
      where: { instrumentId: instrumentId },
    });

    if (!instrument) {
      return c.json({ error: "Instrument not found" }, 404);
    }

    return c.json(instrument);
  } catch (error) {
    return c.json({ error: "Error fetching instrument" }, 500);
  }
});

// Update an instrument
app.put("/:instrumentId", async (c) => {
  const instrumentId = c.req.param("instrumentId");
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
      where: { instrumentId: instrumentId },
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

// Delete an instrument
app.delete("/:instrumentId", async (c) => {
  const instrumentId = c.req.param("instrumentId");

  try {
    await prisma.instrument.delete({
      where: { instrumentId: instrumentId },
    });

    return c.json({ message: "Instrument deleted successfully" });
  } catch (error) {
    return c.json({ error: "Instrument deletion failed" }, 400);
  }
});

export default app;
