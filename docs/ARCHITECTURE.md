# Architecture

HA Roomboard is a frontend-only Home Assistant dashboard element distributed through HACS.

The shipped JavaScript module registers:

- a dashboard strategy (`custom:ha-roomboard`) that discovers Home Assistant areas, devices, and entities through the supported WebSocket registry APIs;
- a room card (`custom:ha-roomboard-room`) that renders live state and controls for one area;
- an overview card (`custom:ha-roomboard-overview`) that summarizes all generated rooms.

The strategy deliberately keeps generation and presentation separate. Registry data is used at dashboard-generation time to determine room membership and suppress configuration/diagnostic noise. Live state always comes from `hass.states` in the cards.

## Automatic selection

An entity is considered for a room when it is assigned directly to the area, or when its device belongs to the area and the entity has no explicit area override. Disabled and hidden registry entities are excluded. Configuration and diagnostic entities are excluded by default. Domains that are primarily administrative rather than useful for room control are excluded by default.

Users can override the automatic result with `include_entities`, `exclude_entities`, `include_areas`, `exclude_areas`, and `room_order` in the strategy configuration.

## Interaction model

Roomboard keeps direct actions conservative. Lights, switches, input booleans, and fans can be toggled from the tile. Buttons can be pressed only when explicitly included. Other domains open Home Assistant's standard More Info dialog rather than guessing a potentially unsafe command.

## Dependency policy

The runtime has no dependency on third-party Lovelace cards or on private Home Assistant frontend internals. It uses standard custom-element APIs, Home Assistant's documented strategy interface, documented registry WebSocket calls, and `hass.callService`.
