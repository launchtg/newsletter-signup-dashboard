#!/usr/bin/env node
/**
 * Newsletter Dashboard API Server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const DATA_FILE = '/root/.openclaw/workspace/dashboard/data.json';
const SIGNUP_LOG = '/root/.openclaw/workspace/logs/newsletter-signups.json';
const TRACKING_LOG = '/root/.openclaw/workspace/logs/signup-tracking.json';

// Load existing signup data
function loadExistingSignups() {
    const statusMap = {};
    
    try {
        if (fs.existsSync(SIGNUP_LOG)) {
            const signupLog = JSON.parse(fs.readFileSync(SIGNUP_LOG, 'utf8'));
            signupLog.signups.forEach(signup => {
                statusMap[signup.url] = 'success';
            });
        }
        
        if (fs.existsSync(TRACKING_LOG)) {
            const tracking = JSON.parse(fs.readFileSync(TRACKING_LOG, 'utf8'));
            tracking.failed.forEach(fail => {
                if (fail.url && !statusMap[fail.url]) {
                    statusMap[fail.url] = 'failed';
                }
            });
            tracking.needsHuman.forEach(need => {
                if (need.url) {
                    statusMap[need.url] = 'failed';
                }
            });
        }
    } catch (e) {
        console.log('No existing signup data');
    }
    
    return statusMap;
}

// Request handler
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve HTML
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }
    
    // API: Get newsletters
    if (req.url === '/api/newsletters' && req.method === 'GET') {
        if (!fs.existsSync(DATA_FILE)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ newsletters: [], statusMap: loadExistingSignups() }));
            return;
        }
        
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        // Merge with existing signup statuses
        data.statusMap = { ...loadExistingSignups(), ...data.statusMap };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }
    
    // API: Save newsletters
    if (req.url === '/api/newsletters' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
        return;
    }
    
    // API: Start automation
    if (req.url === '/api/start-automation' && req.method === 'POST') {
        // Load newsletter data
        if (!fs.existsSync(DATA_FILE)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No newsletters loaded' }));
            return;
        }
        
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const pendingNewsletters = data.newsletters.filter(n => !data.statusMap[n.url]);
        
        // Save pending newsletters to a file for the automation script
        fs.writeFileSync(
            '/root/.openclaw/workspace/data/pending-signups.json',
            JSON.stringify({ newsletters: pendingNewsletters }, null, 2)
        );
        
        // Start automation script in background
        exec(
            'cd /root/.openclaw/workspace && nohup node scripts/automated-signup-worker.js > logs/automation-worker.log 2>&1 &',
            (error) => {
                if (error) {
                    console.error('Error starting automation:', error);
                }
            }
        );
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            message: `Started automation for ${pendingNewsletters.length} newsletters`
        }));
        return;
    }
    
    // 404
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log('📊 Newsletter Dashboard Server');
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log('');
    console.log('The dashboard is now running!');
    console.log('');
});
