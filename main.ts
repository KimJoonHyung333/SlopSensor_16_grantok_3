// 재성모빌리티 기울기보정시스템/2025.12.31
input.onButtonPressed(Button.A, function () {
    music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone)
    텍스트사용 = 1
    pins.servoWritePin(AnalogPin.P1, 90)
    pins.servoWritePin(AnalogPin.P2, 90)
    basic.showLeds(`
        # . . . #
        . # . # .
        . . # . .
        . # . # .
        # . . . #
        `)
})
input.onButtonPressed(Button.B, function () {
    텍스트사용 = 1
    music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone)
    basic.showLeds(`
        . # # # .
        # . . . #
        # . . . #
        # . . . #
        . # # # .
        `)
    // 0.2초 표시 + 0.05초 빈화면
    basic.pause(200)
    텍스트사용 = 0
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone)
    텍스트사용 = 1
    basic.clearScreen()
    show_text_step("2025/12/31/SLOP DETECTION", 200, 50)
// 0.2초 표시 + 0.05초 빈화면
    basic.pause(100)
    텍스트사용 = 0
})
let py = 0
let px = 0
let prev_err_y = 0
let ctrl_y = 0
let prev_err_x = 0
let ctrl_x = 0
let err_y = 0
let err_x = 0
let target_y = 0
let target_x = 0
let y_raw = 0
let cur_y = 0
let cur_x = 0
let Kd = 0
let Kp = 0
let 텍스트사용 = 0
music.play(music.createSoundExpression(
WaveShape.Noise,
1,
1,
255,
0,
500,
SoundExpressionEffect.None,
InterpolationCurve.Linear
), music.PlaybackMode.UntilDone)
let x_raw: number;
let servo1_angle: number;
let servo2_angle: number;
function show_text_step(text: string, delay: number = 500, blank: number = 100) {
    for (let c of text) {
        basic.showString(c, 50)
        //  글자 표시
        basic.pause(delay)
        //  유지
        basic.clearScreen()
        //  지우기
        basic.pause(blank)
    }
}
// 빈 화면
if (텍스트사용 == 0) {
    // PID 계수
    Kp = 0.1
    // (0.3)
    Kd = 0.1
    // (0.2)
    // 현재 위치 (float로 유지)
    cur_x = 2
    cur_y = 2
    while (true) {
        if (텍스트사용 == 0) {
            // 가속도 값 읽기 (-1024 ~ +1024)
            x_raw = input.acceleration(Dimension.X)
            y_raw = input.acceleration(Dimension.Y)
            // 좌표 변환: -1024~+1024 → 0~4
            target_x = (x_raw + 256) * 6 / 512
            target_y = (y_raw + 256) * 6 / 512
            // PID 제어
            err_x = target_x - cur_x
            err_y = target_y - cur_y
            ctrl_x = Kp * err_x + Kd * (err_x - prev_err_x)
            ctrl_y = Kp * err_y + Kd * (err_y - prev_err_y)
            cur_x += ctrl_x
            cur_y += ctrl_y
            prev_err_x = err_x
            prev_err_y = err_y
            // LED 표시
            basic.clearScreen()
            px = Math.min(4, Math.max(0, Math.trunc(cur_x)))
            py = Math.min(4, Math.max(0, Math.trunc(cur_y)))
            led.plotBrightness(px, py, 255)
            // === 서보 제어 추가 ===
            // X축 → 서보1 (핀 P1)
            servo1_angle = Math.map(x_raw, -1024, 1024, 0, 180)
            pins.servoWritePin(AnalogPin.P1, servo1_angle)
            // Y축 → 서보2 (핀 P2)
            servo2_angle = Math.map(y_raw, -1024, 1024, 0, 180)
            pins.servoWritePin(AnalogPin.P2, servo2_angle)
        }
        basic.pause(5)
    }
}
