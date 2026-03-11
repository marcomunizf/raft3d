export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function getStoredAuthPayload() {
  const token = localStorage.getItem('rr_token');
  if (!token) return null;
  return parseJwt(token);
}

export function getTokenUserId() {
  return getStoredAuthPayload()?.sub || null;
}