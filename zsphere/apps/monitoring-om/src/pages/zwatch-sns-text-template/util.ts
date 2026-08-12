import { get } from "lodash-es";

export const getMicrosoftTeamsTemplate = (temp: string) => {
  try {
    const tempObj = JSON.parse(temp);
    const json = get(tempObj, ["sections", "0", "facts"]);

    return JSON.stringify(
      {
        facts: json,
      },
      null,
      2,
    );
  } catch (e) {
    console.error(e);
  }
};
