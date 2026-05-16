const express = require("express");
const router = express.Router();
const { departments, initiatives, cells } = require("../data/mockData");

// In-memory store (replace with DB in production)
let cellStore = [...cells];

router.get("/departments", (req, res) => {
  res.json(departments);
});

router.get("/initiatives", (req, res) => {
  res.json(initiatives);
});

router.get("/heatmap", (req, res) => {
  const { status, category, region } = req.query;

  let filteredDepts = departments;
  let filteredInits = initiatives;
  let filteredCells = cellStore;

  if (region) {
    filteredDepts = filteredDepts.filter(
      (d) => d.region.toLowerCase() === region.toLowerCase()
    );
    const deptIds = new Set(filteredDepts.map((d) => d.id));
    filteredCells = filteredCells.filter((c) => deptIds.has(c.departmentId));
  }

  if (category) {
    filteredInits = filteredInits.filter(
      (i) => i.category.toLowerCase() === category.toLowerCase()
    );
    const initIds = new Set(filteredInits.map((i) => i.id));
    filteredCells = filteredCells.filter((c) => initIds.has(c.initiativeId));
  }

  if (status) {
    filteredCells = filteredCells.filter((c) => c.status === status);
  }

  res.json({
    departments: filteredDepts,
    initiatives: filteredInits,
    cells: filteredCells,
  });
});

router.get("/summary", (req, res) => {
  const total = cellStore.length;
  const byStatus = cellStore.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const avgImpact =
    Math.round(cellStore.reduce((sum, c) => sum + c.impactScore, 0) / total);
  const avgReadiness =
    Math.round(cellStore.reduce((sum, c) => sum + c.readinessScore, 0) / total);

  const criticalCells = cellStore.filter(
    (c) => c.impactScore >= 80 && c.readinessScore < 50
  ).length;

  const blockedCells = cellStore.filter((c) => c.status === "blocked").length;

  res.json({
    total,
    byStatus,
    avgImpact,
    avgReadiness,
    criticalCells,
    blockedCells,
  });
});

router.put("/heatmap/:departmentId/:initiativeId", (req, res) => {
  const { departmentId, initiativeId } = req.params;
  const updates = req.body;

  const idx = cellStore.findIndex(
    (c) => c.departmentId === departmentId && c.initiativeId === initiativeId
  );

  if (idx === -1) {
    return res.status(404).json({ error: "Cell not found" });
  }

  const allowed = ["impactScore", "readinessScore", "status", "notes"];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) {
      cellStore[idx][field] = updates[field];
    }
  });
  cellStore[idx].lastUpdated = new Date().toISOString().split("T")[0];

  res.json(cellStore[idx]);
});

module.exports = router;
