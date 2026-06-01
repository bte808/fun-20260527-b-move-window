import { readFile } from "node:fs/promises";

const requiredFiles = ["index.html", "styles.css", "app.js", "README.md"];
const contents = new Map();

for (const file of requiredFiles) {
  contents.set(file, await readFile(new URL(`../${file}`, import.meta.url), "utf8"));
}

const html = contents.get("index.html");
const app = contents.get("app.js");
const readme = contents.get("README.md");

const checks = [
  [html.includes('id="planner-form"'), "planner form exists"],
  [html.includes('id="timeline"'), "timeline mount exists"],
  [html.includes('id="next-actions"'), "next action mount exists"],
  [html.includes('id="calendar-button"'), "calendar export button exists"],
  [html.includes("./app.js"), "app script is referenced"],
  [html.includes("./styles.css"), "stylesheet is referenced"],
  [app.includes("baseTasks"), "task templates exist"],
  [app.includes("buildMarkdown"), "markdown export exists"],
  [app.includes("buildCalendar"), "calendar export exists"],
  [app.includes("renderNextActions"), "next action focus exists"],
  [app.includes("localStorage"), "local progress persistence exists"],
  [readme.includes("## Validation"), "README documents validation"],
  [readme.includes("Inspiration"), "README documents inspiration"]
];

const failures = checks.filter(([passed]) => !passed);

if (failures.length) {
  console.error("Failed checks:");
  for (const [, label] of failures) console.error(`- ${label}`);
  process.exit(1);
}

console.log(`Passed ${checks.length} static checks.`);
