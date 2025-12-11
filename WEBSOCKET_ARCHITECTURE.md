# WebSocket Architecture Documentation

## Current Architecture Analysis

### ✅ What's Working Well

1. **Single Connection Management**
   - `WebSocketProvider` maintains a single `socketRef` that's shared across all components
   - Multiple `useWebSocket` calls reuse the same socket instance
   - Connection lifecycle is managed at the provider level

2. **Connection Reuse**
   - `connectSocket` checks for existing connected socket before creating new one
   - Efficient resource usage

### ⚠️ Issues & Improvements Needed

1. **Event Listener Management**
   - Each component directly registers listeners on the socket
   - No centralized tracking of subscriptions
   - Potential memory leaks if cleanup doesn't happen properly
   - Handlers can be recreated unnecessarily

2. **Type Safety**
   - Events use `any` types
   - No compile-time checking for event names

3. **Connection State**
   - No way to observe connection state across components
   - Components can't react to connection/disconnection

4. **Handler Recreation**
   - `useNotificationWebSocket` has `onReceive` in dependencies, causing re-registration
   - Need ref-based handler pattern

## Proposed Enhanced Architecture

### Architecture Principles

1. **Single Source of Truth**: One socket connection managed at provider level
2. **Centralized Event Management**: All subscriptions tracked and managed centrally
3. **Type Safety**: Full TypeScript support for events
4. **Automatic Cleanup**: Subscriptions cleaned up automatically
5. **State Management**: Shared connection state across components
6. **Performance**: Prevent unnecessary re-subscriptions

### Implementation

See `websocket-enhanced.provider.tsx` for the enhanced implementation.

### Usage Examples

#### Basic Event Subscription (Notification WebSocket)

```tsx
// Old way (issues with handler recreation)
useNotificationWebSocket(websocketOptions, (notification) => {
  // Handler recreated on every render if dependencies change
  setNotifications(prev => [...prev, notification])
})

// New way (stable subscriptions)
useWebSocketEvent('events:notifications', (data) => {
  // Handler wrapped in ref, no re-subscription
  setNotifications(prev => [...prev, data.data])
})
```

#### Using in Components

```tsx
// Get connection status
const { isConnected, connectionState } = useWebSocketStatus()

// Emit events
const emit = useWebSocketEmit()
emit('subscribe:announcements', {})

// Subscribe to events with proper cleanup
useWebSocketEvent('events:announcements', (messages) => {
  setAnnouncements(prev => [...prev, ...messages])
})
```

#### Provider Setup

```tsx
// In root providers
<WebSocketProviderEnhanced 
  options={websocketOptions} 
  shouldConnect={isLoggedIn}
>
  {children}
</WebSocketProviderEnhanced>
```

### Migration Path

1. **Phase 1**: Add enhanced provider alongside existing one
2. **Phase 2**: Migrate one feature at a time
3. **Phase 3**: Remove old provider once all features migrated

### Benefits

1. **Memory Safety**: Automatic cleanup prevents leaks
2. **Type Safety**: Compile-time checking for events
3. **Performance**: No unnecessary re-subscriptions
4. **Maintainability**: Centralized event management
5. **Debugging**: Easy to track all subscriptions
6. **Testing**: Easier to mock and test

### Comparison

| Aspect | Current | Enhanced |
|--------|---------|----------|
| Connection Management | ✅ Single connection | ✅ Single connection |
| Event Subscriptions | ❌ Per-component | ✅ Centralized |
| Type Safety | ❌ `any` types | ✅ Full TypeScript |
| Handler Stability | ❌ Recreated | ✅ Ref-based |
| Connection State | ❌ Not shared | ✅ Shared |
| Cleanup | ⚠️ Manual | ✅ Automatic |
| Memory Leaks | ⚠️ Possible | ✅ Prevented |
