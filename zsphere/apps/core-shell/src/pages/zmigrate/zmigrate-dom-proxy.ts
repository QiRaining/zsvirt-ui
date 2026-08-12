export function shouldRedirectZmigrateBodyNode({
  node,
  container,
  isMapped,
  qiankunName,
  stack = "",
}: {
  node: unknown;
  container: Element;
  isMapped: boolean;
  qiankunName: string;
  stack?: string;
  // Legacy signal kept for regression tests; active focus alone is not ownership.
  isZmigrateInteractionActive?: boolean;
}): boolean {
  if (!(node instanceof Element)) return false;
  const isFromZmigrate = isFromZmigrateStack(stack);

  if (container.contains(node)) return true;
  if (isMapped) return true;

  let parent = node.parentElement;
  while (parent) {
    if (container.contains(parent)) return true;
    parent = parent.parentElement;
  }

  if (
    node.id.includes("zmigrate") ||
    node.getAttribute("data-qiankun") === qiankunName
  ) {
    return true;
  }

  if (node.closest('[data-zmigrate-portal-owner="true"]')) {
    return true;
  }

  if (isLikelyPortalRoot(node)) {
    return isFromZmigrate;
  }

  return isLikelyZmigrateOverlayNode(node) && isFromZmigrate;
}

export function removeMappedZmigrateBodyNode({
  node,
  mappedContainer,
  cleanupMapping,
}: {
  node: Node;
  mappedContainer: Node | undefined;
  cleanupMapping: () => void;
}): Node | undefined {
  if (!mappedContainer) {
    return undefined;
  }

  if (mappedContainer.contains(node)) {
    const parentNode = node.parentNode;

    try {
      if (parentNode) {
        parentNode.removeChild(node);
      } else {
        mappedContainer.removeChild(node);
      }
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }
    }
  }

  cleanupMapping();
  return node;
}

export function removeZmigrateBodyNode({
  node,
  mappedContainer,
  cleanupMapping,
  removeFromBody,
}: {
  node: Node;
  mappedContainer: Node | undefined;
  cleanupMapping: () => void;
  removeFromBody: (node: Node) => Node;
}): Node {
  const removedNode = removeMappedZmigrateBodyNode({
    node,
    mappedContainer,
    cleanupMapping,
  });

  if (removedNode) {
    return removedNode;
  }

  try {
    return removeFromBody(node);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    return removeFromActualParent(node);
  }
}

export function createNotFoundTolerantRemoveChild<TParent extends Node>(
  removeChild: (this: TParent, child: Node) => Node,
): (this: TParent, child: Node) => Node {
  return function removeChildWithNotFoundFallback(this: TParent, child: Node) {
    try {
      return removeChild.call(this, child);
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      return removeFromActualParent(child);
    }
  };
}

function removeFromActualParent(node: Node): Node {
  const parentNode = node.parentNode;
  if (!parentNode) {
    return node;
  }

  try {
    return Node.prototype.removeChild.call(parentNode, node);
  } catch (parentError) {
    if (!isNotFoundError(parentError)) {
      throw parentError;
    }
  }

  return node;
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "NotFoundError"
  );
}

function isFromZmigrateStack(stack: string): boolean {
  return (
    stack.includes("zmigrate") ||
    stack.includes("zmigrate-ui") ||
    stack.includes("zmigrate-core-shell")
  );
}

function isLikelyZmigrateOverlayNode(node: Element): boolean {
  const className = typeof node.className === "string" ? node.className : "";
  const role = node.getAttribute("role");

  return (
    className.includes("ant-") ||
    className.includes("drawer") ||
    className.includes("modal") ||
    className.includes("popover") ||
    className.includes("tooltip") ||
    role === "dialog" ||
    node.getAttribute("style") ===
      "position: absolute; top: 0px; left: 0px; width: 100%;"
  );
}

function isLikelyPortalRoot(node: Element): boolean {
  return node.tagName.toLowerCase() === "div";
}
