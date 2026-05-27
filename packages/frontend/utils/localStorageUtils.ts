export const LocalStorageUtils = {
  lsGet(key: string) {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },
  lsSet(key: string, value: any) {
    if (typeof window === "undefined") return;
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
  lsDelete(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};
