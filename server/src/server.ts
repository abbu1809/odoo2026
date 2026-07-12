import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { startLicenseExpiryJob } from "./jobs/licenseExpiryJob";

async function main() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`TransitOps API listening on http://localhost:${env.port}`);
  });
  startLicenseExpiryJob();
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
