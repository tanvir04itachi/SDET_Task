import http from 'k6/http';

// Login traffic is tagged type=auth so it never counts toward the transaction thresholds.
const AUTH_TAGS = { type: 'auth' };

function jsonPost(url, body) {
  return http.post(url, JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    tags: AUTH_TAGS,
  });
}

/**
 * Logs a user in with their own credentials and returns a JWT.
 * Customer/Agent/Merchant logins need a second OTP step; the dev OTP is used here.
 */
export function login(cfg, user) {
  const res = jsonPost(`${cfg.baseUrl}/user/login`, { phone_number: user.phone_number, password: user.password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${user.name}: ${res.status} ${res.body}`);
  }
  const body = res.json();
  if (body.token) return body.token;

  const otp = jsonPost(`${cfg.baseUrl}/user/verify-otp?env=dev`, { identifier: user.phone_number, otp: cfg.otp });
  if (otp.status !== 200 || !otp.json('token')) {
    throw new Error(`OTP verification failed for ${user.name}: ${otp.status} ${otp.body}`);
  }
  return otp.json('token');
}

export function authHeaders(cfg, token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-AUTH-SECRET-KEY': cfg.secretKey,
  };
}
