# Changelog

All notable changes to HA Roomboard are documented here.

## Unreleased

- Rework the GitHub front page around a shorter, clearer quick-start flow, one-click HACS entry, feature overview, interaction model, accessibility notes and advanced configuration.
- Add conventional root-level Roomboard icon assets for repository/HACS-facing branding while keeping the existing original artwork under `assets/`.
- Declare Home Assistant 2026.5.0 as the minimum supported version in `hacs.json`, matching the documented Community dashboard strategy requirement.
- Add a transparent note about the current upstream HACS 2.0.5 custom-repository icon limitation so a placeholder is not mistaken for a missing project asset.

## 0.3.1 - 2026-08-16

- Make the automation card itself an **edit** action, matching the way people naturally open an automation to inspect or change it.
- Follow Home Assistant's native automation routes: use `/config/automation/edit/<id>` when an automation ID is available and fall back to `/config/automation/show/<entity_id>` otherwise.
- Add a separate, accessible 44 px enable/disable control so pausing an automation is deliberate rather than an accidental card tap.
- Keep the three-dot button dedicated to More Info and keep scene taps dedicated to running scenes.
- Apply the same edit/toggle/More Info model to Area-assigned automations in room views.
- Extend tests and repository validation around editor routing and explicit `automation.turn_on` / `automation.turn_off` behavior.
- Rewrite the automation documentation around the actual human interaction instead of implementation details.

## 0.3.0 - 2026-08-16

- Add global Home sections for Home Assistant scenes and automations, including entities that are not assigned to an Area.
- Make scene tiles run the scene and automation tiles toggle whether the automation is enabled; More Info remains available separately.
- Allow Area-assigned automations to appear as ordinary room tiles alongside Area-assigned scenes.
- Add a prominent one-tap Home Assistant Assist launcher using the native dashboard `assist` action, with preferred-pipeline and start-listening options.
- Register explicit **HA Roomboard Light** and **HA Roomboard Dark** Community dashboard strategies while preserving the existing system-theme strategy.
- Add fixed high-contrast Light and Dark palettes designed around WCAG 2.2 AA normal-text contrast targets.
- Raise supporting typography to at least 14 px-equivalent, preserve 16 px-equivalent entity names, increase line-height, and keep long names wrapping.
- Add visible keyboard focus outlines, 44 px interaction targets where applicable, and reduced-motion handling.
- Increase unavailable-tile legibility when the collapsed unavailable section is opened.
- Add accessibility documentation with measured palette contrast values.
- Extend behavior and repository validation for scenes, automations, Assist, Light/Dark strategies, and accessibility markers.

## 0.2.1 - 2026-08-14

- Increase the minimum desktop tile width so real-world entity names have more room before wrapping.
- Let entity names, states, and parent-device names wrap naturally instead of clipping or ellipsizing them.
- Increase the size and line-height of secondary text, room summaries, navigation text, metrics, unavailable-section labels, and Home overview metadata.
- Allow power and energy metrics to wrap within the tile footer instead of being silently cut off.
- Let tiles grow vertically when longer names or supporting information require additional lines while keeping the compact two-column mobile layout.

## 0.2.0 - 2026-08-14

- Add live registry refresh while a Roomboard view is open, using Home Assistant registry events plus a periodic fallback refresh.
- Newly created or migrated entities in an existing Area can appear without rebuilding the dashboard.
- Add semantic room-icon inference across a broad set of common room types and enforce unique navigation icons within the dashboard.
- Move unavailable and unknown entities out of the main grid; collapse them at the bottom by default with configurable `collapse`, `show`, and `hide` modes.
- Prefer available entities when suppressing obvious same-domain, same-name duplicates; allow deduplication to be disabled.
- Prefer available temperature, humidity, CO₂, and presence sensors in room summaries instead of displaying unavailable summary chips.
- Show available-entity counts on the Home overview.

## 0.1.1 - 2026-08-14

- Use Home Assistant's current `type: panel` view configuration for generated full-width room views.
- Keep card grid metadata numeric and compatible with the current dashboard grid API.
- Align package and runtime version metadata.

## 0.1.0 - 2026-08-14

Initial public implementation.

- Automatic dashboard strategy registered with Home Assistant's Community dashboards picker.
- Area, device, and entity discovery through Home Assistant registry WebSocket APIs.
- Home overview and one generated view per populated Area.
- Sticky responsive room navigation.
- Automatic suppression of disabled, hidden, configuration, diagnostic, and administrative entities.
- Compact room summaries for temperature, humidity, CO₂, and presence where available.
- Responsive everyday device tiles with conservative direct-action rules.
- Secondary power, energy, current, voltage, and battery metrics attached to device tiles.
- Explicit area and entity include/exclude overrides.
- HACS plugin manifest, CI validation, architecture notes, and legal-independence rules.
