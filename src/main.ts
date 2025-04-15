import './style.css';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  ipAddress: string;
  isp: string;
  serverLocation: string;
  timestamp: Date;
}

// Initialize terminal
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="terminal">
    <h1>$ Terminal Speed Test v1.0.0</h1>
    <div class="result">Type 'help' to view available commands.</div>
    <div id="terminal-output"></div>
    <div id="command-line">
      <span class="prompt">root@internet-speedtest:~$</span>
      <input type="text" id="command-input" autofocus />
      <span class="cursor"></span>
    </div>
  </div>
`;

const terminalOutput = document.getElementById('terminal-output') as HTMLDivElement;
const commandInput = document.getElementById('command-input') as HTMLInputElement;
const commandLine = document.getElementById('command-line') as HTMLDivElement;

// Hide the actual input field and handle input display manually
commandInput.style.opacity = '0';
commandInput.style.position = 'absolute';
commandInput.style.zIndex = '-1';

// Focus the input field when clicking anywhere in the terminal
document.querySelector('.terminal')?.addEventListener('click', () => {
  commandInput.focus();
});

// Keep track of command history
const commandHistory: string[] = [];
let historyIndex = -1;
let currentInput = '';

// Handle input
let inputBuffer = '';
commandInput.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  inputBuffer = target.value;
  renderCommandLine();
});

commandInput.addEventListener('keydown', (e) => {
  // Handle arrow up/down for command history
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex === -1) {
      currentInput = inputBuffer;
    }
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
      inputBuffer = commandInput.value;
      renderCommandLine();
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      commandInput.value = currentInput;
    }
    inputBuffer = commandInput.value;
    renderCommandLine();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const command = inputBuffer.trim();
    if (command) {
      // Add to history if not a duplicate of the last command
      if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
        commandHistory.push(command);
      }
      historyIndex = -1;
      executeCommand(command);
      inputBuffer = '';
      commandInput.value = '';
      renderCommandLine();
    }
  }
});

function renderCommandLine() {
  const displayElem = document.createElement('span');
  displayElem.textContent = inputBuffer;
  displayElem.style.marginLeft = '5px';
  
  const promptElem = document.createElement('span');
  promptElem.className = 'prompt';
  promptElem.textContent = 'root@internet-speedtest:~$ ';
  
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  
  commandLine.innerHTML = '';
  commandLine.appendChild(promptElem);
  commandLine.appendChild(displayElem);
  commandLine.appendChild(cursor);
}

function appendToTerminal(text: string) {
  const outputLine = document.createElement('div');
  outputLine.className = 'result';
  outputLine.innerHTML = text;
  terminalOutput.appendChild(outputLine);
  
  // Auto scroll to bottom
  outputLine.scrollIntoView();
}

function clearTerminal() {
  terminalOutput.innerHTML = '';
}

async function executeCommand(command: string) {
  // Echo the command
  appendToTerminal(`<span class="prompt">root@internet-speedtest:~$</span> <span>${command}</span>`);
  
  // Split command and arguments
  const args = command.split(' ');
  const mainCommand = args[0].toLowerCase();
  
  // Execute appropriate command
  switch (mainCommand) {
    case 'help':
      displayHelp();
      break;
    case 'clear':
    case 'cls':
      clearTerminal();
      break;
    case 'speedtest':
      await runSpeedTest(args.slice(1));
      break;
    case 'about':
      displayAbout();
      break;
    case 'history':
      displayHistory();
      break;
    default:
      appendToTerminal(`Command not found: ${mainCommand}. Type 'help' for available commands.`);
  }
}

function displayHelp() {
  appendToTerminal(`
Available commands:
  - <span style="color: #AAFF00">help</span>: Display this help message
  - <span style="color: #AAFF00">clear</span> or <span style="color: #AAFF00">cls</span>: Clear the terminal
  - <span style="color: #AAFF00">speedtest</span>: Run a speed test
    Options:
      --download: Test download speed only
      --upload: Test upload speed only
      --full: Test all metrics (default)
  - <span style="color: #AAFF00">about</span>: Display information about this app
  - <span style="color: #AAFF00">history</span>: Show command history
  `);
}

function displayAbout() {
  appendToTerminal(`
<span style="color: #AAFF00">Terminal Speed Test v1.0.0</span>
A retro terminal-style internet speed testing tool.
Built with TypeScript and modern web technologies.
Measures download speed, upload speed, latency, and more.
  `);
}

function displayHistory() {
  if (commandHistory.length === 0) {
    appendToTerminal('No command history yet.');
    return;
  }
  
  let historyOutput = '<span style="color: #AAFF00">Command History:</span>\n';
  commandHistory.forEach((cmd, index) => {
    historyOutput += `${index + 1}: ${cmd}\n`;
  });
  
  appendToTerminal(historyOutput);
}

async function runSpeedTest(options: string[]) {
  // Parse options
  const testDownload = options.length === 0 || options.includes('--full') || options.includes('--download');
  const testUpload = options.length === 0 || options.includes('--full') || options.includes('--upload');
  
  appendToTerminal('Initializing speed test...');
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.innerHTML = '<div class="progress-fill"></div>';
  terminalOutput.appendChild(progressBar);
  
  const progressFill = progressBar.querySelector('.progress-fill') as HTMLDivElement;
  
  // Get IP information first
  appendToTerminal('Getting network information...');
  let ipInfo = await getIPInfo();
  
  // Test latency
  appendToTerminal('Measuring latency...');
  const latency = await measureLatency();
  updateProgress(progressFill, 20);
  
  // Test jitter
  appendToTerminal('Measuring jitter...');
  const jitter = await measureJitter();
  updateProgress(progressFill, 30);
  
  let downloadSpeed = 0;
  let uploadSpeed = 0;
  
  // Test download speed
  if (testDownload) {
    appendToTerminal('Testing download speed...');
    downloadSpeed = await testDownloadSpeed(progressFill, 30, 70);
    appendToTerminal(`Download speed: <span style="color: #AAFF00">${downloadSpeed.toFixed(2)} Mbps</span>`);
  } else {
    updateProgress(progressFill, 70);
  }
  
  // Test upload speed
  if (testUpload) {
    appendToTerminal('Testing upload speed...');
    uploadSpeed = await testUploadSpeed(progressFill, 70, 100);
    appendToTerminal(`Upload speed: <span style="color: #AAFF00">${uploadSpeed.toFixed(2)} Mbps</span>`);
  } else {
    updateProgress(progressFill, 100);
  }
  
  // Display final results
  const result: SpeedTestResult = {
    downloadSpeed,
    uploadSpeed,
    latency,
    jitter,
    ipAddress: ipInfo.ip || 'Unknown',
    isp: ipInfo.isp || 'Unknown',
    serverLocation: ipInfo.location || 'Unknown',
    timestamp: new Date()
  };
  
  displayResults(result);
}

function updateProgress(progressElement: HTMLDivElement, percentage: number) {
  progressElement.style.width = `${percentage}%`;
}

async function getIPInfo() {
  try {
    // Simulate fetching IP information
    await delay(500);
    return {
      ip: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      isp: 'Mock ISP Provider',
      location: 'Localhost, Terminal Country'
    };
  } catch (error) {
    console.error('Error getting IP info:', error);
    return { ip: 'Unknown', isp: 'Unknown', location: 'Unknown' };
  }
}

async function measureLatency() {
  // Simulate latency measurement
  await delay(800);
  return Math.floor(Math.random() * 50) + 10; // Random latency between 10-60ms
}

async function measureJitter() {
  // Simulate jitter measurement
  await delay(600);
  return Math.floor(Math.random() * 15) + 2; // Random jitter between 2-17ms
}

async function testDownloadSpeed(progressElement: HTMLDivElement, startPercentage: number, endPercentage: number) {
  // Simulate download speed test with progress updates
  const steps = 10;
  const stepSize = (endPercentage - startPercentage) / steps;
  
  for (let i = 0; i < steps; i++) {
    await delay(300);
    updateProgress(progressElement, startPercentage + stepSize * (i + 1));
  }
  
  // Return a simulated download speed between 10 and 150 Mbps
  return Math.random() * 140 + 10;
}

async function testUploadSpeed(progressElement: HTMLDivElement, startPercentage: number, endPercentage: number) {
  // Simulate upload speed test with progress updates
  const steps = 8;
  const stepSize = (endPercentage - startPercentage) / steps;
  
  for (let i = 0; i < steps; i++) {
    await delay(250);
    updateProgress(progressElement, startPercentage + stepSize * (i + 1));
  }
  
  // Return a simulated upload speed between 5 and 50 Mbps
  return Math.random() * 45 + 5;
}

function displayResults(result: SpeedTestResult) {
  const timestamp = result.timestamp.toLocaleString();
  
  // Format results as a terminal table
  appendToTerminal(`
<span style="color: #AAFF00">====== SPEED TEST RESULTS ======</span>
┌─────────────────┬──────────────────────────┐
│ Test Time       │ ${timestamp.padEnd(26)} │
├─────────────────┼──────────────────────────┤
│ IP Address      │ ${result.ipAddress.padEnd(26)} │
├─────────────────┼──────────────────────────┤
│ ISP             │ ${result.isp.padEnd(26)} │
├─────────────────┼──────────────────────────┤
│ Server Location │ ${result.serverLocation.padEnd(26)} │
├─────────────────┼──────────────────────────┤
│ Download Speed  │ ${result.downloadSpeed.toFixed(2)} Mbps${' '.repeat(20 - result.downloadSpeed.toFixed(2).length)} │
├─────────────────┼──────────────────────────┤
│ Upload Speed    │ ${result.uploadSpeed.toFixed(2)} Mbps${' '.repeat(20 - result.uploadSpeed.toFixed(2).length)} │
├─────────────────┼──────────────────────────┤
│ Latency         │ ${result.latency} ms${' '.repeat(24 - result.latency.toString().length)} │
├─────────────────┼──────────────────────────┤
│ Jitter          │ ${result.jitter} ms${' '.repeat(24 - result.jitter.toString().length)} │
└─────────────────┴──────────────────────────┘
  `);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initial focus
commandInput.focus();

// Welcome message
appendToTerminal(`
<span style="color: #AAFF00">Welcome to Terminal Speed Test v1.0.0</span>
Type 'help' for available commands or 'speedtest' to start a test.
`);
