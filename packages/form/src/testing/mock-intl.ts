import { IntlLike } from "../validation";

export const createMockIntl = (): IntlLike => ({
  formatMessage: ({ defaultMessage }, values) => {
    if (!values) {
      return defaultMessage;
    }

    return Object.entries(values).reduce(
      (message, [key, value]) =>
        message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
      defaultMessage,
    );
  },
});
