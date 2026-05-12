require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const cheerio = require('cheerio');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Store generated cards temporarily for check live feature
const generatedCardsStore = new Map();

// Check Live API config
const CHECK_LIVE_URL = 'https://sxglrllialxihqowmqwh.supabase.co/functions/v1/check-card';
const CHECK_LIVE_APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z2xybGxpYWx4aWhxb3dtcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjE2NjQsImV4cCI6MjA4MzY5NzY2NH0.mCivzbRAqNkJ1BA8ag4mt6vHlUjV5lWUguhGb4mmKc0';

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
        const res = await fetch(`https://bincheck.io/vi/details/${bin}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'vi,en-US;q=0.7,en;q=0.3',
            },
        });
        if (!res.ok) {
            if (res.status === 404) return { error: 'Không tìm thấy BIN.' };
            if (res.status === 429) return { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' };
            return { error: 'Tra cứu thất bại.' };
        }
        const html = await res.text();
        const $ = cheerio.load(html);

        // Extract from meta description: "Con số này: 415464 là một số BIN hợp lệ VISA Do KHALEEJI BANK B.S.C trong BAHRAIN"
        const description = $('meta[name="description"]').attr('content') || '';
        
        // Parse description pattern: "... là một số BIN hợp lệ {SCHEME} Do {BANK} trong {COUNTRY}"
        const descMatch = description.match(/là một số BIN hợp lệ\s+(.+?)\s+Do\s+(.+?)\s+trong\s+(.+)/i);
        
        let scheme = 'N/A';
        let bankName = 'N/A';
        let country = 'N/A';

        if (descMatch) {
            scheme = descMatch[1].trim() || 'N/A';
            bankName = descMatch[2].trim() || 'N/A';
            country = descMatch[3].trim() || 'N/A';
        }

        // If all fields are empty or title indicates not found, return error
        const title = $('title').text() || '';
        if (!descMatch || (scheme === 'N/A' && bankName === 'N/A' && country === 'N/A') || title.includes('không được tìm thấy')) {
            return { error: 'Không tìm thấy BIN trong cơ sở dữ liệu.' };
        }

        return { scheme, bankName, country };
    } catch {
        return { error: 'Dịch vụ không khả dụng.' };
    }
}

async function checkCardLive(cardString) {
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
            body: JSON.stringify({ card: cardString }),
        });
        if (!res.ok) return { status: 'Error', message: `HTTP ${res.status}` };
        return await res.json();
    } catch {
        return { status: 'Error', message: 'Không thể kết nối API.' };
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
\`/gen 37435512226 20\`
\`/check 453201\`
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

    // Generate unique ID and store cards for check live
    const storeId = `${msg.chat.id}_${Date.now()}`;
    generatedCardsStore.set(storeId, cards);

    // Auto-cleanup after 10 minutes
    setTimeout(() => generatedCardsStore.delete(storeId), 10 * 60 * 1000);

    bot.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⚡ Check Live', callback_data: `checklive_${storeId}` }]
            ]
        }
    });
});

// Handle /gen with no args
bot.onText(/^\/gen(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu BIN prefix.\n\nCách dùng: `/gen <BIN> [số lượng] [MM|YY] [CVV]`\nVí dụ: `/gen 453201 10` hoặc `/gen 37435512226 10`',
        { parse_mode: 'Markdown' }
    );
});

// /check <BIN> - BIN lookup using bincheck.io
bot.onText(/\/check(?:@\w+)?\s+(\d+)/, async (msg, match) => {
    const bin = match[1];

    const waitMsg = await bot.sendMessage(msg.chat.id, '🔍 Đang tra cứu BIN...', { parse_mode: 'Markdown' });

    const lookupBin = bin.substring(0, Math.min(8, bin.length));
    const data = await lookupBIN(lookupBin);

    if (data.error) {
        return bot.editMessageText(`❌ ${data.error}`, {
            chat_id: msg.chat.id,
            message_id: waitMsg.message_id,
        });
    }

    let info = `🔍 *Tra cứu BIN*\n━━━━━━━━━━━━━━━━━━━━\n`;
    info += `📌 BIN: \`${lookupBin}\`\n`;
    info += `💳 Thương hiệu: *${data.scheme}*\n`;
    info += `🌍 Quốc gia: ${data.country}\n`;
    info += `🏦 Ngân hàng: ${data.bankName}\n`;
    info += `━━━━━━━━━━━━━━━━━━━━`;

    bot.editMessageText(info, {
        chat_id: msg.chat.id,
        message_id: waitMsg.message_id,
        parse_mode: 'Markdown',
    });
});

// Handle /check with no args
bot.onText(/^\/check(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu số BIN.\n\nCách dùng: `/check <BIN>`\nVí dụ: `/check 453201`',
        { parse_mode: 'Markdown' }
    );
});

// ==================== CHECK LIVE CALLBACK ====================
bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;

    if (!data.startsWith('checklive_')) return;

    const storeId = data.replace('checklive_', '');
    const cards = generatedCardsStore.get(storeId);

    if (!cards) {
        return bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Dữ liệu đã hết hạn. Vui lòng /gen lại.', show_alert: true });
    }

    // Remove the button after clicking
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
    bot.answerCallbackQuery(callbackQuery.id, { text: '⚡ Đang check live...' });

    // Send initial status message
    const statusMsg = await bot.sendMessage(chatId, '⏳ *Đang kiểm tra cards...*\n\n`0/' + cards.length + '` đã check', { parse_mode: 'Markdown' });

    let liveCards = [];
    let deadCards = [];
    let errorCards = [];

    for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        // Format: number|month|year|cvv
        const [month, year] = c.expiry.split('|');
        const cardString = `${c.number}|${month}|20${year}|${c.cvv}`;

        const result = await checkCardLive(cardString);

        if (result.status === 'Live') {
            liveCards.push({ card: cardString, message: result.message });
            console.log(`✅ [${i + 1}/${cards.length}] LIVE: ${cardString}`);
        } else if (result.status === 'Dead') {
            deadCards.push({ card: cardString, message: result.message });
            console.log(`❌ [${i + 1}/${cards.length}] DEAD: ${cardString}`);
        } else {
            errorCards.push({ card: cardString, message: result.message });
            console.log(`⚠️ [${i + 1}/${cards.length}] ERROR: ${cardString} - ${result.message}`);
        }

        // Update progress every card
        const progress = `⏳ *Đang kiểm tra cards...*\n\n\`${i + 1}/${cards.length}\` đã check\n✅ Live: ${liveCards.length} | ❌ Dead: ${deadCards.length}`;
        bot.editMessageText(progress, {
            chat_id: chatId,
            message_id: statusMsg.message_id,
            parse_mode: 'Markdown',
        }).catch(() => {});

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final result
    let finalMsg = `⚡ *Kết quả Check Live*\n━━━━━━━━━━━━━━━━━━━━\n`;
    finalMsg += `📊 Tổng: ${cards.length} | ✅ Live: ${liveCards.length} | ❌ Dead: ${deadCards.length}\n`;
    finalMsg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (liveCards.length > 0) {
        finalMsg += `✅ *LIVE CARDS:*\n`;
        liveCards.forEach(c => {
            finalMsg += `\`${c.card}\`\n`;
        });
        finalMsg += `\n`;
    }

    if (deadCards.length > 0) {
        finalMsg += `❌ *DEAD CARDS:*\n`;
        deadCards.forEach(c => {
            finalMsg += `\`${c.card}\`\n`;
        });
    }

    bot.editMessageText(finalMsg, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
        parse_mode: 'Markdown',
    }).catch(() => {});

    // Cleanup
    generatedCardsStore.delete(storeId);
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
