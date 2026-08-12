import { Icon } from "@zstack/icon";

export default function Loader() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon type="loader" />
    </div>
  );
}
