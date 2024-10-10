import Chart from 'chart.js/auto';

// Global variables
let isTracking = false;
let isDataTransmitting = false;
let dataFrequency = 1;
let simulationInterval;

// Initialize charts
const coordinateChart = new Chart(document.getElementById('coordinate-chart'), {
    type: 'scatter',
    data: {
        datasets: [{
            label: '坐标点',
            data: [],
            backgroundColor: 'red'
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                min: -100,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                grid: {
                    color: (context) => context.tick.value === 0 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
                }
            },
            y: {
                type: 'linear',
                position: 'left',
                min: -100,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                grid: {
                    color: (context) => context.tick.value === 0 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false
    }
});

const rcsChart = new Chart(document.getElementById('rcs-chart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'RCS',
            data: [],
            borderColor: 'blue',
            pointStyle: 'triangle',
            pointRadius: 6
        }]
    },
    options: {
        maintainAspectRatio: false
    }
});

const speedDistanceChart = new Chart(document.getElementById('speed-distance-chart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: '速度',
                data: [],
                borderColor: 'green',
                yAxisID: 'y-speed'
            },
            {
                label: '距离',
                data: [],
                borderColor: 'orange',
                yAxisID: 'y-distance'
            }
        ]
    },
    options: {
        scales: {
            'y-speed': {
                type: 'linear',
                position: 'left',
                min: 0,
                max: 2.00,
                title: {
                    display: true,
                    text: '速度 (m/s)'
                }
            },
            'y-distance': {
                type: 'linear',
                position: 'right',
                min: 0,
                max: 60,
                title: {
                    display: true,
                    text: '距离 (m)'
                }
            }
        },
        maintainAspectRatio: false
    }
});

// 串口数据处理模块
const SerialDataProcessor = {
    // 解析串口数据
    parseSerialData: function(rawData) {
        // TODO: 实现实际的数据解析逻辑
        // 这里应该根据实际的串口数据格式进行解析
        // 返回一个包含解析后数据的对象
        console.log('Received raw serial data:', rawData);
        
        // 示例：假设数据格式为 "longitude,latitude,rcs,speed,distance"
        const [longitude, latitude, rcs, speed, distance] = rawData.split(',').map(Number);
        
        return {
            longitude: longitude.toFixed(4),
            latitude: latitude.toFixed(4),
            rcs,
            speed,
            distance
        };
    },

    // 处理解析后的数据
    processData: function(parsedData) {
        // 使用解析后的数据更新图表和显示
        updateCharts(parsedData);
    }
};

// 模拟接收串口数据
function simulateSerialDataReceive() {
    // 这里模拟接收到的原始串口数据
    const rawData = `${(Math.random() * 200 - 100).toFixed(4)},${(Math.random() * 200 - 100).toFixed(4)},${Math.random() * 10},${Math.random() * 2},${Math.random() * 60}`;
    
    // 解析数据
    const parsedData = SerialDataProcessor.parseSerialData(rawData);
    
    // 处理解析后的数据
    SerialDataProcessor.processData(parsedData);
}

function updateCharts(data) {
    // 更新坐标图
    coordinateChart.data.datasets[0].data.push({ x: parseFloat(data.longitude), y: parseFloat(data.latitude) });
    coordinateChart.update();

    // 更新RCS图
    rcsChart.data.labels.push(new Date().toLocaleTimeString());
    rcsChart.data.datasets[0].data.push(data.rcs);
    if (rcsChart.data.labels.length > 20) {
        rcsChart.data.labels.shift();
        rcsChart.data.datasets[0].data.shift();
    }
    rcsChart.update();

    // 更新速度和距离图
    speedDistanceChart.data.labels.push(new Date().toLocaleTimeString());
    speedDistanceChart.data.datasets[0].data.push(data.speed);
    speedDistanceChart.data.datasets[1].data.push(data.distance);
    if (speedDistanceChart.data.labels.length > 20) {
        speedDistanceChart.data.labels.shift();
        speedDistanceChart.data.datasets[0].data.shift();
        speedDistanceChart.data.datasets[1].data.shift();
    }
    speedDistanceChart.update();

    // 更新经纬度显示
    document.getElementById('longitude-value').textContent = data.longitude;
    document.getElementById('latitude-value').textContent = data.latitude;
}

// Event listeners
document.getElementById('toggle-tracking').addEventListener('click', () => {
    isTracking = !isTracking;
    document.getElementById('toggle-tracking').textContent = isTracking ? '停止循迹' : '启动循迹';
    document.getElementById('positioning-status').style.backgroundColor = isTracking ? 'green' : 'red';
});

document.getElementById('toggle-data').addEventListener('click', () => {
    isDataTransmitting = !isDataTransmitting;
    document.getElementById('toggle-data').textContent = isDataTransmitting ? '停止数据传输' : '开启数据传输';
    document.getElementById('radar-status').style.backgroundColor = isDataTransmitting ? 'green' : 'red';

    if (isDataTransmitting) {
        simulationInterval = setInterval(() => {
            if (isTracking) {
                simulateSerialDataReceive();
            }
        }, 1000 / dataFrequency);
    } else {
        clearInterval(simulationInterval);
    }
});

document.getElementById('clear-data').addEventListener('click', () => {
    coordinateChart.data.datasets[0].data = [];
    rcsChart.data.labels = [];
    rcsChart.data.datasets[0].data = [];
    speedDistanceChart.data.labels = [];
    speedDistanceChart.data.datasets[0].data = [];
    speedDistanceChart.data.datasets[1].data = [];
    coordinateChart.update();
    rcsChart.update();
    speedDistanceChart.update();
    document.getElementById('longitude-value').textContent = '0.0000';
    document.getElementById('latitude-value').textContent = '0.0000';
});

document.getElementById('set-frequency').addEventListener('click', () => {
    const newFrequency = parseInt(document.getElementById('data-frequency').value);
    if (newFrequency >= 1 && newFrequency <= 5) {
        dataFrequency = newFrequency;
        if (isDataTransmitting) {
            clearInterval(simulationInterval);
            simulationInterval = setInterval(() => {
                if (isTracking) {
                    simulateSerialDataReceive();
                }
            }, 1000 / dataFrequency);
        }
    } else {
        alert('请输入1到5之间的整数');
    }
});

// 锁定和解锁功能
const lockOverlay = document.getElementById('lock-overlay');
const lockButton = document.getElementById('lock-button');
const unlockButton = document.getElementById('unlock-button');
const unlockPassword = document.getElementById('unlock-password');

lockButton.addEventListener('click', () => {
    lockOverlay.classList.remove('hidden');
});

unlockButton.addEventListener('click', () => {
    if (unlockPassword.value === '1234') {
        lockOverlay.classList.add('hidden');
        unlockPassword.value = '';
    } else {
        alert('密码错误');
    }
});