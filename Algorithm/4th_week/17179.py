import sys
input = sys.stdin.readline
N, M, L = map(int, input().split())
arr = [int(input()) for _ in range(M)] + [L]
for _ in range(N):
    Q = int(input()) # 자르는 횟수
    start = 0
    end = L
    ans = 0
    while start <= end:
        mid = (start + end) // 2
        cnt = 0
        prev = 0
        for i in range(M+1):
            diff = arr[i] - prev
            if diff >= mid: # mid 길이로 자를 수 있다면
                cnt += 1 # 덩어리 수
                prev = arr[i] # 자른 지점 표시
        if cnt > Q:
            start = mid + 1
            ans = max(mid, ans)
        else:
            end = mid - 1
    print(ans)

'''
- 이진탐색으로 범위 내의 모든 길이를 탐색한다.
- 해당 길이 이상으로 자를 수 있는지 확인한다.
- 자를 수 있다면 몇개의 덩어리가 되는지 arr 순회를 통해 확인한다.
- Q번 자르면 덩어리가 Q+1개가 생겨야 하므로 cnt 가 Q보다 클 때 ans 를 갱신한다.
- arr 의 맨 마지막에 L 을 추가했으므로 arr 에 마지막 원소로 L을추가한다.
'''