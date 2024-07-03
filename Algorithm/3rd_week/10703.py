# 유성
import sys
from collections import deque
input = sys.stdin.readline

r, s = map(int, input().split())
arr = [list(input().rstrip()) for _ in range(r)]
dir = [(-1, 0), (1, 0), (0, -1), (0, 1)]
ans = [['.'] * s for _ in range(r)]

diff = float('inf')
for j in range(s):
    ground_h = r-1
    for i in range(r-1, -1, -1):
        if arr[i][j] == '#':
            ground_h = i
        elif arr[i][j] == 'X':
            new_diff = ground_h - i -1
            if new_diff < diff:
                diff = new_diff
                star = (i, j)
            if new_diff >= diff:
                break

def bfs(sx, sy, type):
    q = deque([(sy, sx)])
    arr[sy][sx] = '*'  # 방문 표시로 변경
    if type == 'X':
        ans[sy + diff][sx] = type
    else:
        ans[sy][sx] = type
    while q:
        y, x = q.popleft()
        for dy, dx in dir:
            ny = y + dy
            nx = x + dx
            if ny < 0 or ny >= r or nx < 0 or nx >= s:
                continue
            if arr[ny][nx] == type:  # 방문 여부 체크 대신, 값 비교로 변경
                q.append((ny, nx))
                if arr[ny][nx] == '#':
                    ans[ny][nx] = '#'
                elif arr[ny][nx] == 'X':
                    ans[ny + diff][nx] = 'X'
                arr[ny][nx] = '*'  # 방문 표시로 변경

bfs(star[1], star[0], 'X')
bfs(star[1], star[0] + diff + 1, '#')

for i in range(r):
    for j in range(s):
        sys.stdout.write(ans[i][j])
    sys.stdout.write('\n')