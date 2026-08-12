import { useQuery, gql } from "@apollo/client";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { navigateToUrl } from "single-spa";

import type { NoVncProps } from "./context";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
    }
  }
`;

export default function useCheckAuth(props?: NoVncProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!props?.options?.token) {
      navigateToUrl("/exception/401");
    }
  }, [props?.options?.token]);

  useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "ui",
      name: "novnc.resource.permission.check",
    },
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      if (data?.globalConfig?.value === "true") {
        navigate(window.location.pathname, { replace: true });
      }
    },
  });
}
