/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@local").toLowerCase();
  const pass = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const name = process.env.SEED_ADMIN_NAME || "Administrador";

  const hash = await bcrypt.hash(pass, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin já existe:", email);
    return;
  }

  await prisma.user.create({
    data: { name, email, passwordHash: hash, role: "ADMIN" }
  });

  console.log("Admin criado:");
  console.log("  email:", email);
  console.log("  senha:", pass);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
