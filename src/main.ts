import './style.css';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number | null;
  latency: number;
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
    <div class="result">Initializing... Type 'help' to view available commands.</div>
    <div class="help-link"><a href="/help.html" target="_blank">Open Help Guide</a></div>
    <div id="terminal-output"></div>
    <div id="command-line">
      <span class="prompt">root@internet-speedtest:~$</span>
      <div id="input-container">
        <span id="input-display-before"></span>
        <span class="cursor" id="cursor-element"></span>
        <span id="input-display-after"></span>
      </div>
      <input type="text" id="command-input" autofocus />
    </div>
  </div>
`;

const terminalOutput = document.getElementById('terminal-output') as HTMLDivElement;
const commandInput = document.getElementById('command-input') as HTMLInputElement;
const commandLine = document.getElementById('command-line') as HTMLDivElement;
const inputDisplayBefore = document.getElementById('input-display-before') as HTMLSpanElement;
const inputDisplayAfter = document.getElementById('input-display-after') as HTMLSpanElement;
const cursorElement = document.getElementById('cursor-element') as HTMLSpanElement;

// Initial welcome message in terminal output
appendToTerminal(`Welcome to Terminal Speed Test v1.0.0`);
appendToTerminal(`Type 'help' for available commands or 'speedtest' to start a test.`);

// Hide the actual input field and handle input display manually
commandInput.style.opacity = '0';
commandInput.style.position = 'absolute';
commandInput.style.zIndex = '-1';
commandInput.style.width = '1px';
commandInput.style.height = '1px';
commandInput.style.caretColor = 'transparent';

// Initial focus
commandInput.focus();

// Add a listener to refocus if focus is somehow lost
document.addEventListener('click', () => {
  commandInput.focus();
});

// Focus the input field when clicking anywhere in the terminal
document.querySelector('.terminal')?.addEventListener('click', (e) => {
  e.preventDefault();
  commandInput.focus();
});

// Keep track of command history
const commandHistory: string[] = [];
let historyIndex = -1;
let currentInput = '';

// Handle input
let inputBuffer = '';
let caretPosition = 0;

// Update the display with current input and caret position
function updateDisplay() {
  inputDisplayBefore.textContent = inputBuffer.substring(0, caretPosition);
  inputDisplayAfter.textContent = inputBuffer.substring(caretPosition);
}

// Handle input changes
commandInput.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  inputBuffer = target.value;
  caretPosition = target.selectionStart || 0;
  updateDisplay();
});

// Handle caret position changes
commandInput.addEventListener('click', (e) => {
  caretPosition = commandInput.selectionStart || 0;
  updateDisplay();
});

commandInput.addEventListener('keyup', (e) => {
  if (e.key !== 'Enter') {
    caretPosition = commandInput.selectionStart || 0;
    updateDisplay();
  }
});

commandInput.addEventListener('keydown', (e) => {
  // Handle arrow left/right for caret movement
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    setTimeout(() => {
      caretPosition = commandInput.selectionStart || 0;
      updateDisplay();
    }, 0);
  }
  // Handle arrow up/down for command history
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex === -1) {
      currentInput = inputBuffer;
    }
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      inputBuffer = commandHistory[commandHistory.length - 1 - historyIndex];
      commandInput.value = inputBuffer;
      caretPosition = inputBuffer.length;
      updateDisplay();
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      inputBuffer = commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      inputBuffer = currentInput;
    } else {
      inputBuffer = commandInput.value;
    }
    commandInput.value = inputBuffer;
    caretPosition = inputBuffer.length;
    updateDisplay();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const command = inputBuffer.trim();
    if (command) {
      if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
        commandHistory.push(command);
      }
      historyIndex = -1;
      currentInput = '';
      executeCommand(command);
      inputBuffer = '';
      caretPosition = 0;
      commandInput.value = '';
      updateDisplay();
    } else {
      appendToTerminal(`<span class="prompt">root@internet-speedtest:~$</span> `);
    }
    commandInput.focus();
  } else {
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      historyIndex = -1;
      currentInput = '';
    }
  }
});

function renderCommandLine() {
  updateDisplay();
  commandInput.focus();
}

function appendToTerminal(text: string, isHTML: boolean = true) {
  const outputLine = document.createElement('div');
  outputLine.className = 'result';
  if (isHTML) {
    outputLine.innerHTML = text;
  } else {
    outputLine.textContent = text; // Use textContent for plain text to prevent XSS
  }
  terminalOutput.appendChild(outputLine);
  
  // Auto scroll to bottom
  outputLine.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
  - <span style="color: #AAFF00">speedtest</span>: Run a speed test (download & latency)
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
  appendToTerminal('Initializing speed test...');
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.innerHTML = '<div class="progress-fill"></div>';
  terminalOutput.appendChild(progressBar);
  
  const progressFill = progressBar.querySelector('.progress-fill') as HTMLDivElement;
  
  let ipInfo = { ipAddress: 'N/A', isp: 'N/A', serverLocation: 'N/A' };
  let latency = -1;
  let downloadSpeed = -1;

  try {
    // Get IP information first
    appendToTerminal('Fetching network information...');
    ipInfo = await getIPInfo();
    appendToTerminal(`IP: ${ipInfo.ipAddress}, ISP: ${ipInfo.isp}, Location: ${ipInfo.serverLocation}`);
    updateProgress(progressFill, 10);

    // Test latency
    appendToTerminal('Measuring latency...');
    latency = await measureLatency();
    if (latency !== -1) {
      appendToTerminal(`Latency: <span style="color: #AAFF00">${latency.toFixed(0)} ms</span>`);
    } else {
      appendToTerminal('Latency Test Failed.');
    }
    updateProgress(progressFill, 30);

    // Test download speed
    appendToTerminal('Testing download speed...');
    downloadSpeed = await testDownloadSpeed(progressFill, 30, 100); // Download takes remaining progress
    if (downloadSpeed !== -1) {
      appendToTerminal(`Download speed: <span style="color: #AAFF00">${downloadSpeed.toFixed(2)} Mbps</span>`);
    } else {
      appendToTerminal('Download Test Failed.');
    }

    // Upload speed is skipped for now
    const uploadSpeed = null;

    // Display final results
    const result: SpeedTestResult = {
      downloadSpeed: downloadSpeed,
      uploadSpeed: uploadSpeed,
      latency: latency,
      ipAddress: ipInfo.ipAddress,
      isp: ipInfo.isp,
      serverLocation: ipInfo.serverLocation,
      timestamp: new Date()
    };

    displayResults(result);

  } catch (error) {
    appendToTerminal(`An error occurred during the speed test: ${(error as Error).message}`, false);
    updateProgress(progressFill, 100); // Ensure progress bar completes on error
  } finally {
     // Remove progress bar after test completion or error
     if (progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
     }
     renderCommandLine(); // Re-render command line prompt
  }
}

function updateProgress(progressElement: HTMLDivElement, percentage: number) {
  progressElement.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}

async function getIPInfo(): Promise<{ ipAddress: string; isp: string; serverLocation: string; }> {
  try {
    // Using ip-api.com as an example
    const response = await fetch('http://ip-api.com/json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const locationString = `${data.city || ''}, ${data.regionName || ''}, ${data.country || ''}`.replace(/^, |, $|(,{2,})/g, ', ').replace(/^, |, $/g, '').trim();
    return {
      ipAddress: data.query || 'N/A',
      isp: data.isp || 'N/A',
      serverLocation: locationString || 'N/A' // Use the cleaned string
    };
  } catch (error) {
    console.error('Error fetching IP info:', error);
    appendToTerminal('Could not fetch IP information.', false);
    return { ipAddress: 'N/A', isp: 'N/A', serverLocation: 'N/A' };
  }
}

async function measureLatency(samples: number = 5): Promise<number> {
  let totalLatency = 0;
  let successfulSamples = 0;
  // Use a small, cache-busting URL. Targeting the IP info API endpoint as it should be available.
  const url = `http://ip-api.com/json?&_=${Date.now()}`;

  appendToTerminal(`Pinging ${url.split('?')[0]}...`);

  for (let i = 0; i < samples; i++) {
    const startTime = performance.now();
    try {
      // Use HEAD request to minimize data transfer
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' }); // Using no-cors as we only need timing, not content
      // NOTE: 'no-cors' might return opaque responses, timing might be less accurate or zero.
      // A dedicated backend endpoint would be more reliable here.
      const endTime = performance.now();
      const currentLatency = endTime - startTime;
      totalLatency += currentLatency;
      successfulSamples++;
      appendToTerminal(`Ping reply time=${currentLatency.toFixed(0)} ms`);
      await delay(100); // Small delay between pings
    } catch (error) {
       console.error(`Latency test sample ${i + 1} failed:`, error);
       appendToTerminal(`Ping sample ${i + 1} failed.`);
    }
  }

  return successfulSamples > 0 ? totalLatency / successfulSamples : -1;
}

async function testDownloadSpeed(progressElement: HTMLDivElement, startPercentage: number, endPercentage: number): Promise<number> {
  // !!! IMPORTANT: Replace with an actual URL to a test file (e.g., 5MB-10MB) hosted on a reliable server/CDN. !!!
  // Using a placeholder - THIS WILL NOT WORK without a real URL.
  const testFileURL = '/path/to/your/test/file.dat'; // <--- REPLACE THIS URL
  // Example using a public file (use with caution, may be unreliable or rate-limited):
  // const testFileURL = 'https://proof.ovh.net/files/10Mb.dat';

  appendToTerminal(`Downloading test file from ${testFileURL}...`);

  try {
    const startTime = performance.now();
    const response = await fetch(testFileURL + `?&_=${Date.now()}`); // Cache busting

    if (!response.ok) {
        throw new Error(`Failed to download test file: ${response.status} ${response.statusText}`);
    }
    if (!response.body) {
         throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const contentLength = Number(response.headers.get('Content-Length'));
    if (!contentLength || contentLength <= 0) {
        appendToTerminal('Warning: Content-Length header missing or invalid. Progress/Speed might be inaccurate.', false);
        // Fallback or different approach might be needed here if Content-Length is unreliable
    }

    let receivedLength = 0;
    let chunks = []; // Store chunks if needed, or just track length

    while(true) {
        const {done, value} = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength > 0) {
            const percentage = startPercentage + (receivedLength / contentLength) * (endPercentage - startPercentage);
            updateProgress(progressElement, percentage);
        } else {
             // If no content length, maybe update progress based on time elapsed? Less ideal.
             // For now, just update slightly to show activity
             const timeElapsed = (performance.now() - startTime) / 1000; // seconds
             const estimatedProgress = Math.min(endPercentage, startPercentage + timeElapsed * 5); // Arbitrary progress update
             updateProgress(progressElement, estimatedProgress);
        }
    }

    const endTime = performance.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const bitsLoaded = receivedLength * 8;
    const speedBps = bitsLoaded / durationInSeconds;
    const speedMbps = speedBps / (1024 * 1024);

    updateProgress(progressElement, endPercentage); // Ensure progress bar completes

    return speedMbps;

  } catch (error) {
    console.error('Download test error:', error);
    appendToTerminal(`Download test failed: ${(error as Error).message}`, false);
    updateProgress(progressElement, endPercentage); // Ensure progress bar completes on error
    return -1;
  }
}

function displayResults(result: SpeedTestResult) {
  appendToTerminal('\n--- Test Complete ---'); // Keep newline here for spacing
  appendToTerminal(`Timestamp:        ${result.timestamp.toLocaleString()}`);
  appendToTerminal(`IP Address:       ${result.ipAddress}`);
  appendToTerminal(`ISP:              ${result.isp}`);
  appendToTerminal(`Location:         ${result.serverLocation}`);
  appendToTerminal(`Latency:          ${result.latency >= 0 ? result.latency.toFixed(0) + ' ms' : 'N/A'}`);
  appendToTerminal(`Download Speed:   ${result.downloadSpeed >= 0 ? result.downloadSpeed.toFixed(2) + ' Mbps' : 'N/A'}`);
  // appendToTerminal(`Upload Speed:     ${result.uploadSpeed ? result.uploadSpeed.toFixed(2) + ' Mbps' : 'N/A (Not Tested)'}`);
   appendToTerminal('-------------------');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add a listener to refocus if focus is somehow lost from the input to the body
document.body.addEventListener('focus', () => {
    commandInput.focus();
}, true);

// Add focus logic
document.querySelector('.terminal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement)?.closest('a')) {
        return;
    }
    commandInput.focus();
});
