import { useSearchParams } from "react-router";

import KeyDetail from "./key/detail";

export default function Detail() {
  const [searchParams] = useSearchParams();
  return <KeyDetail uuid={searchParams.get("uuid") as string} />;
}
