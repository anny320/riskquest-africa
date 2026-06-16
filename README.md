# Wakara Secure360 Challenge

A free interactive cybersecurity, AI governance, and digital resilience assessment platform for SMEs, built by Wakara Technologies Limited.

## Live Flow

1. `index.html` — Landing page with hero, how-it-works, and category overview.
2. `assessment.html` — Business persona selection, 5 interactive risk scenarios with live scoring and feedback.
3. `report.html` — Dashboard (radar + category charts, badges), lead capture form, PDF report generation, and consultation funnel.

## Tech Stack

- HTML5 + Tailwind CSS (CDN)
- Vanilla JavaScript (ES6)
- Chart.js for radar/bar charts
- jsPDF for client-side PDF report generation
- Browser Local Storage for session state (no backend required)

## Structure

```
index.html
assessment.html
report.html
assets/
  css/styles.css
  js/
    app.js          # session persistence, shared helpers
    scenarios.js     # loads scenario data
    scoring.js        # scoring engine (people/process/technology/data/AI pillars)
    charts.js          # Chart.js radar + bar chart renderers
    pdf.js               # jsPDF report builder
    leadcapture.js        # lead form validation + storage
data/scenarios.json   # personas, scenarios, badges, risk levels
```

## Running Locally

This is a static site — no build step required.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

Designed for GitHub Pages — push to the `main` branch (or configure Pages to serve from your default branch) with no build step needed.
