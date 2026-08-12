import alova from "@zstack/alova-instance";
import { useIntl } from "react-intl";

const useSearchDoc = () => {
  const intl = useIntl();
  const search = async (word: string) => {
    const data = await alova
      .Get<Array<any>>("/api/search/doc", {
        params: {
          q: word,
          language: intl.locale,
        },
      })
      .send();
    return data || [];
  };

  return {
    search,
  };
};

export default useSearchDoc;
