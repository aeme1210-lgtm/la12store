import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Colombia Local 2026",
    slug: "colombia-local-2026",
    team: "Colombia",
    league: "Selecciones",
    season: "2026",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    description: "Camiseta oficial Colombia Local para el Mundial 2026. Tela técnica de alta calidad con acabados profesionales. Incluye dorsal y parches gratis.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Colombia Visitante 2026",
    slug: "colombia-visitante-2026",
    team: "Colombia",
    league: "Selecciones",
    season: "2026",
    type: "Visitante",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    description: "Camiseta oficial Colombia Visitante para el Mundial 2026. Tela técnica premium con acabados profesionales.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Argentina Local 2026",
    slug: "argentina-local-2026",
    team: "Argentina",
    league: "Selecciones",
    season: "2026",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    description: "Camiseta oficial Argentina Local 2026. La albiceleste con calidad premium.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Brasil Local 2026",
    slug: "brasil-local-2026",
    team: "Brasil",
    league: "Selecciones",
    season: "2026",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: false,
    isNew: true,
    description: "Camiseta oficial Brasil Local 2026. Calidad premium con acabados profesionales.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Sudáfrica Visitante 2026",
    slug: "sudafrica-visitante-2026",
    team: "Sudáfrica",
    league: "Selecciones",
    season: "2026",
    type: "Visitante",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: false,
    isFeatured: false,
    isNew: true,
    description: "Camiseta oficial Sudáfrica Visitante 2026.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "México Local 2026",
    slug: "mexico-local-2026",
    team: "México",
    league: "Selecciones",
    season: "2026",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: false,
    isFeatured: false,
    isNew: true,
    description: "Camiseta oficial México Local 2026.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Real Madrid Local 25/26",
    slug: "real-madrid-local-25-26",
    team: "Real Madrid",
    league: "Liga Española",
    season: "25/26",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    description: "Camiseta Real Madrid Local temporada 25/26. Calidad premium.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Barcelona Local 25/26",
    slug: "barcelona-local-25-26",
    team: "Barcelona",
    league: "Liga Española",
    season: "25/26",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    description: "Camiseta Barcelona Local temporada 25/26.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Barcelona Visitante 25/26 Dorada",
    slug: "barcelona-visitante-25-26-dorada",
    team: "Barcelona",
    league: "Liga Española",
    season: "25/26",
    type: "Visitante",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    description: "Camiseta Barcelona Visitante temporada 25/26 en su exclusiva versión dorada.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Manchester United Retro 98/99",
    slug: "manchester-united-retro-98-99",
    team: "Manchester United",
    league: "Premier League",
    season: "98/99",
    type: "Retro",
    priceRetro: 170000,
    isRetro: true,
    hasPlayer: false,
    isTrending: false,
    isFeatured: true,
    isNew: false,
    description: "Camiseta retro clásica Manchester United 98/99 con el patrocinio Sharp. Un ícono del fútbol mundial.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Real Madrid Retro 98/00",
    slug: "real-madrid-retro-98-00",
    team: "Real Madrid",
    league: "Liga Española",
    season: "98/00",
    type: "Retro",
    priceRetro: 170000,
    isRetro: true,
    hasPlayer: false,
    isTrending: false,
    isFeatured: false,
    isNew: false,
    description: "Camiseta retro clásica Real Madrid 98/00 con el patrocinio Teka. Una pieza histórica.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Liverpool Local 25/26",
    slug: "liverpool-local-25-26",
    team: "Liverpool",
    league: "Premier League",
    season: "25/26",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: true,
    isFeatured: false,
    isNew: true,
    description: "Camiseta Liverpool Local temporada 25/26.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "AC Milan Local 25/26",
    slug: "ac-milan-local-25-26",
    team: "AC Milan",
    league: "Serie A",
    season: "25/26",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: false,
    isFeatured: false,
    isNew: true,
    description: "Camiseta AC Milan Local temporada 25/26.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
  {
    name: "Boca Juniors Local 25/26",
    slug: "boca-juniors-local-25-26",
    team: "Boca Juniors",
    league: "Ligas Sudamericanas",
    season: "25/26",
    type: "Local",
    priceFan: 150000,
    pricePlayer: 180000,
    isTrending: false,
    isFeatured: false,
    isNew: true,
    description: "Camiseta Boca Juniors Local temporada 25/26.",
    images: JSON.stringify(["/images/placeholder.svg"]),
  },
];

const categories = [
  { name: "Selecciones", slug: "selecciones", order: 1 },
  { name: "Liga Española", slug: "liga-espanola", order: 2 },
  { name: "Premier League", slug: "premier-league", order: 3 },
  { name: "Serie A", slug: "serie-a", order: 4 },
  { name: "Bundesliga", slug: "bundesliga", order: 5 },
  { name: "Ligue 1", slug: "ligue-1", order: 6 },
  { name: "Ligas Sudamericanas", slug: "ligas-sudamericanas", order: 7 },
  { name: "Retros / Clásicas", slug: "retros-clasicas", order: 8 },
];

async function main() {
  console.log("Seeding database...");

  const seedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!seedPassword) {
    throw new Error(
      "ADMIN_SEED_PASSWORD no está definida. Agrégala al .env antes de correr el seed — nunca hardcodear la contraseña del admin."
    );
  }
  const hashedPassword = await bcrypt.hash(seedPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@la12store.com" },
    update: {},
    create: {
      email: "admin@la12store.com",
      password: hashedPassword,
      name: "Andrés Méndez",
    },
  });
  console.log("Admin user created");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories created");

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`${products.length} products created`);

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
