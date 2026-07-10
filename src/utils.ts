// Date and Time Utility Helpers for FINORA AI

/**
 * Formats a date string, Date object, or timestamp to DD-MM-YYYY format.
 * Examples: '10-07-2026', '04-01-2026', etc.
 */
export function formatDate(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return "";
  const dateStr = String(dateInput);

  // If it's already in DD-MM-YYYY format, return it
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Handle YYYY-MM-DD
  const matchIso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchIso) {
    return `${matchIso[3]}-${matchIso[2]}-${matchIso[1]}`;
  }

  // Handle ISO strings with time 'YYYY-MM-DDTHH:MM:SS...'
  const matchIsoTime = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  if (matchIsoTime) {
    const parts = dateStr.split('T')[0].split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return dateStr;
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Formats a date or time string to H:MM AM/PM format (without seconds).
 * Examples: '9:15 AM', '1:42 PM', '7:08 PM'.
 */
export function formatTime(timeInput: string | Date | number | undefined | null): string {
  if (!timeInput) return "12:00 PM";
  
  const d = new Date(timeInput);
  if (isNaN(d.getTime())) {
    // Attempt to extract time from string if it's already a time string or contains one
    const timeStr = String(timeInput);
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = match[2];
      const ampm = match[4] || (h >= 12 ? 'PM' : 'AM');
      h = h % 12;
      h = h ? h : 12;
      return `${h}:${m} ${ampm.toUpperCase()}`;
    }
    return "12:00 PM";
  }

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Returns a static date-time configuration for the app
 * matching the current 2026-07-10 system time if needed.
 */
export function getCurrentFormattedDateTime() {
  const now = new Date();
  return {
    date: formatDate(now),
    time: formatTime(now)
  };
}
