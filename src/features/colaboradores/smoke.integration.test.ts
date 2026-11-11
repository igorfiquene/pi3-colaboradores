import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db";

describe("smoke integração — banco responde", () => {
  it("lista empresas do seed", async () => {
    const empresas = await prisma.empresa.findMany();
    expect(empresas.length).toBeGreaterThanOrEqual(2);
  });
});
