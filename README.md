<p align="center">
  <img src="assets/icon.png" alt="HA Roomboard icon" width="160">
</p>

# HA Roomboard

HA Roomboard is a frontend-only Home Assistant dashboard that builds itself from your existing Areas, devices, entities, scenes, and automations.

It is designed for the common smart-home case where Home Assistant exposes far more technical entities than anyone wants to see day to day. Roomboard creates a Home overview, one view per populated Area, a sticky room navigator, compact responsive device tiles, one-tap Assist access, and global scene/automation controls without requiring you to hand-build every room in YAML.

## What it does

- Discovers Areas, devices, and entities from Home Assistant's registry APIs.
- Creates one dashboard view per populated Area.
- Keeps a sticky room navigation bar at the top of every generated view.
- Refreshes room discovery while the dashboard is open when Home Assistant's entity/device/area registries change, with a periodic fallback refresh.
- Assigns distinct room icons automatically, using the Area name and a broad set of room types before falling back to neutral unique icons.
- Gives each room a compact temperature, humidity, CO₂, and presence summary when an available sensor exists.
- Shows everyday controls such as lights, switches, climate, fans, covers, locks, media players, vacuums, humidifiers, water heaters, cameras, scenes, automations, and alarms.
- Shows all available non-hidden scenes and automations on the Home view even when they are not assigned to an Area.
- Provides a prominent one-tap **Assist** launcher on the Home view.
- Shows important environmental and safety sensors without dumping every diagnostic sensor into the room.
- Attaches power, energy, current, voltage, and battery readings as secondary information where possible instead of creating extra tiles.
- Suppresses obvious duplicate tiles with the same domain and display name by preferring the available entity.
- Keeps unavailable/unknown entities out of the main grid and places them in a collapsed section at the bottom by default.
- Uses wider responsive tiles, readable secondary text, and wrapped names instead of clipping long entity or device names.
- Provides explicit **System**, **Light**, and **Dark** dashboard variants.
- Excludes disabled, hidden, configuration, diagnostic, and administrative entities by default.
- Allows explicit include/exclude overrides when the automatic result is not what you want.
- Uses no third-party Lovelace card as a runtime dependency.

The interaction model tries to make the obvious tap do the human thing. Lights, switches, fans, and input booleans toggle directly, while scenes run immediately. Automations are treated as things you are likely to inspect or tune: tap the automation card to open Home Assistant's editor, use the dedicated enable/disable switch when you want to pause or resume it, and use the three-dot button for More Info. Other device types still open Home Assistant's More Info dialog rather than guessing a command that could be inappropriate for the device.

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
8. Under **Community dashboards**, choose one of:
   - **HA Roomboard** — follows the Home Assistant/system appearance.
   - **HA Roomboard Light** — fixed high-contrast light palette.
   - **HA Roomboard Dark** — fixed high-contrast dark palette.

No YAML is required for the default setup.

If the strategies do not appear in the Add dashboard dialog, confirm that the HACS resource is present under **Settings → Dashboards → Resources**, then refresh the browser.

## Automatic selection and live refresh

Roomboard treats Home Assistant's Area assignment as the source of truth for room membership. An entity belongs to a room when either:

- the entity itself is assigned to that Area; or
- the entity has no Area override and its parent device belongs to that Area.

The default filter then removes registry entries that are disabled, hidden, configuration-only, or diagnostic. Common administrative domains such as updates, people, trackers, selectors, numbers, and timers are also omitted unless explicitly included.

Roomboard is intentionally selective with sensors. Temperature, humidity, CO₂, illuminance, air-quality, particulate, pressure, VOC, occupancy, motion, door/window, moisture, smoke, gas, safety, and problem sensors are treated as useful room information. Power, energy, battery, current, and voltage are normally shown as secondary metrics attached to the corresponding device.

While a Roomboard view is open, it listens for Home Assistant registry update events and re-runs discovery for that room. A 60-second periodic refresh is also used as a fallback. Newly created or migrated entities in an existing Area can therefore appear without rebuilding the dashboard. New scenes and automations also refresh on the Home view. A completely new Area still needs the dashboard strategy itself to regenerate so Home Assistant can create a new view; reloading the dashboard after such a change is sufficient.

## Scenes and automations

The Home view has dedicated **Scenes** and **Automations** sections. These are global and do not require the entity to be assigned to an Area.

- Tap a scene to run it with `scene.turn_on`.
- Tap the body of an automation card to open Home Assistant's native automation editor. If the entity exposes an automation `id`, Roomboard opens `/config/automation/edit/<id>`; otherwise it falls back to Home Assistant's `/config/automation/show/<entity_id>` page.
- Use the dedicated switch button on the automation card to enable or disable it. This never runs the automation's actions.
- Use the three-dot button for Home Assistant More Info.
- The same interaction model is used for Area-assigned automations inside room views.

An automation is usually something you want to understand before changing. Separating **edit**, **enable/disable**, and **More Info** makes the dashboard faster to read and much harder to mis-tap.

Set `show_scenes: false` or `show_automations: false` if you do not want one of the global sections.

## Assist

The Home view includes a prominent **Assist** launcher. It uses Home Assistant's native dashboard `assist` action rather than directly calling a conversation service.

By default it uses the user's preferred Assist pipeline and starts listening immediately. Advanced configuration can change this:

```yaml
assist_pipeline: preferred
assist_start_listening: true
```

Set `assist_start_listening: false` if you prefer the Assist dialog to open without immediately using the microphone.

## Light and dark variants

HA Roomboard registers three Community dashboard strategies:

- `custom:ha-roomboard` — system/Home Assistant appearance.
- `custom:ha-roomboard-light` — fixed light palette.
- `custom:ha-roomboard-dark` — fixed dark palette.

The Light and Dark variants intentionally define their own background, card, text, muted-text, divider, and accent colors so readability does not depend on the user's Home Assistant theme. Existing HA Roomboard dashboards continue to work unchanged.

Advanced users using the base strategy can also set:

```yaml
appearance: light
```

Accepted values are `system`, `light`, and `dark`.

## Accessibility and readability

Roomboard's fixed Light and Dark palettes are designed around WCAG 2.2 AA normal-text contrast targets. Everyday entity names use 16 px-equivalent text; supporting text and metrics use at least 14 px-equivalent text with increased line-height. Long names wrap instead of being truncated.

Interactive controls use visible keyboard focus outlines and a minimum 44 px touch target where applicable. Reduced-motion preferences are respected. Unavailable devices are no longer faded to the point that their text becomes difficult to read when their collapsed section is opened.

See [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) for the tested palette contrast values and implementation rules.

## Unavailable entities

The default is `unavailable_mode: collapse`. Available entities stay in the normal room grid. Unavailable and unknown entities move below a separator into a collapsed **Unavailable devices** section, so stale entities do not dominate the dashboard but are still inspectable.

Other modes are available:

- `collapse` — default; keep them at the bottom and collapsed.
- `show` — keep them at the bottom, expanded under a separator.
- `hide` — do not render them.

## Room icons

Roomboard first tries to infer a meaningful icon from the Area name, with rules for bedrooms, bathrooms, kitchens, halls/entries, living rooms, outside/gardens/balconies, basements, offices, dining rooms, laundry/utility rooms, garages, attics, storage, workshops, gyms, stairs, media rooms, pools and other common spaces. It then falls back to a pool of neutral room icons. Icons are allocated uniquely within the generated dashboard so the top navigation does not become a row of identical houses.

## Optional strategy configuration

The default dashboard needs no configuration. Advanced users can use these strategy keys:

```yaml
strategy:
  type: custom:ha-roomboard
  title: My Home
  appearance: system
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
  show_scenes: true
  show_automations: true
  unavailable_mode: collapse
  refresh_interval: 60
  deduplicate: true
  assist_pipeline: preferred
  assist_start_listening: true
```

Area selectors accept either the Area ID or the Area name. Entity selectors use the full Home Assistant entity ID.

`include_entities` is an override: it can expose an entity that Roomboard would normally suppress, provided that entity belongs to the generated Area. This is useful for unusual but intentional controls such as IR buttons. `exclude_entities` always wins over automatic discovery and also removes matching scenes/automations from the global Home sections.

`refresh_interval` is the fallback registry refresh interval in seconds and is clamped to a minimum of 30 seconds. Registry events normally trigger an earlier refresh. `deduplicate` defaults to `true`; set it to `false` if you intentionally keep multiple same-named entities of the same domain in one Area.

## Design and legal independence

HA Roomboard is an independent Home Assistant community project. It is not a skin, fork, or redistribution of any commercial smart-home application.

The project does not contain third-party application code, extracted artwork, logos, screenshots, fonts, proprietary icon sets, copied stylesheets, or decompiled resources. Its room navigation, responsive tiles, device grouping, compact controls, scene/automation presentation, and Assist launcher are independently implemented from general interface patterns and Home Assistant APIs.

The HA Roomboard icon is original project artwork and is not derived from Tuya, Smart Life, or Home Assistant branding.

See [docs/LEGAL.md](docs/LEGAL.md) for the contributor rules that keep this separation explicit.

## Development

The distributed plugin is `dist/ha-roomboard.js`. There is intentionally no runtime build chain in the early releases; keeping the shipped module readable makes compatibility debugging easier.

Local validation:

```bash
npm run check
```

GitHub Actions runs both the repository checks and the official HACS validation action.

Architecture details are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Status

The project is still pre-1.0 and is being tested against real, mixed Home Assistant installations. Please report misclassified entities with the entity domain, device class, registry category, and Area assignment; do not post secrets or private Home Assistant URLs.

## License

MIT. See [LICENSE](LICENSE).
