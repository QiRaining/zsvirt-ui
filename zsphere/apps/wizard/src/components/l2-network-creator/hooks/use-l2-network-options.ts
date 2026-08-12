import { useMemo } from "react";
import { useIntl } from "react-intl";

export const useL2NetworkOptions = () => {
  const intl = useIntl();
  const l2NetworkOptions = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "wizard.create.l2.network.form.default",
          defaultMessage: "Default Switch",
        }),
        value: "default",
      },
      {
        label: intl.formatMessage({
          id: "wizard.create.l2.network.form.create",
          defaultMessage: "New Switch",
        }),
        value: "create",
      },
    ],
    [intl],
  );
  return l2NetworkOptions;
};
