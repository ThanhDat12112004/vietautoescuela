export type PremiumBankTab = 'vn' | 'es';
export type PremiumBankId = 'vn_vcb' | 'es_caixa' | 'es_revolut';

type PremiumBankOption = {
  id: PremiumBankId;
  tab: PremiumBankTab;
  label: string;
};

const BANK_OPTIONS: PremiumBankOption[] = [
  { id: 'vn_vcb', tab: 'vn', label: 'Vietcombank' },
  { id: 'es_caixa', tab: 'es', label: 'CaixaBank' },
  { id: 'es_revolut', tab: 'es', label: 'Revolut' },
];

export function getPremiumBankOptions(tab: PremiumBankTab): PremiumBankOption[] {
  return BANK_OPTIONS.filter((opt) => opt.tab === tab);
}

/**
 * Ảnh QR theo kênh — ưu tiên biến riêng, fallback `NEXT_PUBLIC_PREMIUM_QR_URL` cho VN, placeholder cho ES.
 */
export function getPremiumQrUrl(bank: PremiumBankId): string {
  const vn =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PREMIUM_QR_VN?.trim()) ||
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PREMIUM_QR_URL?.trim()) ||
    '';

  if (bank === 'vn_vcb') {
    return vn || '/brand/premium-qr.png';
  }
  return '';
}

/**
 * Dòng hiển thị (STK, chủ TK, IBAN…) — tách bằng `|` trong env để tránh xuống dòng trong .env.
 * Ví dụ: `Vietcombank — 0123456789|CTK: NGUYEN VAN A`
 */
export function getPremiumBankLines(bank: PremiumBankId): string[] {
  const raw = (() => {
    if (typeof process === 'undefined') return '';
    if (bank === 'vn_vcb') return process.env.NEXT_PUBLIC_PREMIUM_BANK_LINES_VN?.trim() || '';
    if (bank === 'es_caixa') {
      return (
        process.env.NEXT_PUBLIC_PREMIUM_BANK_LINES_ES_CAIXA?.trim() ||
        process.env.NEXT_PUBLIC_PREMIUM_BANK_LINES_ES?.trim() ||
        ''
      );
    }
    return process.env.NEXT_PUBLIC_PREMIUM_BANK_LINES_ES_REVOLUT?.trim() || '';
  })();

  if (!raw) {
    if (bank === 'vn_vcb') {
      return [
        'Ngân hàng Vietcombank',
        'Số tài khoản: 093462868501',
        'Chủ tài khoản: Xuan Long Pham',
      ];
    }
    if (bank === 'es_caixa') {
      return [
        'Bizum: 642087268',
        'Nombre: Xuan Long Pham',
        'IBAN: ES0521000555390203052354',
        'Banco: CaixaBank',
      ];
    }
    return ['IBAN: ES0715830001179044430932', 'Nombre: Xuan Long Pham', 'Banco: Revolut'];
  }
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}
