import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import users from "./routes/users";
import projects from "./routes/projects";
import datasets from "./routes/datasets";
import instruments from "./routes/instruments";
import { Hono } from "hono";

const app = new Hono();

app.use(logger());

app.route("/api/users", users);
app.route("/api/projects", projects);
app.route("/api/datasets", datasets);
app.route("/api/instruments", instruments);

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
