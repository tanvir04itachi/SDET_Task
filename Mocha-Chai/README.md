# DMoney API Integration Testing

An automated API integration test suite for the **DMoney Transaction API** (`dmoney-transaction-api`), built with **Mocha**, **Chai** and **Axios**.

The suite exercises a full, realistic user journey against a running instance of the API:

1. Self-register 2 Customers, 1 Agent and 1 Merchant.
2. Admin activates all 4 pending accounts.
3. Each activated user logs in (OTP flow) and obtains a JWT.
4. The `SYSTEM` account deposits `5000 tk` to the new Agent.
5. The Agent deposits `2000 tk` to Customer 1 — asserts the **deposit commission**.
6. Customer 1 sends `1000 tk` to Customer 2 — asserts the **P2P service fee**.
7. Customer 2 cashes out `500 tk` via the Agent — asserts the **withdraw service fee**.
8. Customer 1 pays `400 tk` to the Merchant — asserts the **service fee deducted from the customer**.

Every test case asserts the HTTP response status code in addition to any business-logic assertions.

## Project structure

```
Mocha-Chai/
├── .env               # Local config (gitignored) — copy from .env.example
├── .env.example        # Template for required environment variables
├── .gitignore
├── .mocharc.json       # Mocha configuration (test glob, timeout, dotenv)
├── package.json
├── README.md
└── test/
    └── dmoney.spec.js  # All test scenarios
```

## Prerequisites

1. **`dmoney-transaction-api`** must be running locally (MySQL + `npm start` inside `dmoney-transaction-api/`), reachable at the URL configured in `.env`.
2. Node.js and npm installed.

## Setup

```bash
cd Mocha-Chai
npm install
copy .env.example .env    # Windows (use `cp` on macOS/Linux)
```

Edit `.env` so its values match the running API's own `.env`:

| Variable          | Description                                                                 |
|-------------------|-------------------------------------------------------------------------------|
| `BASE_URL`        | Base URL of the running API, e.g. `http://localhost:5000`                     |
| `SECRET_KEY`      | Must match `PARTNER_KEY` in `dmoney-transaction-api/.env` (`X-AUTH-SECRET-KEY` header) |
| `DEFAULT_OTP`     | Must match `DEFAULT_OTP` in `dmoney-transaction-api/.env` (dev OTP bypass)     |
| `SYSTEM_EMAIL`    | Pre-seeded SYSTEM account email (`system@dmoney.com`)                         |
| `SYSTEM_PASSWORD` | Pre-seeded SYSTEM account password (`1234`)                                   |
| `ADMIN_EMAIL`     | Pre-seeded Admin account email (`admin@dmoney.com`)                           |
| `ADMIN_PASSWORD`  | Pre-seeded Admin account password (`1234`)                                    |

## Running the tests

```bash
npm test
```

This single command runs the entire suite (`mocha` picks up `.mocharc.json` automatically).

Test data (phone numbers, emails, NIDs) is randomly generated on every run, so the suite is **safe to re-run** without manual cleanup or database resets.

## How authentication is handled

- New Customer/Agent/Merchant accounts self-register via `POST /user/register` (public, no auth) and start with `status: "pending"`.
- The Admin activates each account via `PATCH /user/update/:id` (requires an Admin JWT + `X-AUTH-SECRET-KEY`).
- Login (`POST /user/login`) always returns an OTP challenge for non-Admin/non-SYSTEM accounts. The suite completes login via `POST /user/verify-otp?env=dev`, using the `DEFAULT_OTP` dev bypass so no real email/OTP retrieval is required — the exact mechanism the API exposes for automated testing.
- Admin and SYSTEM accounts skip OTP entirely and receive a JWT directly from `POST /user/login`.

## Fee/commission values asserted

These mirror the DB-driven rules seeded in the `Commissions` table (`dmoney-transaction-api/migrations/create_commission_table.js`):

| Transaction         | Rule                                   | On 2000/1000/500/400 tk |
|---------------------|-----------------------------------------|--------------------------|
| Deposit (Agent → Customer) | 2.5% Agent commission             | `2000 * 0.025 = 50 tk`   |
| Send Money (Customer → Customer) | Flat 5 tk system service fee | `5 tk`                   |
| Withdraw (Customer → Agent) | 1% system fee, 5 tk floor         | `max(500*0.01, 5) = 5 tk`|
| Payment (Customer → Merchant) | 1% system fee, 5 tk floor       | `max(400*0.01, 5) = 5 tk`|

## Console output

Sample output from a full local test run (`npm test`):

```
> dmoney-api-integration-tests@1.0.0 test
> mocha



  DMoney API Integration Tests
    1. Create users (2 Customer, 1 Agent, 1 Merchant)
      ✔ registers Customer 1 successfully (201, status=pending)
      ✔ registers Customer 2 successfully (201, status=pending)
      ✔ registers the Agent successfully (201, status=pending)
      ✔ registers the Merchant successfully (201, status=pending)
      ✔ rejects registering the same phone number twice (208)
      ✔ rejects an invalid role (400)
    2. Admin activates users
      ✔ activates Customer 1 (200)
      ✔ activates Customer 2 (200)
      ✔ activates the Agent (200)
      ✔ activates the Merchant (200)
      ✔ rejects a non-admin activation attempt with the wrong secret key (401)
    3. Login as activated users
      ✔ logs in Customer 1 and receives a JWT
      ✔ logs in Customer 2 and receives a JWT
      ✔ logs in the Agent and receives a JWT
      ✔ logs in the Merchant and receives a JWT
      ✔ rejects login with an incorrect password (401)
    4. SYSTEM deposits 5000 tk to Agent
      ✔ deposits 5000 tk from SYSTEM to the Agent (201)
      ✔ rejects SYSTEM deposit to a non-Agent account (400)
    5. Agent deposits 2000 tk to Customer 1 (assert commission)
      ✔ deposits 2000 tk to Customer 1 and returns the correct commission (201)
      ✔ rejects a deposit initiated by someone other than the Agent account owner (403)
    6. Customer 1 sends 1000 tk to Customer 2 (assert service fee)
      ✔ sends 1000 tk and returns the correct P2P service fee (201)
      ✔ rejects send money to a Merchant account (400)
    7. Customer 2 cashes out 500 tk via Agent (assert service fee)
      ✔ withdraws 500 tk through the Agent and returns the correct service fee (201)
      ✔ rejects withdraw to a non-Agent account (400)
    8. Customer 1 pays 400 tk to Merchant (assert service fee deducted)
      ✔ pays 400 tk to the Merchant, deducting amount + fee from the customer (201)
      ✔ rejects payment to a non-Merchant account (400)


  26 passing (450ms)
```

> Note: this is the raw terminal output captured from a real local run (no screenshot-capture tool was available in this environment); it shows the same pass/fail information a screenshot would.
