export interface MenuItem {
  title: string;
  path: string;
  description: string;
}

export interface MenuItemsProps {
  items: MenuItem[];
  onNavigate: (path: string) => void;
} 