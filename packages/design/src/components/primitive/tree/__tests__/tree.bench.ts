import { bench, describe } from "vitest";

import type { TreeNode } from "../types";

function generateFlatData(count: number): TreeNode[] {
  const data: TreeNode[] = [];
  for (let i = 0; i < count; i++) {
    data.push({ id: `node-${i}`, name: `Node ${i + 1}` });
  }
  return data;
}

function generateDeepData(depth: number): TreeNode[] {
  let current: TreeNode = { id: `node-${depth - 1}`, name: `Level ${depth}` };
  for (let i = depth - 2; i >= 0; i--) {
    current = {
      id: `node-${i}`,
      name: `Level ${i + 1}`,
      children: [current],
    };
  }
  return [current];
}

function generateMixedData(
  roots: number,
  children: number,
  grandchildren: number,
): TreeNode[] {
  const data: TreeNode[] = [];
  for (let r = 0; r < roots; r++) {
    const root: TreeNode = {
      id: `root-${r}`,
      name: `Root ${r + 1}`,
      children: [],
    };
    for (let c = 0; c < children; c++) {
      const child: TreeNode = {
        id: `root-${r}-child-${c}`,
        name: `Child ${c + 1}`,
        children: [],
      };
      for (let g = 0; g < grandchildren; g++) {
        child.children!.push({
          id: `root-${r}-child-${c}-grand-${g}`,
          name: `Grandchild ${g + 1}`,
        });
      }
      root.children!.push(child);
    }
    data.push(root);
  }
  return data;
}

describe("Tree data generation performance", () => {
  bench(
    "generate 100k flat nodes",
    () => {
      generateFlatData(100000);
    },
    { time: 3000 },
  );

  bench(
    "generate 1000 deep tree",
    () => {
      generateDeepData(1000);
    },
    { time: 3000 },
  );

  bench(
    "generate 100k mixed tree (10x100x100)",
    () => {
      generateMixedData(10, 100, 100);
    },
    { time: 3000 },
  );
});

describe("Tree data traversal performance", () => {
  const flatData = generateFlatData(100000);
  const deepData = generateDeepData(1000);
  const mixedData = generateMixedData(10, 100, 100);

  function countNodes(nodes: TreeNode[]): number {
    let count = 0;
    const stack = [...nodes];
    while (stack.length > 0) {
      const node = stack.pop()!;
      count++;
      if (node.children) {
        stack.push(...node.children);
      }
    }
    return count;
  }

  bench(
    "traverse 100k flat nodes",
    () => {
      countNodes(flatData);
    },
    { time: 3000 },
  );

  bench(
    "traverse 1000 deep tree",
    () => {
      countNodes(deepData);
    },
    { time: 3000 },
  );

  bench(
    "traverse 100k mixed tree",
    () => {
      countNodes(mixedData);
    },
    { time: 3000 },
  );
});

describe("Tree node lookup performance", () => {
  const flatData = generateFlatData(100000);

  function findNodeById(nodes: TreeNode[], id: string): TreeNode | undefined {
    const stack = [...nodes];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        stack.push(...node.children);
      }
    }
    return undefined;
  }

  bench(
    "find node in middle of 100k flat (id: node-50000)",
    () => {
      findNodeById(flatData, "node-50000");
    },
    { time: 3000 },
  );

  bench(
    "find last node in 100k flat (id: node-99999)",
    () => {
      findNodeById(flatData, "node-99999");
    },
    { time: 3000 },
  );
});
