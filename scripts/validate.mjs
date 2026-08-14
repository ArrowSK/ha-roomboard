import fs from "node:fs";

const source = fs.readFileSync(new URL("../dist/ha-roomboard.js", import.meta.url), "utf8");
const hacs = JSON.parse(fs.readFileSync(new URL("../hacs.json", import.meta.url), "utf8"));
const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const requiredSnippets = [
  'customElements.define("ll-strategy-dashboard-ha-roomboard"',
  'customElements.define("ha-roomboard-room"',
  'customElements.define("ha-roomboard-overview"',
  'type: "config/area_registry/list"',
  'type: "config/device_registry/list"',
  'type: "config/entity_registry/list"',
  'strategyType: "dashboard"',
  'entity_registry_updated',
  'device_registry_updated',
  'area_registry_updated',
  'unavailable_mode',
  'assignUniqueAreaIcons',
  'deduplicateItems',
  'grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));',
  'overflow-wrap: anywhere;',
  '.metrics span { white-space: nowrap; }',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`Missing required implementation marker: ${snippet}`);
  }
}

if (source.includes('text-overflow: ellipsis;')) {
  throw new Error("Roomboard must not ellipsize entity or device names");
}

const versionMatch = source.match(/const ROOMBOARD_VERSION = "([^"]+)"/);
if (!versionMatch) throw new Error("Unable to read runtime version");
if (versionMatch[1] !== pkg.version) {
  throw new Error(`Runtime version ${versionMatch[1]} does not match package version ${pkg.version}`);
}

if (hacs.name !== "HA Roomboard") throw new Error("Unexpected HACS display name");
if (hacs.filename !== "ha-roomboard.js") throw new Error("HACS filename must match repository plugin name");

const forbiddenAssetPatterns = [
  /tuya[^\n]*(logo|icon|asset|font|css|stylesheet)/i,
  /smart\s*life[^\n]*(logo|icon|asset|font|css|stylesheet)/i,
];
for (const pattern of forbiddenAssetPatterns) {
  if (pattern.test(source)) {
    throw new Error(`Potential third-party asset reference found: ${pattern}`);
  }
}

console.log(`HA Roomboard ${pkg.version} validation passed`);
