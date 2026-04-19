export function isSuperClasicoActive(): boolean {
  const now = new Date();
  // Convertir a hora Colombia (UTC-5)
  const bogotaOffset = -5 * 60; // minutos
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bogotaTime = new Date(utc + bogotaOffset * 60000);

  const year = bogotaTime.getFullYear();
  const month = bogotaTime.getMonth(); // 0-indexed
  const day = bogotaTime.getDate();

  return year === 2026 && month === 3 && day === 19; // abril = mes 3
}

export function getSuperClasicoEndTime(): Date {
  // 19 de abril 2026 23:59:59 Colombia = 20 de abril 04:59:59 UTC
  return new Date("2026-04-20T04:59:59Z");
}

export function getSuperClasicoStartTime(): Date {
  // 19 de abril 2026 00:00:00 Colombia = 19 de abril 05:00:00 UTC
  return new Date("2026-04-19T05:00:00Z");
}

export function getTimeRemaining(): {
  total: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const end = getSuperClasicoEndTime();
  const total = end.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor(total / (1000 * 60 * 60));
  return { total, hours, minutes, seconds };
}
