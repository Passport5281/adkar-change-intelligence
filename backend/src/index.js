require("dotenv").config();
const express = require("express");
const cors = require("cors");
const heatmapRoutes = require("./routes/heatmap");
const adkarRoutes = require("./routes/adkar");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }));
app.use(express.json());

app.use("/api", heatmapRoutes);
app.use("/api/adkar", adkarRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
