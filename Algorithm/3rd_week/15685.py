# 드래곤 커브
import sys
input = sys.stdin.readline
n = int(input())

all_points = [] # 드래곤 커브의 모든 점
dir = [(0, 1), (-1, 0), (0, -1), (1, 0)] # 우상좌하

def dragon_curve(x, y, d, end):
    all_points.append((x, y))

    g = 0
    temp = [d]
    ex = dir[d][1] + x
    ey = dir[d][0] + y
    all_points.append((ex, ey))

    while g < end:
        for i in range(len(temp)-1, -1, -1):
            ey += dir[(temp[i] + 1)% 4][0] 
            ex += dir[(temp[i] + 1)% 4][1] 
            temp.append(temp[i] + 1)
            all_points.append((ex, ey))

        g += 1

for _ in range(n):
    x, y, d, g = map(int, input().split())
    dragon_curve(x, y, d, g)

arr = [[0] * 101 for _ in range(101)]
for point in set(all_points):
    x, y = point
    arr[y][x] = 1

result = 0
for i in range(100):
    for j in range(100):
        if arr[i][j] and arr[i+1][j] and arr[i][j+1] and arr[i+1][j+1]:
            result += 1
print(result)