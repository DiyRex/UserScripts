// ==UserScript==
// @name         Proxmox Paste
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Proper paste with correct timing
// @match        https://zcloud-sg.zuselab.dev/*
// @match        https://*.zuselab.dev/*
// @grant        none
// @run-at       document-end
// @Author       DiyRex
// ==/UserScript==

(function() {
    'use strict';

    console.log("🚀 Proxmox Paste Script v4.0 LOADED");

    // ADJUST THIS if typing is still too fast or too slow
    const TYPING_DELAY = 25; // milliseconds between each character (increase if issues persist)

    let canvas = null;
    let initialized = false;

    function findCanvas() {
        canvas = document.getElementById("canvas-id");
        if (canvas) {
            console.log("✓ Found canvas");
            return true;
        }

        const canvases = document.querySelectorAll('canvas');
        if (canvases.length > 0) {
            canvas = canvases[0];
            console.log("✓ Found canvas (fallback)");
            return true;
        }

        return false;
    }

    function init() {
        if (initialized) return;

        if (!findCanvas()) {
            setTimeout(init, 500);
            return;
        }

        initialized = true;
        setupPaste();
    }

    function setupPaste() {
        console.log("🎯 Setting up paste...");

        // Right-click paste
        canvas.addEventListener("contextmenu", function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("👆 RIGHT CLICK");
            pasteFromClipboard();
            return false;
        }, true);

        // Visual confirmation
        canvas.style.outline = "3px solid lime";
        setTimeout(() => canvas.style.outline = "", 1500);

        console.log("✅ READY! Right-click to paste");
    }

    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();

            if (!text) {
                console.warn("⚠️ Clipboard empty");
                return;
            }

            console.log("📋 Pasting " + text.length + " characters");
            typeTextProperly(text);

        } catch (error) {
            console.error("❌ Error:", error);
            alert("Please allow clipboard access:\n1. Click lock icon 🔒\n2. Allow Clipboard\n3. Refresh page");
        }
    }

    function typeTextProperly(text) {
        if (!canvas) return;

        const chars = text.split("");
        let currentIndex = 0;

        function typeNextChar() {
            if (currentIndex >= chars.length) {
                console.log("✅ Paste complete!");
                return;
            }

            const char = chars[currentIndex];
            sendProperKeyEvent(char);
            currentIndex++;

            setTimeout(typeNextChar, TYPING_DELAY);
        }

        typeNextChar();
    }

    function sendProperKeyEvent(char) {
        // Handle special keys
        let keyToSend = char;
        let keyCode = char.charCodeAt(0);

        // Check if shift is needed
        const needsShift = /[A-Z!@#$%^&*()_+{}:"<>?~|]/.test(char);

        // Create proper keyboard event
        const event = new KeyboardEvent('keydown', {
            key: char,
            code: getKeyCode(char),
            keyCode: keyCode,
            which: keyCode,
            charCode: keyCode,
            shiftKey: needsShift,
            bubbles: true,
            cancelable: true,
            composed: true
        });

        canvas.dispatchEvent(event);

        // Also dispatch keypress for better compatibility
        const pressEvent = new KeyboardEvent('keypress', {
            key: char,
            keyCode: keyCode,
            which: keyCode,
            charCode: keyCode,
            shiftKey: needsShift,
            bubbles: true,
            cancelable: true
        });

        canvas.dispatchEvent(pressEvent);
    }

    function getKeyCode(char) {
        // Map special characters to proper key codes
        const specialKeys = {
            '\n': 'Enter',
            '\t': 'Tab',
            ' ': 'Space',
            '-': 'Minus',
            '=': 'Equal',
            '[': 'BracketLeft',
            ']': 'BracketRight',
            '\\': 'Backslash',
            ';': 'Semicolon',
            "'": 'Quote',
            ',': 'Comma',
            '.': 'Period',
            '/': 'Slash',
            '`': 'Backquote'
        };

        if (specialKeys[char]) {
            return specialKeys[char];
        }

        if (char >= 'a' && char <= 'z') {
            return 'Key' + char.toUpperCase();
        }

        if (char >= 'A' && char <= 'Z') {
            return 'Key' + char;
        }

        if (char >= '0' && char <= '9') {
            return 'Digit' + char;
        }

        return '';
    }

    // Keyboard shortcut: Ctrl+Shift+V
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
            e.preventDefault();
            console.log("⌨️ Ctrl+Shift+V");
            pasteFromClipboard();
        }
    }, true);

    // Initialize
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 500);
    }

    console.log("📝 Waiting for canvas...");
})();
