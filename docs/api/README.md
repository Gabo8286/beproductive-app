# Spark Bloom Flow API Documentation

## Overview

The Spark Bloom Flow API provides enterprise-grade endpoints for integrating productivity and habit tracking capabilities into your applications. This RESTful API supports authentication, real-time updates, and comprehensive data access.

## Base URL

```
Production: https://api.sparkbloomflow.com/v1
Staging: https://staging-api.sparkbloomflow.com/v1
```

## Authentication

### API Key Authentication

All API requests require authentication using an API key in the Authorization header:

```http
Authorization: Bearer your-api-key-here
```

### OAuth 2.0 Flow

For user-specific data access, implement OAuth 2.0:

1. **Authorization URL**: `https://auth.sparkbloomflow.com/oauth/authorize`
2. **Token URL**: `https://auth.sparkbloomflow.com/oauth/token`
3. **Scopes**:
   - `read:tasks` - Read task data
   - `write:tasks` - Create and update tasks
   - `read:habits` - Read habit tracking data
   - `write:habits` - Create and update habits
   - `read:analytics` - Access productivity analytics
   - `admin:org` - Organization administration

### Request Example

```bash
curl -X GET "https://api.sparkbloomflow.com/v1/tasks" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"
```

## Rate Limiting

- **Free Tier**: 1,000 requests per hour
- **Pro Tier**: 10,000 requests per hour
- **Enterprise**: 100,000 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Response Format

All responses use JSON format with consistent structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0",
    "request_id": "req_abc123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "title",
      "issue": "Required field missing"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0",
    "request_id": "req_abc123"
  }
}
```

## Core Resources

### Tasks

Manage productivity tasks and to-do items.

#### Task Object

```json
{
  "id": "task_abc123",
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2024-01-20T17:00:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:22:00Z",
  "completed_at": null,
  "tags": ["documentation", "api"],
  "assignee_id": "user_xyz789",
  "project_id": "proj_def456",
  "metadata": {
    "estimated_hours": 4,
    "actual_hours": 2.5
  }
}
```

### Habits

Track recurring behaviors and build positive routines.

#### Habit Object

```json
{
  "id": "habit_def456",
  "name": "Daily Exercise",
  "description": "30 minutes of physical activity",
  "frequency": "daily",
  "target_value": 30,
  "unit": "minutes",
  "created_at": "2024-01-01T08:00:00Z",
  "streak": {
    "current": 15,
    "longest": 25,
    "last_completed": "2024-01-15T19:30:00Z"
  },
  "category": "health",
  "is_active": true
}
```

### Analytics

Access productivity insights and performance metrics.

#### Analytics Object

```json
{
  "user_id": "user_xyz789",
  "period": "week",
  "start_date": "2024-01-08T00:00:00Z",
  "end_date": "2024-01-14T23:59:59Z",
  "metrics": {
    "tasks_completed": 24,
    "tasks_created": 32,
    "completion_rate": 0.75,
    "average_completion_time": "2.5 hours",
    "productivity_score": 85,
    "habits_maintained": 12,
    "habit_streak_average": 18.5
  },
  "trends": {
    "productivity_change": "+12%",
    "completion_rate_change": "+5%"
  }
}
```

## Endpoints Reference

### Tasks API

#### List Tasks

```http
GET /tasks
```

**Query Parameters:**
- `status` (string): Filter by status (`pending`, `in_progress`, `completed`)
- `priority` (string): Filter by priority (`low`, `medium`, `high`)
- `assignee_id` (string): Filter by assignee
- `project_id` (string): Filter by project
- `limit` (integer): Number of results (default: 50, max: 100)
- `offset` (integer): Pagination offset
- `sort` (string): Sort field (`created_at`, `due_date`, `priority`)
- `order` (string): Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "has_more": true
    }
  }
}
```

#### Create Task

```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "priority": "high",
  "due_date": "2024-01-20T17:00:00Z",
  "assignee_id": "user_xyz789",
  "project_id": "proj_def456",
  "tags": ["documentation", "api"],
  "metadata": {
    "estimated_hours": 4
  }
}
```

#### Get Task

```http
GET /tasks/{task_id}
```

#### Update Task

```http
PATCH /tasks/{task_id}
```

**Request Body:**
```json
{
  "status": "completed",
  "metadata": {
    "actual_hours": 3.5
  }
}
```

#### Delete Task

```http
DELETE /tasks/{task_id}
```

### Habits API

#### List Habits

```http
GET /habits
```

**Query Parameters:**
- `category` (string): Filter by category
- `is_active` (boolean): Filter active/inactive habits
- `frequency` (string): Filter by frequency
- `limit` (integer): Number of results

#### Create Habit

```http
POST /habits
```

**Request Body:**
```json
{
  "name": "Daily Exercise",
  "description": "30 minutes of physical activity",
  "frequency": "daily",
  "target_value": 30,
  "unit": "minutes",
  "category": "health"
}
```

#### Record Habit Completion

```http
POST /habits/{habit_id}/completions
```

**Request Body:**
```json
{
  "completed_at": "2024-01-15T19:30:00Z",
  "value": 35,
  "notes": "Ran 3 miles"
}
```

### Analytics API

#### Get User Analytics

```http
GET /analytics/users/{user_id}
```

**Query Parameters:**
- `period` (string): Time period (`day`, `week`, `month`, `quarter`, `year`)
- `start_date` (string): Start date (ISO 8601)
- `end_date` (string): End date (ISO 8601)
- `metrics` (array): Specific metrics to include

#### Get Team Analytics

```http
GET /analytics/teams/{team_id}
```

#### Get Organization Analytics

```http
GET /analytics/organizations/{org_id}
```

## Webhooks

Subscribe to real-time events using webhooks.

### Supported Events

- `task.created`
- `task.updated`
- `task.completed`
- `task.deleted`
- `habit.created`
- `habit.completed`
- `habit.streak.broken`
- `user.productivity.milestone`

### Webhook Configuration

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/sparkbloom",
  "events": ["task.completed", "habit.completed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "task.completed",
  "timestamp": "2024-01-15T14:22:00Z",
  "data": {
    "task": {
      // Full task object
    },
    "user": {
      "id": "user_xyz789",
      "email": "user@example.com"
    }
  },
  "webhook_id": "webhook_abc123"
}
```

### Webhook Security

Verify webhook authenticity using HMAC-SHA256:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

## SDKs and Libraries

### Official SDKs

- **JavaScript/Node.js**: `npm install @sparkbloom/api-client`
- **Python**: `pip install sparkbloom-api`
- **Java**: Available on Maven Central
- **C#/.NET**: Available on NuGet

### JavaScript SDK Example

```javascript
import { SparkBloomClient } from '@sparkbloom/api-client';

const client = new SparkBloomClient({
  apiKey: 'your-api-key',
  environment: 'production' // or 'staging'
});

// Create a task
const task = await client.tasks.create({
  title: 'Complete integration',
  priority: 'high',
  due_date: '2024-01-20T17:00:00Z'
});

// List habits
const habits = await client.habits.list({
  category: 'health'
});

// Get analytics
const analytics = await client.analytics.getUser('user_xyz789', {
  period: 'week'
});
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_ERROR` | Invalid API key or token |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `VALIDATION_ERROR` | Invalid request parameters |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `MAINTENANCE_MODE` | Service temporarily unavailable |

## Best Practices

### Pagination

Always use pagination for list endpoints:

```javascript
let allTasks = [];
let offset = 0;
const limit = 100;

do {
  const response = await client.tasks.list({ limit, offset });
  allTasks.push(...response.data.tasks);
  offset += limit;
} while (response.data.pagination.has_more);
```

### Error Handling

```javascript
try {
  const task = await client.tasks.create(taskData);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Validation failed:', error.details);
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Implement exponential backoff
    await delay(error.retry_after * 1000);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Bulk Operations

For bulk operations, use batch endpoints:

```http
POST /tasks/batch
```

```json
{
  "operations": [
    {
      "operation": "create",
      "data": { /* task data */ }
    },
    {
      "operation": "update",
      "id": "task_abc123",
      "data": { "status": "completed" }
    }
  ]
}
```

## Support and Resources

- **API Status**: https://status.sparkbloomflow.com
- **Developer Portal**: https://developers.sparkbloomflow.com
- **Support Email**: api-support@sparkbloomflow.com
- **Discord Community**: https://discord.gg/sparkbloom

## Changelog

### Version 1.2.0 (2024-01-15)
- Added batch operations for tasks and habits
- Improved analytics endpoint performance
- Added webhook retry mechanism

### Version 1.1.0 (2024-01-01)
- Added team analytics endpoints
- Enhanced webhook security
- Added rate limiting headers

### Version 1.0.0 (2023-12-01)
- Initial API release
- Core CRUD operations for tasks and habits
- Basic analytics endpoints