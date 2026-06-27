import { AppUser } from './types';

export function getUserStorageSuffix(user?: AppUser | null): string {
  if (!user?.name?.trim()) return '';
  const normalizedName = user.name.trim().toLocaleLowerCase('vi-VN');
  const safeName = encodeURIComponent(normalizedName).replace(/%/g, '_');
  const role = user.role || 'user';
  const classPart = user.studentClass ? `_${encodeURIComponent(user.studentClass.trim().toLocaleLowerCase('vi-VN')).replace(/%/g, '_')}` : '';
  return `_${role}_${safeName}${classPart}`;
}
