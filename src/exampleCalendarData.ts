import { Calendar, Category, Day } from './data';

const commonFields = { createdAt: '', id: '', notes: '', ownerId: '', updatedAt: '' };
const commonInnerFields = { ...commonFields, calendarId: '' };

// prettier-ignore
export const exampleData: {
  calendar: Calendar;
  categories: Category[];
  days: Day[];
} = {
  calendar: {
    ...commonFields,
    endDate: "2023-05-22",
    isPubliclyVisible: false,
    startDate: "2023-05-01",
    title: "Fake UK Travels"
  },
  categories: [
    { ...commonInnerFields, color: "#8da0cb", id: "travel", name: "Travel" },
    { ...commonInnerFields, color: "#66c2a5", id: "london", name: "London" },
    { ...commonInnerFields, color: "#fc8d62", id: "york", name: "York" },
    { ...commonInnerFields, color: "#a6d854", id: "edinburgh", name: "Edinburgh" },
    { ...commonInnerFields, color: "#ffd92f", id: "leeds", name: "Leeds" },
    { ...commonInnerFields, color: "#e78ac3", id: "inverness", name: "Inverness" },
    { ...commonInnerFields, color: "#ffd92f", id: "glasgow", name: "Glasgow" },
    { ...commonInnerFields, color: "#fc8d62", id: "liverpool", name: "Liverpool" },
  ],
  days: [
    { ...commonInnerFields, categoryId: "travel", date: "2023-05-01", halfCategoryId: "london" },
    { ...commonInnerFields, categoryId: "london", date: "2023-05-02", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "london", date: "2023-05-03", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "london", date: "2023-05-04", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "london", date: "2023-05-05", halfCategoryId: "york" },
    { ...commonInnerFields, categoryId: "york", date: "2023-05-06", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "york", date: "2023-05-07", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "york", date: "2023-05-08", halfCategoryId: "leeds" },
    { ...commonInnerFields, categoryId: "leeds", date: "2023-05-09", halfCategoryId: "edinburgh" },
    { ...commonInnerFields, categoryId: "edinburgh", date: "2023-05-10", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "edinburgh", date: "2023-05-11", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "edinburgh", date: "2023-05-12", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "edinburgh", date: "2023-05-13", halfCategoryId: "inverness" },
    { ...commonInnerFields, categoryId: "inverness", date: "2023-05-14", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "inverness", date: "2023-05-15", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "inverness", date: "2023-05-16", halfCategoryId: "glasgow" },
    { ...commonInnerFields, categoryId: "glasgow", date: "2023-05-17", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "glasgow", date: "2023-05-18", halfCategoryId: "liverpool" },
    { ...commonInnerFields, categoryId: "liverpool", date: "2023-05-19", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "liverpool", date: "2023-05-20", halfCategoryId: null },
    { ...commonInnerFields, categoryId: "liverpool", date: "2023-05-21", halfCategoryId: "london" },
    { ...commonInnerFields, categoryId: "london", date: "2023-05-22", halfCategoryId: "travel" },
  ],
};
