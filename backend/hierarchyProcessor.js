
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

            for (const child of (adjacency.get(node) || [])) queue.push(child);
            for (const parent of (reverse.get(node) || [])) queue.push(parent);
        }

        return component;
    }

    function componentHasCycle(component) {
        const state = new Map();

        const dfs = (node) => {
            state.set(node, 1);

            for (const child of (adjacency.get(node) || [])) {
                if (!component.has(child)) continue;

                const childState = state.get(child) || 0;

                if (childState === 1) return true;
                if (childState === 0 && dfs(child)) return true;
            }

            state.set(node, 2);
            return false;
        };

        for (const node of component) {
            if ((state.get(node) || 0) === 0) {
                if (dfs(node)) return true;
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

    function depth(node) {
        const children = adjacency.get(node) || [];

        if (!children.length) return 1;

        let maxDepth = 0;

        for (const child of children) {
            maxDepth = Math.max(maxDepth, depth(child));
        }

        return maxDepth + 1;
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

        for (const n of component) processed.add(n);

        const componentNodes = [...component].sort();

        const roots = componentNodes.filter(n => !parentOf.has(n));

        const root = roots.length ? roots[0] : componentNodes[0];

        const hasCycle = componentHasCycle(component);

        if (hasCycle) {
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

        const treeDepth = depth(root);

        total_trees++;

        if (
            treeDepth > largestDepth ||
            (treeDepth === largestDepth && root < largest_tree_root)
        ) {
            largestDepth = treeDepth;
            largest_tree_root = root;
        }

        hierarchies.push({
            root,
            tree,
            depth: treeDepth
        });
    }

    hierarchies.sort((a, b) => a.root.localeCompare(b.root));

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
