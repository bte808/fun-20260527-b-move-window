const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "move-window-v1";

const form = document.querySelector("#planner-form");
const timeline = document.querySelector("#timeline");
const summaryStrip = document.querySelector("#summary-strip");
const progressBar = document.querySelector("#progress-bar");
const template = document.querySelector("#phase-template");
const customTaskInput = document.querySelector("#custom-task");
const customOffsetInput = document.querySelector("#custom-offset");

const baseTasks = [
  {
    id: "budget",
    offset: -56,
    text: "Set a move budget, target move window, and rough inventory.",
    why: "Locks the scale before quotes and supplies."
  },
  {
    id: "quotes",
    offset: -42,
    text: "Request mover or truck quotes and confirm insurance basics.",
    why: "Good dates disappear quickly."
  },
  {
    id: "declutter",
    offset: -35,
    text: "Start a donate, sell, recycle, and keep sweep by room.",
    why: "Every removed item saves packing time."
  },
  {
    id: "supplies",
    offset: -28,
    text: "Gather boxes, tape, labels, markers, and a first-night bin.",
    why: "Packing goes faster when supplies are visible."
  },
  {
    id: "records",
    offset: -21,
    text: "Collect IDs, leases, receipts, warranties, and move paperwork in one folder.",
    why: "Important papers should not ride loose in boxes."
  },
  {
    id: "address",
    offset: -14,
    text: "Submit address changes for mail, banks, deliveries, subscriptions, and work.",
    why: "Prevents missed bills and lost packages."
  },
  {
    id: "pack-low-use",
    offset: -10,
    text: "Pack low-use items and label each box by room plus priority.",
    why: "Labels turn unloading into sorting, not searching."
  },
  {
    id: "confirm",
    offset: -7,
    text: "Confirm movers, truck, parking, building access, and arrival window.",
    why: "The last week is for confirmation, not discovery."
  },
  {
    id: "essentials",
    offset: -3,
    text: "Pack an essentials bag with chargers, medicine, keys, clothes, tools, and snacks.",
    why: "Keeps the first night functional."
  },
  {
    id: "photos",
    offset: -1,
    text: "Photograph rooms, meters, appliance hookups, and box stacks.",
    why: "Creates proof and helps rebuild setups."
  },
  {
    id: "move-day",
    offset: 0,
    text: "Walk the old place, check closets, carry valuables, and keep the essentials bag with you.",
    why: "Move day needs a short must-not-miss list."
  },
  {
    id: "first-night",
    offset: 1,
    text: "Unpack the first-night bin, test utilities, and make one safe sleeping area.",
    why: "One working zone lowers the friction fast."
  },
  {
    id: "settle",
    offset: 7,
    text: "Review deposits, claims, returns, registrations, and leftover address updates.",
    why: "Close the loop while records are fresh."
  }
];

const extraTasks = {
  renting: [
    {
      id: "rent-notice",
      offset: -45,
      text: "Check notice rules, deposit terms, move-out cleaning, and key return steps.",
      why: "Lease details can create avoidable fees."
    },
    {
      id: "rent-inspect",
      offset: -2,
      text: "Patch small holes, clean high-fee areas, and schedule any required inspection.",
      why: "Deposit recovery depends on details."
    }
  ],
  utilities: [
    {
      id: "utility-switch",
      offset: -14,
      text: "Schedule electricity, water, gas, internet, and trash transfer dates.",
      why: "Avoids paying two places or arriving to a cold home."
    },
    {
      id: "meter-read",
      offset: 0,
      text: "Record final and starting meter readings.",
      why: "Useful if a bill looks wrong."
    }
  ],
  pets: [
    {
      id: "pet-records",
      offset: -21,
      text: "Update pet tags, vet records, carriers, food, and a quiet room plan.",
      why: "Pets need a predictable transfer path."
    }
  ],
  kids: [
    {
      id: "school",
      offset: -28,
      text: "Handle school or childcare records, commute changes, and a comfort box.",
      why: "Kid logistics are easier before packing peaks."
    }
  ],
  fragile: [
    {
      id: "fragile-zone",
      offset: -14,
      text: "Create a fragile packing zone with towels, paper, labels, and a no-stack note.",
      why: "The goal is fewer mystery boxes and fewer breaks."
    }
  ],
  elevator: [
    {
      id: "elevator-book",
      offset: -21,
      text: "Reserve elevator, loading dock, gate access, and parking permits.",
      why: "Building access is often the hidden blocker."
    }
  ],
  long: [
    {
      id: "route",
      offset: -21,
      text: "Plan route, overnight stops, tolls, weather backup, and arrival buffer.",
      why: "Long moves punish optimistic timing."
    }
  ],
  downsizing: [
    {
      id: "fit-check",
      offset: -28,
      text: "Measure large furniture against doorways, elevators, and the new floor plan.",
      why: "A fit check beats moving furniture twice."
    }
  ],
  house: [
    {
      id: "large-items",
      offset: -21,
      text: "List appliances, garage items, outdoor tools, and specialty hauling needs.",
      why: "Large items create most surprise labor."
    }
  ]
};

let state = loadState();

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && typeof parsed === "object") {
      return {
        completed: parsed.completed || {},
        customTasks: Array.isArray(parsed.customTasks) ? parsed.customTasks : []
      };
    }
  } catch {
    // Ignore damaged local data and start clean.
  }

  return { completed: {}, customTasks: [] };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dayDistance(date) {
  return Math.round((date - getToday()) / DAY_MS);
}

function relativeLabel(date, moveDate) {
  const untilMove = Math.round((date - moveDate) / DAY_MS);
  const fromToday = dayDistance(date);

  if (untilMove === 0) return "Move day";
  if (untilMove < 0) return `${Math.abs(untilMove)} days before`;
  if (untilMove === 1) return "1 day after";
  if (untilMove > 0) return `${untilMove} days after`;
  if (fromToday === 0) return "Today";

  return "";
}

function taskKey(task, dueDate) {
  return `${task.id}:${toIsoDate(dueDate)}`;
}

function formData() {
  const data = new FormData(form);
  return {
    moveDate: data.get("moveDate"),
    moveType: data.get("moveType"),
    homeSize: data.get("homeSize"),
    fromName: data.get("fromName").trim(),
    toName: data.get("toName").trim(),
    notes: data.get("notes").trim(),
    renting: data.has("renting"),
    utilities: data.has("utilities"),
    pets: data.has("pets"),
    kids: data.has("kids"),
    fragile: data.has("fragile"),
    elevator: data.has("elevator")
  };
}

function buildTasks(data) {
  const tasks = [...baseTasks];

  for (const key of ["renting", "utilities", "pets", "kids", "fragile", "elevator"]) {
    if (data[key]) tasks.push(...extraTasks[key]);
  }

  if (extraTasks[data.moveType]) tasks.push(...extraTasks[data.moveType]);
  if (extraTasks[data.homeSize]) tasks.push(...extraTasks[data.homeSize]);
  tasks.push(...state.customTasks);

  return tasks.sort((a, b) => a.offset - b.offset || a.text.localeCompare(b.text));
}

function groupTasks(tasks, moveDate) {
  const groups = new Map();
  for (const task of tasks) {
    const dueDate = addDays(moveDate, task.offset);
    const iso = toIsoDate(dueDate);
    if (!groups.has(iso)) groups.set(iso, { dueDate, tasks: [] });
    groups.get(iso).tasks.push({ ...task, dueDate });
  }
  return [...groups.values()].sort((a, b) => a.dueDate - b.dueDate);
}

function render() {
  const data = formData();
  if (!data.moveDate) {
    timeline.innerHTML = `<p class="empty-state">Choose a move date to build the plan.</p>`;
    summaryStrip.innerHTML = "";
    progressBar.style.width = "0";
    return;
  }

  const moveDate = parseLocalDate(data.moveDate);
  const tasks = buildTasks(data);
  const groups = groupTasks(tasks, moveDate);
  const completed = tasks.filter((task) => state.completed[taskKey(task, addDays(moveDate, task.offset))]).length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const today = getToday();
  const next = groups.find((group) => group.dueDate >= today) || groups.at(-1);
  const daysToMove = Math.round((moveDate - today) / DAY_MS);
  const overdue = groups.reduce((sum, group) => {
    if (group.dueDate >= today) return sum;
    return sum + group.tasks.filter((task) => !state.completed[taskKey(task, group.dueDate)]).length;
  }, 0);

  summaryStrip.innerHTML = [
    metric("Move date", formatDate(moveDate)),
    metric(daysToMove >= 0 ? "Days left" : "Days since", Math.abs(daysToMove).toString()),
    metric("Done", `${completed}/${tasks.length}`),
    metric(overdue ? "Open overdue" : "Next checkpoint", overdue ? overdue.toString() : formatDate(next.dueDate))
  ].join("");
  progressBar.style.width = `${percent}%`;

  timeline.replaceChildren();
  for (const group of groups) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".phase-card");
    const badge = node.querySelector(".phase-day");
    const title = node.querySelector("strong");
    const subtitle = node.querySelector("small");
    const list = node.querySelector("ul");

    const fromToday = dayDistance(group.dueDate);
    if (fromToday < 0) article.classList.add("past");
    badge.textContent = fromToday === 0 ? "TODAY" : fromToday < 0 ? "PAST" : "NEXT";
    title.textContent = formatDate(group.dueDate);
    subtitle.textContent = relativeLabel(group.dueDate, moveDate);

    for (const task of group.tasks) {
      const item = document.createElement("li");
      item.className = "task-row";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(state.completed[taskKey(task, group.dueDate)]);
      checkbox.addEventListener("change", () => {
        state.completed[taskKey(task, group.dueDate)] = checkbox.checked;
        saveState();
        render();
      });

      const text = document.createElement("span");
      text.textContent = task.text;
      if (task.why) {
        const why = document.createElement("small");
        why.textContent = task.why;
        text.appendChild(why);
      }
      item.append(checkbox, text);
      list.append(item);
    }

    timeline.append(node);
  }
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function buildMarkdown() {
  const data = formData();
  if (!data.moveDate) return "Move Window\n\nChoose a move date first.";

  const moveDate = parseLocalDate(data.moveDate);
  const tasks = buildTasks(data);
  const groups = groupTasks(tasks, moveDate);
  const route = [data.fromName, data.toName].filter(Boolean).join(" -> ");
  const lines = [
    `# Move Window: ${formatDate(moveDate)}`,
    "",
    route ? `Route: ${route}` : "",
    `Type: ${labelFor(data.moveType)} / ${labelFor(data.homeSize)}`,
    data.notes ? `Notes: ${data.notes}` : "",
    ""
  ].filter((line, index, list) => line || list[index - 1] !== "");

  for (const group of groups) {
    lines.push(`## ${formatDate(group.dueDate)} - ${relativeLabel(group.dueDate, moveDate)}`);
    for (const task of group.tasks) {
      const mark = state.completed[taskKey(task, group.dueDate)] ? "x" : " ";
      lines.push(`- [${mark}] ${task.text}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

function labelFor(value) {
  return String(value).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function copyPlan() {
  const text = buildMarkdown();
  try {
    await navigator.clipboard.writeText(text);
    flashButton("#copy-button", "Copied");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    flashButton("#copy-button", "Copied");
  }
}

function downloadPlan() {
  const blob = new Blob([buildMarkdown()], { type: "text/markdown" });
  const data = formData();
  const filename = `move-window-${data.moveDate || "plan"}.md`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function flashButton(selector, text) {
  const button = document.querySelector(selector);
  const original = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

function setSample() {
  const sampleDate = addDays(getToday(), 32);
  form.moveDate.value = toIsoDate(sampleDate);
  form.moveType.value = "local";
  form.homeSize.value = "apartment";
  form.fromName.value = "Old apartment";
  form.toName.value = "New apartment";
  form.renting.checked = true;
  form.utilities.checked = true;
  form.pets.checked = false;
  form.kids.checked = false;
  form.fragile.checked = true;
  form.elevator.checked = true;
  form.notes.value = "Label boxes by room + priority. Keep keys, chargers, router, medicine, and lease paperwork in the essentials bag.";
  state.customTasks = [
    {
      id: "custom-sample-wifi",
      offset: -7,
      text: "Write the new Wi-Fi install time on the first-night box.",
      why: "The router should not disappear into a random carton."
    }
  ];
  saveState();
  render();
}

function resetAll() {
  state = { completed: {}, customTasks: [] };
  saveState();
  form.reset();
  form.utilities.checked = true;
  form.moveDate.value = toIsoDate(addDays(getToday(), 30));
  render();
}

function addCustomTask() {
  const text = customTaskInput.value.trim();
  if (!text) return;
  state.customTasks.push({
    id: `custom-${Date.now()}`,
    offset: Number(customOffsetInput.value),
    text,
    why: "Custom task"
  });
  customTaskInput.value = "";
  saveState();
  render();
}

form.addEventListener("input", render);
form.addEventListener("change", render);
document.querySelector("#sample-button").addEventListener("click", setSample);
document.querySelector("#reset-button").addEventListener("click", resetAll);
document.querySelector("#copy-button").addEventListener("click", copyPlan);
document.querySelector("#download-button").addEventListener("click", downloadPlan);
document.querySelector("#print-button").addEventListener("click", () => window.print());
document.querySelector("#add-custom-button").addEventListener("click", addCustomTask);
customTaskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addCustomTask();
  }
});

if (!form.moveDate.value) {
  form.moveDate.value = toIsoDate(addDays(getToday(), 30));
}

render();
