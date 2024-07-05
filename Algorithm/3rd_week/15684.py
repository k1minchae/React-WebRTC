# 사다리 조작
import sys
from itertools import combinations as cb
input = sys.stdin.readline
n, m, h = map(int, input().split())

# 가로선이 없는 경우
if m == 0:
    print(0)
    exit(0)

arr = [[0] * n for _ in range(h)]
for _ in range(m):
    a, b = map(int, input().split())
    arr[a-1][b-1] = 1

available = []
for i in range(h):
    for j in range(n-1):
        if not arr[i][j]:
            available.append((i, j))

def go_ladder():
    for i in range(n):
        now = i
        for j in range(h):
            if arr[j][now]:
                now += 1
            elif now-1 >= 0 and arr[j][now-1]:
                now -= 1
        if now != i:
            return False
    return True

if go_ladder():
    print(0)
else:
    for k in range(1, 4):
        all_cases = list(cb(available, k))
        for case in all_cases:
            is_break = False
            for y, x in case:
                # 이미 설치된 곳에 또 설치하려 할 경우
                if arr[y][x]:
                    is_break = True
                    break
                # 왼쪽에 설치되어 연속으로 설치할 수 없는 경우
                elif x-1 >= 0 and arr[y][x-1]:
                    is_break = True
                    break
                # 오른쪽에 설치되어 연속으로 설치 X
                elif x+1 < n and arr[y][x+1]:
                    is_break = True
                    break
            if is_break:
                continue

            # 사다리를 전부 설치할 수 있는 경우
            for y, x in case:
                arr[y][x] = 1
                
            if go_ladder():
                print(k)
                exit(0)
            else:
                for y, x in case:
                    arr[y][x] = 0
    print(-1)