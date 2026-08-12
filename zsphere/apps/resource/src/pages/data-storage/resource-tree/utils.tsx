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

export { flattenTree };
