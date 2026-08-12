import { useIntl } from "react-intl";

import style from "./style.module.less";

export default function Loader(props: { loading: boolean }) {
  const { loading } = props;
  const intl = useIntl();

  if (loading) {
    return (
      <div className={style.container}>
        <div className={style.indicator}>
          <svg width="16px" height="12px">
            <polyline
              className={style.back}
              points="1 6 4 6 6 11 10 1 12 6 15 6"
            />
            <polyline
              className={style.front}
              points="1 6 4 6 6 11 10 1 12 6 15 6"
            />
          </svg>
        </div>
        <div className={style.loading}>
          {intl.formatMessage({ id: "loading", defaultMessage: "Loading" })}
        </div>
      </div>
    );
  }
  return null;
}
