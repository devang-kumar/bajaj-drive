const VALID_EDGE = /^[A-Z]->[A-Z]$/;

function processHierarchy(data) {
    const invalid_entries = [];
    const duplicate_edges = [];

    const seenEdges = new Set();
    const duplicateSeen = new Set();

    const adjacency = new Map();
    const reverse = new Map();
    const parentOf = new Map();
    const allNodes = new Set();

    for (const raw of data || []) {
        const edge = String(raw).trim();

        if (!VALID_EDGE.test(edge)) {
            invalid_entries.push(raw);
            continue;
        }

        const [parent, child] = edge.split("->");

        if (parent === child) {
            invalid_entries.push(raw);
            continue;
        }

        if (seenEdges.has(edge)) {
            if (!duplicateSeen.has(edge)) {
                duplicateSeen.add(edge);
                duplicate_edges.push(edge);
            }
            continue;
        }

        seenEdges.add(edge);

        if (parentOf.has(child)) {
            continue;
        }

        parentOf.set(child, parent);

        if (!adjacency.has(parent)) adjacency.set(parent, []);
        if (!adjacency.has(child)) adjacency.set(child, []);

        if (!reverse.has(parent)) reverse.set(parent, []);
        if (!reverse.has(child)) reverse.set(child, []);

        adjacency.get(parent).push(child);
        reverse.get(child).push(parent);

        allNodes.add(parent);
        allNodes.add(child);
    }

    for (const children of adjacency.values()) {
        children.sort();
    }

    function getComponent(start) {
        const component = new Set();
        const queue = [start];

        while (queue.length) {
            const node = queue.shift();

            if (component.has(node)) continue;

            component.add(node);

            for (const child of adjacency.get(node) || []) {
                queue.push(child);
            }

            for (const parent of reverse.get(node) || []) {
                queue.push(parent);
            }
        }

        return component;
    }

    function hasCycle(component) {
        const color = new Map();

        function dfs(node) {
            color.set(node, 1);

            for (const child of adjacency.get(node) || []) {
                if (!component.has(child)) continue;

                const state = color.get(child) || 0;

                if (state === 1) {
                    return true;
                }

                if (state === 0 && dfs(child)) {
                    return true;
                }
            }

            color.set(node, 2);
            return false;
        }

        for (const node of component) {
            if ((color.get(node) || 0) === 0) {
                if (dfs(node)) {
                    return true;
                }
            }
        }

        return false;
    }

    function buildTree(node) {
        const result = {};

        const children = adjacency.get(node) || [];

        for (const child of children) {
            result[child] = buildTree(child);
        }

        return result;
    }

    function getDepth(node) {
        const children = adjacency.get(node) || [];

        if (children.length === 0) {
            return 1;
        }

        let longest = 0;

        for (const child of children) {
            longest = Math.max(longest, getDepth(child));
        }

        return longest + 1;
    }

    const processed = new Set();

    const hierarchies = [];

    let total_trees = 0;
    let total_cycles = 0;

    let largest_tree_root = "";
    let largestDepth = -1;

    const orderedNodes = [...allNodes].sort();

    for (const node of orderedNodes) {
        if (processed.has(node)) continue;

        const component = getComponent(node);

        component.forEach(n => processed.add(n));

        const componentNodes = [...component].sort();

        const roots = componentNodes.filter(
            n => !parentOf.has(n)
        );

        const root =
            roots.length > 0
                ? roots[0]
                : componentNodes[0];

        if (hasCycle(component)) {
            total_cycles++;

            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });

            continue;
        }

        const tree = {
            [root]: buildTree(root)
        };

        const depth = getDepth(root);

        total_trees++;

        if (
            depth > largestDepth ||
            (
                depth === largestDepth &&
                root < largest_tree_root
            )
        ) {
            largestDepth = depth;
            largest_tree_root = root;
        }

        hierarchies.push({
            root,
            tree,
            depth
        });
    }

    hierarchies.sort((a, b) =>
        a.root.localeCompare(b.root)
    );

    return {
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    };
}

module.exports = processHierarchy;
