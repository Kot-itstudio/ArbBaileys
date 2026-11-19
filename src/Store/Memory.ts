export interface StoreOptions {
  /** Directory for persisted state. If omitted, purely in-memory. */
  dir?: string;
}

/**
 * Simple key/value memory store with optional file persistence.
 * Used to keep chat/session metadata around between restarts.
 */
export class MemoryStore {
  private data = new Map<string, any>();
  private dir?: string;

  constructor(opts: StoreOptions = {}) {
    this.dir = opts.dir;
  }

  get<T = any>(key: string): T | undefined {
    return this.data.get(key);
  }

  set<T = any>(key: string, value: T): void {
    this.data.set(key, value);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  clear(): void {
    this.data.clear();
  }

  toJSON(): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [k, v] of this.data.entries()) out[k] = v;
    return out;
  }

  loadFrom(obj: Record<string, any>): void {
    this.data.clear();
    for (const [k, v] of Object.entries(obj)) this.data.set(k, v);
  }
}
