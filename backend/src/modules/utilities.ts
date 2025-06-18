// Time and Year module - Melbourne Aus
export function formatLocalTime() {
  const now = new Date();

  const melTime = new Date(now.toLocaleString("en-AU", {timeZone: "Australia/Melbourne"}));

  const year = melTime.getFullYear();
  const month = String(melTime.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(melTime.getDate()).padStart(2, '0');
  const hours = String(melTime.getHours()).padStart(2, '0');
  const minutes = String(melTime.getMinutes()).padStart(2, '0');
  const seconds = String(melTime.getSeconds()).padStart(2, '0');

  return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
}
