import { describe, expect, it, vi } from "vitest";

import {
  createNotFoundTolerantRemoveChild,
  removeZmigrateBodyNode,
  removeMappedZmigrateBodyNode,
  shouldRedirectZmigrateBodyNode,
} from "./zmigrate-dom-proxy";

describe("shouldRedirectZmigrateBodyNode", () => {
  it("does not redirect host portal roots only because zmigrate was active", () => {
    const container = document.createElement("div");
    const node = document.createElement("div");

    expect(
      shouldRedirectZmigrateBodyNode({
        node,
        container,
        isMapped: false,
        qiankunName: "zmigrate-core-shell",
        stack: "Error\n    at https://example.test/5468.host.js:1:1",
        isZmigrateInteractionActive: true,
      }),
    ).toBe(false);
  });

  it("does not redirect host AntD overlays only because zmigrate was active", () => {
    const container = document.createElement("div");
    const node = document.createElement("div");
    node.className = "ant-notification ant-notification-topRight";

    expect(
      shouldRedirectZmigrateBodyNode({
        node,
        container,
        isMapped: false,
        qiankunName: "zmigrate-core-shell",
        stack: "Error\n    at https://example.test/5468.host.js:1:1",
        isZmigrateInteractionActive: true,
      }),
    ).toBe(false);
  });

  it("redirects likely portal roots created by the zmigrate stack", () => {
    const container = document.createElement("div");
    const node = document.createElement("div");

    expect(
      shouldRedirectZmigrateBodyNode({
        node,
        container,
        isMapped: false,
        qiankunName: "zmigrate-core-shell",
        stack: "Error\n    at https://example.test/zmigrate-ui/main.js:1:1",
      }),
    ).toBe(true);
  });

  it("redirects likely portal roots created by suffixed zmigrate qiankun stacks", () => {
    const container = document.createElement("div");
    const node = document.createElement("div");

    for (const qiankunSuffix of ["", "_1", "_2"]) {
      expect(
        shouldRedirectZmigrateBodyNode({
          node,
          container,
          isMapped: false,
          qiankunName: "zmigrate-core-shell",
          stack: `Error\n    at https://example.test/zmigrate-core-shell${qiankunSuffix}/index.js:1:1`,
        }),
      ).toBe(true);
    }
  });
});

describe("removeMappedZmigrateBodyNode", () => {
  it("removes a mapped portal node from its redirected container", () => {
    const node = {} as Node;
    const container = {
      contains: vi.fn(() => true),
      removeChild: vi.fn(),
    } as unknown as Node;
    const cleanupMapping = vi.fn();

    expect(
      removeMappedZmigrateBodyNode({
        node,
        mappedContainer: container,
        cleanupMapping,
      }),
    ).toBe(node);
    expect(container.contains(node)).toBe(true);
    expect(container.removeChild).toHaveBeenCalledWith(node);
    expect(cleanupMapping).toHaveBeenCalledOnce();
  });

  it("treats an already removed mapped portal node as cleaned up", () => {
    const node = {} as Node;
    const container = {
      contains: vi.fn(() => false),
      removeChild: vi.fn(),
    } as unknown as Node;
    const cleanupMapping = vi.fn();

    expect(() =>
      removeMappedZmigrateBodyNode({
        node,
        mappedContainer: container,
        cleanupMapping,
      }),
    ).not.toThrow();
    expect(container.removeChild).not.toHaveBeenCalled();
    expect(cleanupMapping).toHaveBeenCalledOnce();
  });

  it("ignores NotFoundError while removing a mapped portal node", () => {
    const parentNode = {
      removeChild: vi.fn(() => {
        throw { name: "NotFoundError" };
      }),
    } as unknown as Node;
    const node = { parentNode } as Node;
    const container = {
      contains: vi.fn(() => true),
      removeChild: vi.fn(),
    } as unknown as Node;
    const cleanupMapping = vi.fn();

    expect(() =>
      removeMappedZmigrateBodyNode({
        node,
        mappedContainer: container,
        cleanupMapping,
      }),
    ).not.toThrow();
    expect(parentNode.removeChild).toHaveBeenCalledWith(node);
    expect(cleanupMapping).toHaveBeenCalledOnce();
  });

  it("does not handle an unmapped node", () => {
    const node = {} as Node;
    const cleanupMapping = vi.fn();

    expect(
      removeMappedZmigrateBodyNode({
        node,
        mappedContainer: undefined,
        cleanupMapping,
      }),
    ).toBeUndefined();
    expect(cleanupMapping).not.toHaveBeenCalled();
  });

  it("removes an unmapped node from its actual parent when body removal misses", () => {
    const parent = document.createElement("div");
    const node = document.createElement("div");
    parent.appendChild(node);
    document.body.appendChild(parent);

    const cleanupMapping = vi.fn();

    expect(() =>
      removeZmigrateBodyNode({
        node,
        mappedContainer: undefined,
        cleanupMapping,
        removeFromBody: (child) => document.body.removeChild(child),
      }),
    ).not.toThrow();
    expect(parent.contains(node)).toBe(false);
    expect(cleanupMapping).not.toHaveBeenCalled();
  });
});

describe("createNotFoundTolerantRemoveChild", () => {
  it("removes a child from its actual parent when a body prototype removal misses", () => {
    const parent = document.createElement("div");
    const node = document.createElement("script");
    parent.appendChild(node);
    document.body.appendChild(parent);

    const qiankunRemoveChild = vi.fn(() => {
      throw new DOMException(
        "The node to be removed is not a child of this node.",
        "NotFoundError",
      );
    });

    const guardedRemoveChild =
      createNotFoundTolerantRemoveChild(qiankunRemoveChild);

    expect(() => guardedRemoveChild.call(document.body, node)).not.toThrow();
    expect(parent.contains(node)).toBe(false);
    expect(qiankunRemoveChild).toHaveBeenCalledWith(node);
  });
});
