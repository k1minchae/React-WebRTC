# 두 수의 합
import sys
input = sys.stdin.readline
t = int(input())
for _ in range(t):
    N, K = map(int, input().split())
    arr = list(map(int, input().split()))

    arr.sort()
    start = 0 
    end = N - 1

    val = float('inf')
    result = 0
    while start < end:
        now = arr[start] + arr[end] - K
        if abs(now) < val:
            val = abs(now)
            result = 1
        elif abs(now) == val:
            result += 1
        if now >= 0:
            end -= 1
        elif now < 0:
            start += 1
    print(result)