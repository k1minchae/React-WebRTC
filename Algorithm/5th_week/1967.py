# 트리의 지름
import sys
sys.setrecursionlimit(10**6)
input = sys.stdin.readline

N = int(input())
adj = [[] for _ in range(N+1)]
for _ in range(N-1):
    parent, child, cost = map(int, input().split())
    adj[parent].append((child, cost))
    adj[child].append((parent, cost))

visited = [0] * (N+1)
far_node = 0
distance = 0
def dfs(node, cost):
    global distance, far_node
    if cost > distance:
        distance = cost
        far_node = node
    for next, next_cost in adj[node]:
        if visited[next] == 0:
            visited[next] = 1
            dfs(next, cost+next_cost)
            visited[next] = 0

visited[1] = 1
dfs(1, 0)
result = distance
new_start = far_node

visited = [0] * (N+1)
far_node = 0
distance = 0
visited[new_start] = 1
dfs(new_start, 0)

print(distance)