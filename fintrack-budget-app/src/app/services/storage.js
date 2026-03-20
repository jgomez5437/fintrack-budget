const browserStorage = {
  async get(key) {
    if (typeof window === "undefined") return null;

    const value = window.localStorage.getItem(key);
    return value === null ? null : { value };
  },

  async set(key, value) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(key, value);
  },
};

export function getStorage() {
  if (typeof window === "undefined") {
    return browserStorage;
  }

  return window.storage ?? browserStorage;
}
