/**
 * TypeScript types for Console Warning Module
 */

export interface ConsoleWarningOptions {
  /** Whether to show warning when page loads */
  showOnLoad?: boolean;
  
  /** Whether to detect when developer tools are opened/closed */
  detectDevTools?: boolean;
  
  /** Whether to override console.log to show warning on every log */
  overrideConsoleLog?: boolean;
  
  /** Interval in milliseconds to check for dev tools opening */
  checkInterval?: number;
}

export interface DevToolsState {
  /** Whether dev tools are currently open */
  open: boolean;
  
  /** Orientation of dev tools (null if not detected) */
  orientation: string | null;
}

export interface ConsoleWarningInstance {
  /** Initialize the console warning system */
  init(): void;
  
  /** Clean up and destroy the console warning system */
  destroy(): void;
  
  /** Show warning once manually */
  showWarningOnce(): void;
}

export type ConsoleWarningConstructor = new (options?: ConsoleWarningOptions) => ConsoleWarningInstance;
