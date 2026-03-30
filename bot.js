require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'ce8703e988mshc81fb8ebd23b098p1bc5b6jsnca838140df08';
const RAPIDAPI_HOST = 'bin-ip-checker.p.rapidapi.com';

// ==================== UTILS ====================

function luhnGenerate(partialNumber) {
    const digits = partialNumber.split('').map(Number);
    const parity = digits.length % 2;
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let d = digits[i];
        if (i % 2 === parity) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return partialNumber + checkDigit;
}

function generateExpiry() {
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const yearsAhead = Math.floor(Math.random() * 5) + 1;
    const year = currentYear + yearsAhead;
    const month = Math.floor(Math.random() * 12) + 1;
    return `${String(month).padStart(2, '0')}|${String(year).padStart(2, '0')}`;
}

function generateCVV() {
    return String(Math.floor(Math.random() * 900) + 100);
}

function generateCards(binPrefix, count = 10, fixedExpiry = '', fixedCVV = '') {
    const cards = [];
    const seen = new Set();
    const cardLength = 16;
    const remainingLength = cardLength - binPrefix.length - 1;

    let attempts = 0;
    while (cards.length < count && attempts < count * 20) {
        let partial = binPrefix;
        for (let i = 0; i < remainingLength; i++) {
            partial += Math.floor(Math.random() * 10);
        }
        const fullCard = luhnGenerate(partial);

        if (!seen.has(fullCard)) {
            seen.add(fullCard);
            cards.push({
                number: fullCard,
                expiry: fixedExpiry || generateExpiry(),
                cvv: fixedCVV || generateCVV(),
            });
        }
        attempts++;
    }
    return cards;
}

async function lookupBIN(bin) {
    try {
        const res = await fetch(`https://lookup.binlist.net/${bin}`, {
            headers: { 'Accept-Version': '3', 'Accept': 'application/json' },
        });
        if (!res.ok) {
            if (res.status === 404) return { error: 'Không tìm thấy BIN.' };
            if (res.status === 429) return { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' };
            return { error: 'Tra cứu thất bại.' };
        }
        return await res.json();
    } catch {
        return { error: 'Dịch vụ không khả dụng.' };
    }
}

// RapidAPI BIN Checker
async function checkBINAdvanced(bin) {
    try {
        const res = await fetch(`https://${RAPIDAPI_HOST}/?bin=${bin}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) return { error: 'Tra cứu thất bại.' };
        return await res.json();
    } catch {
        return { error: 'Dịch vụ không khả dụng.' };
    }
}

// RapidAPI BIN + IP Checker
async function checkBINWithIP(bin, ip) {
    try {
        const res = await fetch(`https://${RAPIDAPI_HOST}/?bin=${bin}&ip=${ip}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) return { error: 'Tra cứu thất bại.' };
        return await res.json();
    } catch {
        return { error: 'Dịch vụ không khả dụng.' };
    }
}

// RapidAPI IP Lookup
async function checkIP(ip) {
    try {
        const res = await fetch(`https://${RAPIDAPI_HOST}/ip-lookup?ip=${ip}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) return { error: 'Tra cứu thất bại.' };
        return await res.json();
    } catch {
        return { error: 'Dịch vụ không khả dụng.' };
    }
}

// ==================== COMMANDS ====================

// /start
bot.onText(/\/start/, (msg) => {
    const welcome = `
💳 *BIN Generator Bot*

Các lệnh hỗ trợ:

🔹 \`/gen <BIN>\` — Tạo 10 thẻ ngẫu nhiên
🔹 \`/gen <BIN> <số lượng>\` — Tạo theo số lượng
🔹 \`/gen <BIN> <số lượng> <MM|YY> <CVV>\` — Cố định ngày hết hạn & CVV
🔹 \`/check <BIN>\` — Tra cứu thông tin BIN (binlist.net)
🔹 \`/bin <BIN>\` — Tra cứu BIN chi tiết (RapidAPI)
🔹 \`/binip <BIN> <IP>\` — Kiểm tra BIN + IP
🔹 \`/ip <IP>\` — Tra cứu thông tin IP

*Ví dụ:*
\`/gen 453201\`
\`/gen 37435512226 20\`
\`/bin 448590\`
\`/binip 448590 2.56.188.79\`
\`/ip 2.56.188.79\`
    `.trim();

    bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
});

// /gen <BIN> [qty] [MM|YY] [CVV]
bot.onText(/\/gen(?:@\w+)?\s+(.+)/, (msg, match) => {
    const args = match[1].trim().split(/\s+/);
    const bin = args[0].replace(/\D/g, '');

    // Validate BIN
    if (bin.length < 1 || bin.length >= 16) {
        return bot.sendMessage(msg.chat.id, '❌ BIN phải từ 1-15 chữ số.', { parse_mode: 'Markdown' });
    }

    // Parse quantity
    let qty = 10;
    if (args[1]) {
        qty = parseInt(args[1], 10);
        if (isNaN(qty) || qty < 1) qty = 10;
        if (qty > 50) qty = 50;
    }

    // Parse fixed expiry (MM|YY)
    let fixedExpiry = '';
    if (args[2]) {
        const expMatch = args[2].match(/^(\d{2})\|(\d{2})$/);
        if (expMatch) {
            const month = parseInt(expMatch[1], 10);
            if (month >= 1 && month <= 12) {
                fixedExpiry = args[2];
            }
        }
    }

    // Parse fixed CVV
    let fixedCVV = '';
    if (args[3] && /^\d{3}$/.test(args[3])) {
        fixedCVV = args[3];
    }

    // Generate cards
    const cards = generateCards(bin, qty, fixedExpiry, fixedCVV);

    if (cards.length === 0) {
        return bot.sendMessage(msg.chat.id, '❌ Không thể tạo thẻ.', { parse_mode: 'Markdown' });
    }

    // Format output
    const header = `⚡ *BIN Generator*\n📌 BIN: \`${bin}\` | Số lượng: ${cards.length}\n`;
    const divider = '━━━━━━━━━━━━━━━━━━━━';
    const lines = cards.map(c => `\`${c.number}|${c.expiry}|${c.cvv}\``).join('\n');

    const message = `${header}${divider}\n${lines}\n${divider}`;

    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// /bin <BIN>
bot.onText(/\/check(?:@\w+)?\s+(\d+)/, async (msg, match) => {
    const bin = match[1];

    const waitMsg = await bot.sendMessage(msg.chat.id, '🔍 Đang tra cứu BIN...', { parse_mode: 'Markdown' });

    // Use first 6-8 digits for lookup
    const lookupBin = bin.substring(0, Math.min(8, bin.length));
    const data = await lookupBIN(lookupBin);

    if (data.error) {
        return bot.editMessageText(`❌ ${data.error}`, {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    const scheme = data.scheme || 'Unknown';
    const type = data.type || 'N/A';
    const brand = data.brand || 'N/A';
    const prepaid = data.prepaid === true ? '✅ Yes' : data.prepaid === false ? '❌ No' : 'N/A';
    const country = data.country ? `${data.country.emoji || ''} ${data.country.name || 'N/A'}` : 'N/A';
    const bankName = data.bank?.name || 'N/A';
    const bankUrl = data.bank?.url || '';
    const bankPhone = data.bank?.phone || '';

    let info = `🔍 *Tra cứu BIN*\n━━━━━━━━━━━━━━━━━━━━\n`;
    info += `📌 BIN: \`${lookupBin}\`\n`;
    info += `💳 Thương hiệu: *${scheme.toUpperCase()}*\n`;
    info += `📋 Loại thẻ: ${type}\n`;
    info += `🏷 Hạng thẻ: ${brand}\n`;
    info += `💰 Trả trước: ${prepaid}\n`;
    info += `🌍 Quốc gia: ${country}\n`;
    info += `🏦 Ngân hàng: ${bankName}\n`;
    if (bankUrl) info += `🌐 Website: ${bankUrl}\n`;
    if (bankPhone) info += `📞 SĐT: ${bankPhone}\n`;
    info += `━━━━━━━━━━━━━━━━━━━━`;

    bot.editMessageText(info, {
        chat_id: msg.chat.id,
        message_id: waitMsg.message_id,
        parse_mode: 'Markdown',
    });
});

// Handle /gen with no args
bot.onText(/^\/gen(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu BIN prefix.\n\nCách dùng: `/gen <BIN> [số lượng] [MM|YY] [CVV]`\nVí dụ: `/gen 453201 10` hoặc `/gen 37435512226 10`',
        { parse_mode: 'Markdown' }
    );
});

// Handle /check with no args
bot.onText(/^\/check(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu số BIN.\n\nCách dùng: `/check <BIN>`\nVí dụ: `/check 453201`',
        { parse_mode: 'Markdown' }
    );
});

// /bin <BIN> - RapidAPI Advanced BIN Check
bot.onText(/\/bin(?:@\w+)?\s+(\d+)/, async (msg, match) => {
    const bin = match[1];

    const waitMsg = await bot.sendMessage(msg.chat.id, '🔍 Đang tra cứu BIN...', { parse_mode: 'Markdown' });

    const result = await checkBINAdvanced(bin);

    if (result.error) {
        return bot.editMessageText(`❌ ${result.error}`, {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    if (!result.success || !result.BIN) {
        return bot.editMessageText('❌ Không tìm thấy thông tin BIN.', {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    const b = result.BIN;
    let info = `🔍 *Tra cứu BIN (RapidAPI)*\n━━━━━━━━━━━━━━━━━━━━\n`;
    info += `📌 BIN: \`${b.number}\`\n`;
    info += `💳 Thương hiệu: *${b.scheme || 'N/A'}*\n`;
    info += `📋 Loại thẻ: ${b.type || 'N/A'}\n`;
    info += `🏷 Hạng thẻ: ${b.level || 'N/A'}\n`;
    info += `💰 Trả trước: ${b.is_prepaid === 'true' ? '✅ Yes' : '❌ No'}\n`;
    info += `🏢 Thương mại: ${b.is_commercial === 'true' ? '✅ Yes' : '❌ No'}\n`;
    info += `💵 Tiền tệ: ${b.currency || 'N/A'}\n`;
    info += `🌍 Quốc gia: ${b.country?.flag || ''} ${b.country?.name || 'N/A'}\n`;
    info += `🏦 Ngân hàng: ${b.issuer?.name || 'N/A'}\n`;
    info += `━━━━━━━━━━━━━━━━━━━━`;

    bot.editMessageText(info, {
        chat_id: msg.chat.id,
        message_id: waitMsg.message_id,
        parse_mode: 'Markdown',
    });
});

// /binip <BIN> <IP> - Check BIN with IP
bot.onText(/\/binip(?:@\w+)?\s+(\d+)\s+([\d\.]+)/, async (msg, match) => {
    const bin = match[1];
    const ip = match[2];

    const waitMsg = await bot.sendMessage(msg.chat.id, '🔍 Đang tra cứu BIN + IP...', { parse_mode: 'Markdown' });

    const result = await checkBINWithIP(bin, ip);

    if (result.error) {
        return bot.editMessageText(`❌ ${result.error}`, {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    if (!result.success) {
        return bot.editMessageText('❌ Không tìm thấy thông tin.', {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    const b = result.BIN;
    const ipData = result.IP;

    let info = `🔍 *Tra cứu BIN + IP*\n━━━━━━━━━━━━━━━━━━━━\n`;
    
    // BIN Info
    info += `\n💳 *Thông tin BIN:*\n`;
    info += `📌 BIN: \`${b.number}\`\n`;
    info += `🏷 ${b.scheme} ${b.type} ${b.level}\n`;
    info += `🌍 ${b.country?.flag} ${b.country?.name}\n`;
    info += `🏦 ${b.issuer?.name || 'N/A'}\n`;
    
    // IP Info
    info += `\n🌐 *Thông tin IP:*\n`;
    info += `📍 IP: \`${ipData.IP}\`\n`;
    info += `🌍 ${ipData.flag} ${ipData.country}\n`;
    info += `📍 ${ipData.city}, ${ipData.region}\n`;
    info += `🔒 Proxy: ${ipData.is_proxy ? '⚠️ Yes' : '✅ No'}\n`;
    info += `🏢 ISP: ${ipData.isp}\n`;
    
    // Match Status
    info += `\n${ipData.IP_BIN_match ? '✅' : '❌'} ${ipData.IP_BIN_match_message || 'N/A'}\n`;
    info += `━━━━━━━━━━━━━━━━━━━━`;

    bot.editMessageText(info, {
        chat_id: msg.chat.id,
        message_id: waitMsg.message_id,
        parse_mode: 'Markdown',
    });
});

// /ip <IP> - IP Lookup
bot.onText(/\/ip(?:@\w+)?\s+([\d\.]+)/, async (msg, match) => {
    const ip = match[1];

    const waitMsg = await bot.sendMessage(msg.chat.id, '🔍 Đang tra cứu IP...', { parse_mode: 'Markdown' });

    const result = await checkIP(ip);

    if (result.error) {
        return bot.editMessageText(`❌ ${result.error}`, {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    if (!result.success || !result.IP) {
        return bot.editMessageText('❌ Không tìm thấy thông tin IP.', {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    const ipData = result.IP;
    let info = `🔍 *Tra cứu IP*\n━━━━━━━━━━━━━━━━━━━━\n`;
    info += `📍 IP: \`${ipData.IP}\`\n`;
    info += `🌍 Quốc gia: ${ipData.flag} ${ipData.country}\n`;
    info += `📍 Vị trí: ${ipData.city}, ${ipData.region}\n`;
    info += `📮 Zip: ${ipData.zip_code}\n`;
    info += `🕐 Múi giờ: ${ipData.time_zone}\n`;
    info += `🔒 Proxy: ${ipData.is_proxy ? '⚠️ Yes' : '✅ No'}\n`;
    info += `🏢 ISP: ${ipData.isp}\n`;
    info += `🔢 ASN: ${ipData.asn}\n`;
    
    if (ipData.proxy && ipData.is_proxy) {
        info += `\n⚠️ *Chi tiết Proxy:*\n`;
        info += `📌 Loại: ${ipData.proxy.type}\n`;
        info += `🌐 Domain: ${ipData.proxy.domain}\n`;
        info += `📊 Usage: ${ipData.proxy.usage_type}\n`;
    }
    
    info += `━━━━━━━━━━━━━━━━━━━━`;

    bot.editMessageText(info, {
        chat_id: msg.chat.id,
        message_id: waitMsg.message_id,
        parse_mode: 'Markdown',
    });
});

// Handle /bin with no args
bot.onText(/^\/bin(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu số BIN.\n\nCách dùng: `/bin <BIN>`\nVí dụ: `/bin 448590`',
        { parse_mode: 'Markdown' }
    );
});

// Handle /binip with no args
bot.onText(/^\/binip(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu thông tin.\n\nCách dùng: `/binip <BIN> <IP>`\nVí dụ: `/binip 448590 2.56.188.79`',
        { parse_mode: 'Markdown' }
    );
});

// Handle /ip with no args
bot.onText(/^\/ip(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu địa chỉ IP.\n\nCách dùng: `/ip <IP>`\nVí dụ: `/ip 2.56.188.79`',
        { parse_mode: 'Markdown' }
    );
});

// ==================== STARTUP ====================
bot.setMyCommands([
    { command: 'start', description: 'Hướng dẫn sử dụng bot' },
    { command: 'gen', description: 'Tạo số thẻ từ BIN prefix' },
    { command: 'check', description: 'Tra cứu thông tin BIN (binlist.net)' },
    { command: 'bin', description: 'Tra cứu BIN chi tiết (RapidAPI)' },
    { command: 'binip', description: 'Kiểm tra BIN + IP' },
    { command: 'ip', description: 'Tra cứu thông tin IP' },
]);

console.log('🤖 BIN Bot is running...');

// ==================== HEALTH CHECK API ====================
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        if (req.method === 'HEAD' || req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            if (req.method === 'GET') {
                res.end(JSON.stringify({ status: 'ok', bot: 'running', uptime: process.uptime() }));
            } else {
                res.end();
            }
        } else {
            res.writeHead(405);
            res.end();
        }
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`✅ Health check API running on port ${PORT}`);
});
