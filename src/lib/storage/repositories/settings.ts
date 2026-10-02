import type { AppSettings } from '@/types';
import { KEYS } from '../keys';
import { commit, read, write } from '../storage';

const DEFAULTS: AppSettings = {
  nurseryName: 'Tadika Ceria',
  address: 'No. 12, Jalan Melur 3, Taman Seri Ceria, 43200 Cheras, Selangor',
  phone: '03-9123 4567',
  email: 'hello@tadicakeria.my',
};

export function getSettings(): AppSettings {
  return read<AppSettings>(KEYS.settings, DEFAULTS);
}

export function saveSettings(next: AppSettings): void {
  write(KEYS.settings, next);
  commit();
}
