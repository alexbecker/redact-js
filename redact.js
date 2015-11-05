#!/usr/bin/nodejs

var fs = require("fs");
var aes = require("crypto-js/aes");
var jsdom = require("jsdom");

var argv = require("minimist")(process.argv.slice(2));
var infile = argv._[0];
var passwords = argv._.slice(1);
var client_side_aes = argv.aes || "https://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/aes.js";

function redact(node, passwords) {
    var childToRedact = node.querySelector("span.redact");
    if (childToRedact !== null) {
        redact(childToRedact, passwords.slice(1));

        childToRedact.innerHTML = aes.encrypt(childToRedact.innerHTML, passwords[0]);
        childToRedact.className = childToRedact.className.replace(/(?:^|\s)redact(?!\S)/g, " redacted ");

        redact(node, passwords);
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

var raw = fs.readFileSync(infile).toString();
jsdom.env(
    raw,
    function (err, window) {
        redact(window.document, passwords);
        injectDependencies(window.document);
        process.stdout.write(window.document.documentElement.outerHTML);
    }
);
