export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isJwtExpired(payload) {
  if (!payload?.exp) return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

export function getStoredAuthPayload() {
  const token = localStorage.getItem('rr_token');
  if (!token) return null;
  return parseJwt(token);
}

export function getTokenUserId() {
  return getStoredAuthPayload()?.sub || null;
}
