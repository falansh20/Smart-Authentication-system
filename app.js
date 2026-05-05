// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const tabPanes = document.querySelectorAll('.tab-pane');
const pauseBtn = document.getElementById('pauseMetrics');
const refreshBtn = document.getElementById('refreshMetrics');

// Dashboard elements
const cpuValue = document.getElementById('cpuValue');
const memValue = document.getElementById('memValue');
const authEvents = document.getElementById('authEvents');
const failedAuth = document.getElementById('failedAuth');
const procCount = document.getElementById('procCount');
const uptime = document.getElementById('uptime');
const loadAvg = document.getElementById('loadAvg');
const swapUsage = document.getElementById('swapUsage');

// Chart elements
const cpuChartEl = document.getElementById('cpuChart');
const authChartEl = document.getElementById('authChart');
const factorChartEl = document.getElementById('factorChart');
const authStatusChartEl = document.getElementById('authStatusChart');

// Auth elements
const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const otpFactor = document.getElementById('otpFactor');
const bioFactor = document.getElementById('bioFactor');
const showPassword = document.getElementById('showPassword');
const authStatus = document.getElementById('authStatus');

// Biometric elements
const bioUsername = document.getElementById('bioUsername');
const bioPattern = document.getElementById('bioPattern');
const enrollBio = document.getElementById('enrollBio');
const bioEnrollStatus = document.getElementById('bioEnrollStatus');
const bioVerifyUser = document.getElementById('bioVerifyUser');
const bioVerifyPattern = document.getElementById('bioVerifyPattern');
const livenessCheck = document.getElementById('livenessCheck');
const verifyBio = document.getElementById('verifyBio');
const bioVerifyStatus = document.getElementById('bioVerifyStatus');

// Kernel elements
const requestRing0 = document.getElementById('requestRing0');
const ringDisplay = document.getElementById('ringDisplay');
const ringStatus = document.getElementById('ringStatus');
const syscallType = document.getElementById('syscallType');
const syscallArg = document.getElementById('syscallArg');
const executeSyscall = document.getElementById('executeSyscall');
const syscallStatus = document.getElementById('syscallStatus');
const kernelModule = document.getElementById('kernelModule');
const loadModule = document.getElementById('loadModule');
const unloadModule = document.getElementById('unloadModule');
const moduleStatus = document.getElementById('moduleStatus');
const proc1 = document.getElementById('proc1');
const proc2 = document.getElementById('proc2');
const contextSwitch = document.getElementById('contextSwitch');
const switchStatus = document.getElementById('switchStatus');
const interruptType = document.getElementById('interruptType');
const triggerInterrupt = document.getElementById('triggerInterrupt');
const interruptStatus = document.getElementById('interruptStatus');
const moduleList = document.getElementById('moduleList');

// Processes elements
const processNameInput = document.getElementById('processNameInput');
const addProcessBtn = document.getElementById('addProcessBtn');
const processList = document.getElementById('processList');

// Events elements
const eventsList = document.getElementById('eventsList');
const clearEvents = document.getElementById('clearEvents');

// Global state
let systemState = {
  cpu: 45,
  memory: 62,
  authCount: 1247,
  failedAuthCount: 23,
  processes: 32,
  metricsRunning: true,
  currentRing: 3,
  sessionToken: null,
  biometricTemplates: {},
  loadedModules: ['auth_core.ko', 'mfa_handler.ko'],
  events: [],
  createdProcesses: [],
  nextPid: 1000,
  cpuHistory: [45, 48, 42, 50, 46, 49, 44, 47],
  authHistory: [100, 105, 95, 110, 102, 108, 98, 112],
  authSuccessHistory: [92, 95, 98, 102, 99, 104, 101, 106],
  authFailHistory: [8, 5, 7, 4, 6, 3, 5, 2],
  authFactors: {
    otp: 36,
    biometric: 44,
    password: 20
  },
  memHistory: [62, 64, 61, 65, 63, 66, 62, 65]
};

const users = {
  admin: 'OsSecure@2026',
  guest: 'guest1234'
};

const kernelModuleSigs = {
  'auth_core.ko': 'sig_valid_0x1a2b',
  'mfa_handler.ko': 'sig_valid_0x5e6f',
  'crypto_engine.ko': 'sig_valid_0x9i0j',
  'rootkit.ko': 'MALWARE_DETECTED'
};

// Chart instances
let cpuChart = null;
let authChart = null;
let factorChart = null;
let authStatusChart = null;

// Initialize charts
function initCharts() {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        ticks: {
          color: 'rgba(168, 178, 193, 0.8)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(168, 178, 193, 0.8)'
        }
      }
    }
  };

  // CPU Chart
  cpuChart = new Chart(cpuChartEl, {
    type: 'line',
    data: {
      labels: ['8s', '7s', '6s', '5s', '4s', '3s', '2s', '1s'],
      datasets: [{
        label: 'CPU %',
        data: systemState.cpuHistory,
        borderColor: '#4a9eff',
        backgroundColor: 'rgba(74, 158, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#4a9eff'
      }]
    },
    options: chartOptions
  });

  // Auth Requests Chart
  authChart = new Chart(authChartEl, {
    type: 'line',
    data: {
      labels: ['8s', '7s', '6s', '5s', '4s', '3s', '2s', '1s'],
      datasets: [{
        label: 'Auth Requests',
        data: systemState.authHistory,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#4ade80'
      }]
    },
    options: {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          beginAtZero: true,
          suggestedMax: 140,
          grid: chartOptions.scales.y.grid,
          ticks: chartOptions.scales.y.ticks
        }
      }
    }
  });

  factorChart = new Chart(factorChartEl, {
    type: 'doughnut',
    data: {
      labels: ['OTP', 'Biometric', 'Password'],
      datasets: [{
        data: [systemState.authFactors.otp, systemState.authFactors.biometric, systemState.authFactors.password],
        backgroundColor: ['#4ade80', '#5dd7ff', '#ffb347'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(168, 178, 193, 0.9)'
          }
        }
      }
    }
  });

  authStatusChart = new Chart(authStatusChartEl, {
    type: 'line',
    data: {
      labels: ['8m', '7m', '6m', '5m', '4m', '3m', '2m', '1m'],
      datasets: [{
        label: 'Success',
        data: systemState.authSuccessHistory,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#4ade80'
      }, {
        label: 'Failure',
        data: systemState.authFailHistory,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#ff6b6b'
      }]
    },
    options: {
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        y: {
          beginAtZero: true,
          suggestedMax: 120,
          grid: chartOptions.scales.y.grid,
          ticks: chartOptions.scales.y.ticks
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: 'rgba(168, 178, 193, 0.9)'
          }
        }
      }
    }
  });
}

// Update charts
function updateCharts() {
  if (!cpuChart || !authChart) return;

  systemState.cpuHistory.shift();
  systemState.cpuHistory.push(systemState.cpu);
  
  systemState.authHistory.shift();
  systemState.authHistory.push(100 + Math.floor(Math.random() * 30));
  
  cpuChart.data.datasets[0].data = systemState.cpuHistory;
  cpuChart.update('none');
  
  authChart.data.datasets[0].data = systemState.authHistory;
  authChart.update('none');
  updateAuthCharts();
}

function updateAuthCharts() {
  if (!factorChart || !authStatusChart) return;

  factorChart.data.datasets[0].data = [
    systemState.authFactors.otp,
    systemState.authFactors.biometric,
    systemState.authFactors.password
  ];
  factorChart.update('none');

  authStatusChart.data.datasets[0].data = systemState.authSuccessHistory;
  authStatusChart.data.datasets[1].data = systemState.authFailHistory;
  authStatusChart.update('none');
}

// Tab Navigation
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    const tabName = item.dataset.tab;
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
  });
});

// Metrics updates
function updateMetrics() {
  if (!systemState.metricsRunning) return;
  
  systemState.cpu = Math.max(10, Math.min(90, systemState.cpu + (Math.random() - 0.5) * 15));
  systemState.memory = Math.max(30, Math.min(85, systemState.memory + (Math.random() - 0.5) * 8));
  
  cpuValue.textContent = systemState.cpu.toFixed(1) + '%';
  memValue.textContent = systemState.memory.toFixed(1) + '%';
  
  document.getElementById('cpuFill').style.width = systemState.cpu + '%';
  document.getElementById('memFill').style.width = systemState.memory + '%';
  
  authEvents.textContent = (1200 + Math.floor(Math.random() * 100)).toString();
  failedAuth.textContent = (20 + Math.floor(Math.random() * 10)).toString();
  procCount.textContent = (30 + Math.floor(Math.random() * 8)).toString();
  loadAvg.textContent = (2.1 + Math.random() * 0.8).toFixed(2) + ' (1m)';
  
  updateCharts();
  updateAuthCharts();
}

pauseBtn.addEventListener('click', () => {
  systemState.metricsRunning = !systemState.metricsRunning;
  pauseBtn.textContent = systemState.metricsRunning ? 'Pause' : 'Resume';
});

refreshBtn.addEventListener('click', updateMetrics);

showPassword.addEventListener('change', () => {
  password.type = showPassword.checked ? 'text' : 'password';
});

// Authentication
function showMessage(element, message, type = 'info') {
  element.textContent = message;
  element.className = 'status-message ' + type;
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = username.value.trim();
  const pass = password.value;
  
  if (!user || !pass) {
    showMessage(authStatus, 'Enter username and password', 'danger');
    return;
  }
  
  if (users[user] !== pass) {
    showMessage(authStatus, 'Invalid credentials', 'danger');
    addEvent(`Failed login attempt for ${user}`, 'danger');
    return;
  }
  
  if (otpFactor.checked) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    showMessage(authStatus, `OTP: ${otp}. Confirm to proceed.`, 'info');
    setTimeout(() => {
      const input = prompt('Enter OTP:');
      if (input === otp.toString()) {
        completeAuth(user);
      } else {
        showMessage(authStatus, 'OTP mismatch', 'danger');
        addEvent(`OTP verification failed for ${user}`, 'danger');
      }
    }, 200);
    return;
  }
  
  completeAuth(user);
});

function completeAuth(user) {
  systemState.sessionToken = 'token_' + Math.random().toString(36).substring(7);
  showMessage(authStatus, `Authenticated: ${user}. Session: ${systemState.sessionToken}`, 'success');
  addEvent(`User ${user} authenticated successfully`, 'success');
  username.value = '';
  password.value = '';

  if (otpFactor.checked) {
    systemState.authFactors.otp += 1;
  } else if (bioFactor.checked) {
    systemState.authFactors.biometric += 1;
  } else {
    systemState.authFactors.password += 1;
  }

  systemState.authSuccessHistory.shift();
  systemState.authSuccessHistory.push(95 + Math.floor(Math.random() * 10));
  systemState.authFailHistory.shift();
  systemState.authFailHistory.push(2 + Math.floor(Math.random() * 4));
  updateAuthCharts();
}

// Biometric
enrollBio.addEventListener('click', () => {
  const user = bioUsername.value.trim();
  const pattern = bioPattern.value.trim();
  
  if (!user || pattern.length < 8) {
    showMessage(bioEnrollStatus, 'Min 8 chars for pattern', 'danger');
    return;
  }
  
  systemState.biometricTemplates[user] = pattern;
  showMessage(bioEnrollStatus, `Biometric enrolled for ${user}`, 'success');
  addEvent(`Biometric enrolled: ${user}`, 'success');
  bioUsername.value = '';
  bioPattern.value = '';
});

verifyBio.addEventListener('click', () => {
  const user = bioVerifyUser.value.trim();
  const pattern = bioVerifyPattern.value.trim();
  
  if (!user || !pattern) {
    showMessage(bioVerifyStatus, 'Enter username and pattern', 'danger');
    return;
  }
  
  if (!systemState.biometricTemplates[user]) {
    showMessage(bioVerifyStatus, 'User not enrolled', 'danger');
    return;
  }
  
  const stored = systemState.biometricTemplates[user];
  const similarity = Math.round((stored === pattern ? 100 : Math.random() * 100));
  
  if (livenessCheck.checked && Math.random() < 0.15) {
    showMessage(bioVerifyStatus, 'Liveness check failed', 'danger');
    addEvent(`Biometric spoofing attempt detected for ${user}`, 'danger');
    return;
  }
  
  if (similarity >= 75) {
    showMessage(bioVerifyStatus, `Match: ${similarity}%. Verified!`, 'success');
    addEvent(`Biometric verification successful for ${user}`, 'success');
  } else {
    showMessage(bioVerifyStatus, `Match too low: ${similarity}%`, 'danger');
    addEvent(`Biometric verification failed for ${user}`, 'danger');
  }
  
  bioVerifyUser.value = '';
  bioVerifyPattern.value = '';
});

// Kernel Operations
requestRing0.addEventListener('click', () => {
  if (!systemState.sessionToken) {
    showMessage(ringStatus, 'Session required. Authenticate first.', 'danger');
    return;
  }
  
  if (systemState.currentRing === 0) {
    showMessage(ringStatus, 'Already in Ring 0', 'info');
    return;
  }
  
  systemState.currentRing = 0;
  ringDisplay.textContent = 'Ring 0 (Kernel Mode)';
  ringDisplay.style.color = '#ff6b6b';
  showMessage(ringStatus, 'Privilege escalated to Ring 0', 'success');
  addEvent('Privilege escalation to Ring 0 granted', 'success');
});

executeSyscall.addEventListener('click', () => {
  if (systemState.currentRing !== 0) {
    showMessage(syscallStatus, 'Ring 0 required', 'danger');
    return;
  }
  
  const syscallMap = {
    'auth_verify': { number: '0x401', cycles: 1250 },
    'auth_enroll': { number: '0x402', cycles: 2840 },
    'mfa_challenge': { number: '0x404', cycles: 560 }
  };
  
  const type = syscallType.value;
  const syscall = syscallMap[type];
  const result = Math.floor(Math.random() * 100);
  
  showMessage(syscallStatus, `Syscall ${syscall.number} executed. Return: ${result}, Cycles: ${syscall.cycles}`, 'success');
  addEvent(`System call ${type} executed`, 'info');
});

loadModule.addEventListener('click', () => {
  const module = kernelModule.value;
  
  if (systemState.loadedModules.includes(module)) {
    showMessage(moduleStatus, `${module} already loaded`, 'info');
    return;
  }
  
  const sig = kernelModuleSigs[module];
  if (sig.includes('MALWARE')) {
    showMessage(moduleStatus, `MALWARE DETECTED in ${module}`, 'danger');
    addEvent(`Rootkit detected: ${module}`, 'danger');
    return;
  }
  
  systemState.loadedModules.push(module);
  showMessage(moduleStatus, `${module} loaded successfully`, 'success');
  renderModuleList();
  addEvent(`Kernel module loaded: ${module}`, 'success');
});

unloadModule.addEventListener('click', () => {
  const module = kernelModule.value;
  
  if (!systemState.loadedModules.includes(module)) {
    showMessage(moduleStatus, `${module} not loaded`, 'info');
    return;
  }
  
  systemState.loadedModules = systemState.loadedModules.filter(m => m !== module);
  showMessage(moduleStatus, `${module} unloaded`, 'success');
  renderModuleList();
  addEvent(`Kernel module unloaded: ${module}`, 'success');
});

function renderModuleList() {
  moduleList.innerHTML = systemState.loadedModules.map(m => 
    `<div class="module-item">● ${m}</div>`
  ).join('');
}

contextSwitch.addEventListener('click', () => {
  const p1 = proc1.value || 'proc1';
  const p2 = proc2.value || 'proc2';
  const msg = `Context switched: ${p1} → ${p2}. PCB saved, resuming at 0x${Math.random().toString(16).substring(2, 10)}`;
  showMessage(switchStatus, msg, 'success');
  addEvent(`Context switch: ${p1} → ${p2}`, 'info');
});

triggerInterrupt.addEventListener('click', () => {
  const intMap = {
    'keyboard': '0x21',
    'timer': '0x08',
    'io': '0x2E',
    'fault': '0x0D'
  };
  
  const type = interruptType.value;
  const num = intMap[type];
  showMessage(interruptStatus, `INT ${num} triggered and handled`, 'success');
  addEvent(`Interrupt triggered: ${type}`, 'info');
});

// Processes
addProcessBtn.addEventListener('click', () => {
  const name = processNameInput.value.trim() || `task_${systemState.nextPid}`;
  const pid = systemState.nextPid++;
  
  systemState.createdProcesses.push({
    pid,
    name,
    cpu: Math.random() * 30,
    mem: Math.random() * 500,
    threads: Math.floor(Math.random() * 8) + 1,
    priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    state: 'Running'
  });
  
  renderProcesses();
  processNameInput.value = '';
  addEvent(`New process created: ${name} (PID: ${pid})`, 'success');
});

function renderProcesses() {
  processList.innerHTML = systemState.createdProcesses.map(p => `
    <tr>
      <td>${p.pid}</td>
      <td>${p.name}</td>
      <td>${p.cpu.toFixed(1)}%</td>
      <td>${p.mem.toFixed(0)}</td>
      <td>${p.threads}</td>
      <td><span class="priority-${p.priority.toLowerCase()}">${p.priority}</span></td>
      <td>${p.state}</td>
    </tr>
  `).join('');
}

// Events Log
function addEvent(message, type = 'info') {
  const time = new Date().toLocaleTimeString();
  systemState.events.unshift({ time, message, type });
  if (systemState.events.length > 100) systemState.events.pop();
  renderEvents();
}

function renderEvents() {
  eventsList.innerHTML = systemState.events.map(e => `
    <div class="event-item">
      <span class="event-time">${e.time}</span>
      <span class="event-message event-${e.type}">${e.message}</span>
    </div>
  `).join('');
}

clearEvents.addEventListener('click', () => {
  systemState.events = [];
  renderEvents();
});

// Initialize
initCharts();
setInterval(updateMetrics, 1000);
renderModuleList();
renderProcesses();
renderEvents();
addEvent('System initialized and monitoring started', 'success');
