import { useMount, usePersistFn } from "ahooks";
import { Col, Row } from "antd";
import React, {
  FC,
  useRef,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";

import { getBaseCls } from "../../../../_utils/common";
import MainContent from "./content";
import { SearchContext } from "./context";
import Filter from "./filter";
import LeftMenu from "./left-menu";
import ResourceAttributeSearch from "./resource-attribute";
import TagButton from "./tag";
import type { ISearch, ICandidate, IOption } from "./type";

import "./style.less";

export { useSearch } from "./hook";

interface ISearchComponent extends FC<ISearch> {
  Filter: typeof Filter;
}

const SearchAdvanced: ISearchComponent = ({
  candidates,
  resourceAttributeSearch,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<ICandidate>();
  const [mainCandidates, setMainCandidates] = useState<ICandidate[]>([]);
  const [tagCandidates, setTagCandidates] = useState<ICandidate[]>([]);
  const mainCandidatesRef = useRef<ICandidate[]>([]);
  const tagCandidatesRef = useRef<ICandidate[]>([]);
  const { dispatch } = useContext(SearchContext);

  const isEqual = (value: ICandidate[], other: ICandidate[]) =>
    JSON.stringify(value) === JSON.stringify(other);

  useMount(() => {
    setSelectedCandidate(candidates[0]);
  });

  useEffect(() => {
    if (candidates.length > 0) {
      const newMainCandidates = candidates.filter(
        (item) => item.type !== "tag" && !item.key.includes("tag"),
      );
      if (
        newMainCandidates.length > 0 &&
        !isEqual(newMainCandidates, mainCandidatesRef.current)
      ) {
        mainCandidatesRef.current = newMainCandidates;
        setMainCandidates(newMainCandidates);
        if (selectedCandidate) {
          const newSelectedCandidate = newMainCandidates.find(
            (item) => item.key === selectedCandidate.key,
          );
          setSelectedCandidate(newSelectedCandidate!);
        }
      }
      const newTagCandidates = candidates.filter((item) => item.type === "tag");
      if (
        newTagCandidates.length > 0 &&
        !isEqual(newTagCandidates, tagCandidatesRef.current)
      ) {
        tagCandidatesRef.current = newTagCandidates;
        setTagCandidates(newTagCandidates);
      }
    }
  }, [candidates, selectedCandidate]);

  const menuOptions = useMemo(
    () =>
      mainCandidates.map((item) => ({
        key: item.key,
        label: item.label,
      })),
    [mainCandidates],
  );

  const handleMenuChange = (value: IOption) => {
    const newSelectedCandidate = mainCandidates.find(
      (item) => item.key === value.key,
    );
    newSelectedCandidate?.onSearch?.();
    setSelectedCandidate(newSelectedCandidate!);
  };

  const handleSearch = usePersistFn(
    (name: IOption, values: IOption[], needClear?: boolean) => {
      if (needClear) {
        dispatch?.({
          type: "set",
          payload: {
            conditions: [
              {
                name,
                values,
              },
            ],
          },
        });
      } else if (values.length > 0 || name.type === "attribute") {
        dispatch?.({
          type: "add",
          payload: {
            condition: {
              name,
              values,
            },
            sortBy: candidates.map((item) => item.key),
          },
        });
      } else {
        dispatch?.({
          type: "remove",
          payload: {
            key: name.key,
          },
        });
      }
    },
  );

  return (
    <Row className={getBaseCls("search-advanced")} wrap={false}>
      <Col className={getBaseCls("search-wrapper")}>
        <LeftMenu options={menuOptions} onChange={handleMenuChange} />
        {selectedCandidate && (
          <MainContent candidate={selectedCandidate} onOk={handleSearch} />
        )}
      </Col>
      {tagCandidates.length > 0 && (
        <Col className={getBaseCls("tag-wrapper")}>
          <TagButton candidates={tagCandidates} onOk={handleSearch} />
        </Col>
      )}
      {resourceAttributeSearch && (
        <Col className={getBaseCls("tag-wrapper")}>
          <ResourceAttributeSearch
            keyList={resourceAttributeSearch.keyList}
            onOk={handleSearch}
          />
        </Col>
      )}
    </Row>
  );
};

SearchAdvanced.Filter = Filter;

export default SearchAdvanced;

export type { ICandidate };
export { SearchContext };
