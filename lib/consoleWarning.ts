/**
 * Console Warning Module
 * Displays security warnings in the browser console similar to pump.fun
 */

import type { ConsoleWarningInstance, ConsoleWarningOptions, DevToolsState } from './types/consoleWarning';

export class ConsoleWarning implements ConsoleWarningInstance {
  private originalLog: typeof console.log;
  private originalClear: typeof console.clear;
  private devtools: DevToolsState = { open: false, orientation: null };
  private intervalId: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor(private options: ConsoleWarningOptions = {}) {
    // Set default options
    this.options = {
      showOnLoad: true,
      detectDevTools: true,
      overrideConsoleLog: true,
      checkInterval: 500,
      ...options
    };

    this.originalLog = console.log;
    this.originalClear = console.clear;
  }

  private showWarning(): void {
    this.originalClear();
    this.originalLog('%c⚠️ Warning!', 'color: yellow; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    this.originalLog('%cYou are reading this message because you opened the browser console, a developer tool. Do not enter or paste code you do not understand. Never share your tokens or any other info with anyone. If someone told you to do this, it is very likely a scam.', 'color: white; background: #2563eb; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);');
    this.originalLog('%c🚨 SECURITY WARNING', 'color: red; font-size: 16px; font-weight: bold;');
    this.originalLog('%cThis is a developer tool. Never enter code you don\'t understand!', 'color: orange; font-size: 14px; font-weight: bold;');
  }

  private detectDevTools(): void {
    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!this.devtools.open) {
        this.devtools.open = true;
        this.showWarning();
      }
    } else {
      this.devtools.open = false;
    }
  }

  private handleResize = (): void => {
    this.detectDevTools();
  };

  public init(): void {
    if (this.isInitialized) return;

    // Override console.log if enabled
    if (this.options.overrideConsoleLog) {
      console.log = (...args: unknown[]) => {
        this.showWarning();
        this.originalLog.apply(console, args);
      };
    }

    // Show warning on load if enabled
    if (this.options.showOnLoad) {
      this.showWarning();
    }

    // Set up dev tools detection if enabled
    if (this.options.detectDevTools) {
      // Check periodically
      this.intervalId = setInterval(() => {
        this.detectDevTools();
      }, this.options.checkInterval);

      // Listen for resize events
      window.addEventListener('resize', this.handleResize);
    }

    this.isInitialized = true;
  }

  public destroy(): void {
    if (!this.isInitialized) return;

    // Restore original console methods
    console.log = this.originalLog;

    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    this.isInitialized = false;
  }

  public showWarningOnce(): void {
    this.showWarning();
  }
}

// Convenience function for quick setup
export function initConsoleWarning(options?: ConsoleWarningOptions): ConsoleWarning {
  const warning = new ConsoleWarning(options);
  warning.init();
  return warning;
}

// Re-export types for convenience
export type { ConsoleWarningInstance, ConsoleWarningOptions, DevToolsState } from './types/consoleWarning';

// Default export for easy importing
export default ConsoleWarning;
