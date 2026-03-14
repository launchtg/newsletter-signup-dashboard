const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DATA_FILE = path.join(__dirname, '../data.json');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Load newsletter data
    if (!fs.existsSync(DATA_FILE)) {
        return res.status(400).json({ error: 'No newsletters loaded' });
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
    
    return res.status(200).json({ 
        success: true, 
        message: `Started automation for ${pendingNewsletters.length} newsletters`
    });
};
