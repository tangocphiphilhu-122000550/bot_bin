require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

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

// ==================== COMMANDS ====================

// /start
bot.onText(/\/start/, (msg) => {
    const welcome = `
💳 *BIN Generator Bot*

Các lệnh hỗ trợ:

🔹 \`/gen <BIN>\` — Tạo 10 thẻ ngẫu nhiên
🔹 \`/gen <BIN> <số lượng>\` — Tạo theo số lượng
🔹 \`/gen <BIN> <số lượng> <MM|YY> <CVV>\` — Cố định ngày hết hạn & CVV
🔹 \`/check <BIN>\` — Tra cứu thông tin BIN

*Ví dụ:*
\`/gen 453201\`
\`/gen 453201 20\`
\`/gen 453201 10 05|28 123\`
\`/check 453201\`
    `.trim();

    bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
});

// /gen <BIN> [qty] [MM|YY] [CVV]
bot.onText(/\/gen(?:@\w+)?\s+(.+)/, (msg, match) => {
    const args = match[1].trim().split(/\s+/);
    const bin = args[0].replace(/\D/g, '');

    // Validate BIN
    if (bin.length < 6 || bin.length > 8) {
        return bot.sendMessage(msg.chat.id, '❌ BIN phải từ 6-8 chữ số.', { parse_mode: 'Markdown' });
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
bot.onText(/\/check(?:@\w+)?\s+(\d{6,8})/, async (msg, match) => {
    const bin = match[1];

    const waitMsg = await bot.sendMessage(msg.chat.id, '🔍 Đang tra cứu BIN...', { parse_mode: 'Markdown' });

    const data = await lookupBIN(bin);

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
    info += `📌 BIN: \`${bin}\`\n`;
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
        '❌ Thiếu BIN prefix.\n\nCách dùng: `/gen <BIN> [số lượng] [MM|YY] [CVV]`\nVí dụ: `/gen 453201 10`',
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

// ==================== STARTUP ====================
bot.setMyCommands([
    { command: 'start', description: 'Hướng dẫn sử dụng bot' },
    { command: 'gen', description: 'Tạo số thẻ từ BIN prefix' },
    { command: 'check', description: 'Tra cứu thông tin BIN' },
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
