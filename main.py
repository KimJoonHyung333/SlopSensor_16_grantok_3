# 100ms 동안 빈 화면 유지
def on_button_pressed_a():
    pass
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_button_pressed_b():
    pass
input.on_button_pressed(Button.B, on_button_pressed_b)

def on_logo_pressed():
    global 텍스트사용
    텍스트사용 = 1
    if 텍스트사용 == 1:
        basic.clear_screen()
        show_text_step("2025/8/18/SLOP DETECTION", 200, 50)
        # 0.2초 표시 + 0.05초 빈화면
        basic.pause(100)
        텍스트사용 = 0
input.on_logo_event(TouchButtonEvent.PRESSED, on_logo_pressed)

py = 0
px = 0
prev_err_y = 0
ctrl_y = 0
prev_err_x = 0
ctrl_x = 0
err_y = 0
err_x = 0
target_y = 0
target_x = 0
y_raw = 0
cur_y = 0
cur_x = 0
Kd = 0
Kp = 0
텍스트사용 = 0

def show_text_step(text: str, delay: number = 500, blank: number = 100):
    for c in text:
        basic.show_string(c, 50)   # 글자 표시
        basic.pause(delay)         # 유지
        basic.clear_screen()       # 지우기
        basic.pause(blank)         # 빈 화면

if 텍스트사용 == 0:
    # PID 계수
    Kp = 0.1  # (0.3)
    Kd = 0.1  # (0.2)

    # 현재 위치 (float로 유지)
    cur_x = 2
    cur_y = 2

    while True:
        if 텍스트사용 == 0:
            # 가속도 값 읽기 (-1024 ~ +1024)
            x_raw = input.acceleration(Dimension.X)
            y_raw = input.acceleration(Dimension.Y)

            # 좌표 변환: -1024~+1024 → 0~4
            target_x = (x_raw + 256) * 6 / 512
            target_y = (y_raw + 256) * 6 / 512

            # PID 제어
            err_x = target_x - cur_x
            err_y = target_y - cur_y
            ctrl_x = Kp * err_x + Kd * (err_x - prev_err_x)
            ctrl_y = Kp * err_y + Kd * (err_y - prev_err_y)
            cur_x += ctrl_x
            cur_y += ctrl_y
            prev_err_x = err_x
            prev_err_y = err_y

            # LED 표시
            basic.clear_screen()
            px = min(4, max(0, int(cur_x)))
            py = min(4, max(0, int(cur_y)))
            led.plot_brightness(px, py, 255)

            # === 서보 제어 추가 ===
            # X축 → 서보1 (핀 P1)
            servo1_angle = Math.map(x_raw, -1024, 1024, 0, 180)
            pins.servo_write_pin(AnalogPin.P1, servo1_angle)

            # Y축 → 서보2 (핀 P2)
            servo2_angle = Math.map(y_raw, -1024, 1024, 0, 180)
            pins.servo_write_pin(AnalogPin.P2, servo2_angle)

        basic.pause(5)
