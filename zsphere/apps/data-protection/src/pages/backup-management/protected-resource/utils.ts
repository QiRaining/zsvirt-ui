const traverseTree = (nodes: any[], callback: Function) => {
  for (const node of nodes) {
    if (callback(node)) {
      return node;
    }
    if (node.children) {
      const result: any = traverseTree(node.children, callback);
      if (result) {
        return result;
      }
    }
  }
  return;
};

export const findNode = (tree: any, key: any) => {
  return traverseTree(tree, (node: any) => node.key === key);
};
