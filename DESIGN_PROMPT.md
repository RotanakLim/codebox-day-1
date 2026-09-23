# Compassionate Food Access Map — UI design prompt

Use this prompt when asking Cursor or another UI-generation agent to refine the California Food Need Map. It is intentionally specific about message, audience, emotion, and accessibility so that visual decisions serve people—not just the data.

## North star

Help a person leave the first screen feeling respected, less alone, and clear about one next step—whether they are looking for food support or trying to make their community stronger.

## Prompt

Design and implement a responsive, accessible front end for a California food insecurity map. The screen should guide people toward trustworthy local support while helping community members understand where need is concentrated and how they can contribute. Food insecurity is a structural issue, not a personal failing: use factual, calm, dignity-preserving language and avoid alarmist colors, shame, or language that treats people as statistics.

### User and context

- The primary audience includes a person looking for food or benefits, a family member helping them, a community volunteer, and a local planner or journalist.
- Some visitors may be stressed, short on time, on a phone, using a screen reader, or unfamiliar with food-security terms.
- A visitor may know only a city name, so county-level results should accept city searches and explain the limits of modeled county estimates.
- The interface must work without an account, location sharing, or prior knowledge. Content should be scannable, plain-language, and useful at a slow connection.

### Message and emotional direction

- Lead with belonging, clarity, and agency: “You are welcome here, and there is a next step.”
- Reassure without minimizing the issue. Pair difficult facts with context and a practical path to help.
- Use warm editorial restraint inspired by the information hierarchy of [Feeding America’s Hunger in America page](https://www.feedingamerica.org/hunger-in-america) and the resource-forward structure of [Nutrition.gov’s Food Security and Access page](https://www.nutrition.gov/topics/food-security-and-access), without copying their layouts, language, imagery, or branding.

### UI principles

1. **Reassure:** use generous spacing, soft sage/cream/peach/blue-gray tones, readable type, rounded surfaces, and high-contrast text. Reserve stronger hues for focus states, urgent help, and data meaning.
2. **Guide:** establish a clear hierarchy: immediate help and map exploration first, interpretation and methodology second, community action third. Keep one primary call to action per region.
3. **Help people explore:** use a map, a searchable accessible county table, selected-area details, progressive disclosure, and clear empty/error states. Never require map interaction as the only way to reach information.
4. **Prompt agency:** include a “How you can help” section with realistic options such as sharing a trusted resource, supporting local partners, volunteering, learning, and advocacy. Make it clear that people seeking support are not expected to help others first.
5. **Respect uncertainty:** label values as modeled estimates, show source/year context near the data, and avoid implying that a low county rate means no need exists.
6. **Stay accessible:** use semantic landmarks and heading order, visible `:focus-visible` states, keyboard-operable controls, descriptive labels, live status updates, reduced-motion support, touch targets of at least 44px, and WCAG AA contrast. Do not convey meaning through color alone.
7. **Stay responsive:** on narrow screens, stack content in task order, keep buttons easy to tap, preserve the table’s accessible headings, and avoid horizontal scrolling except inside intentionally scrollable data regions.

### Required components

- Sticky but compact header with Explore, Get help, Take action, and About the data links.
- Hero with a one-sentence purpose, a primary “Explore the map” action, a secondary “Find food now” action, and an immediate 211 callout.
- Statewide context cards with source links and cautious date/method labels.
- County map with legend, keyboard-accessible county shapes, search by county or major city, zoom controls, and a visible selected-area panel.
- “View accessible county list” table with a clear View action for each row.
- Resource cards for 211, CalFresh/BenefitsCal, and nearby food providers.
- “How you can help” cards with practical, non-judgmental actions and a note that asking for help is valid.
- Methodology section explaining what the model can and cannot tell a reader, plus source links.
- Footer disclaimer that the map is informational and does not determine eligibility.

### Constraints and acceptance criteria

- Preserve the existing map behavior, data model, and URLs unless a separate engineering task explicitly changes them.
- Keep factual claims tied to visible, reputable source links; do not invent city-level precision from county estimates.
- Prefer HTML/CSS and the project’s existing components over a new framework or decorative dependency.
- Test keyboard navigation, focus visibility, mobile layout, reduced motion, link target behavior, and readable contrast before handoff.
- Review the result at desktop and phone widths. The final design should feel like a calm public-service guide: clear enough to act on quickly and humane enough to return to.
