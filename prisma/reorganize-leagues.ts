/**
 * reorganize-leagues.ts
 * Reclasifica league de TODOS los productos en 3 pasos:
 * PASO 1: Todo → 'Retro'
 * PASO 2: Contiene '25/26' o '2526' → 'New Season'
 * PASO 3: NO New Season + equipo español EXACTO → 'La Liga'
 *
 * Reglas estrictas:
 * - 'Racing' solo NO cuenta → debe ser 'Racing Santander'
 * - 'Deportivo' solo NO cuenta → debe ser 'Deportivo La Coruña/Coruna'
 * - 'Atletico' solo NO cuenta → debe ser 'Atletico Madrid' / 'Atletico de Madrid'
 *
 * Uso: npx tsx prisma/reorganize-leagues.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Lista EXACTA de equipos españoles — sin términos ambiguos
const SPANISH_TEAMS = [
  "Alavés", "Alaves",
  "Almería", "Almeria",
  "Athletic Bilbao", "Athletic Club",
  "Atlético Madrid", "Atletico Madrid", "Atletico de Madrid",
  "Barcelona",
  "Betis",
  "Cádiz", "Cadiz",
  "Celta",
  "Córdoba", "Cordoba",
  "Deportivo La Coruña", "Deportivo La Coruna",
  "Eibar",
  "Elche",
  "Espanyol",
  "Getafe",
  "Girona",
  "Granada",
  "Hércules", "Hercules",
  "Huesca",
  "Las Palmas",
  "Leganés", "Leganes",
  "Levante",
  "Málaga", "Malaga",
  "Mallorca",
  "Murcia",
  "Numancia",
  "Osasuna",
  "Oviedo",
  "Racing Santander",
  "Rayo Vallecano",
  "Real Madrid",
  "Real Sociedad",
  "Recreativo",
  "Sevilla",
  "Sporting Gijón", "Sporting Gijon",
  "Tenerife",
  "Valencia",
  "Valladolid",
  "Villarreal",
  "Xerez",
  "Zaragoza",
];

function classify(name: string): string {
  // PASO 2: New Season
  if (/25\/26|2526/i.test(name)) return "New Season";

  // PASO 3: La Liga — solo si contiene un nombre de equipo EXACTO
  const lower = name.toLowerCase();
  if (SPANISH_TEAMS.some((team) => lower.includes(team.toLowerCase()))) return "La Liga";

  // PASO 1: todo lo demás es Retro
  return "Retro";
}

async function main() {
  console.log("=".repeat(60));
  console.log("  RECLASIFICACIÓN TOTAL — 3 PASOS");
  console.log("=".repeat(60));

  const products = await prisma.product.findMany({
    select: { id: true, name: true, league: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n  Total productos: ${products.length}`);

  const counts = { "New Season": 0, "La Liga": 0, Retro: 0 };
  const changes: string[] = [];

  for (const p of products) {
    const newLeague = classify(p.name);
    await prisma.product.update({
      where: { id: p.id },
      data: { league: newLeague },
    });
    counts[newLeague as keyof typeof counts]++;
    if (p.league !== newLeague) {
      changes.push(`  ${p.league.padEnd(14)} → ${newLeague.padEnd(14)} | ${p.name}`);
    }
  }

  console.log(`\n  CAMBIOS (${changes.length} productos):`);
  changes.forEach((c) => console.log(c));

  console.log("\n" + "=".repeat(60));
  console.log("  RESULTADO FINAL:");
  console.log(`  New Season : ${counts["New Season"]}`);
  console.log(`  La Liga    : ${counts["La Liga"]}`);
  console.log(`  Retro      : ${counts.Retro}`);
  console.log(`  TOTAL      : ${products.length}`);
  console.log("=".repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
