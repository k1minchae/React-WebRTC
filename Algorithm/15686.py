# 치킨 배달
import sys
from itertools import combinations as cb
input = sys.stdin.readline

n, m = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(n)]

stores = []
houses = []
for i in range(n):
    for j in range(n):
        if arr[i][j] == 2: # 치킨집
            stores.append((i, j))
        elif arr[i][j] == 1: # 집
            houses.append((i, j))

all_cases = list(cb(stores, m))

result = float('inf')
for case in all_cases:
    all_dist = 0
    for house in houses:
        dist = float('inf')
        for store in case:
            dist = min(abs(house[0] - store[0]) + abs(house[1] - store[1]), dist)
        all_dist += dist
    result = min(result, all_dist)

print(result)