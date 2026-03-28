import express from "express";
import cors from "cors";
import { gitRouter } from "./routes/git.js";
import { loadConfig, saveConfig, type ServerConfig } from "./config.js";

const app = express();
const PORT = process.env.PORT || 9876;

app.use(
  cors({
    origin: (_origin, callback) => {
      callback(null, true);
    },
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  const config = loadConfig();
  res.json({
    status: "ok",
    repoPaths: config.repoPaths,
  });
});

app.get("/config", (_req, res) => {
  res.json(loadConfig());
});

app.post("/config", (req, res) => {
  const { repoPaths } = req.body as Partial<ServerConfig>;
  if (repoPaths && Array.isArray(repoPaths)) {
    const config = loadConfig();
    config.repoPaths = repoPaths;
    saveConfig(config);
    res.json({ success: true, config });
  } else {
    res.status(400).json({ error: "repoPaths must be an array of strings" });
  }
});

app.use("/", gitRouter);

app.listen(PORT, () => {
  console.log(`GitHub Dashboard server listening on http://localhost:${PORT}`);
});
