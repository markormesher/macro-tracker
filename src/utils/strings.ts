function cleanString(raw: string): string {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();

  return trimmed === "" ? null : trimmed;
}

export { cleanString };
