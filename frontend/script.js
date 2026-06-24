document.getElementById('submitBtn').addEventListener('click', async () => {

    const error = document.getElementById('error');
    const summaryCards = document.getElementById('summaryCards');
    const hierarchiesDiv = document.getElementById('hierarchies');
    const extraInfo = document.getElementById('extraInfo');

    error.textContent = '';
    summaryCards.innerHTML = '';
    hierarchiesDiv.innerHTML = '';
    extraInfo.innerHTML = '';

    const data = document.getElementById('nodes')
        .value
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length);

    try {

        const response = await fetch(
            'https://your-backend-url/bfhl',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            }
        );

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const result = await response.json();

        summaryCards.innerHTML = `
            <div class="cards">
                <div class="card">
                    <h3>Total Trees</h3>
                    <p>${result.summary.total_trees}</p>
                </div>

                <div class="card">
                    <h3>Total Cycles</h3>
                    <p>${result.summary.total_cycles}</p>
                </div>

                <div class="card">
                    <h3>Largest Tree Root</h3>
                    <p>${result.summary.largest_tree_root || '-'}</p>
                </div>
            </div>
        `;

        result.hierarchies.forEach(item => {

            const div = document.createElement('div');

            div.className =
                item.has_cycle
                ? 'tree-card cycle'
                : 'tree-card tree';

            div.innerHTML = `
                <h3>Root: ${item.root}</h3>

                ${
                    item.has_cycle
                    ? '<span class="badge badge-cycle">Cycle Detected</span>'
                    : `<span class="badge badge-tree">Depth: ${item.depth}</span>`
                }

                <div class="tree-json">
                    <pre>${JSON.stringify(item.tree, null, 2)}</pre>
                </div>
            `;

            hierarchiesDiv.appendChild(div);
        });

        extraInfo.innerHTML = `
            <div class="list-card">
                <h3>Invalid Entries</h3>
                <p>
                    ${
                        result.invalid_entries.length
                        ? result.invalid_entries.join(', ')
                        : 'None'
                    }
                </p>

                <br>

                <h3>Duplicate Edges</h3>
                <p>
                    ${
                        result.duplicate_edges.length
                        ? result.duplicate_edges.join(', ')
                        : 'None'
                    }
                </p>
            </div>
        `;

    } catch (e) {
        error.textContent = e.message;
    }

});
