/**
 * check-admin-passwords.js
 * Verifica que todos los passwords de AdminUser estén hasheados con bcrypt.
 * Si alguno está en texto plano, lo hashea automáticamente (rounds=12).
 *
 * Uso:
 *   node scripts/check-admin-passwords.js           → verifica y hashea si es necesario
 *   node scripts/check-admin-passwords.js --dry-run → solo muestra, no modifica
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");
const BCRYPT_ROUNDS = 12;

// Un hash bcrypt siempre empieza con $2a$, $2b$ o $2y$ seguido del costo.
function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

async function main() {
  if (DRY_RUN) console.log("\n⚠️  MODO DRY-RUN — no se escribirá nada\n");

  const admins = await prisma.adminUser.findMany({
    select: { id: true, email: true, password: true },
  });

  console.log(`Admins en BD: ${admins.length}`);

  if (admins.length === 0) {
    console.log("No hay admins en la BD.");
    return;
  }

  let ok = 0;
  let fixed = 0;
  const issues = [];

  for (const admin of admins) {
    if (isBcryptHash(admin.password)) {
      console.log(`✅ ${admin.email} — password ya está hasheado con bcrypt`);
      ok++;
    } else {
      console.log(`❌ ${admin.email} — password en TEXTO PLANO detectado`);
      issues.push(admin);

      if (!DRY_RUN) {
        const hashed = await bcrypt.hash(admin.password, BCRYPT_ROUNDS);
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { password: hashed },
        });
        console.log(`   → Password hasheado y actualizado con bcrypt rounds=${BCRYPT_ROUNDS}`);
        fixed++;
      }
    }
  }

  console.log(`\n✅ Correctos: ${ok} | ❌ Texto plano: ${issues.length} | 🔧 Hasheados: ${fixed}`);

  if (issues.length > 0 && DRY_RUN) {
    console.log("\n⚠️  Ejecuta sin --dry-run para hashear automáticamente los passwords en texto plano.");
    process.exit(1);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
