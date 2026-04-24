function normalizeSslMode(url: string) {
  if (!url || !url.includes("render.com")) {
    return url;
  }

  const hasQuery = url.includes("?");
  const hasSslMode = /(?:\?|&)sslmode=/.test(url);

  if (hasSslMode) {
    return url;
  }

  return `${url}${hasQuery ? "&" : "?"}sslmode=require`;
}

export function getDatabaseUrl() {
  const directUrl = process.env.DIRECT_URL?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const resolved = directUrl || databaseUrl || "";

  return normalizeSslMode(resolved);
}
