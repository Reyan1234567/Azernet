const millisecondsInADay = 24 * 60 * 60 * 1000;

export const ToMilliSeconds = (days: number) => {
  return days * millisecondsInADay;
};

export const toDays = (milliseconds: number) => {
  return Math.floor(milliseconds / millisecondsInADay);
};
