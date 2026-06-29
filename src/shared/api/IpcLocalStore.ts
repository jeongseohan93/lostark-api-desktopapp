const api = () => {
  if (!window.lostarkAPI) throw new Error('IPC bridge is not available.');
  return window.lostarkAPI;
};

export const getLocalData = async <T>(key: string, fallback: T): Promise<T> => {
  const raw = await api().getLocalData(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const setLocalData = async <T>(key: string, value: T): Promise<void> => {
  await api().setLocalData(key, JSON.stringify(value));
};

export const deleteLocalData = async (key: string): Promise<void> => {
  await api().deleteLocalData(key);
};
