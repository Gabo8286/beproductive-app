import { http, HttpResponse } from 'msw';
import { createMockGoal, createMockUser, createMockHabit } from '@/test/mock-data';

// Base URL for API endpoints
const API_BASE = 'http://localhost:3000/api';

// Mock data generators
const generateMockGoals = (count: number = 5) => {
  return Array.from({ length: count }, (_, index) =>
    createMockGoal({
      id: `goal-${index + 1}`,
      title: `Mock Goal ${index + 1}`,
      description: `Description for mock goal ${index + 1}`,
      progress: Math.floor(Math.random() * 100),
    })
  );
};

const generateMockUsers = (count: number = 3) => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `user-${index + 1}`,
      email: `user${index + 1}@example.com`,
      name: `User ${index + 1}`,
    })
  );
};

const generateMockHabits = (count: number = 4) => {
  return Array.from({ length: count }, (_, index) =>
    createMockHabit({
      id: `habit-${index + 1}`,
      name: `Mock Habit ${index + 1}`,
      description: `Description for mock habit ${index + 1}`,
    })
  );
};

// API handlers for different scenarios
export const successHandlers = [
  // Goals API
  http.get(`${API_BASE}/goals`, () => {
    return HttpResponse.json({
      data: generateMockGoals(),
      total: 5,
      page: 1,
      limit: 10,
    });
  }),

  http.get(`${API_BASE}/goals/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      data: createMockGoal({ id: id as string }),
    });
  }),

  http.post(`${API_BASE}/goals`, async ({ request }) => {
    const newGoal = await request.json();
    return HttpResponse.json({
      data: createMockGoal({
        id: 'new-goal-id',
        ...newGoal,
      }),
    }, { status: 201 });
  }),

  http.put(`${API_BASE}/goals/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    return HttpResponse.json({
      data: createMockGoal({
        id: id as string,
        ...updates,
      }),
    });
  }),

  http.delete(`${API_BASE}/goals/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      message: `Goal ${id} deleted successfully`,
    });
  }),

  // Users API
  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json({
      data: createMockUser(),
    });
  }),

  http.put(`${API_BASE}/users/me`, async ({ request }) => {
    const updates = await request.json();
    return HttpResponse.json({
      data: createMockUser(updates),
    });
  }),

  // Habits API
  http.get(`${API_BASE}/habits`, () => {
    return HttpResponse.json({
      data: generateMockHabits(),
      total: 4,
    });
  }),

  http.post(`${API_BASE}/habits`, async ({ request }) => {
    const newHabit = await request.json();
    return HttpResponse.json({
      data: createMockHabit({
        id: 'new-habit-id',
        ...newHabit,
      }),
    }, { status: 201 });
  }),

  // Analytics API
  http.get(`${API_BASE}/analytics/dashboard`, () => {
    return HttpResponse.json({
      data: {
        totalGoals: 15,
        completedGoals: 8,
        activeHabits: 5,
        weeklyProgress: [
          { day: 'Mon', completed: 3 },
          { day: 'Tue', completed: 5 },
          { day: 'Wed', completed: 2 },
          { day: 'Thu', completed: 4 },
          { day: 'Fri', completed: 6 },
          { day: 'Sat', completed: 1 },
          { day: 'Sun', completed: 3 },
        ],
      },
    });
  }),
];

// Error scenario handlers
export const errorHandlers = [
  // Network errors
  http.get(`${API_BASE}/goals`, () => {
    return HttpResponse.error();
  }),

  // Server errors
  http.post(`${API_BASE}/goals`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Validation errors
  http.put(`${API_BASE}/goals/:id`, () => {
    return HttpResponse.json(
      {
        error: 'Validation failed',
        details: {
          title: 'Title is required',
          description: 'Description must be at least 10 characters',
        },
      },
      { status: 400 }
    );
  }),

  // Authentication errors
  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),

  // Not found errors
  http.get(`${API_BASE}/goals/:id`, () => {
    return HttpResponse.json(
      { error: 'Goal not found' },
      { status: 404 }
    );
  }),
];

// Slow response handlers for performance testing
export const slowHandlers = [
  http.get(`${API_BASE}/goals`, async () => {
    // Simulate slow network
    await new Promise(resolve => setTimeout(resolve, 3000));
    return HttpResponse.json({
      data: generateMockGoals(),
    });
  }),

  http.post(`${API_BASE}/goals`, async ({ request }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newGoal = await request.json();
    return HttpResponse.json({
      data: createMockGoal({
        id: 'slow-goal-id',
        ...newGoal,
      }),
    }, { status: 201 });
  }),
];

// Pagination handlers
export const paginationHandlers = [
  http.get(`${API_BASE}/goals`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const total = 50;

    const startIndex = (page - 1) * limit;
    const goals = Array.from({ length: limit }, (_, index) =>
      createMockGoal({
        id: `goal-${startIndex + index + 1}`,
        title: `Goal ${startIndex + index + 1}`,
      })
    );

    return HttpResponse.json({
      data: goals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  }),
];

// Search and filter handlers
export const searchHandlers = [
  http.get(`${API_BASE}/goals/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');

    let goals = generateMockGoals(10);

    // Filter by search query
    if (query) {
      goals = goals.filter(goal =>
        goal.title.toLowerCase().includes(query.toLowerCase()) ||
        goal.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by status
    if (status) {
      goals = goals.filter(goal => goal.status === status);
    }

    // Filter by category
    if (category) {
      goals = goals.filter(goal => goal.category === category);
    }

    return HttpResponse.json({
      data: goals,
      query: {
        q: query,
        status,
        category,
      },
      total: goals.length,
    });
  }),
];

// File upload handlers
export const uploadHandlers = [
  http.post(`${API_BASE}/goals/:id/attachments`, async ({ params, request }) => {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    return HttpResponse.json({
      data: {
        id: 'attachment-id',
        goalId: id,
        filename: file.name,
        size: file.size,
        type: file.type,
        url: `https://example.com/attachments/${file.name}`,
        uploadedAt: new Date().toISOString(),
      },
    }, { status: 201 });
  }),
];

// Real-time data handlers (WebSocket simulation)
export const realtimeHandlers = [
  http.get(`${API_BASE}/goals/:id/live-progress`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      data: {
        goalId: id,
        progress: Math.floor(Math.random() * 100),
        lastUpdated: new Date().toISOString(),
        activeUsers: Math.floor(Math.random() * 5) + 1,
      },
    });
  }),
];

// Default handlers (success scenario)
export const handlers = [
  ...successHandlers,
  ...paginationHandlers,
  ...searchHandlers,
  ...uploadHandlers,
  ...realtimeHandlers,
];