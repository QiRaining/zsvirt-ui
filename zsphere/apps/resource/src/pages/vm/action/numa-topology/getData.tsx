const getData = (
  vmTopology: any,
  hostTopology: any,
  data: any,
  content: any,
) => {
  const nodeData: any = [];
  const currentPhyNodeID = vmTopology?.map((cv: any) => cv.phyNodeID);
  vmTopology?.map((cv: any) => {
    const templete = {
      x: 0,
      y: 0,
      label: "",
      id: "",
      type: "vnuma",
      memSize: 0,
      tags: [],
    };
    const anchor = {
      type: "anchor",
      x: 0,
      y: 0,
    };
    templete.label = `vNUMA Node-${cv.nodeID}`;
    templete.id = `vNUMA Node-${cv.nodeID}`;
    templete.tags = cv.CPUsID;
    templete.memSize = cv.memSize;
    nodeData.push(templete, anchor);
    return cv;
  });
  hostTopology
    ?.filter((item: any) => currentPhyNodeID.indexOf(item.node) !== -1)
    ?.map((cv: any) => {
      const templete = {
        x: 0,
        y: 0,
        label: "",
        id: "",
        type: "pnuma",
        free: 0,
        total: 0,
        tags: [],
      };
      const pie = {
        id: "",
        type: "Ring",
        x: 0,
        y: 0,
        radius: 13,
        lineWidth: 6,
        percent: 0,
        borderWidth: 1,
        borderColor: "#DBDDE0",
      };
      templete.label = `pNUMA Node-${cv.node}`;
      templete.id = `pNUMA Node-${cv.node}`;
      pie.id = `pie Node-${cv.node}`;
      pie.percent = (cv.size - cv.free) / cv.size;
      templete.tags = cv.cpus;
      templete.free = cv.free;
      templete.total = cv.size;
      nodeData.push(templete, pie);
      return cv;
    });
  const halfContentHeight = content?.clientHeight / 2;

  let vnumaX = 50;
  let pnumaX = 50;
  let pieX = 230;
  let anchorX = 148;
  const newNodeData = nodeData?.map((cv: any) => {
    if (cv.type === "vnuma") {
      const nodeHeight = Math.ceil(cv.tags.length / 6) * 32 + 32;
      cv.y = halfContentHeight - 61 - nodeHeight;
      cv.x = vnumaX;
      vnumaX += 250;
    }
    if (cv.type === "pnuma") {
      cv.y = halfContentHeight + 22;
      cv.x = pnumaX;
      pnumaX += 250;
    }
    if (cv.type === "Ring") {
      cv.y = halfContentHeight + 11 + 71;
      cv.x = pieX;
      pieX += 250;
    }
    if (cv.type === "anchor") {
      cv.y = halfContentHeight - 36;
      cv.x = anchorX;
      anchorX += 250;
    }
    return cv;
  });
  data.nodes[0].x = (vnumaX - 250 - 50) / 2 + 50 + 100;
  data.nodes[0].y = halfContentHeight;
  data.nodes.push(...newNodeData);
  vmTopology?.map((cv: any) => {
    data.edges.push({
      source: `vNUMA Node-${cv.nodeID}`,
      target: `pNUMA Node-${cv.phyNodeID}`,
      size: 2,
      color: "#96989B",
      style: {
        lineDash: [4, 2.5], // 虚线边
      },
    });
    return cv;
  });
};
export default getData;
