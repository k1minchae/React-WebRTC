# LCS 2
import sys
input = sys.stdin.readline
S1 = input().rstrip()
S2 = input().rstrip()
N, M = len(S1), len(S2)
dp = [[''] * (M+1) for _ in range(N+1)]

for n in range(1, N+1):
    for m in range(1, M+1):
        if S1[n-1] == S2[m-1]:
            dp[n][m] = dp[n-1][m-1] + S1[n-1]
        else:
            if len(dp[n-1][m]) >= len(dp[n][m-1]):
                dp[n][m] = dp[n-1][m]
            else:
                dp[n][m] = dp[n][m-1]
res = len(dp[-1][-1])
print(res)
if res != 0:
    print(dp[-1][-1])