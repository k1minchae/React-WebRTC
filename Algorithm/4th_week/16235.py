# 나무 제태크
import sys
from collections import deque
input = sys.stdin.readline

n, m, k = map(int, input().split())
winter = [list(map(int, input().split())) for _ in range(n)]
trees = [[deque() for _ in range(n)] for _ in range(n)]
ground = [[5] * n for _ in range(n)]

for _ in range(m):
    r, c, z = map(int, input().split())
    trees[r-1][c-1].append(z)

dy = (-1, 1, 0, 0, -1, -1, 1, 1)
dx = (0, 0, -1, 1, -1, 1, -1, 1)

for _ in range(k):
    # 봄과 여름
    for i in range(n):
        for j in range(n):
            if trees[i][j]:
                temp = deque()
                dead_nutrients = 0
                while trees[i][j]:
                    age = trees[i][j].popleft()
                    if ground[i][j] >= age:
                        ground[i][j] -= age
                        temp.append(age + 1)
                    else:
                        dead_nutrients += age // 2
                trees[i][j] = temp
                ground[i][j] += dead_nutrients

    # 가을
    for i in range(n):
        for j in range(n):
            if trees[i][j]:
                for tree in trees[i][j]:
                    if tree % 5 == 0:
                        for d in range(8):
                            nx = j + dx[d]
                            ny = i + dy[d]
                            if 0 <= nx < n and 0 <= ny < n:
                                trees[ny][nx].appendleft(1)

    # 겨울
    for i in range(n):
        for j in range(n):
            ground[i][j] += winter[i][j]

result = sum(len(trees[i][j]) for i in range(n) for j in range(n))
print(result)
