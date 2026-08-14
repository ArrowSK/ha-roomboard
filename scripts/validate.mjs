import fs from "node:fs";

const source = fs.readFileSync(new URL("../dist/ha-roomboard.js", import.meta.url), "utf8");
const hacs = JSON.parse(fs.readFileSync(new URL("../hacs.json", import.meta.url), "utf8"));

const requiredSnippets = [
  'customElements.define("ll-strategy-dashboard-ha-roomboard"',
  'customElements.define("ha-roomboard-room"',
  'customElements.define("ha-roomboard-overview"',
  'type: "config/area_registry/list"',
  'type: "config/device_registry/list"',
  'type: "config/entity_registry/list"',
  'strategyType: "dashboard"',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`Missing required implementation marker: ${snippet}`);
  }
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

console.log("HA Roomboard validation passed");
