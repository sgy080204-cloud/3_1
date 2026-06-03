// ==========================================
// 0. 새로운 구글 Firebase 프로젝트(study-manager2) 설정
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDRA0-DGtm1FnoKpKwGQ5p8xMVeil1b2qg",
    authDomain: "study-manager2.firebaseapp.com",
    databaseURL: "https://study-manager2-default-rtdb.firebaseio.com",
    projectId: "study-manager2",
    storageBucket: "study-manager2.firebasestorage.app",
    messagingSenderId: "568494942596",
    appId: "1:568494942596:web:53222c11cfe7b6f3c395d1",
    measurementId: "G-Z1YWS6TTM7"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ==========================================
// 1. 실시간 날짜 및 시계 기능
// ==========================================
function updateClock() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateString = now.toLocaleDateString('ko-KR', options);
    const timeString = now.toLocaleTimeString('ko-KR', { hour12: false });

    const dateDisplay = document.getElementById('date-display');
    const timeDisplay = document.getElementById('time-display');
    
    if (dateDisplay) dateDisplay.innerText = dateString;
    if (timeDisplay) timeDisplay.innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// 2. 불참 체크박스 제어
// ==========================================
const absenceCheck = document.getElementById('absence-check');
const reasonContainer = document.getElementById('reason-container');

if (absenceCheck && reasonContainer) {
    absenceCheck.addEventListener('change', function() {
        if (this.checked) {
            reasonContainer.classList.remove('hidden');
        } else {
            reasonContainer.classList.add('hidden');
            document.getElementById('absence-reason').value = '';
        }
    });
}

// ==========================================
// 3. 상태 제출 및 고유 열쇠(Push Key) 발급 (덮어쓰기 완전 해결)
// ==========================================
const submitAuthBtn = document.getElementById('submit-auth-btn');
const authMessage = document.getElementById('auth-message');
const authSection = document.getElementById('auth-section');
const studySection = document.getElementById('study-section');
const welcomeUser = document.getElementById('welcome-user');

if (submitAuthBtn) {
    submitAuthBtn.addEventListener('click', function() {
        const studentId = document.getElementById('student-id').value.trim();
        const studentName = document.getElementById('student-name').value.trim();
        const isAbsent = absenceCheck.checked;
        const reason = document.getElementById('absence-reason').value.trim();
        const session = document.querySelector('input[name="session"]:checked').value;
        const currentTime = document.getElementById('time-display').innerText;

        if (!studentId || !studentName) {
            authMessage.style.color = "#fa3e3e";
            authMessage.innerText = "⚠️ 학번과 이름을 모두 입력해 주세요.";
            return;
        }

        if (isAbsent && !reason) {
            authMessage.style.color = "#fa3e3e";
            authMessage.innerText = "⚠️ 불참 사유를 구체적으로 입력해 주세요.";
            return;
        }

        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 🔥 덮어쓰기 방지 핵심: push()를 사용하여 각 제출마다 고유 ID 생성
        const newRecordRef = database.ref('students/' + dateKey).push();
        const uniqueKey = newRecordRef.key; 

        const studentStatus = {
            uniqueKey: uniqueKey, 
            date: dateKey,
            id: studentId,
            name: studentName,
            session: session,
            isAbsent: isAbsent,
            reason: isAbsent ? reason : "-",
            authTime: currentTime,
            studyTime: "00:00:00"
        };

        newRecordRef.set(studentStatus)
        .then(() => {
            // 타이머 스크립트가 추적할 수 있도록 로컬 스토리지에 고유 정보 보관
            localStorage.setItem('currentStudentSession', JSON.stringify({ date: dateKey, uniqueKey: uniqueKey }));

            if (isAbsent) {
                authMessage.style.color = "#f5b100";
                authMessage.innerText = `✏️ 불참 및 사유 처리가 완료되었습니다.`;
                setTimeout(() => location.reload(), 1500);
            } else {
                if (authSection && studySection && welcomeUser) {
                    welcomeUser.innerText = studentName;
                    authSection.classList.add('hidden');
                    studySection.classList.remove('hidden');
                }
            }
        })
        .catch((error) => {
            authMessage.style.color = "#fa3e3e";
            authMessage.innerText = "⚠️ 전송 실패. 규칙 설정을 확인하세요.";
            console.error(error);
        });
    });
}

