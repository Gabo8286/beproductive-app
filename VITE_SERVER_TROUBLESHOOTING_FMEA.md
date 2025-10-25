# VITE SERVER TROUBLESHOOTING - FAILURE MODE ANALYSIS (FMEA)

## CRITICAL REFERENCE DOCUMENT
**DO NOT IGNORE THIS DOCUMENT - IT CONTAINS PROVEN SOLUTIONS**

---

## FAILURE MODE 1: "Server Shows Ready But Browser Can't Connect"

### **SYMPTOMS:**
- Terminal shows: `VITE v5.4.21 ready in XXXms ➜ Local: http://localhost:8080/`
- Browser shows: "Safari Can't Connect to the Server" or similar
- curl fails: `curl: (7) Failed to connect to localhost port 8080`

### **ROOT CAUSE:**
**HMR Host Configuration Mismatch** in `vite.config.ts`

### **DETECTION:**
```bash
# Check if port is actually bound
lsof -i :8080
netstat -an | grep 8080

# Test basic Node.js binding
node -e "require('http').createServer().listen(8080, () => console.log('Node works'))"
```

### **SOLUTION:**
1. **Ensure host consistency** in `vite.config.ts`:
   ```ts
   server: {
     host: '127.0.0.1',  // or '0.0.0.0'
     port: 3000,
     strictPort: true,
   },
   // CRITICAL: HMR host MUST match server host
   hmr: {
     host: '127.0.0.1',  // SAME as server host
     port: 3000,         // SAME as server port
   }
   ```

2. **Use alternative port if 8080 conflicts:**
   - Change to port 3000 or 5173
   - Avoid ports commonly used by other services

### **SEVERITY:** HIGH - Blocks all development
### **OCCURRENCE:** Common with complex Vite configs
### **DETECTION RATING:** Medium - Shows "ready" but doesn't work

---

## FAILURE MODE 2: "React App Loads But Shows Context/Router Errors"

### **SYMPTOMS:**
- Server connects successfully
- Browser shows multiple React errors:
  - `useLocation() may be used only in the context of a <Router> component`
  - `LunaProvider` and other context provider failures
  - `GlobalViewProvider` errors

### **ROOT CAUSE:**
**BrowserRouter positioned AFTER context providers that need router context**

### **DETECTION:**
```bash
# Check browser console for these errors
curl -s http://localhost:3000 | grep -i error
```

### **SOLUTION:**
**Move BrowserRouter BEFORE all context providers in App.tsx:**

```tsx
// ❌ WRONG - BrowserRouter too low
<QueryClientProvider>
  <ConfigProvider>
    <AuthProvider>
      <LunaProvider>
        <BrowserRouter>  // ← TOO LATE
          <AppContent />
        </BrowserRouter>
      </LunaProvider>
    </AuthProvider>
  </ConfigProvider>
</QueryClientProvider>

// ✅ CORRECT - BrowserRouter early
<QueryClientProvider>
  <I18nextProvider>
    <BrowserRouter>    // ← EARLY ENOUGH
      <ConfigProvider>
        <AuthProvider>
          <LunaProvider>
            <AppContent />
          </LunaProvider>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  </I18nextProvider>
</QueryClientProvider>
```

### **SEVERITY:** HIGH - App completely broken
### **OCCURRENCE:** High with complex provider hierarchies
### **DETECTION RATING:** High - Obvious errors in console

---

## DIAGNOSTIC WORKFLOW

### **Step 1: Server Binding Check**
```bash
# Verify server actually binds to port
lsof -i :8080
curl -I http://localhost:8080

# If no binding, check vite.config.ts host/port settings
```

### **Step 2: Basic Node.js Test**
```bash
# Test if Node.js can bind to port
node -e "
const http = require('http');
http.createServer((req, res) => {
  res.end('Test OK');
}).listen(8080, '127.0.0.1', () => {
  console.log('✅ Node.js can bind to port 8080');
});
"
```

### **Step 3: Vite Configuration Analysis**
```bash
# Check for host/port mismatches
grep -A 10 -B 5 "hmr:" vite.config.ts
grep -A 5 -B 5 "host:" vite.config.ts
```

### **Step 4: React Context Analysis**
```bash
# Check provider hierarchy in App.tsx
grep -n "BrowserRouter\|Provider" src/App.tsx
```

---

## PREVENTIVE MEASURES

### **1. Vite Configuration Standards:**
- Always match `server.host` and `hmr.host`
- Use `strictPort: true` to avoid port conflicts
- Prefer `127.0.0.1` over `0.0.0.0` for localhost development

### **2. React Provider Standards:**
- `BrowserRouter` must be ABOVE any provider using `useLocation()`
- Use this hierarchy order:
  1. QueryClientProvider
  2. I18nextProvider
  3. **BrowserRouter** ← CRITICAL POSITION
  4. All other context providers

### **3. Debugging Tools:**
- Use `lsof -i :PORT` to verify actual port binding
- Use browser dev tools to check for React context errors
- Test with minimal Node.js server to isolate Vite issues

---

## QUICK REFERENCE COMMANDS

```bash
# Server binding check
lsof -i :8080 && curl -I http://localhost:8080

# Kill processes on port
kill -9 $(lsof -ti:8080)

# Test minimal server
npm run dev

# Check TypeScript
npm run type-check

# Debug Vite
DEBUG=vite:* npm run dev
```

---

## SUCCESS CRITERIA

✅ **Server accessible:** `curl -I http://localhost:3000` returns HTTP 200
✅ **No React errors:** Browser console shows no context/router errors
✅ **TypeScript clean:** `npm run type-check` passes
✅ **HMR working:** File changes trigger hot reload

---

**REMEMBER: These are PROVEN solutions. Don't waste time on other approaches when these symptoms occur.**