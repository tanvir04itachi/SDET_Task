const TOKEN_KEY = "blog_token_local";
const USER_KEY = "blog_user_local";
const COOKIE_TOKEN_KEY = "blog_token";
const COOKIE_ROLE_KEY = "blog_role";
const ONE_DAY_SECONDS = 60 * 60 * 24;

export const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
};

export const setStoredUser = (user) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const removeStoredUser = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

export const setAuthCookies = (token, role) => {
  if (typeof document === "undefined") {
    return;
  }

  const baseOptions = `path=/; max-age=${ONE_DAY_SECONDS}; samesite=lax`;
  document.cookie = `${COOKIE_TOKEN_KEY}=${encodeURIComponent(token)}; ${baseOptions}`;

  if (role) {
    document.cookie = `${COOKIE_ROLE_KEY}=${encodeURIComponent(role)}; ${baseOptions}`;
  }
};

export const clearAuthCookies = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${COOKIE_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  document.cookie = `${COOKIE_ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
};

export const clearAuthData = () => {
  removeToken();
  removeStoredUser();
  clearAuthCookies();
};
