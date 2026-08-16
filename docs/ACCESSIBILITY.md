# Accessibility

HA Roomboard treats readability as a functional requirement rather than a cosmetic option.

## Fixed palette contrast

The explicit Light and Dark dashboard variants use fixed colors so normal text contrast does not depend on a third-party Home Assistant theme.

### Light

- Background: `#f5f7fa`
- Card surface: `#ffffff`
- Primary text: `#1f2428`
- Secondary text: `#4b5560`
- Accent: `#006d83`

Approximate WCAG contrast ratios:

- Primary text on white card: **15.7:1**
- Secondary text on white card: **7.6:1**
- Accent on white card: **6.0:1**

### Dark

- Background: `#101316`
- Card surface: `#1a1f24`
- Primary text: `#f4f7f9`
- Secondary text: `#b9c3ca`
- Accent: `#21b7d0`

Approximate WCAG contrast ratios:

- Primary text on dark card: **15.4:1**
- Secondary text on dark card: **9.3:1**
- Accent on dark background: **7.8:1**

These values exceed the WCAG 2.2 AA 4.5:1 normal-text target for the listed foreground/background combinations.

## Typography

- Base UI text: 16 px-equivalent.
- Supporting text and metrics: at least 14 px-equivalent.
- Entity names: 16 px-equivalent with a line-height of at least 1.35.
- Long entity and device names wrap and are not ellipsized.
- Browser text scaling is not disabled.

## Interaction

- Interactive controls use visible `:focus-visible` outlines.
- Primary navigation and compact action buttons use a 44 px minimum interactive target where applicable.
- Reduced-motion preferences disable non-essential animation/transition effects.
- Unavailable entities are separated and collapsed by default; when expanded they retain substantially higher opacity than the initial beta.

## System appearance

The default **HA Roomboard** strategy follows Home Assistant theme variables for backwards compatibility. Because arbitrary themes can choose arbitrary text/background colors, Roomboard cannot guarantee the same contrast ratios in System mode.

Use **HA Roomboard Light** or **HA Roomboard Dark** when predictable contrast is important.
