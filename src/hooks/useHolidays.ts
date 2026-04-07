import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export interface Holiday {
  name: string;
  date: string;
  type: string[];
}

const CALENDARIFIC_KEY = '7x9vyqnTXcJ1noofiNEKUZ5rOQS5Vjak';

export function useHolidays(year: number, month: number, country = 'IN') {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_KEY}&country=${country}&year=${year}&month=${month}`
        );
        const data = await res.json();
        if (data.response?.holidays) {
          setHolidays(
            data.response.holidays.map((h: any) => ({
              name: h.name,
              date: dayjs(h.date.iso).format('YYYY-MM-DD'),
              type: h.type || [],
            }))
          );
        }
      } catch {
        console.warn('Failed to fetch holidays');
      }
    };
    fetchHolidays();
  }, [year, month, country]);

  return holidays;
}
