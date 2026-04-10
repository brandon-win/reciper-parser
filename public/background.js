function getAuthToken(sendResponse) {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
    console.log({token})
    sendResponse({ token: token });

    if (chrome.runtime.lastError || !token) {
        sendResponse({ error: "Auth failed" });
        return;
    }
    sendResponse({ token: token });
    });
    return true; // Keeps the message channel open for async response

}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === 'getAuthToken') {
        getAuthToken(sendResponse)
    }

    if (request.action === 'hello') {
        sendResponse('world')
    }
})

