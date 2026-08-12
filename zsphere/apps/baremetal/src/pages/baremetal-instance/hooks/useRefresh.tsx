import { useLazyQuery } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import { useInterval } from "ahooks";
import { useState } from "react";

interface Flag {
  key: string;
  value: any;
}

const useRefresh = (
  gqlQuery: any,
  stopFlag: Flag[],
  resourceListName: string = "baremetalInstanceList",
) => {
  const [interval, setInterval] = useState<number | null>(null);
  const [uuidList, setUuidList] = useState<string[]>([]);

  const [queryList, { data: _data }] = useLazyQuery(gqlQuery, {
    onCompleted(data) {
      const { list = [] } = data?.[resourceListName] ?? {};
      const _list: any[] = list.filter(
        (item: any) =>
          !stopFlag.every((flag: Flag) => item?.[flag.key] === flag.value),
      );
      if (_list.length === 0) {
        setInterval(null);
      } else {
        setUuidList(_list.map((item) => item.uuid));
      }
    },
    fetchPolicy: "network-only",
  });

  useInterval(
    () => {
      queryList({
        variables: {
          conditions: [
            {
              key: "uuid",
              op: Op.in,
              values: uuidList,
            },
          ],
        },
      });
    },
    interval,
    {
      immediate: true,
    },
  );

  const callBack = (_uuidList: string[]) => {
    setUuidList(_uuidList);
    setInterval(10000);
  };

  return {
    callBack,
  };
};

export { useRefresh };
