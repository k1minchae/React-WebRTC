# 강의실
import sys
from heapq import heappop, heappush
input = sys.stdin.readline
N = int(input())
arr = [tuple(map(int, input().split())) for _ in range(N)]
arr.sort(key=lambda x: x[1])  # 시작 시간을 기준으로 정렬

q = []

for lecture, start, end in arr:
    if q:
        x = heappop(q)
        if x > start:
            heappush(q, x)
        heappush(q, end)
    else:
        heappush(q, end)

# 힙의 크기가 필요한 강의실의 최소 개수
print(len(q))
