function isLocalHostname(hostname: string) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

export function getDatabaseUrl() {
  const directUrl = process.env.DIRECT_URL?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  return directUrl || databaseUrl || "";
}

export function shouldUseDatabaseSsl(connectionString: string) {
  if (process.env.DATABASE_SSL === "true") {
    return true;
  }

  if (process.env.DATABASE_SSL === "false") {
    return false;
  }

  try {
    const host = new URL(connectionString).hostname;
    return !isLocalHostname(host);
  } catch {
    return false;
  }
}
