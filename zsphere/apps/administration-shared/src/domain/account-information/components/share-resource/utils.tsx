const STYLE_HIGHLIGHT = { backgroundColor: "var(--color-100)" } as const;

const flattenTree = (data: any[]): any[] => {
  return data.reduce((acc: any[], node: any) => {
    const { key, title, children, resourceType } = node;
    acc.push({ key, title, resourceType });
    if (children) {
      acc.push(...flattenTree(children));
    }
    return acc;
  }, []);
};

const updateTreeWithShareTypes = (
  tree: any[],
  shareMap: Map<string, string>,
): any[] => {
  return tree.map((node) => {
    const updatedNode = {
      ...node,
      shareType: shareMap.get(node.key) || "None",
    };
    if (node.children) {
      updatedNode.children = updateTreeWithShareTypes(node.children, shareMap);
    }
    return updatedNode;
  });
};

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} style={STYLE_HIGHLIGHT}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export { flattenTree, highlightText, updateTreeWithShareTypes };
