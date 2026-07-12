import { readFile } from "node:fs/promises";
import { commentaryScriptSchema } from "../src/domain/commentary-schema.js";

const path = new URL("../schemas/commentary-script.schema.json", import.meta.url);
const saved = JSON.parse(await readFile(path, "utf8"));
if (JSON.stringify(saved) !== JSON.stringify(commentaryScriptSchema)) {
  console.error("Schema file is stale. Run: npm run schema:write");
  process.exitCode = 1;
} else {
  console.log("Schema file matches source.");
}
