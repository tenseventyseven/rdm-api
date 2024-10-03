import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import users from "./routes/users";
import projects from "./routes/projects";
import datasets from "./routes/datasets";
import instruments from "./routes/instruments";
import { Hono } from "hono";

const app = new Hono();

app.use(logger());

app.route("/users", users);
app.route("/projects", projects);
app.route("/datasets", datasets);
app.route("/instruments", instruments);

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
