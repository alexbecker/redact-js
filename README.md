redact-js
=========

Securely redact HTML documents, while allowing authorized users to view redacted information.
Supports nested redaction, with inner redactions using separate passwords.

Install
-------

`npm install redact`

Usage
-----

To redact an HTML file, run:

`./redact <infile> <password1> [<password2> <password3> ...] [--aes <filepath>]`

At least as many passwords must be supplied as the highest level of nested redactions.
The --aes flag allows you to specify an AES library to use on the client-side when decrypting
redacted data, which defaults to a Google Code repository. It is highly recommended that
you host your own copy of this library and use the --aes flag to point to it.

API
---

An `unredact` function will be defined in the HTML file, which takes a password and attempts
to decrypt the outermost level of redaction.

Example
-------

The file `example.html` was created by running:

`./redact example.raw.html password password2 > example.html`

It includes a form which on submission calls `unredact`. Try it using "password", and then using "password2"!
