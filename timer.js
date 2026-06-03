let timerId = null;
let totalSeconds = 0;
let isRunning = false;

const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerPauseBtn = document.getElementById('timer-pause-btn');
const timerStopBtn = document.getElementById('timer-stop-btn');
const timerMessage = document.getElementById('timer-message');

function formatTimer(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

if (timerStartBtn) {
    timerStartBtn.addEventListener('click', function() {
        if (isRunning) return;
        isRunning = true;
        timerMessage.style.color = "#00a400";
        timerMessage.innerText = "🔥 집중해서 열공 중인 시간입니다!";
        timerStartBtn.disabled = true;
        timerPauseBtn.disabled = false;
        timerStopBtn.disabled = false;

        timerId = setInterval(function() {
            totalSeconds++;
            timerDisplay.innerText = formatTimer(totalSeconds);
        }, 1000);
    });
}

if (timerPauseBtn) {
    timerPauseBtn.addEventListener('click', function() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerId);
        timerMessage.style.color = "#f5b100";
        timerMessage.innerText = "⏸️ 잠시 숨을 고르는 중입니다.";
        timerStartBtn.disabled = false;
        timerPauseBtn.disabled = true;
    });
}

if (timerStopBtn) {
    timerStopBtn.addEventListener('click', function() {
        const confirmStop = confirm("오늘 자습을 정말 종료하시겠습니까? 학습 시간이 최종 저장됩니다.");
        
        if (confirmStop) {
            isRunning = false;
            clearInterval(timerId);

            const finalTimeText = timerDisplay.innerText;
            timerMessage.style.color = "#333333";
            timerMessage.innerText = `🏁 오늘 총 학습 시간 [ ${finalTimeText} ] 기록 완료!`;

            // 🔥 발급받은 고유 키를 추적해 정확한 내 서랍 칸에 시간 업데이트
            const sessionData = JSON.parse(localStorage.getItem('currentStudentSession'));

            if (sessionData && sessionData.date && sessionData.uniqueKey) {
                firebase.database().ref('students/' + sessionData.date + '/' + sessionData.uniqueKey).update({
                    studyTime: finalTimeText
                })
                .then(() => {
                    alert("학습 시간이 성공적으로 저장되었습니다!");
                    location.reload();
                })
                .catch((err) => {
                    alert("시간 저장 오류 발생. 네트워크를 확인하세요.");
                    console.error(err);
                });
            }
        }
    });
}

