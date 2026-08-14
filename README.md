<p align="center">
  <img src="assets/icon.png" alt="HA Roomboard icon" width="160">
</p>

# HA Roomboard

HA Roomboard is a frontend-only Home Assistant dashboard that builds itself from your existing Areas, devices, and entities.

It is designed for the common smart-home case where Home Assistant exposes far more technical entities than anyone wants to see day to day. Roomboard creates a Home overview, one view per populated Area, a sticky room navigator, and compact responsive device tiles without requiring you to hand-build every room in YAML.

## What it does

- Discovers Areas, devices, and entities from Home Assistant's registry APIs.
- Creates one dashboard view per populated Area.
- Keeps a sticky room navigation bar at the top of every generated view.
- Gives each room a compact temperature, humidity, CO₂, and presence summary when those sensors exist.
- Shows everyday controls such as lights, switches, climate, fans, covers, locks, media players, vacuums, humidifiers, water heaters, cameras, scenes, and alarms.
- Shows important environmental and safety sensors without dumping every diagnostic sensor into the room.
- Attaches power, energy, current, voltage, and battery readings as secondary information where possible instead of creating extra tiles.
- Excludes disabled, hidden, configuration, diagnostic, and administrative entities by default.
- Allows explicit include/exclude overrides when the automatic result is not what you want.
- Uses no third-party Lovelace card as a runtime dependency.

The default interaction model is deliberately conservative. Lights, switches, fans, and input booleans toggle directly. Scenes run directly. Other device types open Home Assistant's More Info dialog rather than guessing a command that could be inappropriate for the device.

## Requirements

- Home Assistant 2026.5 or newer is recommended. Community dashboard strategy discovery was added in Home Assistant 2026.5.
- HACS is recommended for installation.

## Install with HACS

Until HA Roomboard is accepted into the default HACS catalogue, add it as a custom repository:

1. Open HACS in Home Assistant.
2. Open the three-dot menu and choose **Custom repositories**.
3. Add `https://github.com/ArrowSK/ha-roomboard`.
4. Select **Dashboard** as the category.
5. Install **HA Roomboard**.
6. Reload the Home Assistant frontend if HACS asks you to.
7. Go to **Settings → Dashboards → Add dashboard**.
8. Under **Community dashboards**, choose **HA Roomboard**.

No YAML is required for the default setup.

If the strategy does not appear in the Add dashboard dialog, confirm that the HACS resource is present under **Settings → Dashboards → Resources**, then refresh the browser.

## Automatic selection

Roomboard treats Home Assistant's Area assignment as the source of truth for room membership. An entity belongs to a room when either:

- the entity itself is assigned to that Area; or
- the entity has no Area override and its parent device belongs to that Area.

The default filter then removes registry entries that are disabled, hidden, configuration-only, or diagnostic. Common administrative domains such as automations, updates, people, trackers, selectors, numbers, and timers are also omitted unless explicitly included.

Roomboard is intentionally selective with sensors. Temperature, humidity, CO₂, illuminance, air-quality, particulate, pressure, VOC, occupancy, motion, door/window, moisture, smoke, gas, safety, and problem sensors are treated as useful room information. Power, energy, battery, current, and voltage are normally shown as secondary metrics attached to the corresponding device.

## Optional strategy configuration

The default dashboard needs no configuration. Advanced users can use these strategy keys:

```yaml
strategy:
  type: custom:ha-roomboard
  title: My Home
  include_areas:
    - Living Room
    - bedroom
  exclude_areas:
    - Garage
  room_order:
    - Living Room
    - Kitchen
    - Bedroom
  include_entities:
    - button.bedroom_fan_power_on
  exclude_entities:
    - switch.router
  show_empty_areas: false
  show_unavailable: true
```

Area selectors accept either the Area ID or the Area name. Entity selectors use the full Home Assistant entity ID.

`include_entities` is an override: it can expose an entity that Roomboard would normally suppress, provided that entity belongs to the generated Area. This is useful for unusual but intentional controls such as IR buttons. `exclude_entities` always wins over automatic discovery.

## Design and legal independence

HA Roomboard is an independent Home Assistant community project. It is not a skin, fork, or redistribution of any commercial smart-home application.

The project does not contain third-party application code, extracted artwork, logos, screenshots, fonts, proprietary icon sets, copied stylesheets, or decompiled resources. Its room navigation, responsive tiles, device grouping, and compact controls are independently implemented from general interface patterns and Home Assistant APIs.

The HA Roomboard icon is original project artwork and is not derived from Tuya, Smart Life, or Home Assistant branding.

See [docs/LEGAL.md](docs/LEGAL.md) for the contributor rules that keep this separation explicit.

## Development

The distributed plugin is `dist/ha-roomboard.js`. There is intentionally no runtime build chain in the first release; keeping the shipped module readable makes early compatibility debugging easier.

Local validation:

```bash
npm run check
```

GitHub Actions runs both the repository checks and the official HACS validation action.

Architecture details are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Status

The current code is the first public implementation. It has static validation and HACS validation in CI, but it still needs real Home Assistant UI testing across different installations before a stable `1.0.0` release. Please report misclassified entities with the entity domain, device class, registry category, and Area assignment; do not post secrets or private Home Assistant URLs.

## License

MIT. See [LICENSE](LICENSE).
