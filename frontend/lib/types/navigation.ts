/**
 * Navigation Types for Goat Fun
 */

export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  
  /** Display name for the navigation item */
  label: string;
  
  /** Icon name or component for the navigation item */
  icon: string;
  
  /** URL path for navigation */
  href: string;
  
  /** Whether this item is currently active */
  active?: boolean;
  
  /** Whether this item should be shown in mobile bottom nav */
  showInMobile?: boolean;
  
  /** Badge or notification count */
  badge?: number;
  
  /** Whether this item has a "NEW" tag */
  isNew?: boolean;
}

export interface NavigationGroup {
  /** Group identifier */
  id: string;
  
  /** Group title */
  title: string;
  
  /** Items in this group */
  items: NavigationItem[];
  
  /** Whether this group should be shown in mobile */
  showInMobile?: boolean;
}

export interface UserProfile {
  /** User ID */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Username/handle */
  username: string;
  
  /** Profile picture URL */
  avatar: string;
  
  /** Whether user is verified */
  verified?: boolean;
}

export interface NavigationConfig {
  /** Logo/brand information */
  logo: {
    /** Logo image path */
    src: string;
    /** Alt text for logo */
    alt: string;
    /** Logo text */
    text: string;
  };
  
  /** Main navigation groups */
  navigation: NavigationGroup[];
  
  /** User profile information */
  user: UserProfile;
  
  /** Primary action button (like "Create market") */
  primaryAction: {
    label: string;
    href: string;
    icon?: string;
  };
  
  /** Secondary action button (like "Log in") */
  secondaryAction: {
    label: string;
    href: string;
  };
}

export type NavigationVariant = 'desktop' | 'mobile-bottom' | 'mobile-top';
