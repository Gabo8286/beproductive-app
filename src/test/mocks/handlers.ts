import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:54321';

export const handlers = [
  // Auth endpoints
  http.post(`${BASE_URL}/auth/v1/signup`, () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      session: {
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
      },
    });
  }),

  http.post(`${BASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    });
  }),

  // Tasks endpoints
  http.get(`${BASE_URL}/rest/v1/tasks`, () => {
    return HttpResponse.json([
      {
        id: 'task-1',
        title: 'Test Task',
        status: 'todo',
        user_id: 'test-user-id',
      },
    ]);
  }),

  http.post(`${BASE_URL}/rest/v1/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: 'new-task-id',
      ...body,
      created_at: new Date().toISOString(),
    });
  }),

  // Goals endpoints
  http.get(`${BASE_URL}/rest/v1/goals`, () => {
    return HttpResponse.json([
      {
        id: 'goal-1',
        title: 'Test Goal',
        user_id: 'test-user-id',
      },
    ]);
  }),

  // Habits endpoints
  http.get(`${BASE_URL}/rest/v1/habits`, () => {
    return HttpResponse.json([
      {
        id: 'habit-1',
        name: 'Test Habit',
        user_id: 'test-user-id',
      },
    ]);
  }),
];
