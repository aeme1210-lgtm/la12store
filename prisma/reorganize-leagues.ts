/**
 * reorganize-leagues.ts
 * Reclasifica el campo 'league' de TODOS los productos desde cero:
 * 1) Contiene '25/26' o '2526' → 'New Season'
 * 2) NO es 25/26 + equipo español → 'La Liga'
 * 3) Todo lo demás → 'Retro'
 *
 * Uso: npx tsx prisma/reorganize-leagues.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SPANISH_TEAMS = [
  "Alavés", "Alaves",
  "Almería", "Almeria",
  "Athletic Club", "Athletic Bilbao",
  "Atlético", "Atletico",
  "Barcelona", "Barça", "Barca",
  "Betis",
  "Cádiz", "Cadiz",
  "Celta",
  "Córdoba", "Cordoba",
  "Deportivo",
  "Eibar",
  "Elche",
  "Espanyol",
  "Getafe",
  "Gimnàstic", "Nàstic", "Gimnastic", "Nastic",
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
  if (/25\/26|2526/i.test(name)) return "New Season";
  const lower = name.toLowerCase();
  if (SPANISH_TEAMS.some((t) => lower.includes(t.toLowerCase()))) return "La Liga";
  return "Retro";
}

async function main() {
  console.log("=".repeat(60));
  console.log("  RECLASIFICACIÓN TOTAL DE LEAGUES");
  console.log("=".repeat(60));

  const products = await prisma.product.findMany({
    select: { id: true, name: true, league: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n  Total productos a procesar: ${products.length}\n`);

  const counts = { "New Season": 0, "La Liga": 0, Retro: 0 };
  const changes: string[] = [];

  // Actualizar TODOS, sin excepción
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

  if (changes.length) {
    console.log("  CAMBIOS APLICADOS:");
    changes.forEach((c) => console.log(c));
  }

  console.log("\n" + "=".repeat(60));
  console.log("  RESULTADO FINAL (todos los productos):");
  console.log(`  New Season : ${counts["New Season"]}`);
  console.log(`  La Liga    : ${counts["La Liga"]}`);
  console.log(`  Retro      : ${counts.Retro}`);
  console.log(`  Total      : ${products.length}`);
  console.log("=".repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
