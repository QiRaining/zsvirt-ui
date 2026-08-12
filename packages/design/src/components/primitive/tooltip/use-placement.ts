export function usePlacement(placement?: string): {
  titleSide: "top" | "bottom" | "left" | "right" | undefined;
  titleAlign: "start" | "center" | "end" | undefined;
} {
  switch (placement) {
    case "topLeft":
      return {
        titleSide: "top",
        titleAlign: "end",
      };
    case "top":
      return {
        titleSide: "top",
        titleAlign: "center",
      };
    case "topRight":
      return {
        titleSide: "top",
        titleAlign: "start",
      };

    case "leftTop":
      return {
        titleSide: "left",
        titleAlign: "end",
      };

    case "left":
      return {
        titleSide: "left",
        titleAlign: "center",
      };

    case "leftBottom":
      return {
        titleSide: "left",
        titleAlign: "start",
      };

    case "rightTop":
      return {
        titleSide: "right",
        titleAlign: "end",
      };

    case "right":
      return {
        titleSide: "right",
        titleAlign: "center",
      };

    case "rightBottom":
      return {
        titleSide: "right",
        titleAlign: "start",
      };

    case "bottomLeft":
      return {
        titleSide: "bottom",
        titleAlign: "end",
      };

    case "bottom":
      return {
        titleSide: "bottom",
        titleAlign: "center",
      };

    case "bottomRight":
      return {
        titleSide: "bottom",
        titleAlign: "start",
      };
    default:
      return {
        titleSide: undefined,
        titleAlign: undefined,
      };
  }
}
