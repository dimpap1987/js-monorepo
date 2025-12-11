# Bug Report: Component Review in `libs/` Directory

## Summary
Found **6 critical bugs** across React components in the `libs/` directory:
- 3 memory leaks (event listeners, timeouts not cleaned up)
- 3 missing dependencies in useEffect hooks (causing stale closures and infinite loops)

---

## Bug 1: Memory Leak in `notification-bell.tsx` - Event Listener & Debounce

**File:** `libs/notifications/client/src/lib/components/notification-bell.tsx`

**Issues:**
1. **Event listener not cleaned up properly**: The `handleScroll` function is recreated on every render due to `debounce` being called inside `useCallback`, causing the event listener to reference a stale function.
2. **Debounce function recreated**: `debounce()` creates a new function on every render, defeating the purpose of debouncing.
3. **setTimeout not cleaned up**: The `setTimeout` in `onOpenChange` is never cleared, potentially causing memory leaks.

**Lines:** 89-120

**Impact:** 
- Memory leaks (event listeners accumulate)
- Debounce doesn't work correctly
- Potential race conditions

**Fix:** Move debounce outside useCallback, use useRef for debounced function, cleanup setTimeout.

---

## Bug 2: Missing Dependencies in `usePaginationWithParams`

**File:** `libs/next/src/lib/hooks/pagination.ts`

**Issue:** `useEffect` on line 32-34 is missing `replace` and `searchParams` in dependency array, causing stale closures.

**Lines:** 32-34

**Impact:** 
- URL params may not update correctly
- Stale closure bugs

**Fix:** Add `replace` and `searchParams` to dependency array (or use useCallback for replace).

---

## Bug 3: Missing Dependencies in `useWebSocket`

**File:** `libs/next/src/lib/providers/websoket.provider.tsx`

**Issue:** `useEffect` on line 99-107 is missing `opts.path` and `context` in dependency array.

**Lines:** 99-107

**Impact:**
- Socket may not reconnect when options change
- Stale closure bugs

**Fix:** Add missing dependencies or restructure to avoid dependency issues.

---

## Bug 4: Memory Leak in `event-source.provider.tsx` - Reconnect Timeout

**File:** `libs/next/src/lib/providers/event-source.provider.tsx`

**Issue:** `reconnectTimeout` is declared inside `useEffect` but cleanup only clears it if it exists at cleanup time. If component unmounts during reconnect delay, timeout may not be cleared.

**Lines:** 18-71

**Impact:**
- Memory leak: timeout may fire after component unmounts
- Potential state updates on unmounted component

**Fix:** Use useRef for reconnectTimeout to ensure proper cleanup.

---

## Bug 5: Missing Dependency in `session.tsx`

**File:** `libs/auth/next/src/lib/client/session.tsx`

**Issue:** `useEffect` on line 77-87 is missing `session` in dependency array (though it's used in condition).

**Lines:** 77-87

**Impact:**
- Effect may not run when session changes
- Stale closure bugs

**Note:** This might be intentional to avoid infinite loops, but should be documented or refactored.

---

## Bug 6: Missing Dependency in `carousel.tsx`

**File:** `libs/shared/ui/components/src/lib/carousel/carousel.tsx`

**Issue:** `useEffect` on line 71-75 only depends on `hrefs.length`, but `startAutoSlide` function uses `hrefs` array. If hrefs change but length stays same, carousel won't restart.

**Lines:** 71-75

**Impact:**
- Carousel may show wrong images if hrefs array changes but length stays same
- Stale closure bugs

**Fix:** Add `hrefs` to dependency array or use `hrefs.length` consistently.

---

## Priority

**Critical (Fix Immediately):**
- Bug 1: Memory leak with event listeners
- Bug 4: Memory leak with timeout

**High (Fix Soon):**
- Bug 2, 3, 5, 6: Missing dependencies causing potential bugs

---

## Testing Recommendations

After fixes:
1. Test event listener cleanup (open/close notification bell multiple times)
2. Test WebSocket reconnection scenarios
3. Test pagination URL updates
4. Test carousel with changing images
5. Monitor memory usage in dev tools

