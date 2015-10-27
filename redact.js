#!/usr/bin/nodejs

var fs = require("fs");
var aes = require("crypto-js/aes");
var jsdom = require("jsdom");

function redact(node, passwords) {
    var childToRedact = node.querySelector("span.redact");
    if (childToRedact !== null) {
        redact(childToRedact, passwords.slice(1));

        childToRedact.innerHTML = aes.encrypt(childToRedact.innerHTML, passwords[0]);
        childToRedact.className = childToRedact.className.replace(/(?:^|\s)redact(?!\S)/g, " redacted ");

        redact(node, passwords);
    }
}

var infile = process.argv[2];
var passwords = process.argv.slice(3);

var raw = fs.readFileSync(infile).toString();
jsdom.env(
    raw,
    function (err, window) {
        redact(window.document, passwords);
        process.stdout.write(window.document.documentElement.outerHTML);
    }
);
