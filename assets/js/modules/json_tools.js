/**
 * JSON Tools Module
 * Handles JSON formatting, minification, and table conversion.
 */

export function formatJSON(input) {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        throw new Error("Invalid JSON: " + e.message);
    }
}

export function minifyJSON(input) {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed);
    } catch (e) {
        throw new Error("Invalid JSON: " + e.message);
    }
}

export function unescapeJSON(input) {
    if (!input) return "";
    try {
        // First try to parse it directly. 
        // If input is `"{\"key\": \"val\"}"` (a stringified literal), 
        // JSON.parse will return the inner string `{"key": "val"}`, which is what we want.
        const parsed = JSON.parse(input);
        if (typeof parsed === 'string') {
            return parsed;
        }
        // If it parsed to an object, maybe the user wants it stringified? 
        // But the feature request is specific to "unescape".
        // If it's already an object, it's not "escaped" in the sense of a double-encoded string.
        // So we might just return the input or prettify it? 
        // But let's handle the "string with escaped quotes" case that isn't valid JSON yet (e.g. log snippet)

        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        // If parsing fails (e.g. it's not a valid JSON string literal but just raw text with escapes),
        // try a manual replace.
        // e.g. {\"a\": 1} is not valid JSON, but the user wants {"a": 1}
        return input.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
}

export function jsonToTree(input) {
    let data;
    try {
        data = typeof input === 'string' ? JSON.parse(input) : input;
    } catch (e) {
        throw new Error("Invalid JSON: " + e.message);
    }

    let rows = [];
    let rowCount = 0;
    let maxLevel = 0;

    // Recursive helper to flatten the object
    function processNode(key, value, level, parentId) {
        if (level + 1 > maxLevel) maxLevel = level + 1;

        const id = 'row-' + rowCount++;
        const isObject = typeof value === 'object' && value !== null;
        const isArray = Array.isArray(value);
        // Has children if it's a non-empty object/array
        const hasChildren = isObject && (Object.keys(value).length > 0);

        let displayValue = '';
        let typeInfo = '';

        if (value === null) {
            displayValue = '<span class="val-null">null</span>';
        } else if (typeof value === 'boolean') {
            displayValue = `<span class="val-bool">${value}</span>`;
        } else if (typeof value === 'number') {
            displayValue = `<span class="val-num">${value}</span>`;
        } else if (typeof value === 'string') {
            displayValue = `<span class="val-str">"${value}"</span>`;
        } else if (isArray) {
            displayValue = `<span class="val-type">Array(${value.length})</span>`;
        } else {
            // Check if it's an object
            displayValue = `<span class="val-type">Object{${Object.keys(value).length}}</span>`;
        }

        // Toggle Button
        let toggleBtn = '';
        if (hasChildren) {
            // Default Expanded: class="expanded"
            toggleBtn = `<button class="tree-toggle expanded" data-id="${id}">▶</button>`;
        } else {
            toggleBtn = `<span class="tree-spacer"></span>`;
        }

        // Default Expanded: No 'hidden' class for children
        const hiddenClass = '';
        const indent = level * 20;

        rows.push({
            id: id,
            parent: parentId || '',
            html: `
            <tr class="tree-row ${hiddenClass}" data-id="${id}" data-parent="${parentId || ''}" data-level="${level}" data-expanded="true" data-has-children="${hasChildren}">
                <td class="tree-key">
                    <div style="padding-left: ${indent}px; display: flex; align-items: center;">
                        ${toggleBtn}
                        <span class="key-name">${key}</span>
                    </div>
                </td>
                <td class="tree-value">
                    <span class="value-text">${displayValue}</span>
                    <div class="row-actions">
                        <button class="btn-icon btn-copy-row" title="Copy Key & Value">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Key/Value
                        </button>
                        <button class="btn-icon btn-copy-key" title="Copy Key">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Key
                        </button>
                        <button class="btn-icon btn-copy-val" title="Copy Value">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Value
                        </button>
                    </div>
                </td>
            </tr>`
        });

        if (hasChildren) {
            for (const [k, v] of Object.entries(value)) {
                processNode(k, v, level + 1, id);
            }
        }
    }

    // Initialize processing
    if (typeof data === 'object' && data !== null) {
        // If root is object/array, iterate properties
        for (const [k, v] of Object.entries(data)) {
            processNode(k, v, 0, null);
        }
    } else {
        // Primitive Root
        processNode("Root", data, 0, null);
    }

    if (rows.length === 0) return { html: "<em>Empty JSON</em>", maxLevel: 0 };

    const html = `
        <table class="tree-table">
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(r => r.html).join('')}
            </tbody>
        </table>
    `;

    return { html, maxLevel };
}

export function jsonToTable(input) {
    try {
        const data = typeof input === 'string' ? JSON.parse(input) : input;

        if (Array.isArray(data)) {
            if (data.length === 0) return "<em>Empty Array</em>";

            // Collect all keys
            const keys = new Set();
            data.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(k => keys.add(k));
                }
            });
            const headers = Array.from(keys);

            let html = '<table class="json-table"><thead><tr>';
            if (data.length > 0 && typeof data[0] !== 'object') {
                html += '<th>Value</th></tr></thead><tbody>';
                data.forEach(item => {
                    html += `<tr><td>${item}</td></tr>`;
                });
            } else {
                headers.forEach(h => html += `<th>${h}</th>`);
                html += '</tr></thead><tbody>';

                data.forEach(row => {
                    html += '<tr>';
                    headers.forEach(h => {
                        let cell = row[h];
                        let cellHtml = '';

                        if (cell === undefined) {
                            cellHtml = '<span class="text-muted">-</span>';
                        } else if (cell === null) {
                            cellHtml = '<span class="text-muted">null</span>';
                        } else if (typeof cell === 'object') {
                            // Recursive call
                            const nestedHtml = jsonToTable(cell);
                            // Generate a unique ID for toggle
                            const id = 'nested-' + Math.random().toString(36).substr(2, 9);
                            cellHtml = `
                                 <button class="toggle-btn" data-target="${id}">[+] Expand</button>
                                 <div id="${id}" class="nested-container hidden">
                                     ${nestedHtml}
                                 </div>
                             `;
                        } else {
                            cellHtml = String(cell);
                        }
                        html += `<td>${cellHtml}</td>`;
                    });
                    html += '</tr>';
                });
            }
            html += '</tbody></table>';
            return html;
        } else if (typeof data === 'object' && data !== null) {
            // Handle single object by converting to 2-column table (Key | Value)
            let html = '<table class="json-table object-table"><tbody>';
            for (const [key, value] of Object.entries(data)) {
                let valHtml = '';
                if (value === null) valHtml = '<span class="text-muted">null</span>';
                else if (typeof value === 'object') {
                    const nestedHtml = jsonToTable(value);
                    const id = 'nested-' + Math.random().toString(36).substr(2, 9);
                    valHtml = `
                          <button class="toggle-btn" data-target="${id}">[+] Expand</button>
                          <div id="${id}" class="nested-container hidden">
                              ${nestedHtml}
                          </div>
                      `;
                } else {
                    valHtml = String(value);
                }
                html += `<tr><th>${key}</th><td>${valHtml}</td></tr>`;
            }
            html += '</tbody></table>';
            return html;
        } else {
            return String(data);
        }

    } catch (e) {
        throw new Error("Conversion Failed: " + e.message);
    }
}
