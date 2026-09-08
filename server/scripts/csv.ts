/**
 * Minimal CSV writer with no external dependency. Bank bulk-upload portals
 * are picky about quoting/line endings, so this stays deliberately simple
 * and explicit rather than pulling in a full CSV library for a few rows.
 */

const escapeCsvField = (value: string | number): string => {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const toCsv = (
  headers: string[],
  rows: (string | number)[][],
): string => {
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvField).join(","));
  }
  // CRLF line endings - the common expectation for Windows-oriented bank portals
  return lines.join("\r\n") + "\r\n";
};
