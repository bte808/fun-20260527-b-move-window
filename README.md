# Move Window

Move Window is a local-first moving checklist planner. Enter one move date, choose the pieces that apply, and it turns the date into a practical timeline with copy, print, download, and saved progress.

Live demo: https://bte808.github.io/fun-20260527-b-move-window/

## Why it exists

Moving checklists are useful, but they often live as long articles or generic PDFs. Move Window keeps the helpful part: one date goes in, a dated plan comes out, and you can keep checking items off in the browser.

## Inspiration

This small project was inspired by recent public moving-checklist patterns that organize tasks by weeks before moving day, including Opendoor's moving checklist guide: https://www.opendoor.com/articles/moving-guide-checklist

Move Window does not copy another checklist verbatim. It uses its own compact task set and focuses on local-first planning, quick editing, and export.

## What it can do

- Generate a dated moving plan from a move date.
- Include task packs for renting, utilities, pets, kids, fragile items, elevators, long-distance moves, downsizing, and larger homes.
- Add custom tasks with a relative timing such as 2 weeks before or move day.
- Check off progress and keep it in local browser storage.
- See the overdue or next checkpoint at the top of the plan.
- Copy the whole plan as Markdown.
- Download the plan as a Markdown file.
- Download an `.ics` calendar with dated move checkpoints.
- Print a clean checklist.
- Run without accounts, secrets, analytics, or a server.

## Why it is useful

Moving creates small deadlines that are easy to miss: elevator booking, address changes, utility cutoffs, first-night supplies, meter photos, and deposit details. A dated checklist lowers the friction because it tells you what should happen next instead of making you reread a long guide.

## How to run

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 5197
```

Then open:

```text
http://localhost:5197
```

## Core flow

1. Pick the moving day.
2. Select the move type, home size, and extra task packs.
3. Review the dated timeline.
4. Check off tasks, add custom tasks, copy the Markdown, download the plan, export calendar checkpoints, or print it.

## Validation

```bash
npm test
npm run check
python3 -m http.server 5197
curl -I http://localhost:5197/index.html
```

The app has no runtime dependencies. Tests use Node's built-in test runner.

## Future ideas

- Add import/export for saved progress.
- Add a packing label sheet generator.
- Add a one-page "move day command center" view.
