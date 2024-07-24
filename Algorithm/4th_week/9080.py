# PC방 요금
import sys

input = sys.stdin.readline
T = int(input())

for _ in range(T):
    times, d = input().split()
    sh = int(times.split(':')[0])  # 시작 시간
    sm = int(times.split(':')[1])  # 시작 분

    pm = int(d)  # 게임하는 분

    st = sh * 60 + sm  # 시작 시간을 분으로 환산
    et = st + pm
    cost = 0

    while st < et:
        current_time = st % 1440  # 하루 기준 현재 시간
        current_day = st // 1440  # 며칠째인지 계산

        if 1320 <= current_time or current_time < 180:  # 야간 요금 시간대
            if current_time >= 1320:
                night_end = (current_day * 1440) + 1920
            else:
                night_end = (current_day * 1440) + 480

            if et - st > 240:  # 남은 시간이 4시간 이상일 경우
                cost += 5000
                if current_time >= 1320:
                    st = night_end
                else:
                    st = night_end
            else: # 야간인데, 남은 시간이 4시간 안 될 경우
                cost += 1000
                st += 60
        else:  # 주간
            cost += 1000
            st += 60

    print(cost)
