import { useTranslation } from 'react-i18next';
import { MenuItem } from '../types/menu';

export const useMenuItems = (): MenuItem[] => {
  const { t } = useTranslation();

  return [
    {
      title: t('common.schedule'),
      path: '/schedule',
      description: t('schedule.viewSchedule')
    },
    {
      title: t('common.players'),
      path: '/players',
      description: t('players.playerList')
    },
    {
      title: t('common.settings'),
      path: '/settings',
      description: t('settings.language')
    },
  ];
}; 