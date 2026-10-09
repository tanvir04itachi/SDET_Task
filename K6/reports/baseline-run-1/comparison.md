Test duration: 120.9 s

### Per-API comparison

| API | Requests | Throughput | Avg | Median | p(90) | p(95) | Max | Failure rate | Check pass rate |
|---|---|---|---|---|---|---|---|---|---|
| Deposit | 90 | 0.74 req/s | 27.43 ms | 27.99 ms | 36.09 ms | 39.26 ms ✅ | 47.68 ms | 0.00% ✅ | 100.00% ✅ |
| Send Money | 90 | 0.74 req/s | 28.28 ms | 28.44 ms | 36.07 ms | 39.21 ms ✅ | 73.11 ms | 1.11% ❌ | 98.89% ❌ |
| Payment | 210 | 1.74 req/s | 26.43 ms | 27.88 ms | 33.91 ms | 36.34 ms ✅ | 59.36 ms | 0.48% ✅ | 99.52% ✅ |
| **All transactions** | 390 | 3.23 req/s | 27.09 ms | 27.94 ms | 35.12 ms | 37.68 ms | 73.11 ms | 0.51% | 99.49% |

### Per-window (workload change)

| Window | Requests | Throughput | Avg | p(95) | Max | Failure rate |
|---|---|---|---|---|---|---|
| 0–30s (2 flows) | 0 | 0.00 req/s | 29.41 ms | 39.35 ms | 73.11 ms | - |
| 30–60s (3 flows) | 0 | 0.00 req/s | 28.94 ms | 40.77 ms | 47.68 ms | - |
| 60–90s (4 flows) | 0 | 0.00 req/s | 26.91 ms | 37.16 ms | 59.36 ms | - |
| 90–120s (4 payment flows) | 0 | 0.00 req/s | 24.72 ms | 31.30 ms | 37.63 ms | - |

### Per-API per-window

| API | Window | Requests | Avg | p(95) | Max | Failure rate |
|---|---|---|---|---|---|---|
| Deposit | p2 | - | 28.43 ms | 40.31 ms | 47.68 ms | - |
| Deposit | p3 | - | 26.93 ms | 37.45 ms | 44.93 ms | - |
| Send Money | p1 | - | 29.18 ms | 38.03 ms | 73.11 ms | - |
| Send Money | p2 | - | 28.72 ms | 40.16 ms | 46.67 ms | - |
| Send Money | p3 | - | 26.94 ms | 35.74 ms | 53.32 ms | - |
| Payment | p1 | - | 29.65 ms | 44.02 ms | 57.34 ms | - |
| Payment | p2 | - | 29.67 ms | 40.80 ms | 45.83 ms | - |
| Payment | p3 | - | 26.83 ms | 37.15 ms | 59.36 ms | - |
| Payment | p4 | - | 24.72 ms | 31.30 ms | 37.63 ms | - |

### Thresholds

30/33 thresholds passed.
- ❌ sendmoney_success: rate>=0.99
- ❌ http_req_failed{api:sendmoney}: rate<0.01
- ❌ checks{api:sendmoney}: rate>=0.99
