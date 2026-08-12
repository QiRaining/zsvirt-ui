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
    | "violet"
    | "purple"
    | "red"
    | "yellow"
    | "yellow-green"
    | "green"
    | "teal";
  export type IMode = "dark" | "light";
  export type ISemanticNumber = 50 | 100 | 200 | 300 | 400 | 500 | 600;
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
}

const getThemeColor = (
  theme: Color.ITheme,
  mode: Color.IMode = "light",
  number: Color.IThemeNumber = 600,
): string => {
  const colors = palette[mode][theme] as Record<string, string>;
  return colors[`@color-${number}`] || "";
};

const getNeutralColor = (
  mode: Color.IMode = "light",
  number: Color.INeutralNumber = 700,
): string => {
  const colors = palette[mode].neutral as Record<string, string>;
  return colors[`@neutral-${number}`] || "";
};

const getSemanticColor = (
  semantic: Color.ISemantic,
  mode: Color.IMode = "light",
  number: Color.ISemanticNumber = 500,
): string => {
  const colors = palette[mode].semantic as Record<string, string>;
  if (semantic === "disabled") {
    return getNeutralColor(mode, number);
  }
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

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  const red = parseInt(result[1], 16);
  const green = parseInt(result[2], 16);
  const blue = parseInt(result[3], 16);
  return [red, green, blue];
}

/**
 * 将旧变量名映射到 Tailwind CSS v4 变量名
 * 例如：--color-600 → --color-theme-600, --neutral-700 → --color-neutral-700
 */
const setTailwindVariable = (cssName: string, value: string) => {
  if (cssName.startsWith("--color-ai-")) {
    document.body.style.setProperty(
      cssName.replace("--color-ai-", "--color-theme-ai-"),
      value,
    );
  } else if (cssName.startsWith("--color-")) {
    document.body.style.setProperty(
      cssName.replace("--color-", "--color-theme-"),
      value,
    );
  } else if (cssName.startsWith("--neutral-")) {
    document.body.style.setProperty(
      cssName.replace("--neutral-", "--color-neutral-"),
      value,
    );
  } else if (cssName.startsWith("--danger-")) {
    document.body.style.setProperty(
      cssName.replace("--danger-", "--color-danger-"),
      value,
    );
  } else if (cssName.startsWith("--info-")) {
    document.body.style.setProperty(
      cssName.replace("--info-", "--color-info-"),
      value,
    );
  } else if (cssName.startsWith("--alert-")) {
    document.body.style.setProperty(
      cssName.replace("--alert-", "--color-alert-"),
      value,
    );
  } else if (cssName.startsWith("--positive-")) {
    document.body.style.setProperty(
      cssName.replace("--positive-", "--color-positive-"),
      value,
    );
  } else if (cssName.startsWith("--pending-")) {
    document.body.style.setProperty(
      cssName.replace("--pending-", "--color-pending-"),
      value,
    );
  } else if (cssName.startsWith("--teal-")) {
    document.body.style.setProperty(
      cssName.replace("--teal-", "--color-teal-"),
      value,
    );
  }
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
      Object.entries<string>(item).forEach(([name, value]) => {
        const cssName = name.replace("@", "--");
        document.body.style.setProperty(cssName, value);
        const rgb = hexToRgb(value);
        if (rgb) {
          document.body.style.setProperty(
            name.replace("@", "--rgb-"),
            rgb.join(","),
          );
        }
        setTailwindVariable(cssName, value);
      });
    });
    if (mode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
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
  setTailwindVariable,
  getPercentageColor,
};
