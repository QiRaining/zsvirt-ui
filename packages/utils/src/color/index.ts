import palette from "./palette";

export namespace Color {
  export type ISemantic =
    | "positive"
    | "info"
    | "alert"
    | "danger"
    | "pending"
    | "disabled"
    | "normal";
  export type ITheme =
    | "blue"
    | "navyblue"
    | "sapphire"
    | "violet"
    | "purple"
    | "red"
    | "yellow"
    | "yellow-green"
    | "green"
    | "teal";
  export type IMode = "dark" | "light";
  export type ISemanticNumber = 50 | 100 | 200 | 400 | 500 | 600;
  export type IThemeNumber =
    | 50
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900;
  export type INeutralNumber =
    | 0
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900;
}

const getThemeColor = (
  theme: Color.ITheme,
  mode: Color.IMode = "light",
  number: Color.IThemeNumber = 600,
): string => {
  const colors = palette[mode][theme];
  return colors[`@color-${number}`] || "";
};

const getNeutralColor = (
  mode: Color.IMode = "light",
  number: Color.INeutralNumber = 700,
): string => {
  const colors = palette[mode].neutral;
  return colors[`@neutral-${number}`] || "";
};

const getSemanticColor = (
  semantic: Color.ISemantic,
  mode: Color.IMode = "light",
  number: Color.ISemanticNumber = 500,
): string => {
  const colors = palette[mode].semantic;
  if (semantic === "disabled") {
    // @ts-ignore
    return getNeutralColor(mode, number);
  }
  // @ts-ignore
  return colors[`@${semantic}-${number}`] || "";
};

const tagColorMap = new Map<string, string>();
//将3.x系统中遗留的tag颜色转换成主题色
tagColorMap.set("#186EAE", getThemeColor("blue", "light", 600));
tagColorMap.set("#2CA6E6", getThemeColor("teal", "light", 600));
tagColorMap.set("#7385A8", getThemeColor("violet", "light", 600));
tagColorMap.set("#8A65D4", getThemeColor("purple", "light", 600));
tagColorMap.set("#D14B52", getThemeColor("red", "light", 600));
tagColorMap.set("#DF9900", getThemeColor("yellow", "light", 600));
tagColorMap.set("#918A12", getThemeColor("yellow-green", "light", 600));
tagColorMap.set("#318857", getThemeColor("green", "light", 600));

const getTagColor = (originColor: string): string => {
  return tagColorMap.get(originColor) || originColor;
};

const changeTheme = ({
  mode = "light",
  theme = "blue",
}: {
  mode: Color.IMode;
  theme: Color.ITheme;
}) => {
  if (
    mode &&
    theme &&
    palette[mode].neutral &&
    palette[mode].semantic &&
    palette[mode][theme]
  ) {
    [
      palette[mode].neutral,
      palette[mode].semantic,
      palette[mode][theme],
    ].forEach((item) => {
      Object.entries(item).forEach(([name, value]) => {
        name = name.replace("@", "--");
        if (typeof document !== "undefined") {
          document.body.style.setProperty(name, value as string);

          // 同时设置 Tailwind CSS v4 需要的变量名
          // 这样切换主题时 Tailwind 的 utility classes 也能立即生效
          if (name.startsWith("--color-ai-")) {
            // --color-ai-100 -> --color-theme-ai-100
            const tailwindName = name.replace(
              "--color-ai-",
              "--color-theme-ai-",
            );
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--color-")) {
            // --color-50 -> --color-theme-50
            const tailwindName = name.replace("--color-", "--color-theme-");
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--neutral-")) {
            // --neutral-100 -> --color-neutral-100
            const tailwindName = name.replace("--neutral-", "--color-neutral-");
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--danger-")) {
            const tailwindName = name.replace("--danger-", "--color-danger-");
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--info-")) {
            const tailwindName = name.replace("--info-", "--color-info-");
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--alert-")) {
            const tailwindName = name.replace("--alert-", "--color-alert-");
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--positive-")) {
            const tailwindName = name.replace(
              "--positive-",
              "--color-positive-",
            );
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--pending-")) {
            const tailwindName = name.replace("--pending-", "--color-pending-");
            document.body.style.setProperty(tailwindName, value as string);
          } else if (name.startsWith("--teal-")) {
            const tailwindName = name.replace("--teal-", "--color-teal-");
            document.body.style.setProperty(tailwindName, value as string);
          }
        }
      });
    });
    if (typeof document !== "undefined") {
      if (mode === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }
  }
};

/**
 * 根据百分比获取颜色值
 */
const getPercentageColor = (
  percent: number,
  isInverse: boolean = false,
): string => {
  if (!isInverse) {
    if (percent > 80) {
      return getSemanticColor("danger", "light", 500);
    }
    if (percent > 60) {
      return getSemanticColor("alert", "light", 500);
    }
    return getSemanticColor("info", "light", 500);
  }
  if (percent < 20) {
    return getSemanticColor("danger", "light", 500);
  }
  if (percent < 40) {
    return getSemanticColor("alert", "light", 500);
  }
  return getSemanticColor("info", "light", 500);
};

export {
  palette,
  getSemanticColor,
  getNeutralColor,
  getThemeColor,
  getTagColor,
  changeTheme,
  getPercentageColor,
};
