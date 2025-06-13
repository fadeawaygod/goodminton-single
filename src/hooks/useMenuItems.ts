import { useTranslation } from 'react-i18next';
import { MenuItem } from '../types/menu';

export const useMenuItems = (): MenuItem[] => {
  const { t } = useTranslation();

  return [
    {
      title: t('court.courts'),
      path: '/courts',
      description: t('court.courtsDescription')
    },
    {
      title: t('common.settings'),
      path: '/settings',
      description: t('settings.language')
    },
  ];
}; 