/* =====================================================================
   chatbot.js - AI support co-pilot floating assistant
   ===================================================================== */

function toggleBot() {
    document.getElementById('chatbot-window').classList.toggle('hidden');
}

function handleBotQuery(e) {
    e.preventDefault();
    const input = document.getElementById('bot-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendChatMessage(msg, 'user');
    input.value = '';

    setTimeout(() => {
        const lMsg = msg.toLowerCase();
        let reply = "Greetings! I am scanning registered media parameters. To get your uniform, send $15 USD to Robin Mawaro on +263772719284 via EcoCash USD.";

        if (lMsg.includes('payment') || lMsg.includes('robin') || lMsg.includes('ecocash') || lMsg.includes('money') || lMsg.includes('regalia')) {
            reply = "To secure your CTF 2026 Crew Regalia, transfer $15 USD directly to our administrator Robin Mawaro (+263 772 719 284) via EcoCash, then upload your transaction reference on step 3 of the registration form.";
        } else if (lMsg.includes('transport') || lMsg.includes('bus') || lMsg.includes('ride')) {
            reply = "The Media transport bus will leave the Main Chapel on August 24 at 06:00 AM sharp. Please select 'I need transport' during registration to secure your seat.";
        } else if (lMsg.includes('gadget') || lMsg.includes('camera') || lMsg.includes('serial')) {
            reply = "All camera gear, laptop processors, and audio rigs must have model and serial tags registered in step 2. This guarantees immediate access clearing tags at Richland City.";
        } else if (lMsg.includes('approve') || lMsg.includes('hod') || lMsg.includes('reassign')) {
            reply = "Once registration is complete, your HOD can approve or reassign your sector. Any action automatically dispatches a system confirmation directly to your logged inbox.";
        }

        appendChatMessage(reply, 'bot');
    }, 450);
}

/* Append a bubble to the conversation body using the reusable component */
function appendChatMessage(text, sender) {
    const body = document.getElementById('chatbot-body');
    body.appendChild(renderChatBubble(text, sender));
    body.scrollTop = body.scrollHeight;
}
