import { generatePassword, generateBatch } from './modules/generator.js';
import * as jsonTools from './modules/json_tools.js';

// DOM Elements
const app = document.getElementById('app');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const checkboxes = {
    upper: document.getElementById('use-upper'),
    lower: document.getElementById('use-lower'),
    numbers: document.getElementById('use-numbers'),
    symbols: document.getElementById('use-symbols')
};
const batchCountInput = document.getElementById('batch-count');
const generateBtn = document.getElementById('generate-btn');
const passwordOutput = document.getElementById('password-output');
const copyBtn = document.getElementById('copy-btn');

// DOM Elements (Initialized in init)
let jsonInput, highlightingContent, btnBeautify, btnMinify, btnUnescape, btnTable, btnClear, jsonOutputContainer;


// State
let config = {
    length: 16,
    options: {
        upper: true,
        lower: true,
        numbers: true,
        symbols: true
    },
    count: 1
};

// // Basic JSON Syntax Highlighter
function updateHighlight(text, codeElement) {
    if (typeof text !== 'string' || !codeElement) return;

    // Escape HTML to prevent XSS (though we are trusting user input mostly)
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Tokenize
    // Regex logic:
    // Strings: "..." (handling escaped quotes)
    // Numbers: digits, dots, signs
    // Booleans/Null: true, false, null
    // Keys: "..." followed by :

    html = html.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\]\,])/g, function (match) {
        let cls = 'token-punctuation';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'token-key'; // It's a key
            } else {
                cls = 'token-string'; // It's a string value
            }
        } else if (/true|false/.test(match)) {
            cls = 'token-boolean';
        } else if (/null/.test(match)) {
            cls = 'token-null';
        } else if (/^[-0-9]/.test(match)) {
            cls = 'token-number'; // Simple number check
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });

    // Handle trailing newline for PRE display consistency
    if (text.endsWith('\n')) {
        html += '<br>';
    }

    codeElement.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Elements safely when DOM is ready
    jsonInput = document.getElementById('json-input');
    highlightingContent = document.getElementById('highlighting-content');
    btnBeautify = document.getElementById('btn-beautify');
    btnMinify = document.getElementById('btn-minify');
    btnUnescape = document.getElementById('btn-unescape');
    btnTable = document.getElementById('btn-table');
    btnClear = document.getElementById('btn-clear');
    jsonOutputContainer = document.getElementById('json-output-container');

    const highlightingPre = document.getElementById('highlighting-pre');

    // Sync Highlight on Input
    if (jsonInput && highlightingContent) {
        const syncHighlight = () => {
            updateHighlight(jsonInput.value, highlightingContent);
        };

        jsonInput.addEventListener('input', syncHighlight);

        // Initial highlight
        syncHighlight();

        // Sync scroll
        jsonInput.addEventListener('scroll', () => {
            if (highlightingPre) {
                highlightingPre.scrollTop = jsonInput.scrollTop;
                highlightingPre.scrollLeft = jsonInput.scrollLeft;
            }
        });
    }

    // Existing Setup
    setupNavigation();
    setupGeneratorControls();
    setupJsonControls();
});

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;

            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            views.forEach(v => {
                v.classList.remove('active');
                if (v.id === `view-${target}`) {
                    v.classList.add('active');
                }
            });
        });
    });
}

function setupGeneratorControls() {
    lengthSlider.addEventListener('input', (e) => {
        config.length = parseInt(e.target.value);
        lengthVal.textContent = config.length;
    });

    Object.keys(checkboxes).forEach(key => {
        checkboxes[key].addEventListener('change', (e) => {
            config.options[key] = e.target.checked;
        });
    });

    batchCountInput.addEventListener('input', (e) => {
        config.count = parseInt(e.target.value);
    });

    generateBtn.addEventListener('click', handleGenerate);

    copyBtn.addEventListener('click', () => {
        const text = passwordOutput.textContent;
        if (text && text !== 'Your Password Here') {
            navigator.clipboard.writeText(text);

            // Visual feedback - SVG checkmark matching copy icon style
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
            }, 1500);
        }
    });
}

async function handleGenerate() {
    try {
        const { length, options, count } = config;

        if (!options.upper && !options.lower && !options.numbers && !options.symbols) {
            alert('Please select at least one character type.');
            return;
        }

        if (count === 1) {
            const password = generatePassword(length, options);
            if (!password) throw new Error("Generated password was empty");

            passwordOutput.textContent = password;
            passwordOutput.style.color = '#22c55e';
            passwordOutput.classList.remove('batch-mode');
        } else {
            const passwords = generateBatch(count, length, options);

            // Join with newlines for display
            passwordOutput.textContent = passwords.join('\n');
            passwordOutput.style.color = '#22c55e';
            passwordOutput.classList.add('batch-mode');
        }
    } catch (err) {
        console.error("Generation error:", err);
        passwordOutput.textContent = "Error!";
        passwordOutput.style.color = '#ef4444'; // Error color
        alert("Failed to generate password: " + err.message);
    }
}

function setupJsonControls() {
    // Elements are already initialized globally above

    if (btnBeautify) {
        btnBeautify.addEventListener('click', () => {
            try {
                const val = jsonInput.value;
                if (!val) return;
                jsonInput.value = jsonTools.formatJSON(val);
                updateHighlight(jsonInput.value, highlightingContent);
                hideTable();
            } catch (e) {
                alert(e.message);
            }
        });
    }

    if (btnMinify) {
        btnMinify.addEventListener('click', () => {
            try {
                const val = jsonInput.value;
                if (!val) return;
                jsonInput.value = jsonTools.minifyJSON(val);
                updateHighlight(jsonInput.value, highlightingContent);
                hideTable();
            } catch (e) {
                alert(e.message);
            }
        });
    }

    if (btnUnescape) {
        btnUnescape.addEventListener('click', () => {
            const val = jsonInput.value;
            if (!val) return;
            jsonInput.value = jsonTools.unescapeJSON(val);
            updateHighlight(jsonInput.value, highlightingContent);
        });
    }

    const treeControls = document.getElementById('tree-controls');
    const btnExpandAll = document.getElementById('btn-expand-all');
    const btnCollapseAll = document.getElementById('btn-collapse-all');
    const btnCopyValues = document.getElementById('btn-copy-values');
    const expandLevelInput = document.getElementById('expand-level');

    btnTable.addEventListener('click', () => {
        try {
            const val = jsonInput.value;
            if (!val) return;

            // Destructure result
            const result = jsonTools.jsonToTree(val);
            let html, maxLevel;

            if (typeof result === 'string') {
                // Fallback if older version or error
                html = result;
                maxLevel = 10;
            } else {
                html = result.html;
                maxLevel = result.maxLevel;
            }

            jsonOutputContainer.innerHTML = html;
            jsonOutputContainer.style.display = 'block';
            treeControls.style.display = 'flex';

            // Update Slider
            const slider = document.getElementById('expand-level');
            const valSpan = document.getElementById('level-val');
            const dataList = document.getElementById('tick-marks');

            // Set max and default value (fully expanded)
            slider.max = maxLevel;
            slider.value = maxLevel;
            valSpan.textContent = maxLevel;

            // Generate ticks
            dataList.innerHTML = '';
            for (let i = 1; i <= maxLevel; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                dataList.appendChild(opt);
            }

        } catch (e) {
            alert(e.message);
        }
    });


    // Event delegation for toggle buttons
    jsonOutputContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('toggle-btn')) {
            const targetId = e.target.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.classList.toggle('hidden');
                e.target.textContent = targetEl.classList.contains('hidden') ? '[+] Expand' : '[-] Collapse';
            }
        }
    });

    jsonInput.value = '';
    hideTable();


    // Control Handlers
    btnExpandAll.addEventListener('click', () => {
        document.querySelectorAll('.tree-row').forEach(row => {
            row.classList.remove('hidden');
            row.dataset.expanded = 'true';
        });
        document.querySelectorAll('.tree-toggle').forEach(btn => btn.classList.add('expanded'));
    });

    btnCollapseAll.addEventListener('click', () => {
        document.querySelectorAll('.tree-row').forEach(row => {
            if (row.dataset.parent !== '') {
                row.classList.add('hidden');
            }
            row.dataset.expanded = 'false';
        });
        document.querySelectorAll('.tree-toggle').forEach(btn => btn.classList.remove('expanded'));
    });

    btnCopyValues.addEventListener('click', async () => {
        const visibleRows = Array.from(document.querySelectorAll('.tree-row:not(.hidden)'));

        // 1. Calculate Global Max Level for Value Column Alignment
        let globalMaxLevel = 0;
        visibleRows.forEach(row => {
            const l = parseInt(row.dataset.level) || 0;
            if (l > globalMaxLevel) globalMaxLevel = l;
        });

        let textToCopy = '';
        let pendingMerge = false;

        visibleRows.forEach((row, index) => {
            const level = parseInt(row.dataset.level) || 0;

            const keyCell = row.querySelector('.key-name');
            const valCell = row.querySelector('.tree-value');

            if (keyCell && valCell) {
                const key = keyCell.textContent.trim();

                // Value Cleanup
                const valClone = valCell.cloneNode(true);
                const actions = valClone.querySelector('.row-actions');
                if (actions) actions.remove();
                const types = valClone.querySelectorAll('.val-type');
                types.forEach(El => El.remove());
                const val = valClone.textContent.trim();

                const isExpanded = row.dataset.expanded === 'true';
                const hasChildren = row.dataset.hasChildren === 'true';

                // Determine Indentation
                // If previous row was a parent that merged with this one, skip indentation
                let indent = '';
                if (!pendingMerge) {
                    indent = '\t'.repeat(level);
                }
                pendingMerge = false; // Reset consumed merge

                // Logic:
                // If this is an Expanded Parent, we print "Key + Tab" and merge with next line (First Child)
                // UNLESS strictly speaking we need to ensure the next row IS a child? 
                // The visibleRows list implies the next row IS the child if expanded.
                if (hasChildren && isExpanded) {
                    textToCopy += `${indent}${key}\t`;
                    pendingMerge = true;
                } else {
                    // Leaf or Collapsed Parent
                    // Print Key + Padding to align Value + Value + Newline
                    // Padding = (GlobalMax - CurrentLevel) tabs
                    const padCount = globalMaxLevel - level;
                    const padding = '\t'.repeat(padCount);

                    textToCopy += `${indent}${key}${padding}\t${val}\n`;
                }
            }
        });

        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                const originalText = btnCopyValues.textContent;
                btnCopyValues.textContent = 'Copied!';
                setTimeout(() => btnCopyValues.textContent = originalText, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy table.');
            }
        } else {
            alert('No visible rows to copy.');
        }
    });

    // Slider Action (Immediate)
    expandLevelInput.addEventListener('input', () => {
        const level = parseInt(expandLevelInput.value) || 1;
        document.getElementById('level-val').textContent = level;

        document.querySelectorAll('.tree-row').forEach(row => {
            const rowLevel = parseInt(row.dataset.level);

            if (rowLevel < level) {
                row.classList.remove('hidden');

                // Expand state logic
                if (rowLevel < level - 1) {
                    row.dataset.expanded = 'true';
                    const toggle = row.querySelector('.tree-toggle');
                    if (toggle) toggle.classList.add('expanded');
                } else {
                    row.dataset.expanded = 'false';
                    const toggle = row.querySelector('.tree-toggle');
                    if (toggle) toggle.classList.remove('expanded');
                }
            } else {
                row.classList.add('hidden');
                row.dataset.expanded = 'false';
                const toggle = row.querySelector('.tree-toggle');
                if (toggle) toggle.classList.remove('expanded');
            }
        });
    });

    // Event delegation for Tree Toggle
    jsonOutputContainer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-icon')) {
            const btn = e.target.closest('.btn-icon');
            const row = btn.closest('tr');
            handleRowCopy(btn, row);
            return; // Stop processing toggle
        }

        if (e.target.classList.contains('tree-toggle')) {
            const btn = e.target;
            const parentRow = btn.closest('tr');
            const rowId = parentRow.dataset.id;
            const isExpanded = parentRow.dataset.expanded === 'true';

            // Toggle Self
            parentRow.dataset.expanded = !isExpanded;
            btn.classList.toggle('expanded');

            // Toggle Children
            toggleChildren(rowId, !isExpanded);
        }
    });
}

function handleRowCopy(btn, row) {
    let type = 'row'; // default
    if (btn.classList.contains('btn-copy-key')) type = 'key';
    if (btn.classList.contains('btn-copy-val')) type = 'val';

    const data = getRecursiveData(row, type);

    if (data) {
        navigator.clipboard.writeText(data).then(() => {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => btn.innerHTML = originalHtml, 1500);
        }).catch(err => {
            console.error('Copy failed', err);
            alert('Copy failed');
        });
    }
}

function getRecursiveData(startRow, type) {
    if (type === 'key') {
        return startRow.querySelector('.key-name').textContent.trim();
    }

    // Row Copy (Recursive Smart Copy)
    // 1. Flatten the subtree
    let flatRows = [];
    function collect(row) {
        flatRows.push(row);
        const id = row.dataset.id;
        const children = document.querySelectorAll(`tr[data-parent="${id}"]`);
        children.forEach(child => collect(child));
    }
    collect(startRow);

    // 2. Calculate Max Level used in this subtree
    let localMaxLevel = 0;
    flatRows.forEach(row => {
        const l = parseInt(row.dataset.level) || 0;
        if (l > localMaxLevel) localMaxLevel = l;
    });

    // 3. Generate Text with Merge & Alignment Logic
    let result = '';
    let pendingMerge = false;

    flatRows.forEach(row => {
        const level = parseInt(row.dataset.level) || 0;
        const key = row.querySelector('.key-name').textContent.trim();

        // Value Cleanup
        const valCell = row.querySelector('.tree-value');
        const valClone = valCell.cloneNode(true);
        const actions = valClone.querySelector('.row-actions');
        if (actions) actions.remove();
        const types = valClone.querySelectorAll('.val-type');
        types.forEach(El => El.remove());
        const val = valClone.textContent.trim();

        const hasChildren = row.dataset.hasChildren === 'true';
        const isParent = hasChildren;

        if (type === 'val') {
            if (isParent) {
                // For Value Copy, we skip parents because their value (the child) 
                // will be printed on the merged line (or subsequent lines).
                // Effectively we merge lines but only output the value part.
                pendingMerge = true;
            } else {
                result += `${val}\n`;
            }
        } else {
            // Indentation
            let indent = '';
            if (!pendingMerge) {
                indent = '\t'.repeat(level);
            }
            pendingMerge = false;

            if (isParent) {
                result += `${indent}${key}\t`;
                pendingMerge = true;
            } else {
                // Leaf
                const padCount = localMaxLevel - level;
                const padding = '\t'.repeat(padCount);
                result += `${indent}${key}${padding}\t${val}\n`;
            }
        }
    });

    return result;
}

function toggleChildren(parentId, show) {
    const children = document.querySelectorAll(`tr[data-parent="${parentId}"]`);

    children.forEach(child => {
        if (show) {
            child.classList.remove('hidden');
            // Check if this child itself was expanded, if so, show its children too
            if (child.dataset.expanded === 'true') {
                toggleChildren(child.dataset.id, true);
            }
        } else {
            child.classList.add('hidden');
            // Recursively hide all descendants
            toggleChildren(child.dataset.id, false);
        }
    });
}

function hideTable() {
    const treeControls = document.getElementById('tree-controls');
    jsonOutputContainer.style.display = 'none';
    jsonOutputContainer.innerHTML = '';
    if (treeControls) treeControls.style.display = 'none';
}

