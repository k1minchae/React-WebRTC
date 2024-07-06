# 행복 유치원
import sys
input = sys.stdin.readline
N, K = map(int, input().split())
arr = list(map(int, input().split()))

if K == N:
    print(0)
else:
    if K == 1:
        print(arr[-1] - arr[0])
    else:
        temp = [0] * N
        for i in range(1, N):
            temp[i] = arr[i] - arr[i-1]
        temp.sort(reverse=True)
        # print(temp)
        print(sum(temp[K-1:]))