import Papa from 'papaparse';

export interface CsvRow {
  email: string;
  name?: string;
  tags?: string;
}

export interface CsvParseResult {
  valid: CsvRow[];
  invalid: { row: number; reason: string }[];
  total: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseCsv(csvText: string): CsvParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const valid: CsvRow[] = [];
  const invalid: { row: number; reason: string }[] = [];
  const seen = new Set<string>();

  result.data.forEach((row, index) => {
    const email = (row.email || row['이메일'] || row['e-mail'] || '').trim().toLowerCase();
    const name = (row.name || row['이름'] || row['성명'] || '').trim();
    const tags = (row.tags || row['태그'] || row['tag'] || '').trim();

    if (!email) {
      invalid.push({ row: index + 2, reason: '이메일 없음' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      invalid.push({ row: index + 2, reason: `유효하지 않은 이메일: ${email}` });
      return;
    }

    if (seen.has(email)) {
      invalid.push({ row: index + 2, reason: `중복 이메일: ${email}` });
      return;
    }

    seen.add(email);
    valid.push({ email, name: name || undefined, tags: tags || undefined });
  });

  return { valid, invalid, total: result.data.length };
}
