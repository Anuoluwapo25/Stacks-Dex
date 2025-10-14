
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}