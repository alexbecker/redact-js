function unredact(password) {
    var redactedNodes = document.querySelectorAll("span.redacted");
    for (var i=0; i<redactedNodes.length; i++) {
        var redacted = redactedNodes[i];
        redacted.innerHTML = CryptoJS.AES.decrypt(redacted.innerHTML, password).toString(CryptoJS.enc.Utf8);
        redacted.className = redacted.className.replace(/(?:^|\s)redacted(?!\S)/g, " redact ");
    }
}
