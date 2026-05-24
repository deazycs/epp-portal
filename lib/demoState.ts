// Глобальное состояние демо-сценария — живёт вне React
// не сбрасывается при навигации между страницами
let _open = false;
const _listeners: Array<(open: boolean) => void> = [];

export const demoState = {
  get open() { return _open; },
  start() {
    _open = true;
    _listeners.forEach(fn => fn(true));
  },
  stop() {
    _open = false;
    _listeners.forEach(fn => fn(false));
  },
  subscribe(fn: (open: boolean) => void) {
    _listeners.push(fn);
    return () => {
      const i = _listeners.indexOf(fn);
      if (i >= 0) _listeners.splice(i, 1);
    };
  },
};
