# California Food Need Map

An accessible, dependency-free Node.js application for exploring county-level food-insecurity estimates and finding trusted food assistance organizations in California.

## Run locally

Requires Node.js 18 or newer.

```bash
npm start
```

Open `http://localhost:3000`.

```bash
npm test
```

## What is included

- Interactive choropleth of all 58 California counties
- Button, mouse-wheel, and county-focused zoom
- Search by county or major California city
- Keyboard-operable counties and a complete table alternative
- Priority mode highlighting the highest-rate counties
- Local and statewide food assistance organizations
- Los Angeles County city-level child food-insecurity and adult nutrition-insecurity context
- Shareable county URLs and downloadable GeoJSON
- Responsive, reduced-motion-aware interface

## Data notes

The county layer contains 2020 Feeding America Map the Meal Gap modeled estimates, served by the federal Health Resources and Services Administration (HRSA). Newer statewide context comes from the 2024 California Health Interview Survey and 2025 findings shared by California Food Banks. Los Angeles County city cards use 2023 small-area estimates from the Los Angeles County Department of Public Health: child food insecurity and adult nutrition insecurity are kept as separate measures with confidence intervals. These measures use different populations and methods and should not be compared directly.

Modeled estimates are planning indicators, not direct county surveys or eligibility determinations. Verify current conditions with local organizations and community members before allocating services or funding. Organization hours and services can change; call before visiting.

Sources are linked directly from the application.
