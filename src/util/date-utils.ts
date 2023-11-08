import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { Timestamp } from "firebase/firestore";

dayjs.extend(calendar);

export function formatTimestamp(timestamp: Timestamp): string {
  if (!timestamp) {
    return "";
  }

  return dayjs(timestamp.toMillis()).calendar(null, {
    sameDay: "[Today at] h:mm A", // The same day ( Today at 2:30 AM )
    nextDay: "[Tomorrow at] h:mm A", // The next day ( Tomorrow at 2:30 AM )
    nextWeek: "dddd [at] h:mm A", // The next week ( Sunday at 2:30 AM )
    lastDay: "[Yesterday at] h:mm A", // The day before ( Yesterday at 2:30 AM )
    lastWeek: "[Last] dddd [at] h:mm A", // Last week ( Last Monday at 2:30 AM )
    sameElse: "DD/MM/YYYY", // Everything else ( 17/10/2025 )
  });
}