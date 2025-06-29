// Time and Year module - Melbourne Aus
export function formatLocalTime() {
  const now = new Date();

  const date = now.getDate(); // Day of the month (1-31)
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed (0-11)
  const year = now.getFullYear(); // Full year (e.g., 2025)
  
  const hours = String(now.getHours()).padStart(2, '0'); // Current hour (0-23)
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Current minute (0-59)
  const seconds = String(now.getSeconds()).padStart(2, '0'); // Current second (0-59)

  const fullDate = `${date}-${month}-${year}-${hours}:${minutes}:${seconds}`;

  console.log(fullDate);
  return fullDate;
}
