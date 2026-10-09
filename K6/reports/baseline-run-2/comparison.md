Test duration: 120.8 s

### Per-API comparison

| API | Requests | Throughput | Avg | Median | p(90) | p(95) | Max | Failure rate | Check pass rate |
|---|---|---|---|---|---|---|---|---|---|
| Deposit | 90 | 0.74 req/s | 27.36 ms | 25.26 ms | 36.20 ms | 40.72 ms ✅ | 81.50 ms | 0.00% ✅ | 100.00% ✅ |
| Send Money | 90 | 0.74 req/s | 29.79 ms | 23.41 ms | 41.20 ms | 47.48 ms ✅ | 211.97 ms | 1.11% ❌ | 98.89% ❌ |
| Payment | 210 | 1.74 req/s | 24.49 ms | 21.53 ms | 33.92 ms | 38.87 ms ✅ | 112.39 ms | 0.48% ✅ | 99.52% ✅ |
| **All transactions** | 390 | 3.23 req/s | 26.37 ms | 22.44 ms | 37.15 ms | 43.62 ms | 211.97 ms | 0.51% | 99.49% |

### Per-window (workload change)

| Window | Requests | Throughput | Avg | p(95) | Max | Failure rate |
|---|---|---|---|---|---|---|
| 0–30s (2 flows) | 60 | 2.00 req/s | 28.10 ms | 45.54 ms | 49.15 ms | 0.00% |
| 30–60s (3 flows) | 90 | 3.00 req/s | 28.00 ms | 43.97 ms | 82.86 ms | 2.22% |
| 60–90s (4 flows) | 120 | 4.00 req/s | 28.79 ms | 41.02 ms | 211.97 ms | 0.00% |
| 90–120s (4 payment flows) | 120 | 4.00 req/s | 21.88 ms | 32.98 ms | 46.09 ms | 0.00% |

### Per-API per-window

| API | Window | Requests | Avg | p(95) | Max | Failure rate |
|---|---|---|---|---|---|---|
| Deposit | p2 | 30 | 27.74 ms | 42.52 ms | 81.50 ms | 0.00% |
| Deposit | p3 | 60 | 27.17 ms | 37.83 ms | 57.95 ms | 0.00% |
| Send Money | p1 | 30 | 28.33 ms | 44.60 ms | 49.15 ms | 0.00% |
| Send Money | p2 | 30 | 29.03 ms | 55.66 ms | 81.34 ms | 3.33% |
| Send Money | p3 | 30 | 32.00 ms | 60.15 ms | 211.97 ms | 0.00% |
| Payment | p1 | 30 | 27.87 ms | 46.04 ms | 48.89 ms | 0.00% |
| Payment | p2 | 30 | 27.22 ms | 38.87 ms | 82.86 ms | 3.33% |
| Payment | p3 | 30 | 28.80 ms | 53.93 ms | 112.39 ms | 0.00% |
| Payment | p4 | 120 | 21.88 ms | 32.98 ms | 46.09 ms | 0.00% |

### Thresholds

53/59 thresholds passed.
- ❌ http_req_failed{api:sendmoney,phase:p2}: rate<0.01
- ❌ http_req_failed{type:transaction,phase:p2}: rate<0.01
- ❌ http_req_failed{api:payment,phase:p2}: rate<0.01
- ❌ checks{api:sendmoney}: rate>=0.99
- ❌ sendmoney_success: rate>=0.99
- ❌ http_req_failed{api:sendmoney}: rate<0.01
