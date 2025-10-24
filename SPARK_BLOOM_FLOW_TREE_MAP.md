# Spark Bloom Flow - Complete Application Tree View

## Overview
This document provides a comprehensive tree view mapping of all screens, components, interactive elements, and navigation flows in the Spark Bloom Flow application based on the HTML mockup.

---

## 🎨 Design System Foundation

### CSS Design Tokens (150+ Properties)
```
design-system/
├── colors/
│   ├── brand-colors (primary, secondary)
│   ├── surface-colors (card, popover, background)
│   ├── neutral-colors (muted, accent)
│   ├── status-colors (destructive, success, warning)
│   ├── light-theme-palette
│   └── dark-theme-palette
├── typography/
│   ├── font-family (Apple system fonts)
│   ├── font-weights (400, 500, 600, 700)
│   └── font-sizes (0.75rem to 2rem)
├── spacing/
│   ├── radius (0.75rem default)
│   ├── floating-gaps (1.5rem, 6rem, 10rem)
│   └── padding-system
├── shadows/
│   ├── apple-shadow-system (sm, md, lg, xl, 2xl)
│   ├── glow-effects (normal, strong)
│   └── glass-morphism
├── animations/
│   ├── spring-curves (bounce, ease, out)
│   ├── transitions (fast: 150ms, base: 200ms, slow: 300ms)
│   └── keyframes (fadeIn, slideUp, bounceIn)
└── z-index-hierarchy/
    ├── base: 0
    ├── content: 1
    ├── dropdown: 10
    ├── navigation: 20
    ├── backdrop: 40
    ├── modal: 50
    ├── floating-button: 60
    └── critical-alert: 99
```

---

## 🏗️ Main Application Structure

```
spark-bloom-flow-app/
├── html-root/
│   ├── class="light|dark" (theme switching)
│   └── lang="en"
├── theme-toggle-button/
│   ├── position: fixed (top-right)
│   ├── sun-icon (light mode)
│   ├── moon-icon (dark mode)
│   └── onclick="toggleTheme()"
├── main-app-container/
│   ├── id="app"
│   ├── dynamic-page-container/
│   │   └── id="page-container" (content injection point)
│   ├── universal-navigation/
│   │   ├── back-button/
│   │   │   ├── arrow-left-icon
│   │   │   ├── onclick="navigateBack()"
│   │   │   └── text="Back"
│   │   └── nav-tabs/
│   │       ├── capture-tab/ (href="#capture")
│   │       ├── plan-tab/ (href="#plan")
│   │       ├── engage-tab/ (href="#engage")
│   │       └── profile-tab/ (href="#profile")
│   ├── luna-fab-system/
│   │   ├── luna-fab-button/
│   │   │   ├── position: fixed (bottom-right)
│   │   │   ├── gradient-background (blue to purple)
│   │   │   ├── chat-icon
│   │   │   └── onclick="toggleLunaMenu()"
│   │   ├── orbital-buttons-container/
│   │   │   ├── id="orbital-buttons"
│   │   │   ├── position: fixed
│   │   │   └── dynamic-button-generation
│   │   └── backdrop-overlay/
│   │       ├── id="backdrop"
│   │       ├── backdrop-blur
│   │       └── rotation-gesture-support
│   └── page-content-area/ (dynamic injection)
```

---

## 📱 Four Core Application Screens

### 1. 🎯 Capture Page (`/capture`)
```
capture-page/
├── page-header/
│   ├── title: "Capture"
│   └── description: "Quickly capture thoughts, tasks, and ideas"
├── page-content/
│   ├── quick-add-grid/
│   │   ├── note-item/
│   │   │   ├── document-icon
│   │   │   ├── title: "Note"
│   │   │   ├── description: "Capture thoughts quickly"
│   │   │   └── onclick="createNewItem('note')"
│   │   ├── task-item/
│   │   │   ├── clipboard-check-icon
│   │   │   ├── title: "Task"
│   │   │   ├── description: "Add to your todo list"
│   │   │   └── onclick="createNewItem('task')"
│   │   ├── goal-item/
│   │   │   ├── badge-check-icon
│   │   │   ├── title: "Goal"
│   │   │   ├── description: "Set a new goal"
│   │   │   └── onclick="createNewItem('goal')"
│   │   ├── reflection-item/
│   │   │   ├── chat-icon
│   │   │   ├── title: "Reflection"
│   │   │   ├── description: "Journal your thoughts"
│   │   │   └── onclick="createNewItem('reflection')"
│   │   ├── project-item/
│   │   │   ├── briefcase-icon
│   │   │   ├── title: "Project"
│   │   │   ├── description: "Start a new project"
│   │   │   └── onclick="createNewItem('project')"
│   │   └── habit-item/
│   │       ├── refresh-icon
│   │       ├── title: "Habit"
│   │       ├── description: "Track a new habit"
│   │       └── onclick="createNewItem('habit')"
│   └── recent-tasks-section/
│       ├── section-title: "Recent Tasks"
│       └── task-list/
│           └── task-card/ (for each task in sampleData.tasks)
│               ├── checkbox/ (onchange="toggleTask(id)")
│               ├── task-content/
│               │   ├── task-title
│               │   ├── task-description
│               │   └── task-tags/
│               │       ├── category-tag
│               │       └── priority-tag
│               └── due-date
```

### 2. 📅 Plan Page (`/plan`)
```
plan-page/
├── page-header/
│   ├── title: "Plan"
│   └── description: "Organize your day and upcoming events"
├── page-content/
│   ├── todays-agenda-section/
│   │   ├── section-title: "Today's Agenda"
│   │   ├── current-date-display
│   │   └── events-list/
│   │       └── event-card/ (for each event in sampleData.events)
│   │           ├── event-icon (meeting/focus)
│   │           ├── event-content/
│   │           │   ├── event-title
│   │           │   ├── event-time
│   │           │   ├── event-duration
│   │           │   └── attendees-list (if applicable)
│   │           └── event-actions/
│   │               ├── join-button (for meetings)
│   │               └── edit-button
│   ├── upcoming-section/
│   │   ├── section-title: "Upcoming"
│   │   └── placeholder-content/
│   │       ├── calendar-icon
│   │       ├── message: "No upcoming events"
│   │       └── add-event-button
│   └── goals-progress-section/
│       ├── section-title: "Goals Progress"
│       └── goals-list/
│           └── goal-card/ (for each goal in sampleData.goals)
│               ├── goal-content/
│               │   ├── goal-title
│               │   ├── goal-description
│               │   ├── goal-category
│               │   └── goal-deadline
│               └── progress-bar/ (visual progress indicator)
```

### 3. 🤝 Engage Page (`/engage`)
```
engage-page/
├── page-header/
│   ├── title: "Engage"
│   └── description: "Connect and collaborate with your team"
├── page-content/
│   ├── team-overview-section/
│   │   ├── section-title: "Team Overview"
│   │   └── stats-grid/
│   │       ├── active-members-stat/
│   │       │   ├── users-icon
│   │       │   ├── count: "12"
│   │       │   └── label: "Active Members"
│   │       ├── ongoing-projects-stat/
│   │       │   ├── folder-icon
│   │       │   ├── count: "8"
│   │       │   └── label: "Ongoing Projects"
│   │       └── pending-tasks-stat/
│   │           ├── clock-icon
│   │           ├── count: "24"
│   │           └── label: "Pending Tasks"
│   ├── recent-activity-section/
│   │   ├── section-title: "Recent Activity"
│   │   └── activity-feed/
│   │       ├── activity-item-1/
│   │       │   ├── user-avatar
│   │       │   ├── activity-text: "Sarah completed 'Design Review'"
│   │       │   └── timestamp: "2 hours ago"
│   │       ├── activity-item-2/
│   │       │   ├── user-avatar
│   │       │   ├── activity-text: "Mike added new task to 'Mobile App'"
│   │       │   └── timestamp: "4 hours ago"
│   │       └── activity-item-3/
│   │           ├── user-avatar
│   │           ├── activity-text: "Team meeting scheduled for tomorrow"
│   │           └── timestamp: "6 hours ago"
│   └── quick-actions-section/
│       ├── section-title: "Quick Actions"
│       └── actions-grid/
│           ├── start-meeting-button/
│           │   ├── video-icon
│           │   └── label: "Start Meeting"
│           ├── send-message-button/
│           │   ├── message-circle-icon
│           │   └── label: "Send Message"
│           └── share-update-button/
│               ├── share-icon
│               └── label: "Share Update"
```

### 4. 👤 Profile Page (`/profile`)
```
profile-page/
├── page-header/
│   ├── title: "Profile"
│   └── description: "Manage your account and preferences"
├── page-content/
│   ├── user-info-section/
│   │   ├── user-avatar/
│   │   │   ├── image-src: "unsplash-avatar"
│   │   │   └── size: "4rem"
│   │   ├── user-details/
│   │   │   ├── user-name: "Alex Chen"
│   │   │   ├── user-email: "alex@example.com"
│   │   │   └── join-date: "Member since 2024"
│   │   └── edit-profile-button
│   ├── preferences-section/
│   │   ├── section-title: "Preferences"
│   │   └── preferences-grid/
│   │       ├── theme-preference/
│   │       │   ├── moon-icon
│   │       │   ├── label: "Theme"
│   │       │   ├── current-value: "Light"
│   │       │   └── change-button
│   │       ├── language-preference/
│   │       │   ├── globe-icon
│   │       │   ├── label: "Language"
│   │       │   ├── current-value: "English"
│   │       │   └── change-button
│   │       ├── notifications-preference/
│   │       │   ├── bell-icon
│   │       │   ├── label: "Notifications"
│   │       │   ├── current-value: "Enabled"
│   │       │   └── toggle-switch
│   │       └── timezone-preference/
│   │           ├── clock-icon
│   │           ├── label: "Timezone"
│   │           ├── current-value: "UTC-8"
│   │           └── change-button
│   ├── stats-section/
│   │   ├── section-title: "Your Stats"
│   │   └── stats-grid/
│   │       ├── tasks-completed-stat/
│   │       │   ├── check-circle-icon
│   │       │   ├── count: "142"
│   │       │   └── label: "Tasks Completed"
│   │       ├── goals-achieved-stat/
│   │       │   ├── trophy-icon
│   │       │   ├── count: "8"
│   │       │   └── label: "Goals Achieved"
│   │       └── streak-stat/
│   │           ├── fire-icon
│   │           ├── count: "23"
│   │           └── label: "Day Streak"
│   └── account-actions-section/
│       ├── section-title: "Account"
│       └── actions-list/
│           ├── change-password-button/
│           │   ├── lock-icon
│           │   └── label: "Change Password"
│           ├── export-data-button/
│           │   ├── download-icon
│           │   └── label: "Export Data"
│           └── backup-settings-button/
│               ├── shield-check-icon
│               └── label: "Backup Settings"
```

---

## 🎯 Luna FAB Orbital Button System

### Orbital Buttons Configuration (6 Buttons)
```
luna-orbital-system/
├── orbital-buttons-data/
│   ├── home-button/
│   │   ├── id: "home"
│   │   ├── icon: home-svg
│   │   ├── label: "Home"
│   │   ├── color: "rgb(59, 130, 246)" (blue)
│   │   ├── action: navigate('capture')
│   │   └── shortcut: "⌘H"
│   ├── plan-button/
│   │   ├── id: "plan"
│   │   ├── icon: calendar-svg
│   │   ├── label: "Plan"
│   │   ├── color: "rgb(34, 197, 94)" (green)
│   │   ├── action: navigate('plan')
│   │   └── shortcut: "⌘P"
│   ├── tasks-button/
│   │   ├── id: "tasks"
│   │   ├── icon: clipboard-check-svg
│   │   ├── label: "Tasks"
│   │   ├── color: "rgb(168, 85, 247)" (purple)
│   │   ├── action: navigate('capture')
│   │   └── shortcut: "⌘T"
│   ├── engage-button/
│   │   ├── id: "engage"
│   │   ├── icon: users-svg
│   │   ├── label: "Engage"
│   │   ├── color: "rgb(99, 102, 241)" (indigo)
│   │   ├── action: navigate('engage')
│   │   └── shortcut: "⌘E"
│   ├── profile-button/
│   │   ├── id: "profile"
│   │   ├── icon: user-svg
│   │   ├── label: "Profile"
│   │   ├── color: "rgb(245, 158, 11)" (yellow)
│   │   ├── action: navigate('profile')
│   │   └── shortcut: "⌘U"
│   └── search-button/
│       ├── id: "search"
│       ├── icon: search-svg
│       ├── label: "Search"
│       ├── color: "rgb(107, 114, 128)" (gray)
│       ├── action: console.log('Search functionality')
│       └── shortcut: "⌘K"
├── orbital-mechanics/
│   ├── radius: 80px
│   ├── circular-positioning/
│   │   ├── angle-calculation (2π / buttonCount)
│   │   ├── x-position: Math.cos(angle) * radius
│   │   └── y-position: Math.sin(angle) * radius
│   ├── rotation-system/
│   │   ├── rotation-offset (global variable)
│   │   ├── drag-detection (ring area 56px-112px from center)
│   │   ├── angle-calculation-from-center
│   │   └── smooth-regeneration
│   └── label-positioning/
│       ├── smart-positioning (based on x,y coordinates)
│       ├── outside-button-placement
│       └── hover-animations
└── interaction-system/
    ├── backdrop-gesture-detection/
    │   ├── mouse-events (mousedown, mousemove, mouseup)
    │   ├── touch-events (touchstart, touchmove, touchend)
    │   └── rotation-area-validation
    ├── button-click-handling/
    │   ├── click-event-propagation
    │   ├── action-execution
    │   └── menu-close
    └── animations/
        ├── bounce-in-animation (staggered by index)
        ├── hover-scale-effects
        └── backdrop-fade-transitions
```

---

## 🎮 Interactive Elements & Navigation

### Navigation System
```
navigation-system/
├── routing-mechanism/
│   ├── hash-based-routing (#capture, #plan, #engage, #profile)
│   ├── navigate-function/
│   │   ├── route-parameter
│   │   ├── update-active-navigation
│   │   ├── load-page-content
│   │   ├── update-hash
│   │   └── close-luna-menu
│   ├── back-navigation/
│   │   ├── history-check
│   │   └── fallback-to-capture
│   └── hash-change-listener
├── keyboard-shortcuts/
│   ├── cmd/ctrl-h: navigate('capture')
│   ├── cmd/ctrl-p: navigate('plan')
│   ├── cmd/ctrl-e: navigate('engage')
│   ├── cmd/ctrl-u: navigate('profile')
│   └── cmd/ctrl-k: search-functionality
├── active-state-management/
│   ├── tab-highlighting
│   ├── visual-feedback
│   └── accessibility-support
└── page-transitions/
    ├── slide-up-animation
    ├── content-injection
    └── animation-cleanup
```

### Interactive Elements Inventory
```
interactive-elements/
├── buttons/
│   ├── theme-toggle-button (toggleTheme)
│   ├── back-button (navigateBack)
│   ├── nav-tabs (4x navigate functions)
│   ├── luna-fab (toggleLunaMenu)
│   ├── orbital-buttons (6x navigation actions)
│   ├── quick-add-items (6x createNewItem)
│   ├── task-checkboxes (toggleTask)
│   ├── event-action-buttons (join/edit)
│   ├── goal-progress-interactions
│   ├── team-quick-actions (3x collaboration)
│   ├── profile-preference-buttons (4x settings)
│   └── account-action-buttons (3x security)
├── forms-and-inputs/
│   ├── task-checkboxes (completion toggling)
│   ├── preference-toggles (notifications)
│   └── setting-changes (theme, language, timezone)
├── gesture-interactions/
│   ├── orbital-rotation-gestures/
│   │   ├── mouse-drag-rotation
│   │   ├── touch-drag-rotation
│   │   ├── rotation-angle-calculation
│   │   └── smooth-animation-updates
│   └── hover-interactions/
│       ├── button-hover-effects
│       ├── label-appearance
│       └── scale-transformations
└── accessibility-features/
    ├── aria-labels (Luna FAB, theme toggle)
    ├── keyboard-navigation-support
    ├── focus-management
    └── screen-reader-compatibility
```

---

## 📊 Data Structures & Content

### Sample Data Schema
```
sample-data/
├── user-data/
│   ├── name: "Alex Chen"
│   ├── email: "alex@example.com"
│   ├── avatar: "unsplash-photo-url"
│   └── preferences/
│       ├── theme: "light"
│       └── language: "en"
├── tasks-array/
│   └── task-object/
│       ├── id: "unique-string"
│       ├── title: "task-name"
│       ├── description: "task-details"
│       ├── completed: boolean
│       ├── priority: "high|medium|low"
│       ├── category: "Work|Design|Meeting"
│       ├── dueDate: "YYYY-MM-DD"
│       └── tags: ["tag1", "tag2"]
├── goals-array/
│   └── goal-object/
│       ├── id: "unique-string"
│       ├── title: "goal-name"
│       ├── description: "goal-details"
│       ├── progress: number (0-100)
│       ├── category: "Learning|Personal"
│       └── deadline: "YYYY-MM-DD"
└── events-array/
    └── event-object/
        ├── id: "unique-string"
        ├── title: "event-name"
        ├── time: "HH:MM AM/PM"
        ├── duration: "duration-string"
        ├── attendees: ["name1", "name2"]
        └── type: "meeting|focus"
```

### Global State Variables
```
global-state/
├── currentRoute: "capture|plan|engage|profile"
├── lunaMenuOpen: boolean
├── isDragging: boolean
├── rotationOffset: number (degrees)
├── dragStartAngle: number
└── dragStartRotation: number
```

---

## 🔧 JavaScript Functions Hierarchy

### Core Functions (30+ Functions)
```
javascript-functions/
├── initialization/
│   ├── initializeApp()
│   ├── updateActiveNavigation()
│   └── addEventListeners()
├── navigation-functions/
│   ├── navigate(route)
│   ├── navigateBack()
│   ├── getRouteFromHash()
│   ├── updateActiveNavigation()
│   └── loadPage(route)
├── page-generators/
│   ├── getCapturePageHTML()
│   ├── getPlanPageHTML()
│   ├── getEngagePageHTML()
│   └── getProfilePageHTML()
├── luna-fab-functions/
│   ├── toggleLunaMenu()
│   ├── openLunaMenu()
│   ├── closeLunaMenu()
│   ├── generateOrbitalButtons()
│   ├── getLabelPosition(x, y)
│   └── handleOrbitalButtonClick(buttonId)
├── rotation-mechanics/
│   ├── addBackdropEventListeners()
│   ├── removeBackdropEventListeners()
│   ├── handleRotationStart(e)
│   ├── handleRotationMove(e)
│   ├── handleRotationEnd()
│   ├── handleTouchStart(e)
│   ├── handleTouchMove(e)
│   ├── getAngleFromCenter(x, y, centerX, centerY)
│   └── normalizeAngleDifference(angle)
├── utility-functions/
│   ├── toggleTheme()
│   ├── handleKeyboardShortcuts(e)
│   ├── createNewItem(type)
│   ├── toggleTask(taskId)
│   └── getPriorityColor(priority)
└── helper-functions/
    ├── formatDate()
    ├── calculateProgress()
    └── generateId()
```

---

## 🎨 Visual Component Patterns

### Card System
```
card-components/
├── base-card/
│   ├── background: hsl(var(--card))
│   ├── border: 1px solid hsl(var(--border))
│   ├── border-radius: var(--radius)
│   ├── box-shadow: var(--shadow-sm)
│   └── hover-effects: var(--shadow-md)
├── task-card/
│   ├── checkbox-input
│   ├── task-content-area
│   ├── tag-system
│   └── due-date-display
├── goal-card/
│   ├── goal-information
│   ├── progress-bar-visual
│   └── deadline-indicator
├── event-card/
│   ├── event-type-icon
│   ├── event-details
│   ├── attendee-list
│   └── action-buttons
└── stat-card/
    ├── icon-display
    ├── numerical-value
    └── descriptive-label
```

### Button System
```
button-components/
├── primary-button/
│   ├── background: hsl(var(--primary))
│   ├── color: hsl(var(--primary-foreground))
│   ├── hover: hsl(var(--primary-hover))
│   └── transitions: var(--transition-base)
├── outline-button/
│   ├── border: 1px solid hsl(var(--border))
│   ├── background: transparent
│   ├── hover: hsl(var(--accent))
│   └── color: hsl(var(--foreground))
├── ghost-button/
│   ├── background: transparent
│   ├── hover: hsl(var(--accent))
│   └── minimal-styling
├── fab-button/
│   ├── fixed-positioning
│   ├── circular-shape
│   ├── gradient-background
│   ├── shadow-system
│   └── hover-scale-effects
└── orbital-button/
    ├── absolute-positioning
    ├── circular-shape
    ├── color-coding
    ├── hover-animations
    └── label-overlay
```

---

## 🔄 Animation & Interaction Flows

### Animation System
```
animations/
├── entrance-animations/
│   ├── fadeIn (opacity: 0 → 1)
│   ├── slideUp (translateY: 20px → 0)
│   └── bounceIn (scale: 0 → 1.1 → 1, rotate: -180° → 0°)
├── transition-animations/
│   ├── page-transitions (slide-up with 400ms duration)
│   ├── theme-switching (200ms ease)
│   └── navigation-highlighting
├── interactive-animations/
│   ├── button-hover-effects (scale: 1 → 1.05)
│   ├── button-active-effects (scale: 1 → 0.95)
│   ├── orbital-button-stagger (index * 100ms delay)
│   └── rotation-smooth-updates
└── microinteractions/
    ├── checkbox-toggles
    ├── progress-bar-updates
    └── label-appearance-effects
```

### Interaction Flow Patterns
```
interaction-flows/
├── luna-menu-flow/
│   ├── 1. fab-click
│   ├── 2. backdrop-appearance
│   ├── 3. orbital-buttons-generation
│   ├── 4. staggered-animations
│   ├── 5. rotation-gesture-detection
│   ├── 6. button-selection
│   └── 7. navigation-execution
├── navigation-flow/
│   ├── 1. route-selection (tab-click or orbital-button)
│   ├── 2. active-state-update
│   ├── 3. page-content-injection
│   ├── 4. slide-up-animation
│   └── 5. hash-update
├── task-management-flow/
│   ├── 1. quick-add-selection
│   ├── 2. item-creation-function
│   ├── 3. data-update
│   ├── 4. ui-refresh
│   └── 5. confirmation-feedback
└── theme-switching-flow/
    ├── 1. theme-toggle-click
    ├── 2. class-manipulation (light ↔ dark)
    ├── 3. icon-switching
    ├── 4. css-variable-updates
    └── 5. transition-animations
```

---

## 📱 Responsive Design Patterns

### Breakpoint System
```
responsive-design/
├── mobile-breakpoint/
│   ├── max-width: 768px
│   ├── grid-collapse (3/4 columns → 1 column)
│   ├── nav-tab-stacking
│   └── fab-size-adjustments
├── tablet-breakpoint/
│   ├── max-width: 1024px
│   ├── content-width-constraints
│   └── sidebar-collapsing
└── desktop-breakpoint/
    ├── min-width: 1025px
    ├── full-grid-layouts
    └── expanded-navigation
```

### Adaptive Elements
```
adaptive-components/
├── quick-add-grid/
│   ├── mobile: 2 columns
│   ├── tablet: 3 columns
│   └── desktop: 3 columns
├── navigation-tabs/
│   ├── mobile: bottom-fixed
│   ├── tablet: horizontal-scroll
│   └── desktop: full-width
├── orbital-buttons/
│   ├── radius-scaling
│   ├── label-positioning-adjustments
│   └── gesture-area-modifications
└── content-spacing/
    ├── mobile: 1rem padding
    ├── tablet: 1.5rem padding
    └── desktop: 2rem padding
```

---

## 🧭 Complete Navigation Map

### Route-to-Content Mapping
```
navigation-map/
├── hash-routes/
│   ├── #capture → getCapturePageHTML()
│   ├── #plan → getPlanPageHTML()
│   ├── #engage → getEngagePageHTML()
│   └── #profile → getProfilePageHTML()
├── navigation-triggers/
│   ├── nav-tab-clicks
│   ├── orbital-button-clicks
│   ├── keyboard-shortcuts
│   ├── back-button-navigation
│   └── hash-change-events
├── page-content-injection/
│   ├── target: #page-container
│   ├── content-replacement
│   ├── animation-application
│   └── cleanup-processes
└── state-synchronization/
    ├── currentRoute-variable-update
    ├── active-tab-highlighting
    ├── luna-menu-closure
    └── url-hash-update
```

### Cross-Component Communications
```
component-communication/
├── global-state-sharing/
│   ├── currentRoute (navigation state)
│   ├── lunaMenuOpen (fab state)
│   ├── isDragging (gesture state)
│   └── rotationOffset (orbital state)
├── event-propagation/
│   ├── button-clicks → action-functions
│   ├── gesture-events → rotation-updates
│   ├── navigation-events → page-changes
│   └── theme-events → visual-updates
└── data-flow/
    ├── sampleData → page-content-generation
    ├── user-interactions → state-updates
    ├── state-changes → ui-updates
    └── route-changes → content-injection
```

---

## 🎯 Summary

This tree view represents the complete structure of the Spark Bloom Flow application mockup, containing:

- **1 HTML Root** with theme switching capability
- **4 Core Screens** (Capture, Plan, Engage, Profile) with unique layouts
- **6 Orbital Navigation Buttons** with gesture-based rotation
- **50+ Interactive Elements** including buttons, forms, and gestures
- **30+ JavaScript Functions** handling navigation, animations, and interactions
- **150+ CSS Design Tokens** providing consistent theming
- **Complex Animation System** with entrance, transition, and microinteractions
- **Responsive Design Patterns** for mobile, tablet, and desktop
- **Comprehensive Navigation Flow** with multiple interaction methods

The application follows a modern, Apple-inspired design system with glass morphism effects, spring animations, and gesture-based interactions, all built as a single interactive HTML file with embedded CSS and JavaScript.

- [Application Overview](#application-overview)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Application Structure](#application-structure)
- [Pages & Routes](#pages--routes)
- [Component Hierarchy](#component-hierarchy)
- [Widget System](#widget-system)
- [Design System & Colors](#design-system--colors)
- [Database Schema](#database-schema)
- [API & Services](#api--services)
- [Internationalization](#internationalization)
- [Accessibility Features](#accessibility-features)
- [Development Tools](#development-tools)

---

## 🎯 Application Overview

**Spark Bloom Flow** is a comprehensive productivity and personal development application that combines goal tracking, task management, habit building, and AI-powered insights into a unified, widget-based dashboard experience.

### Key Features
- 🎯 **Goal Setting & Tracking** with milestone support
- ✅ **Task Management** with recurring tasks and templates
- 🔄 **Habit Building** with streak tracking and analytics
- 📊 **Analytics Dashboard** with productivity insights
- 🤖 **AI Integration** for recommendations and automation
- 👥 **Team Collaboration** with invitation system
- 🌐 **Multi-language Support** (7 languages)
- ♿ **Accessibility Compliance** (WCAG AAA)
- 📱 **Mobile-First Design** with responsive layouts

---

## 🏗️ Architecture & Technology Stack

### Core Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | Frontend Framework | 18.3.1 |
| **TypeScript** | Type Safety | 5.8.3 |
| **Vite** | Build Tool | 5.4.19 |
| **Supabase** | Backend & Database | 2.58.0 |
| **Tailwind CSS** | Styling | 3.4.17 |
| **Radix UI** | UI Components | Various |
| **TanStack Query** | Server State | 5.83.0 |
| **Framer Motion** | Animations | 12.23.22 |

### Multi-Context Provider Architecture
```
QueryClient → ConfigProvider → AuthProvider → ModulesProvider →
AccessibilityProvider → ProductivityCycleProvider → GlobalViewProvider →
LunaFrameworkProvider → LunaProvider → BrowserRouter
```

---

## 📁 Application Structure

### Directory Structure
```
src/
├── agents/                 # AI agent system
│   ├── backup/            # Backup automation
│   ├── monitoring/        # System monitoring
│   ├── security/          # Security agents
│   └── shared/            # Shared agent utilities
├── components/            # React components
│   ├── ai/               # AI-related components
│   ├── auth/             # Authentication components
│   ├── errors/           # Error handling
│   ├── filters/          # Filtering components
│   ├── goals/            # Goal management
│   ├── habits/           # Habit tracking
│   ├── landing/          # Landing page components
│   ├── layouts/          # Page layouts
│   ├── luna/             # Luna AI framework
│   ├── reflections/      # Reflection components
│   ├── settings/         # Settings components
│   ├── tabs/             # Tab navigation
│   ├── tasks/            # Task management
│   ├── ui/               # Base UI components (42 components)
│   └── widgets/          # Dashboard widgets (26 widgets)
├── config/               # Configuration files
├── constants/            # Application constants
├── contexts/             # React contexts
├── core/                 # Core application logic
├── hooks/                # Custom React hooks (90+ hooks)
├── lib/                  # Library configurations
├── modules/              # Feature modules
├── pages/                # Page components (47 pages)
├── services/             # API and external services
├── shared/               # Shared utilities and components
├── styles/               # Global styles and themes
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

---

## 🗺️ Pages & Routes

### Route Architecture
The application uses a hybrid routing strategy combining modern Apple-inspired tab navigation with traditional detailed views.

#### Modern App Routes (`/app/*`)
| Route | Component | Purpose | Features |
|-------|-----------|---------|----------|
| `/app/capture` | CaptureTab | Quick input & capture | Task creation, notes, voice input |
| `/app/plan` | PlanTab | Planning & organization | Goal setting, scheduling |
| `/app/engage` | EngageTab | Active work & execution | Timer, focus mode |
| `/app/profile` | ProfileTab | Personal insights | Analytics, achievements |

#### Core Application Pages (47 total)
| Category | Routes | Components | Description |
|----------|--------|------------|-------------|
| **Authentication** | `/login`, `/signup`, `/forgot-password` | Login, Signup, ForgotPassword | User authentication |
| **Onboarding** | `/onboarding`, `/signup/invite/:token` | OnboardingFlow, InvitationSignup | User setup |
| **Dashboard** | `/dashboard`, `/dashboard-minimal` | Dashboard variants | Main productivity hub |
| **Goals** | `/goals`, `/goals/new`, `/goals/:id` | Goals, NewGoal, GoalDetail | Goal management |
| **Tasks** | `/tasks`, `/tasks/:id`, `/templates` | Tasks, TaskDetail, Templates | Task management |
| **Habits** | `/habits`, `/habits/:id` | Habits, HabitDetail | Habit tracking |
| **Projects** | `/projects`, `/notes` | Projects, Notes | Project organization |
| **Time Management** | `/calendar`, `/pomodoro`, `/time-blocking` | Calendar, PomodoroTimer, TimeBlocking | Time tools |
| **Analytics** | `/analytics`, `/ai-insights` | Analytics, AIInsights | Performance tracking |
| **Settings** | `/settings`, `/account-settings`, `/billing` | Settings pages | Configuration |
| **Admin** | `/admin/*` | Admin components | Super admin functions |

#### Protected Routes
- All `/app/*` routes require authentication
- All main application routes use `ProtectedRoute` wrapper
- Guest mode available with demo data
- Super admin routes have additional role checking

#### Route Redirects
```typescript
// Legacy route redirects
/dashboard → /app/capture
/plan → /app/plan
/app → /app/capture (default)
```

## 🧱 Component Hierarchy

### Component Structure (200+ components)

#### UI Component Library (46 components)
Based on shadcn/ui with Radix UI primitives:

| Component | Purpose | Features |
|-----------|---------|----------|
| **Layout** | `card`, `sheet`, `dialog`, `popover` | Container components |
| **Navigation** | `breadcrumb`, `tabs`, `sidebar` | Navigation elements |
| **Form** | `button`, `input`, `select`, `form` | Form controls |
| **Data Display** | `table`, `badge`, `avatar`, `skeleton` | Data presentation |
| **Feedback** | `alert`, `toast`, `progress`, `spinner` | User feedback |
| **Interaction** | `dropdown-menu`, `command`, `tooltip` | Interactive elements |

#### Widget System (26 widgets)
Modular dashboard components with drag-and-drop support:

| Widget | File | Purpose | Features |
|--------|------|---------|----------|
| **TasksWidget** | `TasksWidget.tsx` | Task management | Quick add, filtering, status updates |
| **GoalsWidget** | `GoalsWidget.tsx` | Goal tracking | Progress bars, milestones |
| **CalendarWidget** | `CalendarWidget.tsx` | Calendar view | Events, scheduling |
| **TimeTrackingWidget** | `TimeTrackingWidget.tsx` | Time tracking | Pomodoro, time logs |
| **NotesWidget** | `NotesWidget.tsx` | Quick notes | Rich text, organization |
| **SmartRecommendationsWidget** | `SmartRecommendationsWidget.tsx` | AI recommendations | ML-powered suggestions |
| **HabitsWidget** | `HabitsWidget.tsx` | Habit tracking | Streaks, completion rates |
| **UnifiedProgressWidget** | `UnifiedProgressWidget.tsx` | Overall progress | Multi-metric dashboard |
| **GamificationWidget** | `GamificationWidget.tsx` | Achievement system | Points, badges, levels |

#### Widget Configuration
```typescript
interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  config?: Record<string, any>;
  position: number;
}

// Available widget types
WIDGET_TYPES = {
  tasks, goals, time-tracking, notes,
  analytics, ai-insights, calendar
}

// Default layout: Tasks → Goals → AI Insights
maxWidgets: 6
```

#### Feature-Specific Components

| Feature | Components | Purpose |
|---------|------------|---------|
| **Authentication** | `ProtectedRoute`, `LoginForm`, `SignupForm` | User auth |
| **Goals** | `GoalCard`, `ProgressEditor`, `MilestoneCompletion` | Goal management |
| **Tasks** | `TaskForm`, `TaskListView`, `TaskBoardView`, `SubtaskList` | Task system |
| **Habits** | `HabitTracker`, `StreakDisplay`, `HabitForm` | Habit building |
| **Reflections** | `ReflectionCard`, `MoodTracker`, `DailyReflectionForm` | Self-reflection |
| **AI Insights** | `AIInsightCard`, `AIRecommendationCard`, `AIUsageWidget` | AI features |
| **Settings** | `AccessibilitySettings`, `HapticFeedbackSettings` | Configuration |
| **Landing** | `PersonaSelector`, `TestimonialCarousel`, `TrustBadges` | Marketing |

#### Luna AI Framework
Advanced AI-powered interface components:

| Component | Purpose | Features |
|-----------|---------|----------|
| `UnifiedLunaMenu` | AI command interface | Natural language commands |
| `LunaFrameworkProvider` | AI context management | State management |
| `ConversationalAI` | Chat interface | Multi-provider AI chat |
| `AdaptiveWorkspace` | Smart layouts | Context-aware UI |

## 🎨 Design System & Colors

### Theme System
Three-mode theme system with seamless transitions:

| Theme | Purpose | Contrast Ratio | Use Case |
|-------|---------|----------------|----------|
| **Light** | Default mode | 4.5:1 (WCAG AA) | General use, bright environments |
| **Dark** | Low-light mode | 4.5:1 (WCAG AA) | Evening use, reduced eye strain |
| **High Contrast** | Accessibility | 7:1 (WCAG AAA) | Visual impairments, accessibility |

### Color Palette

#### Core Colors (HSL Format)
```css
/* Light Theme */
--primary: 221.2 83.2% 53.3%         /* Blue #3B82F6 */
--background: 0 0% 100%              /* White #FFFFFF */
--foreground: 222.2 84% 4.9%         /* Dark Gray #0F172A */
--card: 0 0% 100%                    /* White #FFFFFF */
--border: 214.3 31.8% 91.4%          /* Light Gray #E2E8F0 */

/* Dark Theme */
--primary: 217.2 91.2% 59.8%         /* Lighter Blue #60A5FA */
--background: 222.2 84% 4.9%         /* Dark #0F172A */
--foreground: 210 40% 98%            /* Light Gray #F8FAFC */
--card: 222.2 84% 4.9%               /* Dark #0F172A */
--border: 217.2 32.6% 17.5%          /* Dark Border #1E293B */

/* High Contrast */
--primary: 213 100% 60%              /* Bright Blue #0080FF */
--background: 0 0% 0%                /* Pure Black #000000 */
--foreground: 0 0% 100%              /* Pure White #FFFFFF */
--border: 0 0% 40%                   /* Mid Gray #666666 */
```

#### Semantic Colors
```css
/* Success (Green) */
--success: 142.1 76.2% 36.3%         /* #16A34A */
--success-foreground: 355.7 100% 97.3% /* #FEF2F2 */

/* Warning (Orange) */
--warning: 32.2 95% 44.1%            /* #F97316 */
--warning-foreground: 355.7 100% 97.3% /* #FEF2F2 */

/* Info (Cyan) */
--info: 198.6 88.7% 48.4%            /* #06B6D4 */
--info-foreground: 355.7 100% 97.3%  /* #FEF2F2 */

/* Destructive (Red) */
--destructive: 0 84.2% 60.2%         /* #EF4444 */
--destructive-foreground: 210 40% 98% /* #F8FAFC */
```

### Typography Scale
```css
/* Font Sizes (Tailwind Scale) */
text-xs     /* 12px */
text-sm     /* 14px */
text-base   /* 16px */
text-lg     /* 18px */
text-xl     /* 20px */
text-2xl    /* 24px */
text-3xl    /* 30px */
text-4xl    /* 36px */
```

### Spacing System
```css
/* Spacing Scale (Tailwind) */
0.5rem  /* 8px   - p-2, m-2 */
1rem    /* 16px  - p-4, m-4 */
1.5rem  /* 24px  - p-6, m-6 */
2rem    /* 32px  - p-8, m-8 */
3rem    /* 48px  - p-12, m-12 */
4rem    /* 64px  - p-16, m-16 */
```

### Animation System
```css
/* Keyframes */
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Transitions */
theme-transition: background-color 0.3s ease, color 0.3s ease
```

### Responsive Breakpoints
```css
/* Screen Sizes */
xs: 475px    /* Extra small devices */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1400px  /* Container max-width */
```

### Accessibility Features
- **Focus Indicators**: 2px outline with offset for standard, 4px for high contrast
- **Color Contrast**: WCAG AAA compliance (7:1 ratio) in high contrast mode
- **Smooth Transitions**: 0.3s ease for theme switching
- **Theme Persistence**: LocalStorage-based theme preference
- **System Preference**: Respects `prefers-color-scheme`

## 🗄️ Database Schema

### Overview
PostgreSQL database with 50+ tables using Supabase with Row Level Security (RLS) enabled on all tables.

### Core Entity Tables

#### Authentication & Users
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `auth.users` | Supabase auth users | `id`, `email`, `is_super_admin` |
| `profiles` | Extended user profiles | `id`, `email`, `full_name`, `role`, `onboarding_completed` |
| `user_roles` | User role management | `user_id`, `role`, `granted_by` |
| `beta_signups` | Beta registration | `email`, `interest_level`, `approved` |
| `beta_invitations` | Beta invites | `email`, `token`, `status` |

#### Workspaces & Collaboration
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `workspaces` | Team workspaces | `id`, `name`, `owner_id` |
| `workspace_members` | Workspace membership | `workspace_id`, `user_id`, `role` |
| `subscriptions` | Billing & plans | `user_id`, `tier`, `status` |

#### Goals & Progress
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `goals` | User goals | `id`, `user_id`, `title`, `progress`, `status` |
| `goal_milestones` | Goal breakdowns | `goal_id`, `title`, `completed` |
| `goal_progress_entries` | Progress history | `goal_id`, `progress_value`, `notes` |
| `goal_collaborators` | Team goal sharing | `goal_id`, `user_id`, `permission` |

#### Tasks & Planning
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `tasks` | Task management | `id`, `user_id`, `title`, `status`, `due_date` |
| `task_templates` | Reusable templates | `name`, `description`, `default_fields` |
| `task_comments` | Task discussions | `task_id`, `user_id`, `content` |
| `task_watchers` | Task followers | `task_id`, `user_id` |
| `quick_todos` | Simple tasks | `user_id`, `content`, `completed` |

#### Habits & Tracking
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `habits` | Habit definitions | `id`, `user_id`, `name`, `frequency` |
| `habit_entries` | Daily completions | `habit_id`, `completed_at`, `value` |
| `habit_streaks` | Streak tracking | `habit_id`, `current_streak`, `longest_streak` |
| `habit_templates` | Habit presets | `name`, `category`, `frequency` |
| `habit_reminders` | Notifications | `habit_id`, `time`, `enabled` |

#### Projects & Organization
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `projects` | Project management | `id`, `user_id`, `name`, `status` |
| `project_members` | Team projects | `project_id`, `user_id`, `role` |
| `project_milestones` | Project phases | `project_id`, `title`, `due_date` |
| `notes` | Note taking | `id`, `user_id`, `title`, `content` |

#### Gamification System
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user_gamification_profiles` | User XP & levels | `user_id`, `level`, `total_xp` |
| `achievements` | Achievement definitions | `id`, `title`, `requirement_type` |
| `user_achievements` | User unlocks | `user_id`, `achievement_id`, `unlocked_at` |
| `user_points_log` | Points history | `user_id`, `action_type`, `points` |
| `productivity_assessments` | Personality profiles | `user_id`, `profile_scores` |

#### AI & Automation
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `ai_insights` | AI-generated insights | `user_id`, `insight_type`, `content` |
| `ai_recommendations` | Smart suggestions | `user_id`, `recommendation_type`, `data` |
| `ai_service_usage` | API usage tracking | `user_id`, `service`, `tokens_used` |
| `ai_habit_suggestions` | AI habit recommendations | `user_id`, `suggestion_text`, `status` |
| `api_keys` | User API keys | `user_id`, `service`, `encrypted_key` |

#### Luna AI Framework
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `luna_productivity_profiles` | AI personality analysis | `user_id`, `profile_data` |
| `luna_framework_assessments` | AI assessments | `user_id`, `assessment_type` |
| `luna_proactive_insights` | Proactive recommendations | `user_id`, `insight_type` |
| `luna_productivity_metrics` | Performance tracking | `user_id`, `metrics_data` |

#### Analytics & Insights
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `reflections` | Self-reflection entries | `user_id`, `content`, `mood` |
| `reflection_analytics` | Reflection insights | `user_id`, `sentiment_score` |
| `time_entries` | Time tracking | `user_id`, `task_id`, `duration` |
| `performance_metrics` | App performance | `metric_name`, `value` |

#### Team & Communication
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `team_invitations` | Team invites | `workspace_id`, `email`, `status` |
| `team_activities` | Activity feed | `workspace_id`, `activity_type` |
| `notifications` | User notifications | `user_id`, `type`, `read` |
| `automation_rules` | Smart automation | `user_id`, `trigger_type`, `action` |

### Database Features
- **Row Level Security**: All tables secured by user access
- **Real-time Subscriptions**: Live updates via Supabase
- **Audit Trails**: Change tracking on critical tables
- **Data Encryption**: Sensitive data encrypted at rest
- **Backup Strategy**: Automated daily backups
- **Performance**: Indexed queries for fast access

## 🚀 API & Services

### Supabase Edge Functions
| Function | Purpose | Method | Authentication |
|----------|---------|--------|----------------|
| `/ai-chat` | AI conversation interface | POST | JWT Required |
| `/generate-insights` | AI-powered user insights | POST | JWT Required |

#### AI Chat Function
```typescript
// Endpoint: /functions/v1/ai-chat
{
  messages: ChatMessage[],
  context: UserContext,
  personality: AIPersonality
}
// Returns: AI response with streaming support
```

#### Generate Insights Function
```typescript
// Endpoint: /functions/v1/generate-insights
// Analyzes user data (tasks, habits, goals)
// Returns: Personalized productivity insights
```

### Frontend Services Architecture

#### Repository Pattern
```typescript
// Base repository for all data operations
interface IBaseRepository<T> {
  create(item: Omit<T, 'id'>): Promise<T>;
  getById(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  list(filters?: any): Promise<T[]>;
}

// Specific repositories
- SupabaseTaskRepository
- SupabaseGoalRepository
- SupabaseBaseRepository
```

#### Service Layer
| Service | Purpose | Key Features |
|---------|---------|--------------|
| **EmailService** | Email management | Multi-language templates, beta invitations |
| **AIServiceManager** | AI provider management | OpenAI, Claude, Gemini integration |
| **ProductivityAnalyzer** | Data analysis | Pattern recognition, insights generation |
| **RepositoryFactory** | Data access factory | Environment-based repository selection |

#### AI Service Providers
```typescript
// Multi-provider AI system
interface AIProvider {
  name: 'openai' | 'claude' | 'gemini';
  generateInsights(data: UserData): Promise<Insight[]>;
  chatCompletion(messages: Message[]): Promise<Response>;
  costTracking: boolean;
}

// Usage tracking
interface AIUsage {
  provider: string;
  tokensUsed: number;
  cost: number;
  timestamp: Date;
}
```

### API Rate Limiting & Usage
| Feature | Limit | Scope |
|---------|-------|-------|
| **AI Calls** | 100/hour | Per user |
| **Database Queries** | 1000/hour | Per user |
| **Email Sending** | 10/day | Per user |
| **File Uploads** | 50MB/file | Per request |

### Authentication & Security
- **JWT Tokens**: Supabase authentication
- **Row Level Security**: Database-level access control
- **API Key Management**: Encrypted user API keys
- **CORS Headers**: Secure cross-origin requests
- **Request Validation**: Zod schema validation

### Real-time Features
```typescript
// Supabase real-time subscriptions
- Task updates
- Goal progress changes
- Team collaboration events
- Notification delivery
- Live dashboard updates
```

### Error Handling
- **Global Error Boundary**: React error catching
- **API Error Responses**: Standardized error format
- **Retry Logic**: Automatic retry for failed requests
- **Offline Support**: Queue requests when offline

## 🌐 Internationalization

### Supported Languages (6 total)
| Language | Code | Native Name | Flag | RTL Support |
|----------|------|-------------|------|-------------|
| **English** | `en` | English | 🇬🇧 | No |
| **Spanish** | `es` | Español | 🇪🇸 | No |
| **Arabic** | `ar` | العربية | 🇸🇦 | Yes |
| **German** | `de` | Deutsch | 🇩🇪 | No |
| **French** | `fr` | Français | 🇫🇷 | No |
| **Portuguese** | `pt` | Português | 🇵🇹 | No |

### i18n Configuration
```typescript
// Language detection strategy
detection: {
  order: ['localStorage', 'navigator', 'htmlTag'],
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage']
}

// Namespace organization
namespaces: [
  'common', 'navigation', 'tasks',
  'goals', 'dashboard', 'forms',
  'errors', 'auth', 'landing'
]
```

### RTL Support Features
- **Automatic Direction**: Document direction updates based on language
- **CSS RTL Utils**: Tailwind utilities for RTL layouts
- **Component Adaptation**: UI components adapt to text direction
- **Icon Mirroring**: Directional icons flip appropriately

### Translation Management
- **Resource Loading**: Dynamic JSON file loading
- **Fallback Strategy**: Falls back to English for missing translations
- **Namespace Splitting**: Organized by feature area
- **Interpolation**: Variable substitution in translations

---

## ♿ Accessibility Features

### WCAG Compliance
| Level | Standard | Implementation |
|-------|----------|----------------|
| **AA** | 4.5:1 contrast | All standard themes |
| **AAA** | 7:1 contrast | High contrast theme |
| **A** | Keyboard navigation | Complete keyboard support |
| **AA** | Screen reader | ARIA labels, semantic HTML |

### Accessibility Tools
```typescript
// Screen reader announcements
useAriaAnnounce(): {
  announce: (message: string) => void;
  polite: (message: string) => void;
  assertive: (message: string) => void;
}

// Focus management
focus-ring: Custom focus indicators
high-contrast-focus: Enhanced focus for accessibility
```

### Keyboard Navigation
- **Tab Order**: Logical tab sequence throughout app
- **Shortcuts**: Keyboard shortcuts for common actions
- **Skip Links**: Skip to main content functionality
- **Focus Trapping**: Modal and dialog focus management

### Visual Accessibility
- **High Contrast Mode**: Pure black/white theme option
- **Focus Indicators**: 2px standard, 4px high contrast
- **Motion Preferences**: Respects `prefers-reduced-motion`
- **Font Scaling**: Supports browser zoom up to 200%

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Dynamic content announcements
- **Role Attributes**: Proper ARIA roles for custom components

### Accessibility Settings
```typescript
interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
}
```

---

## 🛠️ Development Tools

### Available Scripts
```bash
# Development
npm run dev                    # Start dev server (localhost:8080)
npm run dev:mobile            # Mobile-sized floating window
npm run dev:iphone           # iPhone 14 Pro window (393×852)
npm run dev:android          # Google Pixel 7 window (412×915)

# Building & Testing
npm run build                # Production build
npm run type-check          # TypeScript checking
npm run lint                # ESLint linting
npm run test:run            # Unit tests (83% coverage)
npm run test:e2e            # Playwright E2E tests

# Quality Gates
npm run gates:check         # Pre-deployment validation
npm run quality:full        # Complete quality check
npm run production:ready    # Production readiness check

# Database Management
npm run db:connect          # Test Supabase connection
npm run db:health           # Database health check
npm run db:admin           # Super admin management
npm run db:migrate         # Apply migrations

# Analytics & Performance
npm run bundle:analyze      # Bundle size analysis
npm run test:performance   # Performance testing
npm run ai:validate        # AI system validation
```

### Testing Strategy
| Type | Tool | Coverage | Purpose |
|------|------|----------|---------|
| **Unit** | Vitest + Testing Library | 83% | Component logic testing |
| **Integration** | Vitest | 65% | Feature integration testing |
| **E2E** | Playwright | Key flows | User journey testing |
| **Accessibility** | axe-core | 100% | A11y compliance testing |
| **Performance** | Web Vitals | Continuous | Performance monitoring |

### Code Quality Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety and documentation
- **Husky**: Pre-commit hooks
- **Commitlint**: Conventional commit messages

### Mobile Development
- **Responsive Testing**: Multiple device presets
- **Touch Interactions**: Mobile-optimized touch targets
- **Viewport Simulation**: iPhone, Android, tablet testing
- **Performance**: Mobile performance optimization

### Deployment Pipeline
1. **Code Quality**: Lint, type-check, format validation
2. **Testing**: Unit, integration, E2E test execution
3. **Bundle Analysis**: Size and performance analysis
4. **Accessibility**: A11y compliance verification
5. **Production Build**: Optimized production bundle
6. **Deployment**: IONOS deployment with SFTP

---

## 📊 Summary

**Spark Bloom Flow** is a comprehensive productivity application featuring:

- **47 Pages** across modern tab navigation and legacy routes
- **200+ Components** including 46 UI components and 26 widgets
- **50+ Database Tables** with complete user data management
- **Multi-language Support** with 6 languages and RTL support
- **AI Integration** with multiple providers and usage tracking
- **Accessibility Compliance** meeting WCAG AAA standards
- **Mobile-First Design** with responsive layouts and testing tools

The application demonstrates modern React architecture with TypeScript, comprehensive testing, and production-ready deployment capabilities.

---

*Documentation generated with love for the Spark Bloom Flow productivity application* ✨
