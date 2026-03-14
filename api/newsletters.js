const https = require('https');

// Store data on VPS instead of Vercel
const VPS_API = 'http://209.182.213.100:8080/api';

function makeVPSRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(VPS_API + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        const req = require('http').request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch { resolve(body); }
            });
        });
        
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

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

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET - Fetch newsletters
    if (req.method === 'GET') {
        if (!fs.existsSync(DATA_FILE)) {
            return res.status(200).json({ 
                newsletters: [], 
                statusMap: loadExistingSignups() 
            });
        }
        
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.statusMap = { ...loadExistingSignups(), ...data.statusMap };
        
        return res.status(200).json(data);
    }
    
    // POST - Save newsletters
    if (req.method === 'POST') {
        try {
            const data = req.body;
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(400).json({ error: 'Invalid data' });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};
