import moment from 'moment-timezone';

// Commonwealth of Dominica timezone (UTC-4)
export const DOMINICA_TIMEZONE = 'America/Dominica';

/**
 * Convert UTC date to Dominica local time
 * @param utcDate - Date in UTC (string or Date object)
 * @returns Date object in Dominica timezone
 */
export const convertToLocalTime = (utcDate: string | Date): Date => {
  return moment.utc(utcDate).tz(DOMINICA_TIMEZONE).toDate();
};

/**
 * Convert Dominica local time to UTC
 * @param localDate - Date in Dominica timezone
 * @returns Date object in UTC
 */
export const convertToUTC = (localDate: Date): Date => {
  return moment.tz(localDate, DOMINICA_TIMEZONE).utc().toDate();
};

/**
 * Format date for display in Dominica timezone
 * @param utcDate - Date in UTC (string or Date object)
 * @param format - Moment.js format string (optional)
 * @returns Formatted date string in Dominica timezone
 */
export const formatLocalTime = (utcDate: string | Date, format: string = 'MMMM D, YYYY [at] h:mm A'): string => {
  return moment.utc(utcDate).tz(DOMINICA_TIMEZONE).format(format);
};

/**
 * Get current time in Dominica timezone
 * @returns Date object representing current time in Dominica timezone
 */
export const getCurrentLocalTime = (): Date => {
  return moment().tz(DOMINICA_TIMEZONE).toDate();
};

/**
 * Get current UTC time
 * @returns Date object representing current time in UTC
 */
export const getCurrentUTC = (): Date => {
  return moment.utc().toDate();
};

/**
 * Check if a date is in the future (in Dominica timezone)
 * @param date - Date to check
 * @returns True if date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  const now = getCurrentLocalTime();
  return date > now;
};

/**
 * Format publication timestamp for display
 * @param publishedAt - UTC date when article was published (string or Date)
 * @returns Formatted string like "Published on: March 15, 2024 at 2:30 PM"
 */
export const formatPublicationTime = (publishedAt: string | Date): string => {
  return `Published on: ${formatLocalTime(publishedAt)}`;
};

/**
 * Format scheduled timestamp for display
 * @param scheduledAt - UTC date when article is scheduled (string or Date)
 * @returns Formatted string like "Scheduled for: March 15, 2024 at 2:30 PM"
 */
export const formatScheduledTime = (scheduledAt: string | Date): string => {
  return `Scheduled for: ${formatLocalTime(scheduledAt)}`;
};

/**
 * Format date for datetime-local input (in Dominica timezone)
 * @param utcDate - UTC date (string or Date object)
 * @returns String formatted for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export const formatForDateTimeInput = (utcDate: string | Date): string => {
  return moment.utc(utcDate).tz(DOMINICA_TIMEZONE).format('YYYY-MM-DDTHH:mm');
};

/**
 * Parse datetime-local input to UTC date
 * @param localTimeString - Time string from datetime-local input (in Dominica timezone)
 * @returns Date object in UTC
 */
export const parseLocalTimeToUTC = (localTimeString: string): Date => {
  return moment.tz(localTimeString, DOMINICA_TIMEZONE).utc().toDate();
};

/**
 * Get timezone offset for Dominica
 * @returns Timezone offset string (e.g., "-04:00")
 */
export const getDominicaTimezoneOffset = (): string => {
  return moment().tz(DOMINICA_TIMEZONE).format('Z');
};

/**
 * Get timezone abbreviation for Dominica
 * @returns Timezone abbreviation (e.g., "AST" for Atlantic Standard Time)
 */
export const getDominicaTimezoneAbbr = (): string => {
  return moment().tz(DOMINICA_TIMEZONE).format('z');
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param utcDate - UTC date (string or Date object)
 * @returns Relative time string in Dominica timezone
 */
export const formatRelativeTime = (utcDate: string | Date): string => {
  return moment.utc(utcDate).tz(DOMINICA_TIMEZONE).fromNow();
};

/**
 * Format short date for article listings
 * @param utcDate - UTC date (string or Date object)
 * @returns Short formatted date like "Mar 15, 2024"
 */
export const formatShortDate = (utcDate: string | Date): string => {
  return formatLocalTime(utcDate, 'MMM D, YYYY');
};

/**
 * Format time only
 * @param utcDate - UTC date (string or Date object)
 * @returns Time string like "2:30 PM"
 */
export const formatTimeOnly = (utcDate: string | Date): string => {
  return formatLocalTime(utcDate, 'h:mm A');
};