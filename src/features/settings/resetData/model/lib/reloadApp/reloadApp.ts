import { flushStorage } from '@/shared/lib/utils/storage';

export const reloadApp = async (): Promise<void> => {
  try {
    await flushStorage();
  } catch {
    // перезавантаження покаже фактичний стан сховища
  }
  window.location.replace(window.location.pathname + window.location.search);
};