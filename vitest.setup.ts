import "@testing-library/jest-dom/vitest";
import * as dotenv from "node:fs";

// Carrega .env.local pra testes de integração contra o banco
try {
  const content = dotenv.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
} catch {
  // sem .env.local, segue
}
