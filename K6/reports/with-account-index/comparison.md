Test duration: 120.1 s

### Per-API comparison

| API | Requests | Throughput | Avg | Median | p(90) | p(95) | Max | Failure rate | Check pass rate |
|---|---|---|---|---|---|---|---|---|---|
| Deposit | 90 | 0.75 req/s | 21.38 ms | 17.14 ms | 34.15 ms | 39.34 ms ✅ | 45.91 ms | 0.00% ✅ | 100.00% ✅ |
| Send Money | 90 | 0.75 req/s | 25.66 ms | 22.02 ms | 38.59 ms | 40.73 ms ✅ | 47.98 ms | 0.00% ✅ | 100.00% ✅ |
| Payment | 206 | 1.71 req/s | 30.99 ms | 32.00 ms | 43.88 ms | 47.98 ms ✅ | 52.15 ms | 0.00% ✅ | 100.00% ✅ |
| **All transactions** | 386 | 3.21 req/s | 27.51 ms | 26.11 ms | 41.95 ms | 44.41 ms | 52.15 ms | 0.00% | 100.00% |

### Per-window (workload change)

| Window | Requests | Throughput | Avg | p(95) | Max | Failure rate |
|---|---|---|---|---|---|---|
| 0–30s (2 flows) | 60 | 2.00 req/s | 30.63 ms | 43.84 ms | 48.19 ms | 0.00% |
| 30–60s (3 flows) | 90 | 3.00 req/s | 27.04 ms | 41.64 ms | 47.98 ms | 0.00% |
| 60–90s (4 flows) | 120 | 4.00 req/s | 19.09 ms | 37.06 ms | 43.04 ms | 0.00% |
| 90–120s (4 payment flows) | 116 | 3.87 req/s | 34.95 ms | 50.14 ms | 52.15 ms | 0.00% |

### Per-API per-window

| API | Window | Requests | Avg | p(95) | Max | Failure rate |
|---|---|---|---|---|---|---|
| Deposit | p2 | 30 | 26.42 ms | 37.66 ms | 45.91 ms | 0.00% |
| Deposit | p3 | 60 | 18.86 ms | 39.61 ms | 43.04 ms | 0.00% |
| Send Money | p1 | 30 | 30.27 ms | 42.65 ms | 46.13 ms | 0.00% |
| Send Money | p2 | 30 | 27.57 ms | 41.33 ms | 47.98 ms | 0.00% |
| Send Money | p3 | 30 | 19.14 ms | 30.60 ms | 38.56 ms | 0.00% |
| Payment | p1 | 30 | 30.99 ms | 44.30 ms | 48.19 ms | 0.00% |
| Payment | p2 | 30 | 27.15 ms | 42.52 ms | 47.35 ms | 0.00% |
| Payment | p3 | 30 | 19.51 ms | 28.37 ms | 41.24 ms | 0.00% |
| Payment | p4 | 116 | 34.95 ms | 50.14 ms | 52.15 ms | 0.00% |

### Thresholds

59/59 thresholds passed.
