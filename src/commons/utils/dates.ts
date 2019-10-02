import { format } from "date-fns";

function fixedDate(input?: Date | string): Date {
  // TODO: make sure the date component never changes, even if we're in a different timezone
  if (input) {
    return new Date(input);
  } else {
    return new Date();
  }
}

function dateToDateKey(date: Date): string {
  if (!date) {
    return null;
  }

  return format(date, "YYYY-MM-DD");
}

function dateToUrlString(date: Date): string {
  if (!date) {
    return null;
  }

  return format(date, "YYYY-MM-DD");
}

function urlStringToDate(date: string): Date {
  if (!date) {
    return null;
  }

  return fixedDate(date);
}

export { fixedDate, dateToDateKey, dateToUrlString, urlStringToDate };
