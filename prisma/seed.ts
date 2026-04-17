import { prisma } from "../lib/prisma";
import { runBootstrapSeed } from "../lib/services/bootstrap-seed";

async function main() {
  const summary = await runBootstrapSeed(prisma);
  console.log("Bootstrap seed complete", summary);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
