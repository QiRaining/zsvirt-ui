const triggerEvent = (
  graph: any,
  vmTopo: any,
  hostTopo: any,
  content: any,
  vmTopoTitle: any,
  hostTopoTitle: any,
) => {
  let currentVmHeight: number;
  let currentHostHeight: number;
  let initCenterNodeY: number;
  //处理图超出画布的场景
  const keepInCanvas = (vmTopoHeight: number, hostTopoHeight: number) => {
    hostTopo.style.cssText = `height: ${hostTopoHeight}px`;
    vmTopo.style.cssText = `height: ${vmTopoHeight}px`;
    hostTopoTitle.style.cssText = "visibility: visible";
    vmTopoTitle.style.cssText = "visibility: visible";
    if (hostTopoHeight <= 0) {
      vmTopo.style.cssText = `height:${content.clientHeight}px`;
      hostTopo.style.cssText = `height: 0px`;
      hostTopoTitle.style.cssText = "visibility: hidden";
    }
    if (vmTopoHeight <= 0) {
      hostTopo.style.cssText = `height:${content.clientHeight}px`;
      vmTopo.style.cssText = `height: 0px`;
      vmTopoTitle.style.cssText = "visibility: hidden";
    }
    if (hostTopoHeight <= 50) {
      hostTopoTitle.style.cssText = "display: block;margin-top:40px";
    }
    if (vmTopoHeight <= 50) {
      vmTopoTitle.style.cssText = "display: block;margin-bottom:40px";
    }
  };
  graph.on("wheelzoom", (e: any) => {
    e.stopPropagation();
    const centerNode = graph?.findById("centerNode") ?? {
      getBBox: () => ({ centerX: 0, centerY: 0 }),
    };
    const zoom = graph.getZoom();
    const centerNodePointY = graph.getPointByCanvas(
      centerNode.getBBox().centerX,
      centerNode.getBBox().centerY,
    ).y;
    //中心分隔线在canvas坐标轴偏移量=point坐标轴偏移量 * 缩放倍数 因为在缩放过程中，point坐标轴被缩放
    const distance = (content.clientHeight / 2 - centerNodePointY) * zoom;
    const vmTopoHeight = content.clientHeight / 2 + distance;
    const hostTopoHeight = content.clientHeight / 2 - distance;
    keepInCanvas(vmTopoHeight, hostTopoHeight);
  });

  graph.on("canvas:dragstart", () => {
    const centerNode = graph?.findById("centerNode") ?? {
      getBBox: () => ({ centerX: 0, centerY: 0 }),
    };
    currentVmHeight = vmTopo.clientHeight;
    currentHostHeight = hostTopo.clientHeight;
    initCenterNodeY = graph.getPointByCanvas(
      centerNode.getBBox().centerX,
      centerNode.getBBox().centerY,
    ).y;
  });

  graph.on("canvas:drag", () => {
    const centerNode = graph?.findById("centerNode") ?? {
      getBBox: () => ({ centerX: 0, centerY: 0 }),
    };
    const zoom = graph.getZoom();
    const distanceY =
      zoom *
      (initCenterNodeY -
        graph.getPointByCanvas(
          centerNode.getBBox().centerX,
          centerNode.getBBox().centerY,
        ).y);
    const vmTopoHeight = currentVmHeight + distanceY;
    const hostTopoHeight = currentHostHeight - distanceY;
    keepInCanvas(vmTopoHeight, hostTopoHeight);
  });
};
export default triggerEvent;
