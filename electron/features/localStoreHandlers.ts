import { ipcMain } from 'electron';
import { prisma } from '../core/database';

const keyOf = (key: string) => `local:${key}`;

export const registerLocalStoreHandlers = () => {
  ipcMain.handle('local-store:get', async (_, key: string) => {
    const row = await prisma.settings.findUnique({ where: { key: keyOf(key) } });
    return row?.value ?? null;
  });

  ipcMain.handle('local-store:set', async (_, key: string, value: string) => {
    await prisma.settings.upsert({
      where: { key: keyOf(key) },
      update: { value },
      create: { key: keyOf(key), value },
    });
    return { success: true };
  });

  ipcMain.handle('local-store:delete', async (_, key: string) => {
    await prisma.settings.delete({ where: { key: keyOf(key) } }).catch(() => null);
    return { success: true };
  });
};
