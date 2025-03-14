window.onload = function() {
    loadDarkMode();
};

// 🔹 TOOGLE PASSWORD 🔹
function togglePassword() {
    let passwordField = document.getElementById("generatedPassword");
    let icon = document.getElementById("togglePasswordIcon");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}



// 🔹 GENERATE PASSWORD 🔹
function generatePassword() {
    const length = document.getElementById("passwordLength").value;
    const includeUpper = document.getElementById("includeUpper").checked;
    const includeNumbers = document.getElementById("includeNumbers").checked;
    const includeSymbols = document.getElementById("includeSymbols").checked;

    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

    let characters = lower;
    if (includeUpper) characters += upper;
    if (includeNumbers) characters += numbers;
    if (includeSymbols) characters += symbols;

    let password = "";
    const cryptoArray = new Uint32Array(length);
    window.crypto.getRandomValues(cryptoArray);

    for (let i = 0; i < length; i++) {
        password += characters[cryptoArray[i] % characters.length];
    }

    document.getElementById("generatedPassword").value = password;
    checkPasswordStrength(password);
    saveToHistory(password);
}

// 🔹 SUPER SECURE PASSWORD 🔹
function generateSecurePassword() {
    let password = "";
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

    do {
        generatePassword();
        password = document.getElementById("generatedPassword").value;
    } while (!regex.test(password));

    document.getElementById("generatedPassword").value = password;
}

// 🔹 COPY PASSWORD 🔹
function copyPassword() {
    const password = document.getElementById("generatedPassword").value;
    
    navigator.clipboard.writeText(password).then(() => {
        Swal.fire("Berhasil!", "Password disalin!", "success");
    }).catch(() => {
        Swal.fire("Gagal!", "Tidak bisa menyalin password!", "error");
    });
}

function generateQRCode() {
    const password = document.getElementById("generatedPassword").value;
    if (!password) {
        Swal.fire("Error", "Harap generate password terlebih dahulu!", "error");
        return;
    }

    const qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = "";

    let qr = qrcode(0, "L");
    qr.addData(password);
    qr.make();

    const qrImg = qr.createImgTag(4);
    qrcodeContainer.innerHTML = qrImg;

    // Tambahkan tombol download jika belum ada
    if (!document.getElementById("downloadQRCode")) {
        let downloadBtn = document.createElement("button");
        downloadBtn.id = "downloadQRCode";
        downloadBtn.className = "btn btn-info mt-2 w-100";
        downloadBtn.innerHTML = "📥 Unduh QR Code";
        downloadBtn.onclick = downloadQRCode;
        qrcodeContainer.appendChild(downloadBtn);
    }
}


// 🔹 DOWNLOAD QR CODE 🔹
function downloadQRCode() {
    const qrImg = document.querySelector("#qrcode img");

    if (!qrImg) {
        Swal.fire("Error", "QR Code belum dibuat!", "error");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrImg.src;

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "qrcode.png";
        link.click();
    };
}

// 🔹 CEK KEKUATAN PASSWORD 🔹
function checkPasswordStrength(password) {
    const strength = zxcvbn(password).score;
    const strengthText = ["Lemah 🔴", "Kurang 🔴", "Cukup 🟡", "Kuat 🟢", "Sangat Kuat 🟢"];
    document.getElementById("passwordStrength").innerText = "Kekuatan: " + strengthText[strength];
}

// 🔹 RIWAYAT PASSWORD 🔹
function saveToHistory(password) {
    let history = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    history.unshift(password);
    localStorage.setItem("passwordHistory", JSON.stringify(history));
}

function showHistory() {
    let history = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    const historyList = document.getElementById("historyList");

    if (history.length === 0) {
        historyList.innerHTML = "<li class='list-group-item text-muted'>Riwayat kosong</li>";
    } else {
        historyList.innerHTML = history.map(pass => `<li class="list-group-item">${pass}</li>`).join('');
    }

    historyList.classList.remove("d-none");
}

function clearHistory() {
    localStorage.removeItem("passwordHistory");
    document.getElementById("historyList").classList.add("d-none");
}

// 🔹 UNLOCK HISTORY 🔹
function unlockHistory() {
    if (!window.PublicKeyCredential) {
        Swal.fire("Error", "Browser tidak mendukung autentikasi biometrik", "error");
        return;
    }

    navigator.credentials.get({ publicKey: { challenge: new Uint8Array(32), timeout: 60000 } })
        .then(() => {
            Swal.fire("Sukses!", "Riwayat password ditampilkan!", "success");
            showHistory();
        })
        .catch(() => Swal.fire("Gagal!", "Autentikasi biometrik gagal!", "error"));
}

// 🔹 TOGGLE DARK MODE 🔹
document.getElementById("toggleDarkMode").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
});

// 🔹 LOAD DARK MODE 🔹
function loadDarkMode() {
    if (localStorage.getItem("dark-mode") === "enabled") {
        document.body.classList.add("dark-mode");
    }
}

// 🔹 HAPUS RIWAYAT DENGAN KONFIRMASI 🔹
function clearHistory() {
    Swal.fire({
        title: "Hapus Riwayat?",
        text: "Anda yakin ingin menghapus semua riwayat password?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("passwordHistory");
            document.getElementById("historyList").classList.add("d-none");

            Swal.fire("Dihapus!", "Riwayat password telah dihapus.", "success");
        }
    });
}

// 🔹 CEK KEKUATAN PASSWORD DARI INPUT USER 🔹
function checkPasswordInput() {
    const password = document.getElementById("checkPasswordInput").value;
    const resultElement = document.getElementById("passwordCheckResult");

    if (password === "") {
        resultElement.innerText = "";
        return;
    }

    // Gunakan zxcvbn untuk analisis awal
    const analysis = zxcvbn(password);
    const score = analysis.score;

    // Analisis tambahan
    const lengthValid = password.length >= 12; // Minimal 12 karakter
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Cek apakah password hanya mengulang karakter yang sama
    const isRepeating = /^(.)(\1+)$/.test(password);

    // Cek apakah password merupakan pola umum
    const isCommon = ["password", "123456", "qwerty", "letmein", "welcome"].some(pat => password.toLowerCase().includes(pat));

    // Hitung total kategori yang dipenuhi
    const complexityScore = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

    // Logika penentuan kekuatan
    let finalScore = score;
    
    if (!lengthValid || complexityScore < 3 || isRepeating || isCommon) {
        finalScore = 0; // Jika terlalu lemah, turunkan skor jadi 0
    } else if (complexityScore === 3 && finalScore < 3) {
        finalScore = 2; // Maksimal "Cukup" jika hanya ada 3 jenis karakter
    } else if (complexityScore === 4 && finalScore < 3) {
        finalScore = 3; // Bisa "Kuat" jika memenuhi syarat minimal dan ada 4 jenis karakter
    }

    // Label kekuatan password
    const strengthText = ["Sangat Lemah 🔴", "Lemah 🔴", "Cukup 🟡", "Kuat 🟢", "Sangat Kuat 🟢"];
    resultElement.innerText = `Kekuatan: ${strengthText[finalScore]}`;
}

function generateBarcode() {
    let password = document.getElementById("generatedPassword").value;
    if (!password) {
        Swal.fire("Error", "Harap generate password terlebih dahulu!", "error");
        return;
    }

    // Buat barcode
    let barcodeDiv = document.getElementById("barcode");
    barcodeDiv.innerHTML = `<svg id="barcodeSvg"></svg>`;
    JsBarcode("#barcodeSvg", password, { format: "CODE128", displayValue: false });

    // Tambahkan tombol unduh jika belum ada
    if (!document.getElementById("downloadBarcode")) {
        let downloadBtn = document.createElement("button");
        downloadBtn.id = "downloadBarcode";
        downloadBtn.className = "btn btn-info mt-2 w-100";
        downloadBtn.innerHTML = "📥 Unduh Barcode";
        downloadBtn.onclick = downloadBarcode;
        barcodeDiv.appendChild(downloadBtn);
    }
}

function downloadBarcode() {
    let svg = document.getElementById("barcodeSvg");
    let serializer = new XMLSerializer();
    let svgBlob = new Blob([serializer.serializeToString(svg)], { type: "image/svg+xml" });
    let url = URL.createObjectURL(svgBlob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "barcode.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
