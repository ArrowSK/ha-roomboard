import assert from "node:assert/strict";

class FakeElement {
  constructor() {
    this.isConnected = false;
  }

  attachShadow() {
    this.shadowRoot = {
      innerHTML: "",
      querySelectorAll: () => [],
      querySelector: () => null,
    };
    return this.shadowRoot;
  }

  dispatchEvent() {}
}

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
const RoomCard = customElements.get("ha-roomboard-room");
assert.ok(Strategy, "dashboard strategy must register");
assert.ok(RoomCard, "room card must register");

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
});

const hass = {
  states,
  config: { location_name: "Test Home" },
  callWS: async ({ type }) => {
    if (type === "config/area_registry/list") return areas;
    if (type === "config/device_registry/list") return devices;
    if (type === "config/entity_registry/list") return entities;
    throw new Error(`Unexpected websocket request ${type}`);
  },
  callService: async () => {},
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

const hiddenCard = new RoomCard();
hiddenCard.setConfig({ ...bedroomConfig, unavailable_mode: "hide" });
hiddenCard.hass = hass;
assert.doesNotMatch(hiddenCard.shadowRoot.innerHTML, /Unavailable devices/);
assert.doesNotMatch(hiddenCard.shadowRoot.innerHTML, /Bedroom Humidity/);

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

console.log("HA Roomboard behavior tests passed");
