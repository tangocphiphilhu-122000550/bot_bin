require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const cheerio = require('cheerio');
const { COUNTRIES, generateFakeInfo } = require('./countries');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Store generated cards temporarily for check live feature
const generatedCardsStore = new Map();

// Check Live API config
const CHECK_LIVE_URL = 'https://sxglrllialxihqowmqwh.supabase.co/functions/v1/check-card';
const CHECK_LIVE_APIKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z2xybGxpYWx4aWhxb3dtcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjE2NjQsImV4cCI6MjA4MzY5NzY2NH0.mCivzbRAqNkJ1BA8ag4mt6vHlUjV5lWUguhGb4mmKc0';

// ==================== UTILS ====================

function luhnGenerate(prefix, length) {
    const digits = prefix.split('').map(Number);
    while (digits.length < length - 1) {
        digits.push(Math.floor(Math.random() * 10));
    }
    let sum = 0;
    let isEven = true;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];
        if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
        sum += digit;
        isEven = !isEven;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return [...digits, checkDigit].join('');
}

function resolveWildcard(bin) {
    // Replace each 'x' or 'X' with a random digit
    return bin.replace(/x/gi, () => String(Math.floor(Math.random() * 10)));
}

function isAmex(bin) {
    const clean = bin.replace(/x/gi, '0'); // resolve for prefix check
    return clean.startsWith('34') || clean.startsWith('37');
}

function generateCards(binInput, count = 10, fixedMonth = '', fixedYear = '', fixedCVV = '') {
    const cards = [];
    const seen = new Set();
    const amex = isAmex(binInput);
    const cardLength = amex ? 15 : 16;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let attempts = 0;
    while (cards.length < count && attempts < count * 20) {
        // Resolve wildcard x for each card
        const resolvedBin = resolveWildcard(binInput);
        const cardNumber = luhnGenerate(resolvedBin, cardLength);

        if (!seen.has(cardNumber)) {
            seen.add(cardNumber);

            // Generate expiry
            let expYear, expMonth;
            if (fixedYear) {
                expYear = parseInt(fixedYear, 10);
            } else {
                expYear = currentYear + Math.floor(Math.random() * 6);
            }

            if (fixedMonth) {
                expMonth = parseInt(fixedMonth, 10);
                // If fixed month is in the past for current year, bump year
                if (expYear === currentYear && expMonth < currentMonth) {
                    expYear += 1;
                }
            } else {
                if (expYear === currentYear) {
                    // Only generate months from current month onwards
                    expMonth = currentMonth + Math.floor(Math.random() * (13 - currentMonth));
                } else {
                    expMonth = 1 + Math.floor(Math.random() * 12);
                }
            }

            // Generate CVV (4 digits for AMEX, 3 for others)
            let cardCvv;
            if (fixedCVV) {
                cardCvv = fixedCVV;
            } else {
                cardCvv = amex
                    ? String(Math.floor(Math.random() * 9000) + 1000)
                    : String(Math.floor(Math.random() * 900) + 100);
            }

            cards.push({
                number: cardNumber,
                expiry: `${String(expMonth).padStart(2, '0')}|${expYear}`,
                cvv: cardCvv,
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
🔹 \`/gen <BIN> <số lượng> <MM|YYYY> <CVV>\` — Cố định expiry & CVV
🔹 \`/check <BIN>\` — Tra cứu thông tin BIN
🔹 \`/info <country>\` — Gen thông tin giả theo quốc gia
🔹 \`/info list\` — Xem danh sách quốc gia

*Hỗ trợ:* Wildcard \`x\` trong BIN, AMEX (15 số, CVV 4 chữ số)

*Ví dụ:*
\`/gen 453201\`
\`/gen 4532xx 20\`
\`/gen 374355 10 06|2028 1234\`
\`/check 453201\`
\`/info United States\`
    `.trim();

    bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
});

// /gen <BIN> [qty] [MM|YYYY] [CVV]
bot.onText(/\/gen(?:@\w+)?\s+(.+)/, (msg, match) => {
    const args = match[1].trim().split(/\s+/);
    // Allow digits and 'x' wildcard
    const bin = args[0].replace(/[^0-9xX]/g, '');

    // Validate BIN
    if (bin.length < 6 || bin.length > 16) {
        return bot.sendMessage(msg.chat.id, '❌ BIN phải từ 6-16 ký tự (số hoặc x).', { parse_mode: 'Markdown' });
    }

    // Parse quantity
    let qty = 10;
    if (args[1]) {
        qty = parseInt(args[1], 10);
        if (isNaN(qty) || qty < 1) qty = 10;
    }

    // Parse fixed expiry (MM|YYYY or MM|YY)
    let fixedMonth = '';
    let fixedYear = '';
    if (args[2]) {
        const expMatch = args[2].match(/^(\d{2})\|(\d{2,4})$/);
        if (expMatch) {
            const month = parseInt(expMatch[1], 10);
            if (month >= 1 && month <= 12) {
                fixedMonth = expMatch[1];
                // Support both YY and YYYY
                fixedYear = expMatch[2].length === 2 ? `20${expMatch[2]}` : expMatch[2];
            }
        }
    }

    // Parse fixed CVV (3 or 4 digits for AMEX)
    let fixedCVV = '';
    if (args[3] && /^\d{3,4}$/.test(args[3])) {
        fixedCVV = args[3];
    }

    // Generate cards
    const cards = generateCards(bin, qty, fixedMonth, fixedYear, fixedCVV);

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

// /info <country> - Generate fake address info
bot.onText(/\/info(?:@\w+)?\s+(.+)/, (msg, match) => {
    const input = match[1].trim();

    // Show country list
    if (input.toLowerCase() === 'list') {
        const countryList = Object.keys(COUNTRIES).sort();
        const columns = [];
        for (let i = 0; i < countryList.length; i += 2) {
            const row = countryList[i] + (countryList[i + 1] ? `  |  ${countryList[i + 1]}` : '');
            columns.push(row);
        }
        const msg_text = `🌍 *Danh sách quốc gia hỗ trợ:*\n━━━━━━━━━━━━━━━━━━━━\n\`\`\`\n${columns.join('\n')}\n\`\`\`\n\nDùng: \`/info <tên quốc gia>\``;
        return bot.sendMessage(msg.chat.id, msg_text, { parse_mode: 'Markdown' });
    }

    // Find country (case-insensitive partial match)
    const countryName = Object.keys(COUNTRIES).find(
        c => c.toLowerCase() === input.toLowerCase()
    ) || Object.keys(COUNTRIES).find(
        c => c.toLowerCase().includes(input.toLowerCase())
    );

    if (!countryName) {
        return bot.sendMessage(msg.chat.id,
            `❌ Không tìm thấy quốc gia "${input}".\n\nDùng \`/info list\` để xem danh sách.`,
            { parse_mode: 'Markdown' }
        );
    }

    const data = generateFakeInfo(countryName, COUNTRIES[countryName]);

    let info = `🌍 *Fake Info — ${countryName}*\n━━━━━━━━━━━━━━━━━━━━\n`;
    info += `👤 Tên: \`${data.firstName} ${data.lastName}\`\n`;
    info += `🏠 Địa chỉ: \`${data.street}\`\n`;
    info += `🏙 Thành phố: \`${data.city}\`\n`;
    info += `📍 Bang/Tỉnh: \`${data.state}\`\n`;
    info += `📮 ZIP: \`${data.zip}\`\n`;
    info += `📞 SĐT: \`${data.phone}\`\n`;
    info += `📧 Email: \`${data.email}\`\n`;
    info += `━━━━━━━━━━━━━━━━━━━━`;

    bot.sendMessage(msg.chat.id, info, { parse_mode: 'Markdown' });
});

// Handle /info with no args
bot.onText(/^\/info(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
        '❌ Thiếu tên quốc gia.\n\nCách dùng: `/info <country>`\nVí dụ: `/info United States`\n\nXem danh sách: `/info list`',
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
        // Format: number|month|year|cvv (expiry is already MM|YYYY)
        const cardString = `${c.number}|${c.expiry}|${c.cvv}`;

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
    { command: 'info', description: 'Gen thông tin giả theo quốc gia' },
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
