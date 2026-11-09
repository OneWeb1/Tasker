import { baseApi } from '@/shared/api';
import type { CalendarEvent } from '../model/types/event';
import { eventsMock } from './__mocks__/eventsMock';

const COLLECTION = 'events';

export const eventApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEvents: build.query<CalendarEvent[], void>({
      query: () => ({ op: 'list', collection: COLLECTION, seed: eventsMock }),
      providesTags: ['Event'],
    }),
  }),
});

export const { useGetEventsQuery } = eventApi;