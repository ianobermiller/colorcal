import type { Calendar, Category, Day } from './types';

const commonFields = { createdAt: '', id: '', notes: '', ownerId: '' };
const commonInnerFields = { ...commonFields, calendarId: '' };

export const exampleData: {
  calendar: Calendar;
  categories: Category[];
  days: Day[];
} = {
  calendar: {
    ...commonFields,
    endDate: '2023-05-22',
    isPubliclyVisible: false,
    startDate: '2023-05-01',
    title: 'Fake UK Travels',
    updatedAt: '2023-05-01',
  },
  categories: [
    { ...commonInnerFields, color: '#8da0cb', id: 'travel', name: 'Travel' },
    { ...commonInnerFields, color: '#66c2a5', id: 'london', name: 'London' },
    { ...commonInnerFields, color: '#fc8d62', id: 'york', name: 'York' },
    { ...commonInnerFields, color: '#a6d854', id: 'edinburgh', name: 'Edinburgh' },
    { ...commonInnerFields, color: '#ffd92f', id: 'leeds', name: 'Leeds' },
    { ...commonInnerFields, color: '#e78ac3', id: 'inverness', name: 'Inverness' },
    { ...commonInnerFields, color: '#ffd92f', id: 'glasgow', name: 'Glasgow' },
    { ...commonInnerFields, color: '#fc8d62', id: 'liverpool', name: 'Liverpool' },
  ],
  days: [
    { ...commonInnerFields, categoryId: 'travel', date: '2023-05-01', halfCategoryId: 'london' },
    { ...commonInnerFields, categoryId: 'london', date: '2023-05-02' },
    { ...commonInnerFields, categoryId: 'london', date: '2023-05-03' },
    { ...commonInnerFields, categoryId: 'london', date: '2023-05-04' },
    { ...commonInnerFields, categoryId: 'london', date: '2023-05-05', halfCategoryId: 'york' },
    { ...commonInnerFields, categoryId: 'york', date: '2023-05-06' },
    { ...commonInnerFields, categoryId: 'york', date: '2023-05-07' },
    { ...commonInnerFields, categoryId: 'york', date: '2023-05-08', halfCategoryId: 'leeds' },
    { ...commonInnerFields, categoryId: 'leeds', date: '2023-05-09', halfCategoryId: 'edinburgh' },
    { ...commonInnerFields, categoryId: 'edinburgh', date: '2023-05-10' },
    { ...commonInnerFields, categoryId: 'edinburgh', date: '2023-05-11' },
    { ...commonInnerFields, categoryId: 'edinburgh', date: '2023-05-12' },
    { ...commonInnerFields, categoryId: 'edinburgh', date: '2023-05-13', halfCategoryId: 'inverness' },
    { ...commonInnerFields, categoryId: 'inverness', date: '2023-05-14' },
    { ...commonInnerFields, categoryId: 'inverness', date: '2023-05-15' },
    { ...commonInnerFields, categoryId: 'inverness', date: '2023-05-16', halfCategoryId: 'glasgow' },
    { ...commonInnerFields, categoryId: 'glasgow', date: '2023-05-17' },
    { ...commonInnerFields, categoryId: 'glasgow', date: '2023-05-18', halfCategoryId: 'liverpool' },
    { ...commonInnerFields, categoryId: 'liverpool', date: '2023-05-19' },
    { ...commonInnerFields, categoryId: 'liverpool', date: '2023-05-20' },
    { ...commonInnerFields, categoryId: 'liverpool', date: '2023-05-21', halfCategoryId: 'london' },
    { ...commonInnerFields, categoryId: 'london', date: '2023-05-22', halfCategoryId: 'travel' },
  ],
};
