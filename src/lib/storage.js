const HISTORY_KEY = 'calcflow_history';
const FAVORITES_KEY = 'calcflow_favorites';
const MAX_HISTORY = 200;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addHistory(item) {
  const history = getHistory();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    created_date: new Date().toISOString(),
    ...item,
  };
  history.unshift(entry);
  const trimmed = history.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  return entry;
}

export function deleteHistory(id) {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.setItem(HISTORY_KEY, '[]');
}

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addFavorite(item) {
  const favorites = getFavorites();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    created_date: new Date().toISOString(),
    ...item,
  };
  favorites.unshift(entry);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return entry;
}

export function deleteFavorite(id) {
  const favorites = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(type, refId) {
  return getFavorites().some((f) => f.type === type && f.refId === refId);
}