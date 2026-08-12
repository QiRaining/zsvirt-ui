import { useBuildTriggerName } from "@zstack/zsphere-components";
import { useActionConfig } from "@zstack/zsphere-engine/src/alarm-platform-message";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";

import ConfirmAction from "../action/confirm";
import HandleMessageAction from "../action/handle-message-modal";
import MarkAllAsReadAction from "../action/mark-all-read";
import RecoverAction from "../action/recover";

export default (list?: AlarmHistories[]) => {
  const buildTriggerName = useBuildTriggerName();

  const actionConfig = useActionConfig<AlarmHistories>([
    {
      key: "recover.alarm",
      ActionWrapper: RecoverAction,
      validators: [
        (current: AlarmHistories) =>
          current.ackData! && !current.ackData?.resumeAlert,
      ],
    },
    {
      key: "handle.message",
      ActionWrapper: HandleMessageAction,
      validators: [
        (current: AlarmHistories) =>
          !current.ackData! || !!current.ackData?.resumeAlert,
      ],
    },
    {
      key: "all.mark.read",
      autoInjectPreValidator: false,
      ActionWrapper: (props: any) => (
        <MarkAllAsReadAction {...props} selectedList={list ?? []} />
      ),
    },
    {
      key: "mark.as.readed.single",
      validators: [(current: AlarmHistories) => !current.readStatus],
      ActionWrapper: ConfirmAction,
    },
  ]);

  return {
    ...actionConfig,
    getItemName: (current: AlarmHistories) => buildTriggerName(current),
  };
};
