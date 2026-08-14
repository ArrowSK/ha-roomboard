# Changelog

All notable changes to HA Roomboard are documented here.

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
