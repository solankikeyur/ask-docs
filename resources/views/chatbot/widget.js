(function() {
    const chatbotId = '__CHATBOT_ID__';
    const apiUrl = '/api/chat/' + chatbotId;
    const widgetId = 'ask-docs-chatbot-widget';
    const openButtonId = 'ask-docs-chatbot-open-btn';
    const panelId = 'ask-docs-chatbot-panel';
    const messagesId = 'ask-docs-chatbot-messages';
    const inputId = 'ask-docs-chatbot-input';
    const sendBtnId = 'ask-docs-chatbot-send-btn';
    const closeBtnId = 'ask-docs-chatbot-close-btn';

    if (document.getElementById(widgetId)) {
        return;
    }

    // Load Marked.js library for proper markdown rendering
    function loadMarked() {
        return new Promise((resolve, reject) => {
            if (window.marked) {
                resolve(window.marked);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked@12.0.0/lib/marked.umd.js';
            script.onload = () => {
                window.marked.setOptions({
                    breaks: true,
                    gfm: true,
                    headerIds: false,
                    mangle: false
                });
                resolve(window.marked);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    let markedInstance = null;
    function renderMarkdown(text) {
        if (!text) return '';
        if (!markedInstance) {
            const newline = String.fromCharCode(10);
            return text.split(newline).join('<br>');
        }
        return markedInstance.parse(text);
    }

    const style = document.createElement('style');
    style.textContent = `__WIDGET_CSS__`;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = widgetId;

    // SVG Icons
    const chatIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`;
    const botIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
    const sendIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
    const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    widget.innerHTML = `
        <button id="${openButtonId}" aria-label="Open chat">
            ${chatIcon}
        </button>
        <div id="${panelId}">
            <div class="header">
                <div class="title-area">
                    <div class="bot-avatar">${botIcon}</div>
                    <div>
                        <div class="title">__CHATBOT_NAME__</div>
                        <div class="subtitle">Ask questions about your documents</div>
                    </div>
                </div>
                <button id="${closeBtnId}" class="close-btn" aria-label="Close chat">${closeIcon}</button>
            </div>
            <div class="body">
                <div id="${messagesId}"></div>
                <div class="bottom-area">
                    <div class="input-row">
                        <input id="${inputId}" type="text" placeholder="Type your message..." autocomplete="off" />
                        <button id="${sendBtnId}" type="button" aria-label="Send message">${sendIcon}</button>
                    </div>
                    <div class="footer">Powered by AskDocs</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(widget);

    const openButton = document.getElementById(openButtonId);
    const panel = document.getElementById(panelId);
    const closeBtn = document.getElementById(closeBtnId);
    const messagesDiv = document.getElementById(messagesId);
    const input = document.getElementById(inputId);
    const sendBtn = document.getElementById(sendBtnId);
    let sessionId = localStorage.getItem('chatbot-session-' + chatbotId) || null;

    function scrollToBottom() {
        if (messagesDiv) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    function openPanel() {
        if (panel) {
            panel.classList.add('open');
            input.focus();
            scrollToBottom();

            if (!markedInstance) {
                loadMarked().then(marked => {
                    markedInstance = marked;
                    const assistantMessages = messagesDiv.querySelectorAll('.message-wrapper.assistant .message');
                    assistantMessages.forEach(msg => {
                        const text = msg.dataset.raw || msg.textContent || msg.innerText;
                        if (text && !msg.querySelector('.typing-indicator')) {
                            msg.innerHTML = renderMarkdown(text);
                            msg.dataset.raw = text;
                        }
                    });
                }).catch(err => console.warn('Failed to load markdown:', err));
            }
        }
    }

    function closePanel() {
        if (panel) {
            panel.classList.remove('open');
        }
    }

    function getTypingIndicatorHtml() {
        return '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    }

    function addMessage(role, content, isHtml = false) {
        if (!messagesDiv) return null;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper ' + role;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        
        if (isHtml) {
            msgDiv.innerHTML = content;
        } else if (role === 'assistant') {
            msgDiv.innerHTML = renderMarkdown(content);
            msgDiv.dataset.raw = content;
        } else {
            msgDiv.textContent = content;
        }

        wrapper.appendChild(msgDiv);
        messagesDiv.appendChild(wrapper);
        scrollToBottom();
        
        return msgDiv;
    }

    function sendMessage() {
        if (!input || !messagesDiv) return;
        const message = input.value.trim();
        if (!message) return;
        
        input.value = '';
        addMessage('user', message);

        const typingMsgDiv = addMessage('assistant', getTypingIndicatorHtml(), true);

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        }).then(response => {
            if (!response.ok) {
                typingMsgDiv.innerHTML = 'Sorry, something went wrong.';
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let networkText = '';
            let displayedText = '';
            let typingIndex = 0;
            let isTypingAnimRunning = false;
            let isStreamDone = false;

            const responseSessionId = response.headers.get('X-Session-Id');
            if (responseSessionId) {
                sessionId = responseSessionId;
                localStorage.setItem('chatbot-session-' + chatbotId, sessionId);
            }

            function processQueue() {
                if (typingIndex < networkText.length) {
                    isTypingAnimRunning = true;
                    let charsToAdd = Math.max(1, Math.ceil((networkText.length - typingIndex) / 3));
                    displayedText += networkText.substring(typingIndex, typingIndex + charsToAdd);
                    typingIndex += charsToAdd;
                    
                    typingMsgDiv.innerHTML = renderMarkdown(displayedText);
                    typingMsgDiv.dataset.raw = displayedText;
                    scrollToBottom();
                    
                    setTimeout(processQueue, 30);
                } else {
                    isTypingAnimRunning = false;
                    if (isStreamDone) {
                        if (!networkText) {
                            typingMsgDiv.innerHTML = 'No answer received.';
                        } else if (displayedText !== networkText) {
                            typingMsgDiv.innerHTML = renderMarkdown(networkText);
                            typingMsgDiv.dataset.raw = networkText;
                        }
                        scrollToBottom();
                    }
                }
            }

            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        isStreamDone = true;
                        networkText += decoder.decode();
                        if (!isTypingAnimRunning && typingIndex < networkText.length) {
                            processQueue();
                        } else if (!isTypingAnimRunning && typingIndex === networkText.length) {
                            if (!networkText) {
                                typingMsgDiv.innerHTML = 'No answer received.';
                            }
                            scrollToBottom();
                        }
                        return;
                    }
                    networkText += decoder.decode(value, { stream: true });
                    if (!isTypingAnimRunning) {
                        processQueue();
                    }
                    read();
                }).catch(() => {
                    typingMsgDiv.innerHTML = 'Sorry, something went wrong.';
                });
            }
            read();
        }).catch(() => {
            typingMsgDiv.innerHTML = 'Sorry, something went wrong.';
        });
    }

    openButton.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // Close on outside click is optional but good UX
    // But since it's a floating widget, user might want to keep it open while clicking around.
})();
