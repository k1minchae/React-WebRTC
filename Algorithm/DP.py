# 퇴사 2 : 15486
import sys
input = sys.stdin.readline
n = int(input())
arr = [tuple(map(int, input().split())) for _ in range(n)]
dp = [0] * (n + 1)

for i in range(n):
    t, p = arr[i]
    if i + t <= n:
        dp[i + t] = max(dp[i + t], dp[i] + p)
    dp[i + 1] = max(dp[i + 1], dp[i])

print(dp[n])