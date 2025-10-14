/**
 * Navigation Data for Goat Fun
 * Dummy data that can be easily replaced with backend API calls
 */

import type { NavigationConfig, NavigationItem } from '../types/navigation';

export const navigationConfig: NavigationConfig = {
  logo: {
    src: '/goatfun.png',
    alt: 'Goat Fun',
    text: 'Goat.fun'
  },
  
  navigation: [
    {
      id: 'main',
      title: 'Main',
      showInMobile: true,
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: 'home',
          href: '/',
          active: true,
          showInMobile: true
        },
        {
          id: 'livestreams',
          label: 'Livestreams',
          icon: 'camera',
          href: '/livestreams',
          showInMobile: true
        }
      ]
    },
    {
      id: 'social',
      title: 'Social',
      showInMobile: true,
      items: [
        {
          id: 'chat',
          label: 'Chat',
          icon: 'message-circle',
          href: '/chat',
          showInMobile: true,
          isNew: true
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: 'user',
          href: '/profile',
          showInMobile: true
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      showInMobile: false,
      items: [
        {
          id: 'support',
          label: 'Support',
          icon: 'headphones',
          href: '/support'
        },
        {
          id: 'more',
          label: 'More',
          icon: 'more-horizontal',
          href: '/more'
        }
      ]
    }
  ],
  
  user: {
    id: '1',
    name: 'David Patrick',
    username: 'david_patrick01',
    avatar: '/default-avatar.png',
    verified: false
  },
  
  primaryAction: {
    label: 'Create market',
    href: '/create',
    icon: 'plus'
  },
  
  secondaryAction: {
    label: 'Log in',
    href: '/login'
  }
};

// Mobile bottom navigation items (exactly like pump.fun)
export const mobileBottomNavItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    href: '/',
    active: true,
    showInMobile: true
  },
  {
    id: 'create',
    label: 'Create',
    icon: 'plus',
    href: '/create',
    showInMobile: true
  },
  {
    id: 'livestreams',
    label: 'Livestreams',
    icon: 'camera',
    href: '/livestreams',
    showInMobile: true
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'message-circle',
    href: '/chat',
    showInMobile: true,
    isNew: true
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'user',
    href: '/profile',
    showInMobile: true
  }
];

// Desktop sidebar navigation
export const desktopSidebarItems = navigationConfig.navigation;

// Search configuration
export const searchConfig = {
  placeholder: 'Search markets...',
  buttonText: 'Search'
};

// Theme colors
export const themeColors = {
  primary: '#FFD700', // Yellow
  background: '#000000', // Black
  surface: '#111111', // Dark gray
  text: '#FFFFFF', // White
  textSecondary: '#CCCCCC', // Light gray
  border: '#333333', // Medium gray
  success: '#00FF00', // Green for positive values
  error: '#FF0000' // Red for negative values
};
