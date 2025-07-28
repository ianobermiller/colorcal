import { CalendarGrid } from './CalendarGrid';
import { exampleData } from './exampleCalendarData';

export function Landing() {
    return (
        <div class="max-w-2xl">
            <p>
                Organizing a multi-city trip is hard, keeping track of where you are going and for how long. Use Color
                Calendar to paint on the days, see at a glance how long you are staying in each location, and have a
                colorful big picture of your entire trip.
            </p>
            <div class="mt-4 rounded bg-slate-100 p-6 dark:bg-slate-800">
                <h2>Example Trip to the UK</h2>
                <CalendarGrid
                    calendar={() => exampleData.calendar}
                    categories={() => exampleData.categories}
                    days={() => exampleData.days}
                    isReadOnly
                />
            </div>
        </div>
    );
}
