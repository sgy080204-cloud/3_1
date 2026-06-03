// ==========================================
// 0. 새로운 구글 Firebase 프로젝트 설정 동기화
// ==========================================
const firebaseConfigForUpload = {
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
    firebase.initializeApp(firebaseConfigForUpload);
}
const databaseForUpload = firebase.database();

const photoFileInput = document.getElementById('photo-file');
const photoPreview = document.getElementById('photo-preview');
const previewContainer = document.getElementById('preview-container');
const submitPhotoBtn = document.getElementById('submit-photo-btn');
const uploadMessage = document.getElementById('upload-message');

// 사진 선택 시 미리보기 처리
if (photoFileInput && photoPreview && previewContainer) {
    photoFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                uploadMessage.style.color = "#fa3e3e";
                uploadMessage.innerText = "⚠️ 이미지 파일만 업로드할 수 있습니다.";
                photoFileInput.value = '';
                previewContainer.classList.add('hidden');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
                uploadMessage.innerText = "";
            };
            reader.readAsDataURL(file);
        }
    });
}

// 사진 인증 완료 버튼 클릭 이벤트
if (submitPhotoBtn) {
    submitPhotoBtn.addEventListener('click', function() {
        if (!photoFileInput.files || photoFileInput.files.length === 0) {
            uploadMessage.style.color = "#fa3e3e";
            uploadMessage.innerText = "⚠️ 먼저 인증할 사진을 선택해 주세요!";
            return;
        }

        // 브라우저에서 현재 연동된 학생 세션 키 역추적
        const sessionData = JSON.parse(localStorage.getItem('currentStudentSession'));

        if (sessionData && sessionData.date && sessionData.uniqueKey) {
            const now = new Date();
            const logTime = now.toLocaleTimeString('ko-KR', { hour12: false });
            
            // 고유 식별자 서랍 내부에 사진 인증 기록 반영
            databaseForUpload.ref('students/' + sessionData.date + '/' + sessionData.uniqueKey).update({
                isPhotoVerified: `✅ 완료 (${logTime})`
            })
            .then(() => {
                uploadMessage.style.color = "#00a400";
                uploadMessage.innerText = "🎉 사진 인증 성공 기록이 서버에 반영되었습니다!";
                submitPhotoBtn.disabled = true;
                photoFileInput.disabled = true;
            })
            .catch((error) => {
                uploadMessage.style.color = "#fa3e3e";
                uploadMessage.innerText = "⚠️ 사진 인증 실패. 규칙 설정이나 네트워크를 확인하세요.";
                console.error(error);
            });
        } else {
            uploadMessage.style.color = "#fa3e3e";
            uploadMessage.innerText = "⚠️ 학생 인증 정보가 올바르지 않습니다. 다시 로그인해 주세요.";
        }
    });
}

