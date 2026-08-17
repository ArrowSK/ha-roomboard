const ROOMBOARD_VERSION = "0.4.0";
const STRATEGY_TYPE = "ha-roomboard";
const LIGHT_STRATEGY_TYPE = "ha-roomboard-light";
const DARK_STRATEGY_TYPE = "ha-roomboard-dark";
const DEFAULT_REFRESH_SECONDS = 60;

const PRIMARY_DOMAINS = new Set([
  "light",
  "switch",
  "climate",
  "fan",
  "cover",
  "lock",
  "media_player",
  "vacuum",
  "humidifier",
  "water_heater",
  "alarm_control_panel",
  "scene",
  "automation",
  "input_boolean",
  "camera",
]);

const DIRECT_TOGGLE_DOMAINS = new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
]);

const IMPORTANT_SENSOR_CLASSES = new Set([
  "temperature",
  "humidity",
  "carbon_dioxide",
  "illuminance",
  "aqi",
  "pm1",
  "pm10",
  "pm25",
  "pressure",
  "volatile_organic_compounds",
  "volatile_organic_compounds_parts",
]);

const IMPORTANT_BINARY_CLASSES = new Set([
  "occupancy",
  "motion",
  "door",
  "window",
  "opening",
  "moisture",
  "smoke",
  "gas",
  "safety",
  "problem",
]);

const SECONDARY_SENSOR_CLASSES = new Set([
  "power",
  "energy",
  "battery",
  "current",
  "voltage",
]);

const ALWAYS_EXCLUDED_DOMAINS = new Set([
  "calendar",
  "conversation",
  "device_tracker",
  "event",
  "image",
  "notify",
  "number",
  "person",
  "select",
  "sun",
  "text",
  "time",
  "timer",
  "update",
  "zone",
]);

const ROOM_ICON_RULES = [
  { terms: ["basement", "cellar", "pince", "suterén", "souterrain"], icons: ["mdi:home-floor-b", "mdi:stairs-down"] },
  { terms: ["bathroom", "bath", "shower", "wc", "toilet", "fürdő", "badezimmer"], icons: ["mdi:shower", "mdi:bathtub-outline"] },
  { terms: ["bedroom", "bed room", "master", "guest room", "nursery", "kids room", "gyerekszoba", "hálószoba"], icons: ["mdi:bed-king-outline", "mdi:bed-single-outline", "mdi:bed-double-outline"] },
  { terms: ["kitchen", "konyha", "küche"], icons: ["mdi:chef-hat", "mdi:stove"] },
  { terms: ["hall", "hallway", "corridor", "entry", "entrance", "foyer", "előszoba", "flur"], icons: ["mdi:door-open", "mdi:door"] },
  { terms: ["outside", "outdoor", "garden", "yard", "patio", "terrace", "balcony", "kert", "erkély", "garten"], icons: ["mdi:tree-outline", "mdi:flower-outline", "mdi:balcony"] },
  { terms: ["living", "main room", "lounge", "family room", "salon", "nappali", "wohnzimmer"], icons: ["mdi:sofa-outline", "mdi:sofa-single-outline"] },
  { terms: ["office", "study", "dolgozó", "büro"], icons: ["mdi:desk", "mdi:laptop"] },
  { terms: ["dining", "étkező", "esszimmer"], icons: ["mdi:table-chair", "mdi:silverware-fork-knife"] },
  { terms: ["laundry", "utility", "mosókonyha", "hauswirtschaft"], icons: ["mdi:washing-machine", "mdi:tumble-dryer"] },
  { terms: ["garage", "garázs"], icons: ["mdi:garage", "mdi:car"] },
  { terms: ["attic", "loft", "padlás", "dachboden"], icons: ["mdi:home-roof", "mdi:stairs-up"] },
  { terms: ["closet", "wardrobe", "dressing", "gardrób"], icons: ["mdi:wardrobe-outline", "mdi:hanger"] },
  { terms: ["gym", "fitness"], icons: ["mdi:dumbbell", "mdi:weight-lifter"] },
  { terms: ["workshop", "műhely"], icons: ["mdi:tools", "mdi:hammer-wrench"] },
  { terms: ["server", "network", "rack"], icons: ["mdi:server-network", "mdi:lan"] },
  { terms: ["storage", "storeroom", "kamra"], icons: ["mdi:archive-outline", "mdi:package-variant-closed"] },
  { terms: ["stairs", "staircase", "lépcső"], icons: ["mdi:stairs", "mdi:stairs-box"] },
  { terms: ["cinema", "theater", "media room"], icons: ["mdi:theater", "mdi:movie-open-outline"] },
  { terms: ["bar"], icons: ["mdi:glass-cocktail", "mdi:glass-wine"] },
  { terms: ["pool", "swimming"], icons: ["mdi:pool", "mdi:waves"] },
  { terms: ["greenhouse"], icons: ["mdi:greenhouse", "mdi:sprout"] },
  { terms: ["porch", "veranda"], icons: ["mdi:door", "mdi:home-variant-outline"] },
];

const FALLBACK_ROOM_ICONS = [
  "mdi:floor-plan",
  "mdi:home-floor-1",
  "mdi:home-floor-2",
  "mdi:home-floor-3",
  "mdi:door",
  "mdi:window-open-variant",
  "mdi:lamp-outline",
  "mdi:lightbulb-group-outline",
  "mdi:chair-rolling",
  "mdi:table-furniture",
  "mdi:bookshelf",
  "mdi:television-classic",
  "mdi:music-note-outline",
  "mdi:leaf",
  "mdi:weather-sunny",
  "mdi:shield-home-outline",
  "mdi:home-thermometer-outline",
  "mdi:fan",
  "mdi:water-outline",
  "mdi:power-socket-eu",
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSet(value) {
  return new Set(asArray(value).map((item) => String(item).trim()).filter(Boolean));
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function domainOf(entityId) {
  return String(entityId || "").split(".", 1)[0];
}

function slugify(value) {
  return normalizeKey(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "room";
}

function uniquePaths(areas) {
  const used = new Set(["home"]);
  return areas.map((area) => {
    const base = slugify(area.name || area.area_id);
    let path = base;
    let n = 2;
    while (used.has(path)) path = `${base}-${n++}`;
    used.add(path);
    return { ...area, path };
  });
}

function matchesArea(area, selectors) {
  if (!selectors.size) return false;
  const id = normalizeKey(area.area_id);
  const name = normalizeKey(area.name);
  for (const selector of selectors) {
    const key = normalizeKey(selector);
    if (key === id || key === name) return true;
  }
  return false;
}

function friendlyName(registryEntry, stateObj, device) {
  return (
    registryEntry?.name ||
    stateObj?.attributes?.friendly_name ||
    registryEntry?.original_name ||
    device?.name_by_user ||
    device?.name ||
    registryEntry?.entity_id ||
    "Entity"
  );
}

function deviceName(device) {
  return device?.name_by_user || device?.name || "";
}

function stateDeviceClass(stateObj) {
  return stateObj?.attributes?.device_class || "";
}

function stateUnit(stateObj) {
  return stateObj?.attributes?.unit_of_measurement || "";
}

function isUnavailableState(stateObj) {
  return !stateObj || stateObj.state === "unavailable" || stateObj.state === "unknown";
}

function isExplicitlyIncluded(entityId, includeEntities) {
  return includeEntities.has(entityId);
}

function isAdaptiveLightingManagementEntity(entityId) {
  return String(entityId || "").startsWith("switch.adaptive_lighting_");
}

function isCandidateEntity(entry, stateObj, includeEntities, excludeEntities) {
  const entityId = entry.entity_id;
  if (!entityId || excludeEntities.has(entityId)) return false;
  if (isExplicitlyIncluded(entityId, includeEntities)) return true;
  if (isAdaptiveLightingManagementEntity(entityId)) return false;
  if (entry.disabled_by || entry.hidden_by) return false;
  if (entry.entity_category === "config" || entry.entity_category === "diagnostic") return false;
  if (!stateObj) return false;

  const domain = domainOf(entityId);
  if (PRIMARY_DOMAINS.has(domain)) return true;
  if (ALWAYS_EXCLUDED_DOMAINS.has(domain)) return false;

  const deviceClass = stateDeviceClass(stateObj);
  if (domain === "sensor") return IMPORTANT_SENSOR_CLASSES.has(deviceClass);
  if (domain === "binary_sensor") return IMPORTANT_BINARY_CLASSES.has(deviceClass);
  return false;
}

function isSecondary(entry, stateObj) {
  if (!stateObj || domainOf(entry.entity_id) !== "sensor") return false;
  const deviceClass = stateDeviceClass(stateObj);
  if (SECONDARY_SENSOR_CLASSES.has(deviceClass)) return true;
  const unit = stateUnit(stateObj);
  return unit === "W" || unit === "kW" || unit === "kWh" || unit === "%";
}

function categoryRank(item) {
  const ranks = {
    light: 10,
    switch: 20,
    climate: 30,
    fan: 40,
    cover: 50,
    lock: 60,
    humidifier: 70,
    water_heater: 80,
    media_player: 90,
    vacuum: 100,
    camera: 110,
    alarm_control_panel: 120,
    scene: 130,
    automation: 135,
    input_boolean: 140,
    binary_sensor: 200,
    sensor: 210,
    button: 300,
  };
  return ranks[domainOf(item.entity_id)] ?? 500;
}

function inferIconCandidates(area) {
  const name = normalizeKey(`${area.name || ""} ${area.area_id || ""}`);
  const candidates = [];
  if (area.icon) candidates.push(area.icon);
  for (const rule of ROOM_ICON_RULES) {
    if (rule.terms.some((term) => name.includes(term))) candidates.push(...rule.icons);
  }
  candidates.push(...FALLBACK_ROOM_ICONS);
  return [...new Set(candidates.filter(Boolean))];
}

function assignUniqueAreaIcons(areas) {
  const used = new Set(["mdi:home-outline"]);
  return areas.map((area) => {
    const icon = inferIconCandidates(area).find((candidate) => !used.has(candidate)) || "mdi:map-marker-outline";
    used.add(icon);
    return { ...area, icon };
  });
}

function deduplicateItems(items, hass) {
  const groups = new Map();
  for (const item of items) {
    const key = `${item.domain}|${normalizeKey(item.name)}`;
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }

  const result = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    group.sort((a, b) => {
      const explicitDelta = Number(Boolean(b.explicit)) - Number(Boolean(a.explicit));
      if (explicitDelta) return explicitDelta;
      const availableDelta =
        Number(!isUnavailableState(hass.states[b.entity_id])) -
        Number(!isUnavailableState(hass.states[a.entity_id]));
      if (availableDelta) return availableDelta;
      return a.entity_id.localeCompare(b.entity_id);
    });
    result.push(group[0]);
  }
  return result;
}

function buildRoom(area, devices, entities, hass, options) {
  const areaDeviceIds = new Set(
    devices.filter((device) => device.area_id === area.area_id).map((device) => device.id),
  );
  const deviceMap = new Map(devices.map((device) => [device.id, device]));
  const roomEntries = entities.filter((entry) => {
    const inherited = !entry.area_id && entry.device_id && areaDeviceIds.has(entry.device_id);
    return entry.area_id === area.area_id || inherited;
  });

  const secondaryByDevice = new Map();
  for (const entry of roomEntries) {
    const stateObj = hass.states[entry.entity_id];
    if (!entry.device_id || !isSecondary(entry, stateObj)) continue;
    if (entry.disabled_by || entry.hidden_by || entry.entity_category === "config") continue;
    const list = secondaryByDevice.get(entry.device_id) || [];
    list.push({
      entity_id: entry.entity_id,
      name: friendlyName(entry, stateObj, deviceMap.get(entry.device_id)),
      device_class: stateDeviceClass(stateObj),
    });
    secondaryByDevice.set(entry.device_id, list);
  }

  const managementItems = [];
  for (const entry of roomEntries) {
    const stateObj = hass.states[entry.entity_id];
    if (!isAdaptiveLightingManagementEntity(entry.entity_id)) continue;
    if (isExplicitlyIncluded(entry.entity_id, options.includeEntities)) continue;
    if (options.excludeEntities.has(entry.entity_id)) continue;
    if (entry.disabled_by || entry.hidden_by) continue;
    if (entry.entity_category === "config" || entry.entity_category === "diagnostic") continue;
    if (!stateObj) continue;
    const device = deviceMap.get(entry.device_id);
    managementItems.push({
      entity_id: entry.entity_id,
      name: friendlyName(entry, stateObj, device),
      device_name: deviceName(device),
      domain: domainOf(entry.entity_id),
      device_class: stateDeviceClass(stateObj),
      explicit: false,
      secondary: [],
    });
  }
  managementItems.sort((a, b) => a.name.localeCompare(b.name));

  let items = [];
  for (const entry of roomEntries) {
    const stateObj = hass.states[entry.entity_id];
    if (!isCandidateEntity(entry, stateObj, options.includeEntities, options.excludeEntities)) continue;
    const device = deviceMap.get(entry.device_id);
    items.push({
      entity_id: entry.entity_id,
      name: friendlyName(entry, stateObj, device),
      device_name: deviceName(device),
      domain: domainOf(entry.entity_id),
      device_class: stateDeviceClass(stateObj),
      explicit: isExplicitlyIncluded(entry.entity_id, options.includeEntities),
      secondary: (secondaryByDevice.get(entry.device_id) || [])
        .filter((secondary) => secondary.entity_id !== entry.entity_id)
        .slice(0, 3),
    });
  }

  for (const entityId of options.includeEntities) {
    if (items.some((item) => item.entity_id === entityId)) continue;
    const entry = entities.find((candidate) => candidate.entity_id === entityId);
    if (!entry) continue;
    const inherited = !entry.area_id && entry.device_id && areaDeviceIds.has(entry.device_id);
    if (entry.area_id !== area.area_id && !inherited) continue;
    const stateObj = hass.states[entityId];
    const device = deviceMap.get(entry.device_id);
    items.push({
      entity_id: entityId,
      name: friendlyName(entry, stateObj, device),
      device_name: deviceName(device),
      domain: domainOf(entityId),
      device_class: stateDeviceClass(stateObj),
      explicit: true,
      secondary: (secondaryByDevice.get(entry.device_id) || []).slice(0, 3),
    });
  }

  if (options.deduplicate !== false) items = deduplicateItems(items, hass);
  items.sort((a, b) => categoryRank(a) - categoryRank(b) || a.name.localeCompare(b.name));

  const summaryCandidates = {
    temperature: items.filter((item) => item.device_class === "temperature").map((item) => item.entity_id),
    humidity: items.filter((item) => item.device_class === "humidity").map((item) => item.entity_id),
    carbon_dioxide: items.filter((item) => item.device_class === "carbon_dioxide").map((item) => item.entity_id),
    occupancy: items
      .filter((item) => item.device_class === "occupancy" || item.device_class === "motion")
      .map((item) => item.entity_id),
  };

  return {
    area_id: area.area_id,
    title: area.name,
    icon: area.icon,
    path: area.path,
    items,
    management_items: managementItems,
    summary_candidates: summaryCandidates,
  };
}

function buildGlobalActions(entities, hass, options) {
  const result = [];
  for (const entry of entities) {
    const entityId = entry.entity_id;
    const domain = domainOf(entityId);
    if (domain !== "scene" && domain !== "automation") continue;
    if (options.excludeEntities.has(entityId)) continue;
    if (entry.disabled_by || entry.hidden_by) continue;
    if (entry.entity_category === "config" || entry.entity_category === "diagnostic") continue;
    const stateObj = hass.states[entityId];
    if (!stateObj) continue;
    if (domain === "scene" && options.showScenes === false) continue;
    if (domain === "automation" && options.showAutomations === false) continue;
    result.push({
      entity_id: entityId,
      name: friendlyName(entry, stateObj),
      domain,
      icon: entityIcon(stateObj, domain),
    });
  }
  result.sort((a, b) => {
    if (a.domain !== b.domain) return a.domain === "scene" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return result;
}

function discoveryConfig(config = {}) {
  return {
    include_areas: asArray(config.include_areas),
    exclude_areas: asArray(config.exclude_areas),
    include_entities: asArray(config.include_entities),
    exclude_entities: asArray(config.exclude_entities),
    room_order: asArray(config.room_order),
    show_empty_areas: config.show_empty_areas === true,
    deduplicate: config.deduplicate !== false,
    show_scenes: config.show_scenes !== false,
    show_automations: config.show_automations !== false,
  };
}

async function discoverDashboard(config, hass) {
  const [rawAreas, devices, entities] = await Promise.all([
    hass.callWS({ type: "config/area_registry/list" }),
    hass.callWS({ type: "config/device_registry/list" }),
    hass.callWS({ type: "config/entity_registry/list" }),
  ]);

  const includeAreas = normalizeSet(config.include_areas);
  const excludeAreas = normalizeSet(config.exclude_areas);
  const includeEntities = normalizeSet(config.include_entities);
  const excludeEntities = normalizeSet(config.exclude_entities);
  const roomOrder = asArray(config.room_order).map(normalizeKey);

  let areas = rawAreas.filter((area) => {
    if (includeAreas.size && !matchesArea(area, includeAreas)) return false;
    return !matchesArea(area, excludeAreas);
  });

  areas.sort((a, b) => {
    const aKeys = [normalizeKey(a.area_id), normalizeKey(a.name)];
    const bKeys = [normalizeKey(b.area_id), normalizeKey(b.name)];
    const ai = roomOrder.findIndex((key) => aKeys.includes(key));
    const bi = roomOrder.findIndex((key) => bKeys.includes(key));
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      if (ai !== bi) return ai - bi;
    }
    return a.name.localeCompare(b.name);
  });

  areas = assignUniqueAreaIcons(uniquePaths(areas));
  const options = {
    includeEntities,
    excludeEntities,
    deduplicate: config.deduplicate !== false,
  };
  const rooms = areas
    .map((area) => buildRoom(area, devices, entities, hass, options))
    .filter((room) => room.items.length > 0 || config.show_empty_areas === true);

  const globalActions = buildGlobalActions(entities, hass, {
    excludeEntities,
    showScenes: config.show_scenes !== false,
    showAutomations: config.show_automations !== false,
  });

  const nav = [
    { title: "Home", path: "home", icon: "mdi:home-outline" },
    ...rooms.map((room) => ({ title: room.title, path: room.path, icon: room.icon, area_id: room.area_id })),
  ];
  return { rooms, nav, globalActions };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayState(hass, entityId) {
  const stateObj = hass?.states?.[entityId];
  if (!stateObj) return "Unavailable";
  const unit = stateUnit(stateObj);
  const value = stateObj.state;
  return unit ? `${value} ${unit}` : value.replaceAll("_", " ");
}

function displayActionState(hass, item) {
  const stateObj = hass?.states?.[item.entity_id];
  if (isUnavailableState(stateObj)) return "Unavailable";
  if (item.domain === "scene") return "Tap to run";
  if (item.domain === "automation") return stateObj.state === "on" ? "Enabled" : "Disabled";
  return displayState(hass, item.entity_id);
}

function automationEditorPath(hass, entityId) {
  const automationId = hass?.states?.[entityId]?.attributes?.id;
  return automationId
    ? `/config/automation/edit/${encodeURIComponent(automationId)}`
    : `/config/automation/show/${entityId}`;
}

function automationToggleMeta(hass, entityId) {
  const enabled = hass?.states?.[entityId]?.state === "on";
  return {
    enabled,
    service: enabled ? "turn_off" : "turn_on",
    label: enabled ? "Disable automation" : "Enable automation",
    icon: enabled ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline",
  };
}

function isActiveState(stateObj) {
  if (!stateObj) return false;
  return ["on", "open", "opening", "home", "playing", "heat", "cool", "dry", "fan_only"].includes(
    stateObj.state,
  );
}

function entityIcon(stateObj, fallbackDomain) {
  if (stateObj?.attributes?.icon) return stateObj.attributes.icon;
  const iconByDomain = {
    light: "mdi:lightbulb-outline",
    switch: "mdi:toggle-switch-outline",
    climate: "mdi:thermostat",
    fan: "mdi:fan",
    cover: "mdi:window-shutter",
    lock: "mdi:lock-outline",
    media_player: "mdi:speaker",
    vacuum: "mdi:robot-vacuum",
    humidifier: "mdi:air-humidifier",
    water_heater: "mdi:water-boiler",
    alarm_control_panel: "mdi:shield-home-outline",
    scene: "mdi:palette-outline",
    automation: "mdi:robot-outline",
    input_boolean: "mdi:toggle-switch-outline",
    camera: "mdi:cctv",
    sensor: "mdi:gauge",
    binary_sensor: "mdi:radiobox-marked",
    button: "mdi:gesture-tap-button",
  };
  return iconByDomain[fallbackDomain] || "mdi:circle-outline";
}

function dashboardBasePath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return window.location.pathname.replace(/\/$/, "");
  parts.pop();
  return `/${parts.join("/")}`;
}

function bestSummaryEntity(room, key, hass) {
  const candidates = asArray(room.summary_candidates?.[key]);
  return candidates.find((entityId) => !isUnavailableState(hass.states[entityId])) || null;
}

function normalizeAppearance(value) {
  return ["system", "light", "dark"].includes(value) ? value : "system";
}

class HaRoomboardDashboardStrategy extends HTMLElement {
  static noEditor = true;

  static getCreateSuggestions(_hass) {
    return { title: "Rooms", icon: "mdi:floor-plan" };
  }

  static async generate(config, hass) {
    const liveConfig = discoveryConfig(config);
    const { rooms, nav, globalActions } = await discoverDashboard(liveConfig, hass);
    const refreshSeconds = Math.max(30, Number(config.refresh_interval || DEFAULT_REFRESH_SECONDS));
    const unavailableMode = ["collapse", "show", "hide"].includes(config.unavailable_mode)
      ? config.unavailable_mode
      : config.show_unavailable === false
        ? "hide"
        : config.show_unavailable === true
          ? "show"
          : "collapse";
    const appearance = normalizeAppearance(config.appearance);

    const common = {
      nav,
      discovery_config: liveConfig,
      refresh_interval: refreshSeconds,
      unavailable_mode: unavailableMode,
      appearance,
      assist_pipeline: config.assist_pipeline || "preferred",
      assist_start_listening: config.assist_start_listening !== false,
    };

    return {
      title: config.title || "HA Roomboard",
      views: [
        {
          title: "Home",
          path: "home",
          icon: "mdi:home-outline",
          type: "panel",
          cards: [
            {
              type: "custom:ha-roomboard-overview",
              title: config.title || hass.config.location_name || "Home",
              rooms,
              global_actions: globalActions,
              ...common,
            },
          ],
        },
        ...rooms.map((room) => ({
          title: room.title,
          path: room.path,
          icon: room.icon,
          type: "panel",
          cards: [
            {
              type: "custom:ha-roomboard-room",
              room,
              area_id: room.area_id,
              ...common,
            },
          ],
        })),
      ],
    };
  }
}

class HaRoomboardLightDashboardStrategy extends HaRoomboardDashboardStrategy {
  static getCreateSuggestions(_hass) {
    return { title: "Rooms · Light", icon: "mdi:white-balance-sunny" };
  }

  static async generate(config, hass) {
    return super.generate(
      { ...config, appearance: "light", title: config.title || "HA Roomboard Light" },
      hass,
    );
  }
}

class HaRoomboardDarkDashboardStrategy extends HaRoomboardDashboardStrategy {
  static getCreateSuggestions(_hass) {
    return { title: "Rooms · Dark", icon: "mdi:weather-night" };
  }

  static async generate(config, hass) {
    return super.generate(
      { ...config, appearance: "dark", title: config.title || "HA Roomboard Dark" },
      hass,
    );
  }
}

class RoomboardBaseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = undefined;
    this._config = undefined;
    this._refreshTimer = undefined;
    this._refreshing = false;
    this._registryUnsubs = [];
    this._refreshDebounce = undefined;
    this._navScrollLeft = 0;
  }

  set hass(hass) {
    this.captureNavScroll();
    this._hass = hass;
    this.ensureLiveDiscovery();
    this.render();
    this.restoreNavScroll();
  }

  connectedCallback() {
    this.ensureLiveDiscovery();
    this.render();
  }

  disconnectedCallback() {
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    if (this._refreshDebounce) clearTimeout(this._refreshDebounce);
    this._refreshTimer = undefined;
    for (const unsubscribe of this._registryUnsubs) {
      try { unsubscribe(); } catch (_error) {}
    }
    this._registryUnsubs = [];
  }

  getCardSize() {
    return 10;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 6, min_rows: 3 };
  }

  ensureLiveDiscovery() {
    if (!this.isConnected || !this._hass || !this._config) return;
    if (!this._refreshTimer) {
      const seconds = Math.max(30, Number(this._config.refresh_interval || DEFAULT_REFRESH_SECONDS));
      this._refreshTimer = setInterval(() => this.refreshDiscovery(), seconds * 1000);
    }
    if (!this._registryUnsubs.length && this._hass.connection?.subscribeEvents) {
      for (const eventType of ["entity_registry_updated", "device_registry_updated", "area_registry_updated"]) {
        const result = this._hass.connection.subscribeEvents(() => this.scheduleDiscoveryRefresh(), eventType);
        Promise.resolve(result)
          .then((unsubscribe) => {
            if (typeof unsubscribe === "function") this._registryUnsubs.push(unsubscribe);
          })
          .catch(() => {});
      }
    }
  }

  scheduleDiscoveryRefresh() {
    if (this._refreshDebounce) clearTimeout(this._refreshDebounce);
    this._refreshDebounce = setTimeout(() => this.refreshDiscovery(), 750);
  }

  async refreshDiscovery() {
    if (this._refreshing || !this._hass || !this._config?.discovery_config) return;
    this._refreshing = true;
    try {
      const discovery = await discoverDashboard(this._config.discovery_config, this._hass);
      this.captureNavScroll();
      this.applyDiscovery(discovery);
      this.render();
      this.restoreNavScroll();
    } catch (error) {
      console.warn("HA Roomboard live discovery refresh failed", error);
    } finally {
      this._refreshing = false;
    }
  }

  applyDiscovery(_discovery) {}

  captureNavScroll() {
    const nav = this.shadowRoot?.querySelector?.(".nav-scroll");
    if (nav) this._navScrollLeft = nav.scrollLeft || 0;
  }

  restoreNavScroll() {
    const nav = this.shadowRoot?.querySelector?.(".nav-scroll");
    if (!nav) return;
    const maxScrollLeft = Math.max(0, (nav.scrollWidth || 0) - (nav.clientWidth || 0));
    nav.scrollLeft = Math.min(this._navScrollLeft || 0, maxScrollLeft);
    nav.addEventListener(
      "scroll",
      () => { this._navScrollLeft = nav.scrollLeft || 0; },
      { passive: true },
    );
  }

  navHtml(nav, currentPath) {
    const base = dashboardBasePath();
    return `
      <nav class="nav" aria-label="Rooms">
        <div class="nav-scroll">
          ${nav
            .map(
              (item) => `
                <a class="nav-item ${item.path === currentPath ? "selected" : ""}"
                   href="${escapeHtml(`${base}/${item.path}`)}">
                  <ha-icon icon="${escapeHtml(item.icon || "mdi:door")}"></ha-icon>
                  <span>${escapeHtml(item.title)}</span>
                </a>`,
            )
            .join("")}
        </div>
      </nav>`;
  }

  baseStyles() {
    const appearance = normalizeAppearance(this._config?.appearance);
    const palette = appearance === "light"
      ? `
        --primary-background-color: #f5f7fa;
        --card-background-color: #ffffff;
        --primary-text-color: #1f2428;
        --secondary-text-color: #4b5560;
        --divider-color: #d1d7de;
        --primary-color: #006d83;
        color-scheme: light;
      `
      : appearance === "dark"
        ? `
          --primary-background-color: #101316;
          --card-background-color: #1a1f24;
          --primary-text-color: #f4f7f9;
          --secondary-text-color: #b9c3ca;
          --divider-color: #3a424a;
          --primary-color: #21b7d0;
          color-scheme: dark;
        `
        : "";

    return `
      :host {
        ${palette}
        display: block;
        min-height: 100%;
        color: var(--primary-text-color);
        background: var(--primary-background-color);
        box-sizing: border-box;
        font-size: 16px;
        line-height: 1.4;
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }
      * { box-sizing: border-box; }
      button, a { font: inherit; }
      .automation-edit {
        color: inherit;
        text-decoration: none;
      }
      .automation-toggle {
        width: 44px;
        height: 44px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 12px;
        color: var(--secondary-text-color);
        background: transparent;
        cursor: pointer;
      }
      .automation-toggle[aria-pressed="true"] {
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      }
      .automation-toggle:hover {
        background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
      }
      .automation-toggle ha-icon { --mdc-icon-size: 25px; }
      button:focus-visible,
      a:focus-visible,
      summary:focus-visible {
        outline: 3px solid var(--primary-color);
        outline-offset: 3px;
      }
      .shell {
        min-height: 100vh;
        padding: 12px 16px 28px;
        background:
          radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--primary-color) 8%, transparent), transparent 32rem),
          var(--primary-background-color);
      }
      .nav {
        position: sticky;
        top: 0;
        z-index: 20;
        margin: -4px -4px 18px;
        padding: 8px 4px;
        background: color-mix(in srgb, var(--primary-background-color) 92%, transparent);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }
      .nav-scroll {
        display: flex;
        gap: 8px;
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        overscroll-behavior-x: contain;
        scroll-snap-type: none;
        scroll-behavior: auto;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-x pan-y;
        scrollbar-width: none;
        padding: 2px 10px 2px 2px;
      }
      .nav-scroll::-webkit-scrollbar { display: none; }
      .nav-item {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        flex: 0 0 auto;
        min-height: 44px;
        padding: 0 14px;
        border-radius: 14px;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        border: 1px solid color-mix(in srgb, var(--divider-color) 82%, transparent);
        text-decoration: none;
        font-size: 0.9375rem;
        line-height: 1.35;
        font-weight: 650;
      }
      .nav-item.selected {
        color: var(--primary-text-color);
        border-color: color-mix(in srgb, var(--primary-color) 56%, var(--divider-color));
        background: color-mix(in srgb, var(--primary-color) 13%, var(--card-background-color));
      }
      .nav-item ha-icon { --mdc-icon-size: 20px; }
      .header {
        max-width: 1440px;
        margin: 0 auto 18px;
      }
      .eyebrow {
        color: var(--secondary-text-color);
        text-transform: uppercase;
        font-size: 0.875rem;
        line-height: 1.4;
        letter-spacing: 0.07em;
        font-weight: 700;
      }
      h1 {
        margin: 6px 0 8px;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        line-height: 1.1;
      }
      .summary {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        color: var(--secondary-text-color);
      }
      .summary-chip {
        display: inline-flex;
        align-items: center;
        min-height: 34px;
        padding: 0 11px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--card-background-color) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--divider-color) 82%, transparent);
        font-size: 0.875rem;
        line-height: 1.35;
        font-weight: 500;
      }
      @media (max-width: 600px) {
        .shell { padding: 8px 10px 22px; }
        .nav { margin-bottom: 14px; }
        .nav-item { min-height: 44px; padding: 0 12px; }
        .nav-item span { font-size: 0.875rem; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          scroll-behavior: auto !important;
          transition-duration: 0.001ms !important;
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `;
  }

  showMoreInfo(entityId) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      }),
    );
  }

  async toggleAutomationEnabled(entityId) {
    const hass = this._hass;
    if (!hass?.states?.[entityId]) return;
    const meta = automationToggleMeta(hass, entityId);
    try {
      await hass.callService("automation", meta.service, { entity_id: entityId });
    } catch (error) {
      console.error("HA Roomboard automation enable/disable failed", entityId, error);
      this.showMoreInfo(entityId);
    }
  }

  launchAssist() {
    const tapAction = {
      action: "assist",
      pipeline_id: this._config?.assist_pipeline || "preferred",
      start_listening: this._config?.assist_start_listening !== false,
    };
    this.dispatchEvent(
      new CustomEvent("hass-action", {
        bubbles: true,
        composed: true,
        detail: {
          config: { tap_action: tapAction },
          action: "tap",
        },
      }),
    );
  }
}

class HaRoomboardRoomCard extends RoomboardBaseCard {
  constructor() {
    super();
    this._unavailableOpen = false;
    this._advancedOpen = false;
  }

  setConfig(config) {
    if (!config?.room || !Array.isArray(config.nav)) {
      throw new Error("HA Roomboard room card requires room and nav configuration");
    }
    this._config = config;
    this.ensureLiveDiscovery();
    this.render();
  }

  applyDiscovery(discovery) {
    const room = discovery.rooms.find((candidate) => candidate.area_id === this._config.area_id);
    if (room) this._config = { ...this._config, room };
    const knownPaths = new Set(this._config.nav.map((item) => item.path));
    const refreshedNav = discovery.nav.filter((item) => knownPaths.has(item.path));
    if (refreshedNav.length) this._config = { ...this._config, nav: refreshedNav };
  }

  async activate(entityId) {
    const hass = this._hass;
    const stateObj = hass?.states?.[entityId];
    if (!hass || !stateObj) return;
    const domain = domainOf(entityId);

    try {
      if (DIRECT_TOGGLE_DOMAINS.has(domain)) {
        await hass.callService(domain, "toggle", { entity_id: entityId });
        return;
      }
      if (domain === "scene") {
        await hass.callService("scene", "turn_on", { entity_id: entityId });
        return;
      }
      if (domain === "button") {
        await hass.callService("button", "press", { entity_id: entityId });
        return;
      }
      this.showMoreInfo(entityId);
    } catch (error) {
      console.error("HA Roomboard action failed", entityId, error);
      this.showMoreInfo(entityId);
    }
  }

  summaryHtml(room) {
    if (!this._hass) return "";
    const entries = [
      ["temperature", "Temperature"],
      ["humidity", "Humidity"],
      ["carbon_dioxide", "CO₂"],
      ["occupancy", "Presence"],
    ];
    return entries
      .map(([key, label]) => [label, bestSummaryEntity(room, key, this._hass)])
      .filter(([, entityId]) => entityId)
      .map(
        ([label, entityId]) =>
          `<span class="summary-chip"><strong>${escapeHtml(label)}:</strong>&nbsp;${escapeHtml(
            displayState(this._hass, entityId),
          )}</span>`,
      )
      .join("");
  }

  tileHtml(item) {
    const stateObj = this._hass?.states?.[item.entity_id];
    const active = isActiveState(stateObj);
    const unavailable = isUnavailableState(stateObj);
    const icon = entityIcon(stateObj, item.domain);
    const secondary = asArray(item.secondary)
      .map((metric) => {
        const metricState = this._hass?.states?.[metric.entity_id];
        if (isUnavailableState(metricState)) return "";
        return `<span>${escapeHtml(displayState(this._hass, metric.entity_id))}</span>`;
      })
      .filter(Boolean)
      .join("");
    const mainContent = `
          <span class="icon-wrap"><ha-icon icon="${escapeHtml(icon)}"></ha-icon></span>
          <span class="tile-copy">
            <span class="tile-name">${escapeHtml(item.name)}</span>
            <span class="tile-state">${escapeHtml(displayActionState(this._hass, item))}${item.domain === "automation" ? " · tap to edit" : ""}</span>
            ${item.device_name && item.device_name !== item.name ? `<span class="device-name">${escapeHtml(item.device_name)}</span>` : ""}
          </span>`;
    const mainControl = item.domain === "automation"
      ? `<a class="tile-main automation-edit" href="${escapeHtml(automationEditorPath(this._hass, item.entity_id))}" aria-label="Edit ${escapeHtml(item.name)} automation">${mainContent}</a>`
      : `<button class="tile-main" type="button" data-action="activate" data-entity="${escapeHtml(item.entity_id)}">${mainContent}</button>`;
    const automationToggle = item.domain === "automation"
      ? (() => {
          const meta = automationToggleMeta(this._hass, item.entity_id);
          return `<button class="automation-toggle" type="button" data-automation-toggle="${escapeHtml(item.entity_id)}" aria-pressed="${meta.enabled}" aria-label="${escapeHtml(meta.label)}: ${escapeHtml(item.name)}" title="${escapeHtml(meta.label)}"><ha-icon icon="${meta.icon}"></ha-icon></button>`;
        })()
      : "";

    return `
      <article class="tile ${active ? "active" : ""} ${unavailable ? "unavailable" : ""}" data-entity="${escapeHtml(
        item.entity_id,
      )}">
        ${mainControl}
        <div class="tile-footer">
          <div class="metrics">${secondary}</div>
          <div class="tile-actions">
            ${automationToggle}
            <button class="more" type="button" aria-label="More information for ${escapeHtml(item.name)}" data-action="more" data-entity="${escapeHtml(
              item.entity_id,
            )}"><ha-icon icon="mdi:dots-horizontal"></ha-icon></button>
          </div>
        </div>
      </article>`;
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll("button[data-entity]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const target = event.currentTarget;
        const entityId = target.dataset.entity;
        if (target.dataset.action === "more") this.showMoreInfo(entityId);
        else this.activate(entityId);
      });
    });
    this.shadowRoot.querySelectorAll("button[data-automation-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const entityId = event.currentTarget.dataset.automationToggle;
        this.toggleAutomationEnabled(entityId);
      });
    });
    const advanced = this.shadowRoot.querySelector("details.advanced-section");
    if (advanced) {
      advanced.addEventListener("toggle", () => {
        this._advancedOpen = advanced.open;
      });
    }
    const details = this.shadowRoot.querySelector("details.unavailable-section");
    if (details) {
      details.addEventListener("toggle", () => {
        this._unavailableOpen = details.open;
      });
    }
  }

  render() {
    if (!this.shadowRoot || !this._config || !this._hass) return;
    const room = this._config.room;
    const mode = this._config.unavailable_mode || "collapse";
    const availableItems = room.items.filter((item) => !isUnavailableState(this._hass.states[item.entity_id]));
    const unavailableItems = room.items.filter((item) => isUnavailableState(this._hass.states[item.entity_id]));
    const managementItems = asArray(room.management_items).filter((item) => !isUnavailableState(this._hass.states[item.entity_id]));
    const availableTiles = availableItems.map((item) => this.tileHtml(item)).join("");
    const unavailableTiles = unavailableItems.map((item) => this.tileHtml(item)).join("");
    const managementTiles = managementItems.map((item) => this.tileHtml(item)).join("");

    const managementSection = managementItems.length
      ? `<details class="advanced-section" ${this._advancedOpen ? "open" : ""}>
          <summary tabindex="0">
            <span>Lighting automation controls</span>
            <span>${managementItems.length}</span>
          </summary>
          <div class="grid advanced-grid">${managementTiles}</div>
        </details>`
      : "";

    let unavailableSection = "";
    if (unavailableItems.length && mode === "show") {
      unavailableSection = `
        <div class="section-divider"><span>Unavailable</span><span>${unavailableItems.length}</span></div>
        <div class="grid unavailable-grid">${unavailableTiles}</div>`;
    } else if (unavailableItems.length && mode === "collapse") {
      unavailableSection = `
        <details class="unavailable-section" ${this._unavailableOpen ? "open" : ""}>
          <summary tabindex="0">
            <span>Unavailable devices</span>
            <span>${unavailableItems.length}</span>
          </summary>
          <div class="grid unavailable-grid">${unavailableTiles}</div>
        </details>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles()}
        .grid {
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
          align-items: stretch;
        }
        .tile {
          min-height: 184px;
          border-radius: 20px;
          background: var(--card-background-color);
          border: 1px solid color-mix(in srgb, var(--divider-color) 82%, transparent);
          box-shadow: 0 6px 20px color-mix(in srgb, #000 7%, transparent);
          overflow: hidden;
          transition: none;
        }
        .tile.active {
          border-color: color-mix(in srgb, var(--primary-color) 58%, var(--divider-color));
          background: color-mix(in srgb, var(--primary-color) 11%, var(--card-background-color));
        }
        .tile.unavailable { opacity: 0.78; }
        .tile-main {
          width: 100%;
          min-height: 136px;
          display: grid;
          grid-template-columns: 46px minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          padding: 18px 16px 12px;
          border: 0;
          color: inherit;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }
        .icon-wrap {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
        }
        .active .icon-wrap {
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 18%, transparent);
        }
        .icon-wrap ha-icon { --mdc-icon-size: 25px; }
        .tile-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .tile-name {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.35;
          overflow-wrap: anywhere;
          word-break: normal;
          hyphens: auto;
        }
        .tile-state {
          display: block;
          color: var(--secondary-text-color);
          font-size: 0.9375rem;
          line-height: 1.4;
          font-weight: 550;
          text-transform: capitalize;
          overflow-wrap: anywhere;
        }
        .device-name {
          display: block;
          color: var(--secondary-text-color);
          font-size: 0.875rem;
          line-height: 1.4;
          font-weight: 500;
          overflow-wrap: anywhere;
          word-break: normal;
          hyphens: auto;
        }
        .tile-footer {
          min-height: 48px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
          padding: 5px 8px 8px 16px;
        }
        .metrics {
          min-width: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 5px 9px;
          color: var(--secondary-text-color);
          font-size: 0.875rem;
          line-height: 1.35;
          font-weight: 500;
          white-space: normal;
          overflow: visible;
        }
        .metrics span { white-space: nowrap; }
        .tile-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }
        .more {
          width: 52px;
          height: 48px;
          flex: 0 0 auto;
          border: 0;
          border-radius: 12px;
          color: var(--secondary-text-color);
          background: transparent;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
        }
        .more ha-icon { --mdc-icon-size: 27px; }
        .more:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
        .empty {
          max-width: 1440px;
          margin: 0 auto;
          padding: 22px;
          border-radius: 18px;
          background: var(--card-background-color);
          color: var(--secondary-text-color);
          font-size: 0.9375rem;
          line-height: 1.5;
        }
        .section-divider,
        .advanced-section,
        .unavailable-section {
          max-width: 1440px;
          margin: 24px auto 12px;
        }
        .section-divider {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: var(--secondary-text-color);
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .section-divider::before {
          content: "";
          height: 1px;
          flex: 1;
          background: var(--divider-color);
        }
        .section-divider span:first-child { order: 2; }
        .section-divider span:last-child { order: 3; }
        .advanced-section,
        .unavailable-section {
          border-top: 1px solid var(--divider-color);
          padding-top: 10px;
        }
        .advanced-section summary,
        .unavailable-section summary {
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          color: var(--secondary-text-color);
          font-size: 0.9375rem;
          line-height: 1.4;
          font-weight: 700;
          list-style: none;
        }
        .advanced-section summary::-webkit-details-marker,
        .unavailable-section summary::-webkit-details-marker { display: none; }
        .advanced-grid, .unavailable-grid { margin-top: 10px; }
        @media (max-width: 600px) {
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
          .tile { min-height: 174px; border-radius: 18px; }
          .tile-main {
            min-height: 126px;
            grid-template-columns: 40px minmax(0, 1fr);
            gap: 9px;
            padding: 14px 11px 9px;
          }
          .icon-wrap { width: 40px; height: 40px; border-radius: 13px; }
          .icon-wrap ha-icon { --mdc-icon-size: 23px; }
          .tile-name { font-size: 0.9375rem; line-height: 1.35; }
          .tile-state { font-size: 0.875rem; }
          .device-name { font-size: 0.875rem; }
          .tile-footer { min-height: 52px; padding: 4px 6px 6px 11px; }
          .tile-actions { gap: 12px; }
          .more { width: 54px; height: 50px; }
          .metrics { font-size: 0.875rem; gap: 4px 7px; }
          .metrics span:nth-child(n+2) { display: none; }
        }
      </style>
      <div class="shell">
        ${this.navHtml(this._config.nav, room.path)}
        <header class="header">
          <div class="eyebrow">Room</div>
          <h1>${escapeHtml(room.title)}</h1>
          <div class="summary">${this.summaryHtml(room)}</div>
        </header>
        ${availableTiles ? `<main class="grid">${availableTiles}</main>` : `<div class="empty">No available everyday entities are currently active in this area.</div>`}
        ${managementSection}
        ${unavailableSection}
      </div>`;
    this.bindEvents();
  }
}

class HaRoomboardOverviewCard extends RoomboardBaseCard {
  setConfig(config) {
    if (!Array.isArray(config?.rooms) || !Array.isArray(config.nav)) {
      throw new Error("HA Roomboard overview card requires rooms and nav configuration");
    }
    this._config = config;
    this.ensureLiveDiscovery();
    this.render();
  }

  applyDiscovery(discovery) {
    const knownAreaIds = new Set(this._config.rooms.map((room) => room.area_id));
    const refreshedRooms = discovery.rooms.filter((room) => knownAreaIds.has(room.area_id));
    const knownPaths = new Set(this._config.nav.map((item) => item.path));
    const refreshedNav = discovery.nav.filter((item) => knownPaths.has(item.path));
    this._config = {
      ...this._config,
      rooms: refreshedRooms,
      nav: refreshedNav.length ? refreshedNav : this._config.nav,
      global_actions: discovery.globalActions,
    };
  }

  roomSummary(room) {
    const values = [];
    for (const key of ["temperature", "humidity", "occupancy"]) {
      const entityId = bestSummaryEntity(room, key, this._hass);
      if (entityId) values.push(displayState(this._hass, entityId));
    }
    return values.join(" · ");
  }

  actionHtml(item) {
    const stateObj = this._hass?.states?.[item.entity_id];
    const active = item.domain === "automation" && stateObj?.state === "on";
    if (item.domain === "automation") {
      const meta = automationToggleMeta(this._hass, item.entity_id);
      return `
        <article class="action-card ${active ? "active" : ""}">
          <a class="action-main automation-edit" href="${escapeHtml(automationEditorPath(this._hass, item.entity_id))}" aria-label="Edit ${escapeHtml(item.name)} automation">
            <span class="action-icon"><ha-icon icon="${escapeHtml(item.icon || entityIcon(stateObj, item.domain))}"></ha-icon></span>
            <span class="action-copy">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(displayActionState(this._hass, item))} · tap to edit</span>
            </span>
          </a>
          <div class="action-controls">
            <button class="automation-toggle" type="button" data-automation-toggle="${escapeHtml(item.entity_id)}" aria-pressed="${meta.enabled}" aria-label="${escapeHtml(meta.label)}: ${escapeHtml(item.name)}" title="${escapeHtml(meta.label)}"><ha-icon icon="${meta.icon}"></ha-icon></button>
            <button class="action-more" type="button" aria-label="More information for ${escapeHtml(item.name)}" data-global-action="more" data-entity="${escapeHtml(item.entity_id)}"><ha-icon icon="mdi:dots-horizontal"></ha-icon></button>
          </div>
        </article>`;
    }
    return `
      <article class="action-card">
        <button class="action-main" type="button" data-global-action="activate" data-entity="${escapeHtml(item.entity_id)}">
          <span class="action-icon"><ha-icon icon="${escapeHtml(item.icon || entityIcon(stateObj, item.domain))}"></ha-icon></span>
          <span class="action-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(displayActionState(this._hass, item))}</span>
          </span>
        </button>
        <button class="action-more" type="button" aria-label="More information for ${escapeHtml(item.name)}" data-global-action="more" data-entity="${escapeHtml(item.entity_id)}"><ha-icon icon="mdi:dots-horizontal"></ha-icon></button>
      </article>`;
  }

  async activateGlobalAction(entityId) {
    const stateObj = this._hass?.states?.[entityId];
    if (!stateObj) return;
    const domain = domainOf(entityId);
    try {
      if (domain === "scene") {
        await this._hass.callService("scene", "turn_on", { entity_id: entityId });
      } else if (domain === "automation") {
        await this.toggleAutomationEnabled(entityId);
      } else {
        this.showMoreInfo(entityId);
      }
    } catch (error) {
      console.error("HA Roomboard action failed", entityId, error);
      this.showMoreInfo(entityId);
    }
  }

  bindOverviewEvents() {
    this.shadowRoot.querySelectorAll("button[data-global-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const target = event.currentTarget;
        const entityId = target.dataset.entity;
        if (target.dataset.globalAction === "more") this.showMoreInfo(entityId);
        else this.activateGlobalAction(entityId);
      });
    });
    this.shadowRoot.querySelectorAll("button[data-automation-toggle]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const entityId = event.currentTarget.dataset.automationToggle;
        this.toggleAutomationEnabled(entityId);
      });
    });
    const assist = this.shadowRoot.querySelector("button[data-assist]");
    if (assist) assist.addEventListener("click", () => this.launchAssist());
  }

  render() {
    if (!this.shadowRoot || !this._config || !this._hass) return;
    const base = dashboardBasePath();
    const roomCards = this._config.rooms
      .map((room) => {
        const availableCount = room.items.filter(
          (item) => !isUnavailableState(this._hass.states[item.entity_id]),
        ).length;
        return `
          <a class="room-card" href="${escapeHtml(`${base}/${room.path}`)}">
            <span class="room-icon"><ha-icon icon="${escapeHtml(room.icon || "mdi:floor-plan")}"></ha-icon></span>
            <span class="room-copy">
              <strong>${escapeHtml(room.title)}</strong>
              <span>${escapeHtml(this.roomSummary(room) || `${availableCount} available`)}</span>
            </span>
            <span class="count">${availableCount}</span>
          </a>`;
      })
      .join("");

    const actions = asArray(this._config.global_actions).filter(
      (item) => !isUnavailableState(this._hass.states[item.entity_id]),
    );
    const scenes = actions.filter((item) => item.domain === "scene");
    const automations = actions.filter((item) => item.domain === "automation");
    const sceneCards = scenes.map((item) => this.actionHtml(item)).join("");
    const automationCards = automations.map((item) => this.actionHtml(item)).join("");

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles()}
        .overview-grid,
        .action-grid,
        .home-section,
        .assist-wrap {
          max-width: 1440px;
          margin-left: auto;
          margin-right: auto;
        }
        .assist-wrap { margin-bottom: 22px; }
        .assist-card {
          width: 100%;
          min-height: 82px;
          display: grid;
          grid-template-columns: 50px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: 14px 16px;
          border-radius: 20px;
          border: 1px solid color-mix(in srgb, var(--primary-color) 52%, var(--divider-color));
          color: var(--primary-text-color);
          background: color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color));
          cursor: pointer;
          text-align: left;
          box-shadow: 0 6px 20px color-mix(in srgb, #000 6%, transparent);
        }
        .assist-card:hover {
          background: color-mix(in srgb, var(--primary-color) 15%, var(--card-background-color));
        }
        .assist-icon {
          width: 50px;
          height: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 18%, transparent);
        }
        .assist-icon ha-icon { --mdc-icon-size: 27px; }
        .assist-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .assist-copy strong { font-size: 1.0625rem; line-height: 1.35; }
        .assist-copy span { color: var(--secondary-text-color); font-size: 0.9375rem; line-height: 1.4; }
        .assist-open {
          color: var(--primary-color);
          font-size: 0.9375rem;
          font-weight: 700;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }
        .room-card {
          min-height: 112px;
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr) auto;
          gap: 13px;
          align-items: center;
          padding: 16px;
          border-radius: 20px;
          color: var(--primary-text-color);
          background: var(--card-background-color);
          border: 1px solid color-mix(in srgb, var(--divider-color) 82%, transparent);
          text-decoration: none;
          box-shadow: 0 6px 20px color-mix(in srgb, #000 7%, transparent);
        }
        .room-card:hover { border-color: color-mix(in srgb, var(--primary-color) 48%, var(--divider-color)); }
        .room-icon {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 13%, transparent);
        }
        .room-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          overflow-wrap: anywhere;
        }
        .room-copy strong { font-size: 1.0625rem; line-height: 1.35; }
        .room-copy span {
          color: var(--secondary-text-color);
          font-size: 0.9375rem;
          line-height: 1.4;
          font-weight: 500;
          text-transform: capitalize;
        }
        .count {
          min-width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 9px;
          border-radius: 999px;
          color: var(--secondary-text-color);
          background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
          font-size: 0.875rem;
          font-weight: 700;
        }
        .home-section { margin-top: 28px; }
        .section-heading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 12px;
        }
        .section-heading h2 {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.3;
        }
        .section-heading span {
          color: var(--secondary-text-color);
          font-size: 0.875rem;
          line-height: 1.4;
          font-weight: 600;
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 12px;
        }
        .action-card {
          min-height: 104px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 60px;
          border-radius: 18px;
          overflow: hidden;
          background: var(--card-background-color);
          border: 1px solid color-mix(in srgb, var(--divider-color) 82%, transparent);
          box-shadow: 0 5px 16px color-mix(in srgb, #000 6%, transparent);
        }
        .action-card.active {
          border-color: color-mix(in srgb, var(--primary-color) 54%, var(--divider-color));
          background: color-mix(in srgb, var(--primary-color) 9%, var(--card-background-color));
        }
        .action-main {
          min-width: 0;
          min-height: 104px;
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          padding: 14px 8px 14px 14px;
          border: 0;
          color: inherit;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }
        .action-icon {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 13%, transparent);
        }
        .action-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .action-copy strong {
          font-size: 1rem;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }
        .action-copy span {
          color: var(--secondary-text-color);
          font-size: 0.9375rem;
          line-height: 1.4;
          font-weight: 500;
        }
        .action-controls {
          min-height: 104px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 6px 4px 8px;
        }
        .action-controls .action-more {
          align-self: auto;
          justify-self: auto;
          margin-bottom: 0;
        }
        .action-more {
          width: 52px;
          min-height: 48px;
          align-self: end;
          justify-self: center;
          margin-bottom: 6px;
          border: 0;
          border-radius: 12px;
          color: var(--secondary-text-color);
          background: transparent;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
        }
        .action-more ha-icon { --mdc-icon-size: 27px; }
        .action-more:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
        @media (max-width: 600px) {
          .overview-grid { grid-template-columns: 1fr; gap: 9px; }
          .room-card { min-height: 100px; border-radius: 18px; }
          .assist-card {
            grid-template-columns: 46px minmax(0, 1fr);
            min-height: 78px;
            border-radius: 18px;
          }
          .assist-icon { width: 46px; height: 46px; }
          .assist-open { display: none; }
          .action-grid { grid-template-columns: 1fr; gap: 9px; }
        }
      </style>
      <div class="shell">
        ${this.navHtml(this._config.nav, "home")}
        <header class="header">
          <div class="eyebrow">HA Roomboard</div>
          <h1>${escapeHtml(this._config.title || "Home")}</h1>
          <div class="summary">
            <span class="summary-chip">${this._config.rooms.length} rooms</span>
            <span class="summary-chip">${scenes.length} scenes</span>
            <span class="summary-chip">${automations.length} automations</span>
          </div>
        </header>

        <div class="assist-wrap">
          <button class="assist-card" type="button" data-assist aria-label="Open Home Assistant Assist">
            <span class="assist-icon"><ha-icon icon="mdi:creation-outline"></ha-icon></span>
            <span class="assist-copy">
              <strong>Assist</strong>
              <span>Ask Home Assistant or control your home by voice.</span>
            </span>
            <span class="assist-open">Open</span>
          </button>
        </div>

        <main class="overview-grid">${roomCards}</main>

        ${scenes.length ? `
          <section class="home-section" aria-labelledby="roomboard-scenes-heading">
            <div class="section-heading">
              <h2 id="roomboard-scenes-heading">Scenes</h2>
              <span>${scenes.length}</span>
            </div>
            <div class="action-grid">${sceneCards}</div>
          </section>` : ""}

        ${automations.length ? `
          <section class="home-section" aria-labelledby="roomboard-automations-heading">
            <div class="section-heading">
              <h2 id="roomboard-automations-heading">Automations</h2>
              <span>${automations.length}</span>
            </div>
            <div class="action-grid">${automationCards}</div>
          </section>` : ""}
      </div>`;
    this.bindOverviewEvents();
  }
}

if (!customElements.get("ll-strategy-dashboard-ha-roomboard")) {
  customElements.define("ll-strategy-dashboard-ha-roomboard", HaRoomboardDashboardStrategy);
}
if (!customElements.get("ll-strategy-dashboard-ha-roomboard-light")) {
  customElements.define("ll-strategy-dashboard-ha-roomboard-light", HaRoomboardLightDashboardStrategy);
}
if (!customElements.get("ll-strategy-dashboard-ha-roomboard-dark")) {
  customElements.define("ll-strategy-dashboard-ha-roomboard-dark", HaRoomboardDarkDashboardStrategy);
}
if (!customElements.get("ha-roomboard-room")) {
  customElements.define("ha-roomboard-room", HaRoomboardRoomCard);
}
if (!customElements.get("ha-roomboard-overview")) {
  customElements.define("ha-roomboard-overview", HaRoomboardOverviewCard);
}

window.customStrategies = window.customStrategies || [];
const STRATEGIES = [
  {
    type: STRATEGY_TYPE,
    name: "HA Roomboard",
    description: "Automatic room-first dashboard that follows the Home Assistant appearance.",
  },
  {
    type: LIGHT_STRATEGY_TYPE,
    name: "HA Roomboard Light",
    description: "Automatic room-first dashboard with a fixed accessible light palette.",
  },
  {
    type: DARK_STRATEGY_TYPE,
    name: "HA Roomboard Dark",
    description: "Automatic room-first dashboard with a fixed accessible dark palette.",
  },
];
for (const strategy of STRATEGIES) {
  if (!window.customStrategies.some((registered) => registered.type === strategy.type)) {
    window.customStrategies.push({
      ...strategy,
      strategyType: "dashboard",
      documentationURL: "https://github.com/ArrowSK/ha-roomboard",
    });
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "ha-roomboard-room")) {
  window.customCards.push({
    type: "ha-roomboard-room",
    name: "HA Roomboard Room",
    description: "Room view used by the HA Roomboard dashboard strategy.",
    preview: false,
    documentationURL: "https://github.com/ArrowSK/ha-roomboard",
  });
}

console.info(
  `%c HA Roomboard %c v${ROOMBOARD_VERSION} `,
  "background:#455a64;color:white;font-weight:700",
  "background:#eceff1;color:#263238",
);
