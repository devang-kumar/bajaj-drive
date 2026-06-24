const API_URL = 'https://bajaj-drive.onrender.com/bfhl';

document
    .getElementById('submitBtn')
    .addEventListener('click', async () => {

        const button = document.getElementById('submitBtn');

        const error = document.getElementById('error');
        const summaryCards = document.getElementById('summaryCards');
        const hierarchiesDiv = document.getElementById('hierarchies');
        const extraInfo = document.getElementById('extraInfo');

        error.textContent = '';
        summaryCards.innerHTML = '';
        hierarchiesDiv.innerHTML = '';
        extraInfo.innerHTML = '';

        const data = document
            .getElementById('nodes')
            .value
            .split(',')
            .map(edge => edge.trim())
            .filter(edge => edge.length);

        if (!data.length) {
            error.textContent =
                'Please enter at least one edge.';
            return;
        }

        try {

            button.disabled = true;
            button.textContent = 'Processing...';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });

            if (!response.ok) {
                throw new Error(
                    'Unable to connect to server'
                );
            }

            const result = await response.json();

            summaryCards.innerHTML = `
                <div class="cards">

                    <div class="card">
                        <h3>Total Trees</h3>
                        <p>${result.summary?.total_trees ?? 0}</p>
                    </div>

                    <div class="card">
                        <h3>Total Cycles</h3>
                        <p>${result.summary?.total_cycles ?? 0}</p>
                    </div>

                    <div class="card">
                        <h3>Largest Tree Root</h3>
                        <p>${result.summary?.largest_tree_root || '-'}</p>
                    </div>

                </div>
            `;

            (result.hierarchies || []).forEach(item => {

                const card =
                    document.createElement('div');

                card.className =
                    item.has_cycle
                        ? 'tree-card cycle'
                        : 'tree-card tree';

                card.innerHTML = `
                    <h3>Root: ${item.root}</h3>

                    ${
                        item.has_cycle
                            ? `
                                <span class="badge badge-cycle">
                                    Cycle Detected
                                </span>
                              `
                            : `
                                <span class="badge badge-tree">
                                    Depth: ${item.depth}
                                </span>
                              `
                    }

                    <div class="tree-json">
                        <pre>${JSON.stringify(
                            item.tree,
                            null,
                            2
                        )}</pre>
                    </div>
                `;

                hierarchiesDiv.appendChild(card);
            });

            extraInfo.innerHTML = `
                <div class="list-card">

                    <h3>Invalid Entries</h3>

                    <p>
                        ${
                            (result.invalid_entries || []).length
                                ? result.invalid_entries.join(', ')
                                : 'None'
                        }
                    </p>

                    <br>

                    <h3>Duplicate Edges</h3>

                    <p>
                        ${
                            (result.duplicate_edges || []).length
                                ? result.duplicate_edges.join(', ')
                                : 'None'
                        }
                    </p>

                </div>
            `;

        } catch (err) {

            error.textContent =
                err.message || 'Something went wrong';

        } finally {

            button.disabled = false;
            button.textContent =
                'Analyze Hierarchy';
        }
    });
