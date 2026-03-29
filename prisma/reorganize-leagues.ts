/**
 * reorganize-leagues.ts
 * Reorganiza el campo 'league' de todos los productos según estas reglas:
 * 1) Nombre contiene '25/26' o '2526' → league = 'New Season'
 * 2) NO es 25/26 + equipo español → league = 'La Liga'
 * 3) Todo lo demás → league = 'Retro'
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
  "Atlético Madrid", "Atletico Madrid",
  "Barcelona", "Barça", "Barca",
  "Betis",
  "Cádiz", "Cadiz",
  "Celta",
  "Córdoba", "Cordoba",
  "Deportivo La Coruña", "Deportivo Coruña", "Deportivo La Coruna",
  "Eibar",
  "Elche",
  "Espanyol",
  "Getafe",
  "Gimnàstic", "Gimnastic", "Nàstic", "Nastic",
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

function isNewSeason(name: string): boolean {
  return /25\/26|2526/i.test(name);
}

function isLaLiga(name: string): boolean {
  const lower = name.toLowerCase();
  return SPANISH_TEAMS.some((team) => lower.includes(team.toLowerCase()));
}

function getLeague(name: string): string {
  if (isNewSeason(name)) return "New Season";
  if (isLaLiga(name)) return "La Liga";
  return "Retro";
}

async function main() {
  console.log("=".repeat(60));
  console.log("  REORGANIZANDO LEAGUES");
  console.log("=".repeat(60));

  const products = await prisma.product.findMany({
    select: { id: true, name: true, league: true },
  });
  console.log(`\n  Total productos: ${products.length}\n`);

  const counts = { "New Season": 0, "La Liga": 0, Retro: 0, unchanged: 0 };

  for (const product of products) {
    const newLeague = getLeague(product.name);

    if (newLeague === product.league) {
      counts.unchanged++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { league: newLeague },
    });

    console.log(`  ${product.league.padEnd(12)} → ${newLeague.padEnd(12)} | ${product.name}`);
    counts[newLeague as keyof typeof counts]++;
  }

  console.log("\n" + "=".repeat(60));
  console.log("  RESUMEN:");
  console.log(`  → New Season : ${counts["New Season"]} actualizados`);
  console.log(`  → La Liga    : ${counts["La Liga"]} actualizados`);
  console.log(`  → Retro      : ${counts.Retro} actualizados`);
  console.log(`  Sin cambios  : ${counts.unchanged}`);
  console.log("=".repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
