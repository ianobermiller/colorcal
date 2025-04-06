import { CalendarGrid } from './CalendarGrid';
import { exampleData } from './exampleCalendarData';

interface Props {
  /** for preact-router */
  path: string;
}

export function Landing(_: Props) {
  return (
    <div className="max-w-2xl">
      <p>
        Organizing a multi-city trip is hard, keeping track of where you are going and for how long. Use Color Calendar
        to paint on the days, see at a glance how long you are staying in each location, and have a colorful big picture
        of your entire trip.
      </p>
      <div className="mt-4 inline-block rounded bg-slate-100 p-6">
        <h2>Example Trip to the UK</h2>
        <CalendarGrid {...exampleData} />
      </div>
    </div>
  );
}
