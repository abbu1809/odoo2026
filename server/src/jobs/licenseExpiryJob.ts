import { prisma } from "../config/prisma";
import { sendMail } from "../utils/mailer";
import { licenseExpiryEmail } from "../utils/emailTemplates";
import { DriverStatus } from "../../generated/prisma/enums";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const WARNING_WINDOW_DAYS = 30;

/** Todo.md - email reminders for expiring licenses. Only fires for drivers linked to a login user (their email). */
async function checkExpiringLicenses(): Promise<void> {
  const drivers = await prisma.driver.findMany({
    where: {
      status: { not: DriverStatus.SUSPENDED },
      licenseExpiryDate: { lte: new Date(Date.now() + WARNING_WINDOW_DAYS * 24 * 60 * 60 * 1000) },
      userId: { not: null },
    },
    include: { user: { select: { email: true } } },
  });

  for (const driver of drivers) {
    if (!driver.user) continue;
    const { subject, html } = licenseExpiryEmail(driver.name, driver.licenseExpiryDate);
    await sendMail({ to: driver.user.email, subject, html });
  }
}

/** Starts the daily license-expiry check (runs once immediately, then every 24h). */
export function startLicenseExpiryJob(): void {
  void checkExpiringLicenses().catch((error) => console.error("[licenseExpiryJob] check failed:", error));
  setInterval(() => {
    void checkExpiringLicenses().catch((error) => console.error("[licenseExpiryJob] check failed:", error));
  }, CHECK_INTERVAL_MS);
}
