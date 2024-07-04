# 상범 빌딩
import sys
from pprint import pprint
from collections import deque as dq
input = sys.stdin.readline

while True:
    l, r, c = map(int, input().split()) # 층, 행, 열
    if l == 0 and r == 0 and c == 0:
        exit(0)
    arr = []

    for _ in range(l):
        arr.append([list(input().rstrip()) for _ in range(r)])
        input()

    pprint(arr)
    def find_start():
        for k in range(l):
            for i in range(r):
                for j in range(c):
                    if arr[k][i][j] == 'S':
                        return(k, i, j)
    
    start = find_start()

    if 
