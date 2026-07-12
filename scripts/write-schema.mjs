import { writeFile } from "node:fs/promises";
import { commentaryScriptSchema } from "../src/domain/commentary-schema.js";

await writeFile(
  new URL("../schemas/commentary-script.schema.json", import.meta.url),
  `${JSON.stringify(commentaryScriptSchema, null, 2)}\n`,
  "utf8"
);
