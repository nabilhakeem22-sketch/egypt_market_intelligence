export interface TreeNode {
    id: string;
    name: string;
    type: "Industry" | "Sector" | "Sub_Sector" | "Indicator";
    children?: TreeNode[];
    isLeaf?: boolean;
}

export const filterTree = (nodes: TreeNode[], searchQuery: string): TreeNode[] => {
    if (!searchQuery) return nodes;

    const lowerQuery = searchQuery.toLowerCase();

    return nodes
        .map((node) => {
            // Clone node to avoid mutating original
            const newNode = { ...node };

            // If node matches, return it (and all children)
            if (newNode.name.toLowerCase().includes(lowerQuery)) {
                return newNode;
            }

            // If node has children, filter them
            if (newNode.children) {
                newNode.children = filterTree(newNode.children, searchQuery);
                // If any children match, return this node
                if (newNode.children.length > 0) {
                    return newNode;
                }
            }

            // If neither matches, return null (filtered out)
            return null;
        })
        .filter((node): node is TreeNode => node !== null);
};
