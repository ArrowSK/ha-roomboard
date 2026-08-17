import assert from "node:assert/strict";

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
    this.bubbles = options.bubbles;
    this.composed = options.composed;
  }
}

class FakeElement {
  constructor() {
    this.isConnected = false;
    this.events = [];
  }

  attachShadow() {
    this.shadowRoot = {
      innerHTML: "",
      querySelectorAll: () => [],
      querySelector: () => null,
    };
    return this.shadowRoot;
  }

  dispatchEvent(event) {
    this.events.push(event);
    return true;
  }
}

globalThis.CustomEvent = FakeCustomEvent;
globalThis.HTMLElement = FakeElement;
const customElementRegistry = new Map();
globalThis.customElements = {
  get: (name) => customElementRegistry.get(name),
  define: (name, klass) => customElementRegistry.set(name, klass),
};
globalThis.window = {
  customStrategies: [],
  customCards: [],
  location: { pathname: "/roomboard/bedroom" },
};

await import("../dist/ha-roomboard.js");

const Strategy = customElements.get("ll-strategy-dashboard-ha-roomboard");
const LightStrategy = customElements.get("ll-strategy-dashboard-ha-roomboard-light");
const DarkStrategy = customElements.get("ll-strategy-dashboard-ha-roomboard-dark");
const RoomCard = customElements.get("ha-roomboard-room");
const OverviewCard = customElements.get("ha-roomboard-overview");

assert.ok(Strategy, "dashboard strategy must register");
assert.ok(LightStrategy, "light dashboard strategy must register");
assert.ok(DarkStrategy, "dark dashboard strategy must register");
assert.ok(RoomCard, "room card must register");
assert.ok(OverviewCard, "overview card must register");

const areas = [
  { area_id: "basement", name: "Basement" },
  { area_id: "bathroom", name: "Bathroom" },
  { area_id: "bedroom", name: "Bedroom" },
  { area_id: "hall", name: "Hall" },
  { area_id: "kitchen", name: "Kitchen" },
  { area_id: "main_room", name: "Main Room" },
  { area_id: "outside_main_room", name: "Outside Main Room" },
];

const devices = areas.map((area, index) => ({
  id: `area_device_${index}`,
  area_id: area.area_id,
  name: `${area.name} Device`,
}));
devices.push(
  { id: "bedside_live", area_id: "bedroom", name: "Artem Nightstand" },
  { id: "bedside_old", area_id: "bedroom", name: "Artem Nightstand old" },
  { id: "bedroom_climate", area_id: "bedroom", name: "Bedroom Climate" },
  { id: "bedroom_adaptive", area_id: "bedroom", name: "Bedroom Adaptive Lighting" },
);

let entities = areas.map((area, index) => ({
  entity_id: `switch.room_${index}`,
  device_id: `area_device_${index}`,
  name: `${area.name} Dummy`,
}));
entities = entities.concat([
  { entity_id: "light.artem_nightstand", device_id: "bedside_live" },
  { entity_id: "light.artem_nightstand_old", device_id: "bedside_old", name: "Artem Nightstand" },
  { entity_id: "sensor.bedroom_temperature", device_id: "bedroom_climate" },
  { entity_id: "sensor.bedroom_humidity", device_id: "bedroom_climate" },
  { entity_id: "automation.bedroom_night_mode", area_id: "bedroom", name: "Bedroom Night Mode" },
  { entity_id: "switch.adaptive_lighting_bedroom", device_id: "bedroom_adaptive", name: "Adaptive Lighting Bedroom" },
  { entity_id: "scene.good_night", name: "Good Night" },
  { entity_id: "automation.hall_lights", name: "Hall Lights" },
]);

const states = Object.fromEntries(
  areas.map((area, index) => [
    `switch.room_${index}`,
    { state: "off", attributes: { friendly_name: `${area.name} Dummy` } },
  ]),
);
Object.assign(states, {
  "light.artem_nightstand": {
    state: "off",
    attributes: { friendly_name: "Artem Nightstand" },
  },
  "light.artem_nightstand_old": {
    state: "unavailable",
    attributes: { friendly_name: "Artem Nightstand" },
  },
  "sensor.bedroom_temperature": {
    state: "23.4",
    attributes: {
      friendly_name: "Bedroom Temperature",
      device_class: "temperature",
      unit_of_measurement: "°C",
    },
  },
  "sensor.bedroom_humidity": {
    state: "unavailable",
    attributes: {
      friendly_name: "Bedroom Humidity",
      device_class: "humidity",
      unit_of_measurement: "%",
    },
  },
  "automation.bedroom_night_mode": {
    state: "on",
    attributes: { friendly_name: "Bedroom Night Mode" },
  },
  "switch.adaptive_lighting_bedroom": {
    state: "on",
    attributes: { friendly_name: "Adaptive Lighting Bedroom" },
  },
  "scene.good_night": {
    state: "2026-08-16T12:00:00+00:00",
    attributes: { friendly_name: "Good Night" },
  },
  "automation.hall_lights": {
    state: "on",
    attributes: { friendly_name: "Hall Lights", id: "hall-lights-automation" },
  },
});

const serviceCalls = [];
const hass = {
  states,
  config: { location_name: "Test Home" },
  callWS: async ({ type }) => {
    if (type === "config/area_registry/list") return areas;
    if (type === "config/device_registry/list") return devices;
    if (type === "config/entity_registry/list") return entities;
    throw new Error(`Unexpected websocket request ${type}`);
  },
  callService: async (...args) => {
    serviceCalls.push(args);
  },
};

const dashboard = await Strategy.generate({}, hass);
const icons = Object.fromEntries(dashboard.views.map((view) => [view.title, view.icon]));
assert.equal(icons.Basement, "mdi:home-floor-b");
assert.equal(icons.Bathroom, "mdi:shower");
assert.equal(icons.Bedroom, "mdi:bed-king-outline");
assert.equal(icons.Hall, "mdi:door-open");
assert.equal(icons.Kitchen, "mdi:chef-hat");
assert.equal(icons["Main Room"], "mdi:sofa-outline");
assert.equal(icons["Outside Main Room"], "mdi:tree-outline");
assert.equal(new Set(Object.values(icons)).size, Object.values(icons).length, "all view icons must be unique");

const bedroomView = dashboard.views.find((view) => view.path === "bedroom");
assert.ok(bedroomView, "bedroom view must be generated");
const bedroomConfig = bedroomView.cards[0];
const bedroomEntities = bedroomConfig.room.items.map((item) => item.entity_id);
assert.ok(bedroomEntities.includes("light.artem_nightstand"));
assert.ok(!bedroomEntities.includes("light.artem_nightstand_old"), "available duplicate should win");
assert.ok(
  bedroomEntities.includes("automation.bedroom_night_mode"),
  "area-assigned automations should appear as normal room tiles",
);
assert.ok(
  !bedroomEntities.includes("switch.adaptive_lighting_bedroom"),
  "Adaptive Lighting management switches must not appear as ordinary room device controls",
);
assert.ok(
  bedroomConfig.room.management_items.some((item) => item.entity_id === "switch.adaptive_lighting_bedroom"),
  "Adaptive Lighting management switches should remain available in the advanced controls section",
);

const overviewConfig = dashboard.views.find((view) => view.path === "home").cards[0];
assert.ok(
  overviewConfig.global_actions.some((item) => item.entity_id === "scene.good_night"),
  "global scenes should be discovered",
);
assert.ok(
  overviewConfig.global_actions.some((item) => item.entity_id === "automation.hall_lights"),
  "global automations should be discovered",
);

const lightDashboard = await LightStrategy.generate({}, hass);
const darkDashboard = await DarkStrategy.generate({}, hass);
assert.equal(lightDashboard.views[0].cards[0].appearance, "light");
assert.equal(darkDashboard.views[0].cards[0].appearance, "dark");

const roomCard = new RoomCard();
roomCard.setConfig(bedroomConfig);
roomCard.hass = hass;
assert.match(roomCard.shadowRoot.innerHTML, /Unavailable devices/);
assert.match(roomCard.shadowRoot.innerHTML, /Bedroom Humidity/);
assert.doesNotMatch(
  roomCard.shadowRoot.innerHTML,
  /<strong>Humidity:<\/strong>/,
  "unavailable humidity must not be promoted into the room summary",
);
assert.match(roomCard.shadowRoot.innerHTML, /font-size: 0\.875rem/);
assert.match(roomCard.shadowRoot.innerHTML, /focus-visible/);
assert.match(roomCard.shadowRoot.innerHTML, /min-height: 44px/);
assert.match(roomCard.shadowRoot.innerHTML, /Lighting automation controls/);
assert.match(roomCard.shadowRoot.innerHTML, /overscroll-behavior-x: contain/);
assert.match(roomCard.shadowRoot.innerHTML, /width: 52px/);
assert.match(roomCard.shadowRoot.innerHTML, /mdi:dots-horizontal/);
assert.doesNotMatch(roomCard.shadowRoot.innerHTML, /translateY\(/);
assert.match(
  roomCard.shadowRoot.innerHTML,
  /href="\/config\/automation\/show\/automation\.bedroom_night_mode"/,
  "room automation without an id should open the Home Assistant fallback configuration page",
);
assert.match(roomCard.shadowRoot.innerHTML, /data-automation-toggle="automation\.bedroom_night_mode"/);

const hiddenCard = new RoomCard();
hiddenCard.setConfig({ ...bedroomConfig, unavailable_mode: "hide" });
hiddenCard.hass = hass;
assert.doesNotMatch(hiddenCard.shadowRoot.innerHTML, /Unavailable devices/);
assert.doesNotMatch(hiddenCard.shadowRoot.innerHTML, /Bedroom Humidity/);

const overviewCard = new OverviewCard();
overviewCard.setConfig(overviewConfig);
overviewCard.hass = hass;
assert.match(overviewCard.shadowRoot.innerHTML, />Assist</);
assert.match(overviewCard.shadowRoot.innerHTML, />Scenes</);
assert.match(overviewCard.shadowRoot.innerHTML, />Automations</);
assert.match(overviewCard.shadowRoot.innerHTML, /Good Night/);
assert.match(overviewCard.shadowRoot.innerHTML, /Hall Lights/);
assert.match(
  overviewCard.shadowRoot.innerHTML,
  /href="\/config\/automation\/edit\/hall-lights-automation"/,
  "automation cards should open the native Home Assistant editor when attributes.id is available",
);
assert.match(overviewCard.shadowRoot.innerHTML, /data-automation-toggle="automation\.hall_lights"/);

overviewCard.launchAssist();
const assistEvent = overviewCard.events.at(-1);
assert.equal(assistEvent.type, "hass-action");
assert.equal(assistEvent.detail.config.tap_action.action, "assist");
assert.equal(assistEvent.detail.config.tap_action.pipeline_id, "preferred");
assert.equal(assistEvent.detail.config.tap_action.start_listening, true);

await overviewCard.activateGlobalAction("scene.good_night");
await overviewCard.activateGlobalAction("automation.hall_lights");
assert.deepEqual(serviceCalls.at(-2), ["scene", "turn_on", { entity_id: "scene.good_night" }]);
assert.deepEqual(serviceCalls.at(-1), ["automation", "turn_off", { entity_id: "automation.hall_lights" }]);
states["automation.hall_lights"].state = "off";
await overviewCard.toggleAutomationEnabled("automation.hall_lights");
assert.deepEqual(serviceCalls.at(-1), ["automation", "turn_on", { entity_id: "automation.hall_lights" }]);
states["automation.hall_lights"].state = "on";

entities = entities.concat([
  { entity_id: "switch.bedroom_new_device", device_id: "area_device_2", name: "New Bedroom Device" },
]);
states["switch.bedroom_new_device"] = {
  state: "on",
  attributes: { friendly_name: "New Bedroom Device" },
};
await roomCard.refreshDiscovery();
assert.ok(
  roomCard._config.room.items.some((item) => item.entity_id === "switch.bedroom_new_device"),
  "live discovery must pick up a newly added entity in an existing Area",
);

entities = entities.concat([
  { entity_id: "scene.movie_time", name: "Movie Time" },
]);
states["scene.movie_time"] = {
  state: "2026-08-16T13:00:00+00:00",
  attributes: { friendly_name: "Movie Time" },
};
await overviewCard.refreshDiscovery();
assert.ok(
  overviewCard._config.global_actions.some((item) => item.entity_id === "scene.movie_time"),
  "live discovery must pick up newly added scenes",
);

console.log("HA Roomboard behavior tests passed");
