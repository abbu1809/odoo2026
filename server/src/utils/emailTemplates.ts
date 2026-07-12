const shell = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #141413;">
    <h2 style="color: #F5A623;">TransitOps</h2>
    <h3>${title}</h3>
    ${body}
    <p style="color: #6b7280; font-size: 0.8rem; margin-top: 24px;">TransitOps &middot; Smart Transport Operations Platform</p>
  </div>
`;

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to TransitOps",
    html: shell(
      `Welcome, ${name}!`,
      `<p>Your TransitOps account has been created. You can now sign in and start managing your fleet operations.</p>`,
    ),
  };
}

export function licenseExpiryEmail(driverName: string, expiryDate: Date): { subject: string; html: string } {
  const formatted = expiryDate.toISOString().slice(0, 10);
  return {
    subject: `License expiring soon: ${driverName}`,
    html: shell(
      "Driver license expiring soon",
      `<p><strong>${driverName}</strong>'s driving license expires on <strong>${formatted}</strong>.</p>
       <p>Renew it before then to avoid the driver being blocked from new trip assignments.</p>`,
    ),
  };
}
