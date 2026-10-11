# Arkham Horror LCG XP Tracker

A web app for tracking investigator experience across [Arkham Horror: The Card Game](https://www.fantasyflightgames.com/productline/arkham-horror-the-card-game/) campaigns, with an aesthetic inspired by the game's parchment-and-ink artwork. Card and campaign names follow [ArkhamDB](https://arkhamdb.com/).

## Features

- **Overview page** listing all campaigns: title, campaign name, investigator, class icon, total XP, and active/finished status. Active campaigns are always sorted to the top.
- **Create new campaign** page: pick a campaign and your investigator from dropdowns (seeded from ArkhamDB data), and name the friends you play with.
- **Gain XP** page per campaign: record Scenario / Interlude / Card experience with an amount and optional notes.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The SQLite database is created automatically at `data/arkham-tracker.db`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Compile and start the server |
| `npm run build` | Compile TypeScript only |
| `npm test` | Run the test suite |

## Architecture

The project follows Domain-Driven Design and Clean Architecture, with dependencies pointing strictly inward. All wiring happens through dependency injection in the composition root (`src/presentation/dependency-container.ts`).

```
src/
  domain/           # Entities, value objects, repository interface — zero framework imports
  application/      # Use cases, DTOs, and ports (interfaces for infrastructure)
  infrastructure/   # SQLite persistence, ArkhamDB snapshot catalog, id generation
  presentation/     # Express routes, HTML views, styles, and the DI container
```

- **Domain**: the `Campaign` aggregate guards its invariants (validated title, non-negative whole XP, known experience types) and owns the `gainExperience` behavior.
- **Application**: `CreateCampaignHandler`, `GainExperienceHandler`, and `ListCampaignsHandler` orchestrate the domain; ports (`ArkhamCatalog`, `IdGenerator`) keep them framework-agnostic.
- **Infrastructure**: `SqliteCampaignRepository` implements the domain's repository interface; `SnapshotArkhamCatalog` serves campaign/investigator definitions from a checked-in snapshot of ArkhamDB data (ArkhamDB blocks automated access, so the snapshot is curated by hand — extend `src/infrastructure/arkhamdb/*.json` as new content releases).
- **Presentation**: thin routes that parse request input, call a use case, and render server-side HTML views styled like the game.

## Tests

- `tests/domain/` — unit tests for the `Campaign` aggregate and its value objects.
- `tests/application/` — use-case tests against an in-memory repository (mocked port).
