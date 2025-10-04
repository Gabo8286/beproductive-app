import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent viewport for screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Component Screenshots', () => {
    test('should capture button component variations', async ({ page }) => {
      await page.goto('/');

      // Mock a page with various button states for testing
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              .btn-primary { @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded; }
              .btn-secondary { @apply bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded; }
              .btn-destructive { @apply bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded; }
            </style>
          </head>
          <body class="p-8 bg-white">
            <div class="space-y-4">
              <h1 class="text-2xl font-bold">Button Variations</h1>

              <div class="space-x-4">
                <button class="btn-primary">Primary Button</button>
                <button class="btn-secondary">Secondary Button</button>
                <button class="btn-destructive">Destructive Button</button>
                <button class="btn-primary" disabled>Disabled Button</button>
              </div>

              <div class="space-x-4">
                <button class="btn-primary text-sm px-2 py-1">Small Button</button>
                <button class="btn-primary">Medium Button</button>
                <button class="btn-primary text-lg px-6 py-3">Large Button</button>
              </div>

              <div class="space-x-4">
                <button class="btn-primary rounded-none">Square</button>
                <button class="btn-primary rounded">Rounded</button>
                <button class="btn-primary rounded-full">Pill</button>
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('button-variations.png');
    });

    test('should capture card component layouts', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="p-8 bg-gray-100">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Simple Card -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-2">Simple Card</h3>
                <p class="text-gray-600">This is a basic card with minimal styling.</p>
              </div>

              <!-- Card with Image -->
              <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                <div class="p-6">
                  <h3 class="text-lg font-semibold mb-2">Card with Image</h3>
                  <p class="text-gray-600">This card includes a header image.</p>
                </div>
              </div>

              <!-- Card with Actions -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-2">Interactive Card</h3>
                <p class="text-gray-600 mb-4">This card has action buttons.</p>
                <div class="flex space-x-2">
                  <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                  <button class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                </div>
              </div>

              <!-- Progress Card -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-2">Progress Card</h3>
                <p class="text-gray-600 mb-4">75% Complete</p>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 75%"></div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('card-layouts.png');
    });

    test('should capture form components', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="p-8 bg-white">
            <form class="max-w-md mx-auto space-y-6">
              <h2 class="text-2xl font-bold text-center">Form Components</h2>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Text Input</label>
                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter text">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Input</label>
                <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter email">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Select Dropdown</label>
                <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Textarea</label>
                <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Enter description"></textarea>
              </div>

              <div class="flex items-center">
                <input type="checkbox" class="mr-2">
                <label class="text-sm text-gray-700">I agree to the terms</label>
              </div>

              <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Submit Form</button>
            </form>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('form-components.png');
    });
  });

  test.describe('Layout Screenshots', () => {
    test('should capture responsive grid layouts', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="bg-gray-100">
            <!-- Desktop Layout -->
            <div class="p-8">
              <h1 class="text-3xl font-bold mb-8 text-center">Responsive Grid Layout</h1>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                ${Array.from({ length: 8 }, (_, i) => `
                  <div class="bg-white p-6 rounded-lg shadow">
                    <div class="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded mb-4"></div>
                    <h3 class="font-semibold mb-2">Item ${i + 1}</h3>
                    <p class="text-gray-600 text-sm">Sample content for grid item ${i + 1}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('responsive-grid-desktop.png');
    });

    test('should capture mobile layouts', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="bg-gray-100">
            <div class="p-4">
              <h1 class="text-xl font-bold mb-4">Mobile Layout</h1>

              <div class="space-y-4">
                <div class="bg-white p-4 rounded-lg shadow">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-blue-500 rounded-full"></div>
                    <div>
                      <h3 class="font-semibold">Goal Title</h3>
                      <p class="text-sm text-gray-600">Progress: 75%</p>
                    </div>
                  </div>
                  <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-500 h-2 rounded-full" style="width: 75%"></div>
                    </div>
                  </div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow">
                  <h3 class="font-semibold mb-2">Quick Actions</h3>
                  <div class="grid grid-cols-2 gap-2">
                    <button class="bg-blue-500 text-white py-2 rounded text-sm">Add Goal</button>
                    <button class="bg-green-500 text-white py-2 rounded text-sm">View Stats</button>
                    <button class="bg-purple-500 text-white py-2 rounded text-sm">Habits</button>
                    <button class="bg-orange-500 text-white py-2 rounded text-sm">Settings</button>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('mobile-layout.png');
    });
  });

  test.describe('State-based Screenshots', () => {
    test('should capture loading states', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .spinner { animation: spin 1s linear infinite; }
            </style>
          </head>
          <body class="p-8 bg-gray-100">
            <div class="max-w-2xl mx-auto space-y-8">
              <h1 class="text-2xl font-bold text-center">Loading States</h1>

              <!-- Spinner Loading -->
              <div class="bg-white p-6 rounded-lg shadow text-center">
                <div class="spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-gray-600">Loading with spinner...</p>
              </div>

              <!-- Skeleton Loading -->
              <div class="bg-white p-6 rounded-lg shadow">
                <div class="animate-pulse">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div class="space-y-2 flex-1">
                      <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div class="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div class="mt-4 space-y-2">
                    <div class="h-3 bg-gray-300 rounded"></div>
                    <div class="h-3 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>

              <!-- Progress Bar Loading -->
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold mb-4">File Upload Progress</h3>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div class="bg-blue-500 h-2 rounded-full" style="width: 60%"></div>
                </div>
                <p class="text-sm text-gray-600">Uploading... 60% complete</p>
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('loading-states.png');
    });

    test('should capture error states', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="p-8 bg-gray-100">
            <div class="max-w-2xl mx-auto space-y-6">
              <h1 class="text-2xl font-bold text-center">Error States</h1>

              <!-- Form Validation Error -->
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold mb-4">Form Validation</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" class="w-full px-3 py-2 border-2 border-red-500 rounded-md" value="invalid-email">
                    <p class="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                  </div>
                </div>
              </div>

              <!-- Network Error -->
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span class="text-white text-sm">✕</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-red-800">Connection Error</h3>
                    <p class="text-red-600 text-sm">Unable to connect to server. Please try again.</p>
                  </div>
                </div>
              </div>

              <!-- 404 Error -->
              <div class="bg-white p-8 rounded-lg shadow text-center">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-semibold mb-2">Page Not Found</h3>
                <p class="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <button class="bg-blue-500 text-white px-4 py-2 rounded">Go Home</button>
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('error-states.png');
    });
  });

  test.describe('Dark Mode Screenshots', () => {
    test('should capture dark mode components', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="bg-gray-900 text-white">
            <div class="p-8">
              <h1 class="text-2xl font-bold mb-8 text-center">Dark Mode Components</h1>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Dark Card -->
                <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 class="text-lg font-semibold mb-2">Dark Card</h3>
                  <p class="text-gray-300">This is a card in dark mode with appropriate contrast.</p>
                  <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Action</button>
                </div>

                <!-- Dark Form -->
                <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 class="text-lg font-semibold mb-4">Dark Form</h3>
                  <div class="space-y-3">
                    <input type="text" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Dark input">
                    <select class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
                      <option>Dark option 1</option>
                      <option>Dark option 2</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot('dark-mode-components.png');
    });
  });

  test.describe('Interactive State Screenshots', () => {
    test('should capture hover states', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              .hover-demo:hover { transform: scale(1.05); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
            </style>
          </head>
          <body class="p-8 bg-gray-100">
            <div class="max-w-2xl mx-auto">
              <h1 class="text-2xl font-bold mb-8 text-center">Hover States</h1>

              <div class="grid grid-cols-2 gap-6">
                <div class="hover-demo bg-white p-6 rounded-lg shadow transition-all duration-300 cursor-pointer">
                  <h3 class="font-semibold mb-2">Hover Card</h3>
                  <p class="text-gray-600">Hover over me to see the effect</p>
                </div>

                <div class="hover-demo bg-blue-500 text-white p-6 rounded-lg shadow transition-all duration-300 cursor-pointer">
                  <h3 class="font-semibold mb-2">Colored Hover Card</h3>
                  <p>Another hover example</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

      // Hover over the first card
      await page.hover('.hover-demo');
      await expect(page).toHaveScreenshot('hover-states.png');
    });

    test('should capture focus states', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="p-8 bg-white">
            <form class="max-w-md mx-auto space-y-4">
              <h2 class="text-2xl font-bold text-center">Focus States</h2>

              <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Focus on me" autofocus>

              <button type="button" class="w-full bg-blue-500 text-white py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Focusable Button</button>

              <a href="#" class="block text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Focusable Link</a>
            </form>
          </body>
        </html>
      `);

      // The input should be focused due to autofocus
      await expect(page).toHaveScreenshot('focus-states.png');
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    test('should look consistent across browsers', async ({ page, browserName }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="p-8 bg-white">
            <div class="max-w-4xl mx-auto">
              <h1 class="text-3xl font-bold mb-8 text-center">Cross-Browser Test</h1>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-blue-400 to-purple-600 text-white p-6 rounded-lg">
                  <h3 class="font-semibold mb-2">Gradient Card</h3>
                  <p>Testing CSS gradients across browsers</p>
                </div>

                <div class="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg">
                  <h3 class="font-semibold mb-2">Dashed Border</h3>
                  <p>Testing border styles</p>
                </div>

                <div class="bg-white shadow-xl p-6 rounded-lg">
                  <h3 class="font-semibold mb-2">Box Shadow</h3>
                  <p>Testing shadow rendering</p>
                </div>
              </div>

              <div class="mt-8 flex flex-wrap gap-4 justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors">Rounded Button</button>
                <button class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition-colors">Square Button</button>
                <button class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">Large Radius</button>
              </div>
            </div>
          </body>
        </html>
      `);

      await expect(page).toHaveScreenshot(`cross-browser-${browserName}.png`);
    });
  });

  test.describe('Animation Screenshots', () => {
    test('should capture CSS animations', async ({ page }) => {
      await page.setContent(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @keyframes slideIn {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }

              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              .slide-in { animation: slideIn 0.5s ease-out forwards; }
              .fade-in { animation: fadeIn 1s ease-in forwards; }

              .pulse-animation {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }

              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
              }
            </style>
          </head>
          <body class="p-8 bg-gray-100">
            <div class="max-w-2xl mx-auto space-y-6">
              <h1 class="text-2xl font-bold text-center fade-in">Animation Examples</h1>

              <div class="slide-in bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold mb-2">Slide In Animation</h3>
                <p class="text-gray-600">This card slides in from the left</p>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold mb-4">Pulsing Element</h3>
                <div class="pulse-animation w-16 h-16 bg-blue-500 rounded-full mx-auto"></div>
              </div>
            </div>
          </body>
        </html>
      `);

      // Wait for animations to start
      await page.waitForTimeout(100);
      await expect(page).toHaveScreenshot('css-animations.png');
    });
  });
});