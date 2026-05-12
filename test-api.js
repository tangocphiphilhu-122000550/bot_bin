// Test check-card API
const CHECK_LIVE_URL = 'https://sxglrllialxihqowmqwh.supabase.co/functions/v1/check-card';
const CHECK_LIVE_APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z2xybGxpYWx4aWhxb3dtcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjE2NjQsImV4cCI6MjA4MzY5NzY2NH0.mCivzbRAqNkJ1BA8ag4mt6vHlUjV5lWUguhGb4mmKc0';

async function testAPI() {
    const testCard = '4154644406356387|03|2028|641';
    console.log(`🔍 Testing API with card: ${testCard}`);
    console.log(`📡 URL: ${CHECK_LIVE_URL}`);
    console.log('---');

    try {
        const res = await fetch(CHECK_LIVE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': CHECK_LIVE_APIKEY,
                'Authorization': `Bearer ${CHECK_LIVE_APIKEY}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
                'Origin': 'https://madleets.me',
                'Referer': 'https://madleets.me/',
            },
            body: JSON.stringify({ card: testCard }),
        });

        console.log(`📊 Status: ${res.status} ${res.statusText}`);
        console.log(`📋 Headers:`, Object.fromEntries(res.headers.entries()));
        
        const data = await res.json();
        console.log(`\n✅ Response:`);
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`❌ Error:`, err.message);
    }
}

testAPI();
