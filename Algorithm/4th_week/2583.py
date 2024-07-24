# 영역 구하기
import sys
sys.setrecursionlimit(10000)
input = sys.stdin.readline

M, N, K = map(int, input().split())
arr = [[0] * M for _ in range(N)]
for _ in range(K):
    y1, x1, y2, x2 = map(int, input().split())
    for i in range(y1, y2):
        for j in range(x1, x2):
            arr[i][j] = 1

dx = (0, 0, -1, 1)
dy = (-1, 1, 0, 0)

def dfs(y, x):
    arr[y][x] = 1
    size = 1
    for i in range(4):
        ny, nx = y + dy[i], x + dx[i]
        if 0 <= ny < N and 0 <= nx < M and arr[ny][nx] == 0:
            size += dfs(ny, nx)
    return size

areas = []
for i in range(N):
    for j in range(M):
        if arr[i][j] == 0:
            area_size = dfs(i, j)
            areas.append(area_size)

areas.sort()
print(len(areas))
print(*sorted(areas))