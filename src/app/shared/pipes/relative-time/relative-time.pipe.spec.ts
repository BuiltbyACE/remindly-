/**
 * RelativeTime Pipe Unit Tests
 * Testing date transformation to relative time strings
 */

import { describe, it, expect } from 'vitest';
import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;

  beforeEach(() => {
    pipe = new RelativeTimePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null/undefined input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return "just now" for recent timestamps', () => {
    const now = new Date();
    expect(pipe.transform(now)).toBe('just now');
    
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(pipe.transform(thirtySecondsAgo)).toBe('just now');
  });

  it('should return minutes for timestamps within hour', () => {
    const now = new Date();
    
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(pipe.transform(fiveMinutesAgo)).toBe('5 mins ago');
    
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    expect(pipe.transform(oneMinuteAgo)).toBe('1 min ago');
  });

  it('should return hours for timestamps within day', () => {
    const now = new Date();
    
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(pipe.transform(twoHoursAgo)).toBe('2 hours ago');
    
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    expect(pipe.transform(oneHourAgo)).toBe('1 hour ago');
  });

  it('should return days for timestamps within month', () => {
    const now = new Date();
    
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(threeDaysAgo)).toBe('3 days ago');
  });

  it('should handle string date input', () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = pipe.transform(pastDate);
    expect(result).toContain('hours ago');
  });

  it('should return "in X" format for future dates', () => {
    const now = new Date();
    
    const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    expect(pipe.transform(inTwoHours)).toBe('in 2 hours');
    
    const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expect(pipe.transform(inOneDay)).toBe('in 1 day');
  });

  it('should respect unit option when specified', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    expect(pipe.transform(fiveMinutesAgo, { unit: 'minute' })).toBe('5 minutes ago');
    expect(pipe.transform(fiveMinutesAgo, { unit: 'second' })).toBe('300 seconds ago');
  });

  it('should handle addSuffix option', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Default adds suffix
    expect(pipe.transform(fiveMinutesAgo)).toBe('5 mins ago');
  });
});
