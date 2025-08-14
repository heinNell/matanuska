const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Wialon API base URL and token (set your token as env variable)
const WIALON_API_URL = 'https://hst-api.wialon.com/wialon/ajax.html';
const WIALON_TOKEN = process.env.WIALON_TOKEN;

// Middleware to check Wialon token
app.use((req, res, next) => {
    if (!WIALON_TOKEN) {
        return res.status(500).json({ error: 'WIALON_TOKEN env variable not set' });
    }
    next();
});

// Example route: Get session ID from Wialon
app.get('/wialon/login', async (req, res) => {
    try {
        const response = await axios.get(WIALON_API_URL, {
            params: {
                svc: 'token/login',
                params: JSON.stringify({ token: WIALON_TOKEN })
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Example route: Get list of units (vehicles/assets)
app.get('/wialon/units', async (req, res) => {
    try {
        // First, login to get session id
        const loginRes = await axios.get(WIALON_API_URL, {
            params: {
                svc: 'token/login',
                params: JSON.stringify({ token: WIALON_TOKEN })
            }
        });
        const sid = loginRes.data.eid;
        if (!sid) throw new Error('Failed to get session ID from Wialon');

        // Then, get units
        const unitsRes = await axios.get(WIALON_API_URL, {
            params: {
                svc: 'core/search_items',
                params: JSON.stringify({
                    spec: {
                        itemsType: 'avl_unit',
                        propName: 'sys_name',
                        propValueMask: '*',
                        sortType: 'sys_name'
                    },
                    force: 1,
                    flags: 1,
                    from: 0,
                    to: 0
                }),
                sid
            }
        });
        res.json(unitsRes.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.send('Wialon server is healthy');
});

app.listen(PORT, () => {
    console.log(`Wialon server running on http://localhost:${PORT}`);
});
