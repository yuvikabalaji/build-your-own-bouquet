/** In-memory fallback for bouquet preview when sessionStorage fails (e.g. quota) */
let lastSentBouquet: string | null = null;

export function setLastSentBouquet(data: string): void {
  lastSentBouquet = data;
}

export function takeLastSentBouquet(): string | null {
  const v = lastSentBouquet;
  lastSentBouquet = null;
  return v;
}
