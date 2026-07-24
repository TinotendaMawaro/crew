/* =====================================================================
   components/chatBubble.js
   Reusable chat bubble for the AI support assistant.
   Returns a DOM element consumed by the chatbot conversation body.
   ===================================================================== */

function renderChatBubble(text, sender) {
    const wrapper = document.createElement('div');
    wrapper.className = "flex items-start gap-2.5 " + (sender === 'user' ? 'justify-end' : '');

    if (sender === 'bot') {
        wrapper.innerHTML = `
            <div class="h-6 w-6 rounded-full bg-brand-indigo flex items-center justify-center text-[10px] text-white shrink-0 font-bold">AI</div>
            <div class="bg-brand-indigo/10 p-3 rounded-2xl rounded-tl-none border border-brand-indigo/30 text-gray-300 max-w-[85%] leading-relaxed">
                ${text}
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <div class="bg-brand-cyan/20 p-3 rounded-2xl rounded-tr-none border border-brand-cyan/30 text-white max-w-[85%] leading-relaxed shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                ${text}
            </div>
            <div class="h-6 w-6 rounded-full bg-brand-cyan flex items-center justify-center text-[10px] text-black shrink-0 font-bold">ME</div>
        `;
    }

    return wrapper;
}
