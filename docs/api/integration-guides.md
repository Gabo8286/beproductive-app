# Integration Guides

## Overview

This guide provides comprehensive examples for integrating Spark Bloom Flow with popular platforms and enterprise systems.

## Table of Contents

1. [Slack Integration](#slack-integration)
2. [Microsoft Teams](#microsoft-teams)
3. [Salesforce Integration](#salesforce-integration)
4. [Notion Integration](#notion-integration)
5. [Zapier/Make.com](#zapier-automation)
6. [Custom Webhooks](#custom-webhooks)
7. [Single Sign-On (SSO)](#single-sign-on)
8. [Enterprise SCIM](#enterprise-scim)

---

## Slack Integration

### Setup Slack Bot

1. Create a Slack app at https://api.slack.com/apps
2. Add OAuth scopes: `chat:write`, `commands`, `incoming-webhook`
3. Install to your workspace

### Task Notifications

```javascript
// slack-integration.js
const { WebClient } = require('@slack/web-api');
const { SparkBloomClient } = require('@sparkbloom/api-client');

class SlackSparkBloomIntegration {
  constructor(slackToken, sparkBloomApiKey) {
    this.slack = new WebClient(slackToken);
    this.sparkBloom = new SparkBloomClient({ apiKey: sparkBloomApiKey });
  }

  async setupWebhooks() {
    // Create webhook for task completions
    await this.sparkBloom.webhooks.create({
      url: 'https://your-app.com/webhooks/slack-notify',
      events: ['task.completed', 'habit.streak.milestone'],
      secret: process.env.WEBHOOK_SECRET
    });
  }

  async handleTaskCompletion(webhook) {
    const { task, user } = webhook.data;

    const message = {
      channel: '#productivity',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🎉 *${user.name}* completed: *${task.title}*`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Priority: ${task.priority} | Due: ${task.due_date}`
            }
          ]
        }
      ]
    };

    await this.slack.chat.postMessage(message);
  }

  async handleSlashCommand(command) {
    const { text, user_id } = command;

    if (text.startsWith('create task')) {
      const title = text.replace('create task', '').trim();

      const task = await this.sparkBloom.tasks.create({
        title,
        assignee_id: await this.getUserId(user_id)
      });

      return {
        response_type: 'ephemeral',
        text: `✅ Task created: ${task.title}`,
        attachments: [
          {
            color: 'good',
            fields: [
              { title: 'Task ID', value: task.id, short: true },
              { title: 'Status', value: task.status, short: true }
            ]
          }
        ]
      };
    }
  }

  async getUserId(slackUserId) {
    // Map Slack user to SparkBloom user
    const userMapping = await this.getUserMapping(slackUserId);
    return userMapping.sparkbloom_id;
  }
}

// Express.js webhook handler
app.post('/webhooks/slack-notify', (req, res) => {
  const integration = new SlackSparkBloomIntegration(
    process.env.SLACK_TOKEN,
    process.env.SPARKBLOOM_API_KEY
  );

  integration.handleTaskCompletion(req.body);
  res.status(200).send('OK');
});
```

### Slash Commands

```javascript
// Slack slash command: /sparkbloom create task "Complete project docs"
app.post('/slack/commands', async (req, res) => {
  const response = await integration.handleSlashCommand(req.body);
  res.json(response);
});
```

---

## Microsoft Teams

### Teams Bot Setup

```csharp
// TeamsSparkBloomBot.cs
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Teams;
using SparkBloom.Api;

public class TeamsSparkBloomBot : TeamsActivityHandler
{
    private readonly SparkBloomClient _apiClient;

    public TeamsSparkBloomBot(SparkBloomClient apiClient)
    {
        _apiClient = apiClient;
    }

    protected override async Task OnMessageActivityAsync(
        ITurnContext<IMessageActivity> turnContext,
        CancellationToken cancellationToken)
    {
        var text = turnContext.Activity.Text?.ToLowerInvariant();

        if (text.StartsWith("create task"))
        {
            var title = text.Replace("create task", "").Trim();
            var userId = await GetSparkBloomUserId(turnContext.Activity.From.Id);

            var task = await _apiClient.Tasks.CreateAsync(new CreateTaskRequest
            {
                Title = title,
                AssigneeId = userId
            });

            var card = CreateTaskCard(task);
            await turnContext.SendActivityAsync(MessageFactory.Attachment(card));
        }
    }

    private Attachment CreateTaskCard(TaskResponse task)
    {
        var card = new AdaptiveCard("1.2")
        {
            Body = new List<AdaptiveElement>
            {
                new AdaptiveTextBlock
                {
                    Text = "✅ Task Created",
                    Weight = AdaptiveTextWeight.Bolder,
                    Size = AdaptiveTextSize.Medium
                },
                new AdaptiveTextBlock { Text = task.Title },
                new AdaptiveColumnSet
                {
                    Columns = new List<AdaptiveColumn>
                    {
                        new AdaptiveColumn
                        {
                            Items = new List<AdaptiveElement>
                            {
                                new AdaptiveTextBlock { Text = "Priority", Weight = AdaptiveTextWeight.Bolder },
                                new AdaptiveTextBlock { Text = task.Priority }
                            }
                        }
                    }
                }
            }
        };

        return new Attachment
        {
            ContentType = AdaptiveCard.ContentType,
            Content = card
        };
    }
}
```

### Teams Webhook Integration

```javascript
// teams-webhook.js
const axios = require('axios');

class TeamsNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendTaskCompletionNotification(task, user) {
    const card = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Task Completed",
      "sections": [
        {
          "activityTitle": "🎉 Task Completed",
          "activitySubtitle": `by ${user.name}`,
          "facts": [
            { "name": "Task", "value": task.title },
            { "name": "Priority", "value": task.priority },
            { "name": "Completed", "value": new Date(task.completed_at).toLocaleString() }
          ],
          "markdown": true
        }
      ]
    };

    await axios.post(this.webhookUrl, card);
  }
}
```

---

## Salesforce Integration

### Apex Integration Class

```apex
// SparkBloomIntegration.cls
public class SparkBloomIntegration {
    private static final String API_BASE_URL = 'https://api.sparkbloomflow.com/v1';
    private static final String API_KEY = 'your-api-key'; // Store in Custom Settings

    public class TaskResponse {
        public String id;
        public String title;
        public String status;
        public String priority;
        public DateTime due_date;
        public String assignee_id;
    }

    @future(callout=true)
    public static void createTaskFromOpportunity(Id opportunityId) {
        Opportunity opp = [SELECT Id, Name, CloseDate, OwnerId FROM Opportunity WHERE Id = :opportunityId];

        Map<String, Object> taskData = new Map<String, Object>{
            'title' => 'Follow up on: ' + opp.Name,
            'priority' => 'high',
            'due_date' => opp.CloseDate.addDays(7).format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
            'assignee_id' => getUserMapping(opp.OwnerId),
            'metadata' => new Map<String, Object>{
                'salesforce_opportunity_id' => opp.Id
            }
        };

        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_BASE_URL + '/tasks');
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + API_KEY);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(taskData));

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 201) {
            TaskResponse task = (TaskResponse) JSON.deserialize(res.getBody(), TaskResponse.class);

            // Create a custom object to link Salesforce record with SparkBloom task
            SparkBloom_Task__c sbTask = new SparkBloom_Task__c(
                Opportunity__c = opportunityId,
                SparkBloom_Task_Id__c = task.id,
                Title__c = task.title
            );
            insert sbTask;
        }
    }

    private static String getUserMapping(Id salesforceUserId) {
        // Implementation to map Salesforce User to SparkBloom User
        User_Mapping__c mapping = [
            SELECT SparkBloom_User_Id__c
            FROM User_Mapping__c
            WHERE Salesforce_User_Id__c = :salesforceUserId
            LIMIT 1
        ];
        return mapping.SparkBloom_User_Id__c;
    }
}
```

### Process Builder Integration

```apex
// Trigger when Opportunity stage changes to "Closed Won"
public class OpportunityTriggerHandler {
    public static void handleAfterUpdate(List<Opportunity> newOpps, Map<Id, Opportunity> oldOppsMap) {
        for (Opportunity opp : newOpps) {
            Opportunity oldOpp = oldOppsMap.get(opp.Id);

            if (opp.StageName == 'Closed Won' && oldOpp.StageName != 'Closed Won') {
                SparkBloomIntegration.createTaskFromOpportunity(opp.Id);
            }
        }
    }
}
```

---

## Notion Integration

### Notion Database Sync

```javascript
// notion-integration.js
const { Client } = require('@notionhq/client');
const { SparkBloomClient } = require('@sparkbloom/api-client');

class NotionSparkBloomSync {
  constructor(notionToken, sparkBloomApiKey, databaseId) {
    this.notion = new Client({ auth: notionToken });
    this.sparkBloom = new SparkBloomClient({ apiKey: sparkBloomApiKey });
    this.databaseId = databaseId;
  }

  async syncTasksToNotion() {
    const tasks = await this.sparkBloom.tasks.list({ limit: 100 });

    for (const task of tasks.data.tasks) {
      await this.createOrUpdateNotionPage(task);
    }
  }

  async createOrUpdateNotionPage(task) {
    // Check if page already exists
    const existingPage = await this.findExistingPage(task.id);

    const pageProperties = {
      'Task ID': { rich_text: [{ text: { content: task.id } }] },
      'Title': { title: [{ text: { content: task.title } }] },
      'Status': {
        select: {
          name: this.mapStatus(task.status)
        }
      },
      'Priority': {
        select: {
          name: task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
        }
      },
      'Due Date': task.due_date ? {
        date: { start: task.due_date }
      } : null,
      'Tags': {
        multi_select: task.tags.map(tag => ({ name: tag }))
      }
    };

    if (existingPage) {
      await this.notion.pages.update({
        page_id: existingPage.id,
        properties: pageProperties
      });
    } else {
      await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: pageProperties
      });
    }
  }

  async syncNotionToSparkBloom() {
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: {
        property: 'Last Synced',
        date: {
          after: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      }
    });

    for (const page of response.results) {
      await this.syncPageToSparkBloom(page);
    }
  }

  async syncPageToSparkBloom(page) {
    const properties = page.properties;
    const taskId = properties['Task ID']?.rich_text[0]?.text.content;

    if (taskId) {
      // Update existing task
      await this.sparkBloom.tasks.update(taskId, {
        title: properties['Title']?.title[0]?.text.content,
        status: this.mapNotionStatus(properties['Status']?.select?.name),
        priority: properties['Priority']?.select?.name?.toLowerCase()
      });
    } else {
      // Create new task
      const newTask = await this.sparkBloom.tasks.create({
        title: properties['Title']?.title[0]?.text.content,
        status: this.mapNotionStatus(properties['Status']?.select?.name),
        priority: properties['Priority']?.select?.name?.toLowerCase()
      });

      // Update Notion page with SparkBloom task ID
      await this.notion.pages.update({
        page_id: page.id,
        properties: {
          'Task ID': { rich_text: [{ text: { content: newTask.id } }] }
        }
      });
    }
  }

  mapStatus(sparkBloomStatus) {
    const statusMap = {
      'pending': 'Not Started',
      'in_progress': 'In Progress',
      'completed': 'Done'
    };
    return statusMap[sparkBloomStatus] || 'Not Started';
  }

  mapNotionStatus(notionStatus) {
    const statusMap = {
      'Not Started': 'pending',
      'In Progress': 'in_progress',
      'Done': 'completed'
    };
    return statusMap[notionStatus] || 'pending';
  }
}

// Schedule sync every 15 minutes
setInterval(async () => {
  const sync = new NotionSparkBloomSync(
    process.env.NOTION_TOKEN,
    process.env.SPARKBLOOM_API_KEY,
    process.env.NOTION_DATABASE_ID
  );

  await sync.syncTasksToNotion();
  await sync.syncNotionToSparkBloom();
}, 15 * 60 * 1000);
```

---

## Zapier Automation

### Custom Zapier App

```javascript
// zapier-app/triggers/task-completed.js
const taskCompleted = {
  key: 'taskCompleted',
  noun: 'Task',
  display: {
    label: 'Task Completed',
    description: 'Triggers when a task is marked as completed'
  },
  operation: {
    type: 'hook',
    performSubscribe: async (z, bundle) => {
      const response = await z.request({
        url: 'https://api.sparkbloomflow.com/v1/webhooks',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bundle.authData.apiKey}`
        },
        body: {
          url: bundle.targetUrl,
          events: ['task.completed']
        }
      });
      return response.data;
    },
    performUnsubscribe: async (z, bundle) => {
      await z.request({
        url: `https://api.sparkbloomflow.com/v1/webhooks/${bundle.subscribeData.id}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${bundle.authData.apiKey}`
        }
      });
    },
    perform: (z, bundle) => {
      return [bundle.cleanedRequest];
    },
    sample: {
      id: 'task_123',
      title: 'Complete project',
      status: 'completed',
      completed_at: '2024-01-15T14:22:00Z'
    }
  }
};

// zapier-app/creates/create-task.js
const createTask = {
  key: 'createTask',
  noun: 'Task',
  display: {
    label: 'Create Task',
    description: 'Creates a new task'
  },
  operation: {
    inputFields: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text'
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'string',
        choices: ['low', 'medium', 'high']
      },
      {
        key: 'due_date',
        label: 'Due Date',
        type: 'datetime'
      }
    ],
    perform: async (z, bundle) => {
      const response = await z.request({
        url: 'https://api.sparkbloomflow.com/v1/tasks',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bundle.authData.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: bundle.inputData
      });
      return response.data;
    }
  }
};
```

---

## Custom Webhooks

### Webhook Handler Implementation

```python
# webhook_handler.py
import hmac
import hashlib
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

class WebhookHandler:
    def __init__(self, secret):
        self.secret = secret

    def verify_signature(self, payload, signature):
        """Verify webhook signature for security"""
        expected = hmac.new(
            self.secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(f"sha256={expected}", signature)

    def handle_task_completed(self, data):
        """Handle task completion webhook"""
        task = data['task']
        user = data['user']

        # Send email notification
        self.send_completion_email(user['email'], task)

        # Update external system
        self.update_project_management_tool(task)

        # Trigger automation workflows
        self.trigger_automation_workflow('task_completed', {
            'task_id': task['id'],
            'user_id': user['id'],
            'completion_time': task['completed_at']
        })

    def handle_habit_streak_milestone(self, data):
        """Handle habit streak milestone webhook"""
        habit = data['habit']
        user = data['user']
        milestone = data['milestone']

        # Award points/badges
        self.award_achievement(user['id'], f"habit_streak_{milestone}")

        # Send congratulatory message
        self.send_celebration_notification(user, habit, milestone)

@app.route('/webhooks/sparkbloom', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-SparkBloom-Signature')
    payload = request.get_data(as_text=True)

    handler = WebhookHandler(os.environ['WEBHOOK_SECRET'])

    if not handler.verify_signature(payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401

    data = json.loads(payload)
    event = data['event']

    if event == 'task.completed':
        handler.handle_task_completed(data['data'])
    elif event == 'habit.streak.milestone':
        handler.handle_habit_streak_milestone(data['data'])

    return jsonify({'status': 'success'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

---

## Single Sign-On (SSO)

### SAML 2.0 Configuration

```xml
<!-- saml-metadata.xml -->
<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="https://app.sparkbloomflow.com">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true"
                      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                 Location="https://app.sparkbloomflow.com/sso/saml/acs"
                                 index="1" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```

### OIDC Configuration

```json
{
  "client_id": "sparkbloom-enterprise",
  "client_secret": "your-client-secret",
  "redirect_uris": [
    "https://app.sparkbloomflow.com/auth/oidc/callback"
  ],
  "response_types": ["code"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scope": "openid profile email",
  "token_endpoint_auth_method": "client_secret_post"
}
```

---

## Enterprise SCIM

### SCIM User Provisioning

```javascript
// scim-server.js
const express = require('express');
const { SparkBloomClient } = require('@sparkbloom/api-client');

const app = express();
app.use(express.json());

const sparkBloom = new SparkBloomClient({ apiKey: process.env.SPARKBLOOM_API_KEY });

// Get Users
app.get('/scim/v2/Users', async (req, res) => {
  const { startIndex = 1, count = 50, filter } = req.query;

  const users = await sparkBloom.users.list({
    offset: startIndex - 1,
    limit: count,
    filter: parseScimFilter(filter)
  });

  const scimResponse = {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: users.data.pagination.total,
    startIndex: parseInt(startIndex),
    itemsPerPage: users.data.users.length,
    Resources: users.data.users.map(user => formatScimUser(user))
  };

  res.json(scimResponse);
});

// Create User
app.post('/scim/v2/Users', async (req, res) => {
  const scimUser = req.body;

  const userData = {
    email: scimUser.emails[0].value,
    name: `${scimUser.name.givenName} ${scimUser.name.familyName}`,
    username: scimUser.userName,
    active: scimUser.active !== false
  };

  const user = await sparkBloom.users.create(userData);

  res.status(201).json(formatScimUser(user));
});

// Update User
app.put('/scim/v2/Users/:id', async (req, res) => {
  const { id } = req.params;
  const scimUser = req.body;

  const userData = {
    email: scimUser.emails[0].value,
    name: `${scimUser.name.givenName} ${scimUser.name.familyName}`,
    active: scimUser.active !== false
  };

  const user = await sparkBloom.users.update(id, userData);

  res.json(formatScimUser(user));
});

// Delete User
app.delete('/scim/v2/Users/:id', async (req, res) => {
  const { id } = req.params;

  await sparkBloom.users.deactivate(id);

  res.status(204).send();
});

function formatScimUser(user) {
  const nameParts = user.name.split(' ');
  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id: user.id,
    userName: user.username,
    name: {
      givenName: nameParts[0],
      familyName: nameParts.slice(1).join(' ')
    },
    emails: [
      {
        value: user.email,
        primary: true
      }
    ],
    active: user.active,
    meta: {
      resourceType: 'User',
      created: user.created_at,
      lastModified: user.updated_at
    }
  };
}

app.listen(3000, () => {
  console.log('SCIM server running on port 3000');
});
```

## Support

For integration support, contact:
- **Email**: integrations@sparkbloomflow.com
- **Slack**: #api-support in our [Developer Community](https://discord.gg/sparkbloom)
- **Documentation**: https://developers.sparkbloomflow.com