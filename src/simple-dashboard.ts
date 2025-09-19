import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recall Trading Agent Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { 
                background: rgba(255,255,255,0.95); 
                padding: 30px; 
                border-radius: 15px; 
                margin-bottom: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                text-align: center;
            }
            .header h1 { color: #2c3e50; margin-bottom: 10px; font-size: 2.5em; }
            .header p { color: #7f8c8d; font-size: 1.2em; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { 
                background: rgba(255,255,255,0.95); 
                padding: 25px; 
                border-radius: 15px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            .card:hover { transform: translateY(-5px); }
            .card h3 { color: #2c3e50; margin-bottom: 15px; font-size: 1.4em; }
            .status { 
                display: inline-block; 
                padding: 8px 16px; 
                border-radius: 20px; 
                font-weight: bold; 
                font-size: 0.9em;
            }
            .status.running { background: #d4edda; color: #155724; }
            .status.stopped { background: #f8d7da; color: #721c24; }
            .status.error { background: #fff3cd; color: #856404; }
            .btn { 
                background: #007bff; 
                color: white; 
                border: none; 
                padding: 12px 24px; 
                border-radius: 8px; 
                cursor: pointer; 
                font-size: 1em;
                margin: 5px;
                transition: background 0.3s ease;
            }
            .btn:hover { background: #0056b3; }
            .btn.danger { background: #dc3545; }
            .btn.danger:hover { background: #c82333; }
            .btn.success { background: #28a745; }
            .btn.success:hover { background: #218838; }
            .log-container { 
                background: #2c3e50; 
                color: #ecf0f1; 
                padding: 20px; 
                border-radius: 10px; 
                font-family: 'Courier New', monospace; 
                max-height: 400px; 
                overflow-y: auto;
                white-space: pre-wrap;
            }
            .metric { 
                display: flex; 
                justify-content: space-between; 
                padding: 10px 0; 
                border-bottom: 1px solid #eee;
            }
            .metric:last-child { border-bottom: none; }
            .metric-label { font-weight: bold; color: #2c3e50; }
            .metric-value { color: #7f8c8d; }
            .refresh-btn { 
                position: fixed; 
                top: 20px; 
                right: 20px; 
                background: #28a745; 
                color: white; 
                border: none; 
                padding: 15px; 
                border-radius: 50%; 
                cursor: pointer; 
                font-size: 1.2em;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .refresh-btn:hover { background: #218838; }
        </style>
    </head>
    <body>
        <button class="refresh-btn" onclick="location.reload()">🔄</button>
        
        <div class="container">
            <div class="header">
                <h1>🤖 Recall Trading Agent Dashboard</h1>
                <p>Monitor your AI trading agent in real-time</p>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📊 Agent Status</h3>
                    <div id="agent-status">
                        <div class="metric">
                            <span class="metric-label">Status:</span>
                            <span class="metric-value" id="status">Loading...</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">API Health:</span>
                            <span class="metric-value" id="api-health">Checking...</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Strategies:</span>
                            <span class="metric-value" id="strategies">Loading...</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Uptime:</span>
                            <span class="metric-value" id="uptime">-</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🎯 Trading Controls</h3>
                    <div style="text-align: center;">
                        <button class="btn success" onclick="startAgent()">▶️ Start Agent</button>
                        <button class="btn danger" onclick="stopAgent()">⏹️ Stop Agent</button>
                        <button class="btn" onclick="getStatus()">📊 Refresh Status</button>
                    </div>
                    <div style="margin-top: 20px;">
                        <div class="metric">
                            <span class="metric-label">Last Trade:</span>
                            <span class="metric-value" id="last-trade">None</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Total Trades:</span>
                            <span class="metric-value" id="total-trades">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3>📈 Market Data</h3>
                    <div id="market-data">
                        <div class="metric">
                            <span class="metric-label">Chain:</span>
                            <span class="metric-value">Ethereum</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">API Key:</span>
                            <span class="metric-value" id="api-key">***</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Max Position:</span>
                            <span class="metric-value" id="max-position">1000</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3>📝 Recent Logs</h3>
                    <div class="log-container" id="logs">Loading logs...</div>
                </div>
            </div>
        </div>
        
        <script>
            let startTime = new Date();
            
            function updateUptime() {
                const now = new Date();
                const uptime = Math.floor((now - startTime) / 1000);
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = uptime % 60;
                document.getElementById('uptime').textContent = 
                    \`\${hours}h \${minutes}m \${seconds}s\`;
            }
            
            async function getStatus() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();
                    
                    document.getElementById('status').textContent = data.isRunning ? 'Running' : 'Stopped';
                    document.getElementById('status').className = 'metric-value ' + (data.isRunning ? 'status running' : 'status stopped');
                    document.getElementById('api-health').textContent = data.apiHealth ? 'Healthy' : 'Unhealthy';
                    document.getElementById('api-health').className = 'metric-value ' + (data.apiHealth ? 'status running' : 'status error');
                    document.getElementById('strategies').textContent = data.strategies ? data.strategies.length : '0';
                    document.getElementById('api-key').textContent = data.apiKey ? data.apiKey.substring(0, 8) + '...' : 'Not set';
                    document.getElementById('max-position').textContent = data.maxPositionSize || '1000';
                } catch (error) {
                    console.error('Error fetching status:', error);
                    document.getElementById('status').textContent = 'Error';
                    document.getElementById('status').className = 'metric-value status error';
                }
            }
            
            async function getLogs() {
                try {
                    const response = await fetch('/api/logs');
                    const logs = await response.text();
                    document.getElementById('logs').textContent = logs;
                } catch (error) {
                    console.error('Error fetching logs:', error);
                    document.getElementById('logs').textContent = 'Error loading logs';
                }
            }
            
            async function startAgent() {
                try {
                    await fetch('/api/start', { method: 'POST' });
                    setTimeout(getStatus, 1000);
                } catch (error) {
                    console.error('Error starting agent:', error);
                    alert('Error starting agent: ' + error.message);
                }
            }
            
            async function stopAgent() {
                try {
                    await fetch('/api/stop', { method: 'POST' });
                    setTimeout(getStatus, 1000);
                } catch (error) {
                    console.error('Error stopping agent:', error);
                    alert('Error stopping agent: ' + error.message);
                }
            }
            
            // Auto-refresh every 5 seconds
            setInterval(() => {
                getStatus();
                getLogs();
                updateUptime();
            }, 5000);
            
            // Initial load
            getStatus();
            getLogs();
            updateUptime();
        </script>
    </body>
    </html>
  `);
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    isRunning: false, 
    apiHealth: true, 
    strategies: ['moving_average', 'simple_trigger'], 
    apiKey: '7590c012fc45cd9e_8ef29bae405aa80',
    maxPositionSize: 1000
  });
});

app.post('/api/start', (req, res) => {
  res.json({ success: true, message: 'Agent started' });
});

app.post('/api/stop', (req, res) => {
  res.json({ success: true, message: 'Agent stopped' });
});

app.get('/api/logs', (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'trading.log');
    if (fs.existsSync(logPath)) {
      const logs = fs.readFileSync(logPath, 'utf8');
      const lines = logs.split('\n');
      const recentLines = lines.slice(-50).join('\n');
      res.send(recentLines);
    } else {
      res.send('No logs available yet.');
    }
  } catch (error) {
    res.status(500).send('Error reading logs');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 Monitor your trading agent in real-time!`);
  console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
});

export default app;
