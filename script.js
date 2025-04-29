import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBU8IORVQkOWiuXp1y-R18JtnaqJmQ3QF8",
  authDomain: "baocaonongnghiep.firebaseapp.com",
  databaseURL: "https://baocaonongnghiep-default-rtdb.firebaseio.com/",
  projectId: "baocaonongnghiep",
  storageBucket: "baocaonongnghiep.appspot.com",
  messagingSenderId: "441453147217",
  appId: "1:441453147217:web:236f443ae58eee4ce47470",
  measurementId: "G-QJLJ0Y4XXT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Update đồng hồ
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Chuyển trang
window.showPage = function(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
};

// Liên kết input với Firebase 2 chiều
function bindFirebase(path, elementId, isTextSpan = false, unit = '') {
  const element = document.getElementById(elementId);
  const reference = ref(db, path);
  if (!element) return;

  // Khi Firebase thay đổi -> update giao diện
  onValue(reference, snapshot => {
    const val = snapshot.val();
    if (val !== null && val !== undefined) {
      if (isTextSpan) {
        element.textContent = val;
      } else {
        element.value = val;
      }
    }
  });

  // Nếu là input -> khi user thay đổi thì đẩy Firebase
  if (!isTextSpan) {
    element.addEventListener('change', function() {
      const value = isNaN(this.value) ? this.value : Number(this.value);
      set(reference, value);
    });
  }
}

// Vật nuôi
bindFirebase('livestock/temperature', 'livestockTemp', false);
bindFirebase('livestock/temperature', 'livestockTempValue', true);
bindFirebase('livestock/bodyTemp', 'bodyTemp');
bindFirebase('livestock/chickenCount', 'chickenCount');
bindFirebase('livestock/pigCount', 'pigCount');
bindFirebase('livestock/humidity', 'livestockHumidity');
bindFirebase('livestock/foodLevel', 'foodLevel');
bindFirebase('livestock/waterLevel', 'waterLevel');

// Cây trồng
bindFirebase('crops/temperature', 'cropsTemp', false);
bindFirebase('crops/temperature', 'cropsTempValue', true);
bindFirebase('crops/humidity', 'cropsHumidity');
bindFirebase('crops/soilMoisture', 'soilMoisture');
bindFirebase('crops/pestStatus', 'pestStatus');

// Thời tiết
bindFirebase('weather/temperature', 'weatherTemp');
bindFirebase('weather/humidity', 'weatherHumidity');
bindFirebase('weather/windSpeed', 'windSpeed');
bindFirebase('weather/rainChance', 'rainChance');


// Toggle light
const toggleLight = document.getElementById('toggleLight');
toggleLight.addEventListener('click', function() {
  const refLight = ref(db, 'livestock/lightOn');
  set(refLight, this.textContent === 'Bật');
});
onValue(ref(db, 'livestock/lightOn'), snapshot => {
  toggleLight.textContent = snapshot.val() ? 'Tắt' : 'Bật';
});

// Toggle water
const toggleWater = document.getElementById('toggleWater');
toggleWater.addEventListener('click', function() {
  const refWater = ref(db, 'crops/waterOn');
  set(refWater, this.textContent === 'Bật');
});
onValue(ref(db, 'crops/waterOn'), snapshot => {
  toggleWater.textContent = snapshot.val() ? 'Tắt' : 'Bật';
});

// Tạo dữ liệu giá dao động
function generateMarketData(startPrice) {
  const data = [startPrice];
  for (let i = 1; i < 30; i++) {
    const change = (Math.random() - 0.5) * 2; // +/-1
    let newPrice = data[i - 1] + change;
    newPrice = Math.max(newPrice, 1);
    data.push(parseFloat(newPrice.toFixed(2)));
  }
  return data;
}

// Tạo biểu đồ tổng hợp
function createCombinedMarketChart() {
  const ctx = document.getElementById('combinedChart').getContext('2d');

  const chickenData = generateMarketData(95);
  const pigData = generateMarketData(110);
  const tomatoData = generateMarketData(30);
  const carrotData = generateMarketData(25);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 30}, (_, i) => `Ngày ${i + 1}`),
      datasets: [
        {
          label: 'Giá Gà',
          data: chickenData,
          borderColor: '#ff6384',
          backgroundColor: '#ff6384',
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Giá Lợn',
          data: pigData,
          borderColor: '#36a2eb',
          backgroundColor: '#36a2eb',
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Giá Cà Chua',
          data: tomatoData,
          borderColor: '#ff9f40',
          backgroundColor: '#ff9f40',
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Giá Cà Rốt',
          data: carrotData,
          borderColor: '#4bc0c0',
          backgroundColor: '#4bc0c0',
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#333', font: { weight: 'bold' } }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}k VNĐ`
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#666' }
        },
        y: {
          grid: { color: '#eee' },
          ticks: {
            color: '#666',
            callback: function(value) { return value + 'k'; }
          }
        }
      }
    }
  });
}

// Gọi hàm để vẽ biểu đồ khi trang load
createCombinedMarketChart();
