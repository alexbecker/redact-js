#!/usr/bin/nodejs

var fs = require("fs");
var aes = require("crypto-js/aes");
var sha256 = require("crypto-js/sha256");
var jsdom = require("jsdom");

function redact(node, passwords, iv) {
    var childToRedact = node.querySelector("span.redact");
    if (childToRedact !== null) {
        redact(childToRedact, passwords.slice(1), iv);

        childToRedact.setAttribute("data-iv", iv.toString(16));
        childToRedact.innerHTML = aes.encrypt(childToRedact.innerHTML, passwords[0], {'iv': iv});
        childToRedact.className = childToRedact.className.replace(/(?:^|\s)redact(?!\S)/g, " redacted ");

        redact(node, passwords, iv + 1);
    }
}

function injectDependencies(doc) {
    var head = doc.getElementsByTagName("head")[0];

    var style = doc.createElement("style");
    style.innerHTML = fs.readFileSync("redact.css").toString();
    head.appendChild(style);

    var unredact = doc.createElement("script");
    unredact.innerHTML = fs.readFileSync("unredact.js").toString();
    head.appendChild(unredact);

    var decrypt = doc.createElement("script");
    decrypt.setAttribute("src", client_side_aes);
    head.appendChild(decrypt);
}

var argv = require("minimist")(process.argv.slice(2));
var infile = argv._[0];
var passwords = argv._.slice(1);
var client_side_aes = argv.aes || "https://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/aes.js";

var raw = fs.readFileSync(infile).toString();
var hash = sha256(raw).toString();
var iv = parseInt(hash.substring(0,8), 16);

jsdom.env(
    raw,
    function (err, window) {
        redact(window.document, passwords, iv);
        injectDependencies(window.document);
        process.stdout.write(window.document.documentElement.outerHTML);
    }
);
