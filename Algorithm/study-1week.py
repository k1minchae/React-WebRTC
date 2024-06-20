"""
# 퇴사 14501
import sys
input = sys.stdin.readline
n = int(input())
arr = [tuple(map(int, input().split())) for _ in range(n)]
dp = [0] * (n+1)

for i in range(n):
    t, p = arr[i]
    if i+t <= n:
        # 해당 일에 상담을 하는경우
        dp[i+t] = max(dp[i+t], dp[i] + p)
    # 상담 안 하는 경우
    dp[i+1] = max(dp[i+1], dp[i])
print(dp[-1])

# 연구소 14502
import sys
from itertools import combinations
from collections import deque
input = sys.stdin.readline
N, M = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(N)]
# 바이러스 : 2, 벽: 1, 빈칸: 0

zero = []   # (y, x)
virus = []
visited = [[0] * M for _ in range(N)]
for i in range(N):
    for j in range(M):
        if not arr[i][j]:   # 빈칸
            zero.append((i, j))
        if arr[i][j] == 2:  # 바이러스
            virus.append((i, j))
            visited[i][j] = 1
        if arr[i][j] == 1:
            visited[i][j] = 1

# 벽을 세울 수 있는 모든 경우의 수
wall_cases = list(combinations(zero, 3))

dir = [(-1, 0), (1, 0), (0, -1), (0, 1)] # 상하좌우

def BFS(case, used):
    used = [row[:] for row in used]
    q = deque(virus)
    for cy, cx in case:  # 벽 세우기
        used[cy][cx] = 1
    while q:
        y, x = q.popleft()
        for dy, dx in dir:
            ny = y + dy
            nx = x + dx
            if 0 <= ny < N and 0 <= nx < M and not used[ny][nx]:
                q.append((ny, nx))
                used[ny][nx] = 1
    cnt = 0
    for i in range(N):
        for j in range(M):
            if not used[i][j]:  
                cnt += 1
    return cnt

result = 0
for case in wall_cases:
    result = max(BFS(case, visited), result)
print(result)


# 연산자 끼워넣기 14888
import sys
input = sys.stdin.readline
N = int(input())
arr = list(map(int, input().split()))
operator = list(map(int, input().split()))  # 연산자

min_v = float('inf')
max_v = float('-inf')

def backtracking(idx=0, num = arr[0]):
    global min_v, max_v
    if idx == N-1:
        if num < min_v:
            min_v = num
        if num > max_v:
            max_v = num
        return
    for k in range(4):
        if operator[k] > 0:
            operator[k] -= 1
            if k % 4 == 0: # 덧셈
                backtracking(idx+1, num+arr[idx+1])
            elif k % 4 == 1: # 뺄셈
                backtracking(idx+1, num - arr[idx+1])
            elif k % 4 == 2: # 곱셈
                backtracking(idx+1, num * arr[idx+1])
            else: # 나눗셈
                if num < 0:
                    backtracking(idx+1, -(-num // arr[idx+1]))
                else:
                    backtracking(idx+1, num // arr[idx+1])
            operator[k] += 1
backtracking(0)
print(max_v)
print(min_v)


# 테트로미노 14500 : 40분 (정답)
import sys
input = sys.stdin.readline
n, m = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(n)]
tetrominoes = [
    [(0, 1), (0, 2), (0, 3)], # ㅡ
    [(1, 0), (2, 0), (3, 0)], # ㅣ
    [(0, 1), (1, 0), (1, 1)], # ㅁ
    [(1, 0), (2, 0), (2, 1)], # ㄴ
    [(1, 0), (2, 0), (2, -1)], # ㄴ (2)
    [(0, 1), (0, 2), (-1, 2)], # 긴 ㄴ
    [(1, 0), (1, 1), (1, 2)], # 긴 ㄴ(2)
    [(0, 1), (1, 1), (2, 1)], # ㄱ
    [(0, 1), (1, 0), (2, 0)], # ㄱ (2)
    [(1, 0), (0, 1), (0, 2)], # 긴 ㄱ
    [(0, 1), (0, 2), (1, 2)], # 긴 ㄱ(2)
    [(1, 0), (1, 1), (2, 1)], # 초록색 
    [(1, 0), (1, -1), (2, -1)], # 초록색
    [(0, 1), (1, 1), (1, 2)], # 초록색
    [(0, -1), (1, -1), (1, -2)], # 초록색
    [(1, -1), (1, 0), (1, 1)], # ㅗ
    [(-1, -1), (-1, 0), (-1, 1)], # ㅜ
    [(1, 0), (2, 0), (1, 1)], # ㅏ
    [(1, 0), (1, -1), (2, 0)] # ㅓ
]

def check(y, x, type):
    val = arr[y][x]
    for dy, dx in tetrominoes[type]:
        ny = y + dy
        nx = x + dx
        if ny < 0 or ny >= n or nx < 0 or nx >= m:
            return 0
        val += arr[ny][nx]
    return val

result = 0
for i in range(n):
    for j in range(m):
        for type in range(len(tetrominoes)):
            result = max(check(i, j, type), result)
print(result)


# 로봇 청소기 14503 : 33분
import sys
input = sys.stdin.readline
n, m = map(int, input().split())
r, c, d = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(n)]
dir = [(-1, 0), (0, 1), (1, 0), (0, -1)] # 상 동 하 서

result = 0
def clean(y, x, cd):
    global result
    if not arr[y][x]:
        result += 1
        arr[y][x] = 2 # 청소 완료 표시
    for d in range(1, 5):
        d = d * 3
        ny = dir[(cd+d) % 4][0] + y
        nx = dir[(cd+d) % 4][1] + x
        if not arr[ny][nx]:
            clean(ny, nx, cd+d)
            return
    # 후진
    ny = y -dir[cd % 4][0]
    nx = x -dir[cd % 4][1]
    if arr[ny][nx] != 1:
        clean(ny, nx, cd)
    
clean(r, c, d)
print(result)
"""

# 테트로미노
    # 1. 하드코딩 하지 말고 dfs 를 통해 구현하자.
        # ㅗ 모양을 dfs 를 통해 구현하는법 
        # -> count 가 2일 때 다음 좌표에 방문처리 해버리고 값만 더해서 다시 원래좌표에서 dfs를 돌려준다.
    # 2. 가지치기 추가로 하는법 : 전체 arr 에서 미리 최대 점수를 구해놓자
        # 아무리 최대점수로 다 얻어도 갱신 못하는 경우를 return 해주면 됨!

# 연산자 끼워넣기
    # 1. python 의 몫 연산자는 음수일 때와 양수일 때 값이 달라질 수 있다.
        # int(val1 / val2) 로 계산하자.
