/**
 * Vitest Test Setup
 * Configure testing environment and global mocks
 */

import '@testing-library/jest-dom';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Initialize Angular TestBed
TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Global mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// IntersectionObserver mock
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// ResizeObserver mock
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// IndexedDB mock
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: mockIndexedDB,
});

// Web Speech API mock
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: class MockSpeechRecognition {
    start = vi.fn();
    stop = vi.fn();
    onresult = null;
    onerror = null;
    onend = null;
    lang = 'en-US';
  },
});

// Notification API mock
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: class MockNotification {
    static permission = 'default';
    static requestPermission = vi.fn().mockResolvedValue('granted');
    close = vi.fn();
  },
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
