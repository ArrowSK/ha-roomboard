<p align="center">
  <img src="assets/icon.png" alt="HA Roomboard" width="132">
</p>

<h1 align="center">HA Roomboard</h1>

<p align="center">
  <strong>A room-first Home Assistant dashboard that builds itself.</strong><br>
  Clean rooms, useful controls, scenes, automations and Assist — without hand-building hundreds of cards.
</p>

<p align="center">
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=ArrowSK&repository=ha-roomboard&category=Dashboard"><img alt="Open in HACS" src="https://my.home-assistant.io/badges/hacs_repository.svg"></a>
</p>

<p align="center">
  <img alt="Home Assistant 2026.5+" src="https://img.shields.io/badge/Home%20Assistant-2026.5%2B-41BDF5?logo=home-assistant&logoColor=white">
  <img alt="HACS Dashboard" src="https://img.shields.io/badge/HACS-Dashboard-41BDF5">
  <img alt="Validation" src="https://github.com/ArrowSK/ha-roomboard/actions/workflows/validate.yml/badge.svg">
  <img alt="License" src="https://img.shields.io/github/license/ArrowSK/ha-roomboard">
</p>

> Home Assistant should feel like a home, not an entity registry.

Roomboard reads the Areas, devices and entities you already have, then turns them into a responsive dashboard with one view per room. It prefers everyday controls, keeps technical noise out of the way, and refreshes itself when your Home Assistant setup changes.

## Start here

**Already using HACS?** Use the **Open in HACS** button above, add HA Roomboard as a **Dashboard** repository, download it, then go to **Settings → Dashboards → Add dashboard → Community dashboards**.

Choose the version you prefer:

- **HA Roomboard** — follows your Home Assistant/system appearance.
- **HA Roomboard Light** — fixed accessible light palette.
- **HA Roomboard Dark** — fixed accessible dark palette.

No YAML is required for the default setup.

## Updates

HA Roomboard now publishes normal versioned GitHub releases. HACS can therefore treat a new Roomboard version as an update instead of making you redownload the moving `main` branch by hand. After installing a released version, future releases should appear in HACS as pending updates (and in Home Assistant's Updates view when HACS exposes the update entity). If you want HACS to check immediately, use **Update information** for HA Roomboard.

## What you get

| | |
|---|---|
| **Automatic rooms** | One generated dashboard view per populated Home Assistant Area. |
| **Live discovery** | New or migrated entities in existing Areas are picked up while Roomboard is open, with a periodic fallback refresh. |
| **Cleaner rooms** | Diagnostic, configuration, disabled and hidden entities are filtered by default. Unavailable devices are moved out of the main grid, and Adaptive Lighting management switches are kept separate from everyday device controls. |
| **Useful summaries** | Temperature, humidity, CO₂ and presence are promoted when suitable available sensors exist. |
| **Smart device tiles** | Lights, switches, climate, fans, covers, media, cameras and more use a consistent room-first presentation. |
| **Scenes & automations** | Global Home sections make common actions easy to find without assigning everything to an Area. |
| **Assist** | A prominent native Home Assistant Assist launcher is available from the Home view. |
| **Readable by design** | Wrapped names, accessible contrast, visible keyboard focus, larger supporting text and 44 px interaction targets where applicable. |
| **No card stack required** | Roomboard does not require Mushroom, Bubble Card, card-mod or another Lovelace card package to work. |

## The interaction model

Roomboard tries to make the obvious tap do the obvious thing.

**Lights, switches, fans and input booleans** toggle directly. **Scenes** run immediately. Device types where a blind command would be risky or ambiguous open Home Assistant's More Info dialog instead.

Automations deliberately have three separate actions:

1. **Tap the automation card → Edit.** Roomboard opens Home Assistant's native automation editor. If the automation exposes an `id`, it uses `/config/automation/edit/<id>`; otherwise it falls back to the Home Assistant automation details page.
2. **Use the toggle button → Enable / disable.** This pauses or resumes the automation; it does not run the automation's actions.
3. **Use `•••` → More Info.**

The same interaction applies to automations shown inside individual room views.

## How Roomboard decides what belongs in a room

Home Assistant's Area assignment is the source of truth. An entity belongs to a room when either the entity itself is assigned to that Area, or its parent device belongs to that Area and the entity has no Area override.

Roomboard then applies a deliberately conservative cleanup pass. It removes disabled, hidden, configuration-only and diagnostic registry entries, excludes common administrative domains, and avoids promoting every sensor into its own tile.

Useful environmental and safety classes such as temperature, humidity, CO₂, illuminance, air quality, particulate matter, pressure, VOC, occupancy, motion, door/window, moisture, smoke, gas, safety and problem sensors can remain visible. Power, energy, battery, current and voltage readings are normally attached to the corresponding device as secondary information instead of becoming separate cards.

Obvious same-domain, same-name duplicates are collapsed with preference given to the available entity.

Adaptive Lighting's `switch.adaptive_lighting_*` entities are useful management controls, but they are not lamps. Roomboard therefore keeps them out of the everyday room grid and places available ones in a collapsed **Lighting automation controls** section. An entity named in `include_entities` still overrides that default and can be promoted into the normal grid.

## Unavailable devices stay available — just not in your way

The default is:

```yaml
unavailable_mode: collapse
```

Available entities remain in the normal room grid. `unknown` and `unavailable` entities move below the main content into a collapsed **Unavailable devices** section.

Other choices are:

```yaml
unavailable_mode: show
```

or:

```yaml
unavailable_mode: hide
```

This keeps a temporarily broken device inspectable without letting stale entities dominate the dashboard.

## Scenes and automations

The Home view automatically includes available non-hidden scenes and automations, including ones that are not assigned to an Area.

Set either option to `false` if you do not want the corresponding global section:

```yaml
show_scenes: false
show_automations: false
```

Area-assigned scenes and automations can also appear naturally inside their room.

## Assist

Roomboard uses Home Assistant's native dashboard `assist` action rather than calling a conversation service directly.

The default is to use the preferred Assist pipeline and start listening immediately:

```yaml
assist_pipeline: preferred
assist_start_listening: true
```

Set `assist_start_listening: false` if you prefer Assist to open without immediately activating the microphone.

## Light, Dark and System appearance

Roomboard registers three Community dashboard strategies:

```text
custom:ha-roomboard
custom:ha-roomboard-light
custom:ha-roomboard-dark
```

The Light and Dark variants define their own background, card, text, muted-text, divider and accent colours so readability does not depend on a third-party Home Assistant theme. The base Roomboard strategy follows Home Assistant.

Advanced users can also set the base strategy explicitly:

```yaml
appearance: light
```

Accepted values are `system`, `light`, and `dark`.

## Accessibility and readability

Roomboard's fixed Light and Dark palettes are designed around WCAG 2.2 AA normal-text contrast targets. Everyday entity names use 16 px-equivalent text and supporting text uses at least 14 px-equivalent text with increased line-height.

Long names wrap instead of being silently truncated. Interactive controls use visible keyboard focus outlines and a minimum 44 px touch target where applicable. More Info uses a larger, separated touch target on mobile so it is less likely to be confused with a neighbouring automation toggle. Reduced-motion preferences are respected.

Detailed contrast measurements and implementation rules are in [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## Fine-tuning discovery

Automatic discovery is the default, but you can override it when your installation has an unusual entity that Roomboard cannot infer correctly.

```yaml
strategy:
  type: custom:ha-roomboard
  include_areas:
    - Bedroom
    - Main Room
  exclude_areas:
    - Test Lab
  include_entities:
    - sensor.special_room_status
  exclude_entities:
    - switch.debug_relay
  room_order:
    - Main Room
    - Kitchen
    - Bedroom
  unavailable_mode: collapse
  deduplicate: true
```

Area selectors can use either the Home Assistant Area ID or the displayed Area name. Entity overrides use full entity IDs.

## Installation

### HACS — recommended

Use the button at the top of this README, or add the repository manually:

1. Open **HACS**.
2. Open the **⋮** menu → **Custom repositories**.
3. Add `https://github.com/ArrowSK/ha-roomboard`.
4. Select **Dashboard**.
5. Download **HA Roomboard**.
6. Refresh the Home Assistant frontend if HACS asks you to.
7. Open **Settings → Dashboards → Add dashboard** and select a Roomboard strategy under **Community dashboards**.

If Roomboard does not appear under Community dashboards, confirm the resource exists under **Settings → Dashboards → Resources**, then hard-refresh the browser.

### Manual resource installation

HACS is strongly recommended. For manual use, copy `dist/ha-roomboard.js` into a Home Assistant web-accessible directory and register it as a JavaScript module under **Settings → Dashboards → Resources**.

## HACS icon and branding

The repository contains its own independent Roomboard icon in `assets/icon.png` and conventional root-level `icon.png` / `dark_icon.png` assets for repository and HACS-facing branding. The artwork is original to this project and does not use Tuya or Smart Life artwork.

There is an upstream HACS limitation affecting icon resolution for some custom repositories in current HACS 2.0.5 builds. If HACS still shows a generic placeholder after redownloading, that does **not** mean the Roomboard icon is missing from this repository; HACS's current custom-repository icon path can be the limiting layer. The README and GitHub repository will still use the project icon directly.

## Requirements

- Home Assistant **2026.5 or newer**.
- A modern browser supported by current Home Assistant.
- HACS is recommended for installation and updates.

## Privacy and architecture

Roomboard is frontend-only. It does not introduce a separate server, cloud account or analytics service. Discovery is performed against Home Assistant's own registry/state APIs available to the logged-in frontend session.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the implementation model.

## Independent project — not a Tuya clone

HA Roomboard is an independent open-source Home Assistant project. It borrows general room-first smart-home interaction ideas, not Tuya intellectual property.

The repository intentionally does **not** contain Tuya or Smart Life logos, icons, screenshots, fonts, CSS, source code, extracted resources or copied visual assets. Contributors are asked to keep it that way. See [docs/LEGAL.md](docs/LEGAL.md).

## Development

The distributed frontend is `dist/ha-roomboard.js`.

Run the local checks with:

```bash
npm test
```

GitHub Actions also runs JavaScript/behaviour validation and the official HACS validation workflow on changes.

## Project status

Roomboard is still young and is being tested against real Home Assistant installations with large, messy entity registries. That is intentional: the goal is not a perfect demo dashboard, but a dashboard that remains pleasant when a smart home has accumulated years of devices, migrations and integrations.

Issues and focused improvement ideas are welcome.

## License

MIT. See [LICENSE](LICENSE).
