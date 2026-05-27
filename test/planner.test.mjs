import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");

test("default moving plan has a complete dated flow", () => {
  const requiredTaskIds = [
    "budget",
    "quotes",
    "declutter",
    "supplies",
    "address",
    "confirm",
    "essentials",
    "move-day",
    "first-night",
    "settle"
  ];

  for (const id of requiredTaskIds) {
    assert.match(app, new RegExp(`id: "${id}"`));
  }
});

test("planner supports practical export and persistence actions", () => {
  assert.match(app, /function buildMarkdown/);
  assert.match(app, /function downloadPlan/);
  assert.match(app, /navigator\.clipboard/);
  assert.match(app, /localStorage\.setItem/);
});
