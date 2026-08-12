import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
/**
 * @description 封装好的分页组件，可以直接用
 */
("use client");
import { useIntl } from "react-intl";

import { useId } from "../../../utils/use-id.ts";
import { InputNumber } from "../input-number.tsx";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "../select";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from "./pagination";

interface IPaginationProps {
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  count: number;
}

export const Pagination = (props: IPaginationProps) => {
  const { pagination, setPagination, count } = props;
  const intl = useIntl();
  const viewPort = 5;
  const pageCount = Math.ceil(count / pagination.pageSize);
  const [pageValue, setPageValue] = useState<number | "">("");
  const id = useId();
  const pageList = useMemo(() => {
    const _pageList: (string | number)[] = ["previous"];

    if (pageCount < 8) {
      _pageList.push(...Array.from({ length: pageCount }, (_, i) => i), "next");
    } else {
      if (pagination.pageIndex < 0 + (viewPort - 1)) {
        _pageList.push(
          ...Array.from({ length: viewPort }, (_, i) => i),
          "right-jump",
          pageCount - 1,
          "next",
        );
      } else if (
        pagination.pageIndex >= 0 + (viewPort - 1) &&
        pagination.pageIndex <= pageCount - (viewPort - 1)
      ) {
        _pageList.push(
          0,
          "left-jump",
          ...Array.from(
            { length: Math.floor(viewPort / 2) },
            (_, i) => pagination.pageIndex - 1 - i,
          ).reverse(),
          pagination.pageIndex,
          ...Array.from(
            { length: Math.floor(viewPort / 2) },
            (_, i) => pagination.pageIndex + 1 + i,
          ),
          "right-jump",
          pageCount - 1,
          "next",
        );
      } else {
        _pageList.push(
          0,
          "left-jump",
          ...Array.from(
            { length: viewPort },
            (_, i) => pageCount - 1 - i,
          ).reverse(),
          "next",
        );
      }
    }
    return _pageList;
  }, [count, pagination.pageIndex, pagination.pageSize, pageCount]);

  return (
    <div className="flex h-8 items-center gap-6">
      <PaginationRoot className="mx-0 h-8 w-auto">
        <PaginationContent className="h-8 gap-1 whitespace-nowrap">
          {pageList.map((item) => {
            if (item === "previous") {
              return (
                <PaginationPrevious
                  onClick={() => {
                    setPagination({
                      ...pagination,
                      pageIndex: pagination.pageIndex - 1,
                    });
                  }}
                  key="previous"
                  disabled={pagination.pageIndex === 0}
                />
              );
            }
            if (item === "next") {
              return (
                <PaginationNext
                  onClick={() => {
                    setPagination({
                      ...pagination,
                      pageIndex: pagination.pageIndex + 1,
                    });
                  }}
                  key={"next"}
                  disabled={pagination.pageIndex + 1 === pageCount}
                />
              );
            }
            if (item === "right-jump") {
              return (
                <PaginationEllipsis
                  direction="right"
                  onClick={() => {
                    setPagination({
                      ...pagination,
                      pageIndex: Math.min(
                        pagination.pageIndex + viewPort,
                        pageCount - 1,
                      ),
                    });
                  }}
                  key={"right-jump"}
                />
              );
            }
            if (item === "left-jump") {
              return (
                <PaginationEllipsis
                  direction="left"
                  onClick={() => {
                    setPagination({
                      ...pagination,
                      pageIndex: Math.max(pagination.pageIndex - viewPort, 0),
                    });
                  }}
                  key="left-jump"
                />
              );
            }
            return (
              <PaginationLink
                isActive={item === pagination.pageIndex}
                onClick={() => {
                  setPagination({
                    ...pagination,
                    pageIndex: item as number,
                  });
                }}
                key={item}
              >
                {(item as number) + 1}
              </PaginationLink>
            );
          })}
        </PaginationContent>
      </PaginationRoot>

      <div
        className="flex h-8 items-center gap-4 text-sm"
        id={`pagination-select-container-${id}`}
      >
        <SelectRoot
          value={pagination.pageSize + ""}
          onValueChange={(v) => {
            setPagination({
              pageIndex: 0,
              pageSize: Number(v),
            });
          }}
        >
          <SelectTrigger className="h-8 w-auto text-nowrap">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            selectPortalProps={{
              container: document.getElementById(
                `pagination-select-container-${id}`,
              ),
            }}
          >
            <SelectGroup>
              <SelectItem value="10" className="px-2 py-1.5">
                <div>
                  10&nbsp;
                  {intl.formatMessage({
                    id: "pagination.item.page",
                    defaultMessage: "项/页",
                  })}
                </div>
              </SelectItem>
              <SelectItem value="20" className="px-2 py-1.5">
                <div>
                  20&nbsp;
                  {intl.formatMessage({
                    id: "pagination.item.page",
                    defaultMessage: "项/页",
                  })}
                </div>
              </SelectItem>
              <SelectItem value="50" className="px-2 py-1.5">
                <div>
                  50&nbsp;
                  {intl.formatMessage({
                    id: "pagination.item.page",
                    defaultMessage: "项/页",
                  })}
                </div>
              </SelectItem>
              <SelectItem value="100" className="px-2 py-1.5">
                <div>
                  100&nbsp;
                  {intl.formatMessage({
                    id: "pagination.item.page",
                    defaultMessage: "项/页",
                  })}
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectRoot>

        <div className="flex h-8 items-center gap-2">
          <div className="whitespace-nowrap">
            {intl.formatMessage({
              id: "pagination.jump.to",
              defaultMessage: "跳至",
            })}
          </div>
          <InputNumber
            className="h-8 w-20"
            value={pageValue}
            controls={false}
            onValueChange={(v) => setPageValue(v)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (
                  !isNaN(Number(pageValue)) &&
                  Number(pageValue) >= 1 &&
                  Number(pageValue) <= pageCount
                ) {
                  setPagination({
                    ...pagination,
                    pageIndex: Number(pageValue) - 1,
                  });
                }
              }
            }}
          />
          <div className="whitespace-nowrap">
            {intl.formatMessage({
              id: "pagination.page",
              defaultMessage: "页",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
