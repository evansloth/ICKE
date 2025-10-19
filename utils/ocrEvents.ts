type Listener = (payload?: any) => void;

const listeners: Record<string, Listener[]> = {};

export function on(event: string, fn: Listener) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
  return () => off(event, fn);
}

export function off(event: string, fn: Listener) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(l => l !== fn);
}

export function emit(event: string, payload?: any) {
  if (!listeners[event]) return;
  listeners[event].forEach(fn => {
    try { fn(payload); } catch (e) { console.error('ocrEvents handler error', e); }
  });
}

export default { on, off, emit };