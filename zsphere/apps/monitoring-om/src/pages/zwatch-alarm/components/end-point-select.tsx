import { useQuery } from "@apollo/client";
import { Button, Checkbox } from "@zstack/design";
import { Select } from "@zstack/zsphere-components";
import { Empty } from "antd";
import React, { useState, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { querySNSApplicationEndpointList } from "../../../gql/zwatch-endpoint.gql";

import style from "./style.module.less";

const EndPointSelect = ({ ...props }) => {
  const intl = useIntl();
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const { value = [], onChange } = props;

  const { data: endPointData } = useQuery(querySNSApplicationEndpointList, {
    fetchPolicy: "no-cache",
  });

  const endPointNameMap: { [prop in string]: string } = useMemo(() => {
    return {
      HTTP: intl.formatMessage({
        id: "HTTP",
        defaultMessage: "HTTP",
      }),
      DingTalk: intl.formatMessage({
        id: "DingTalk",
        defaultMessage: "DingTalk",
      }),
      SYSTEM_HTTP: intl.formatMessage({
        id: "SYSTEM_HTTP",
        defaultMessage: "System",
      }),
      Email: intl.formatMessage({
        id: "Email",
        defaultMessage: "Email",
      }),
      AliyunSms: intl.formatMessage({
        id: "AliyunSms",
        defaultMessage: "SMS",
      }),
      MicrosoftTeams: intl.formatMessage({
        id: "MicrosoftTeams",
        defaultMessage: "Microsoft Teams",
      }),
    };
  }, [intl]);

  const dropdownRender = useCallback(() => {
    const { list = [] }: { list?: any[] } =
      endPointData?.querySNSApplicationEndpointList || {};

    const _onChange = (checkedValue: string[]) => {
      onChange(checkedValue);
    };
    const isSelectAll = () => {
      if (value && list.length) {
        return value.length === list.length;
      }
      return false;
    };

    const handleSelectAll = () => {
      if (isSelectAll()) {
        onChange([]);
      } else {
        onChange(list.map((cv) => cv?.topic?.uuid) || []);
      }
    };

    return (
      <div>
        <div className={style.selectionHeader}>
          <span>
            {intl.formatMessage({ id: "selected", defaultMessage: "Selected" })}(
            {value?.length || 0}/
            {endPointData?.querySNSApplicationEndpointList?.list?.length || 0})
          </span>
          <Button
            variant="link"
            onClick={() => {
              handleSelectAll();
            }}
          >
            {isSelectAll()
              ? intl.formatMessage({
                  id: "selectNone",
                  defaultMessage: "Select None",
                })
              : intl.formatMessage({ id: "selectAll", defaultMessage: "Select All" })}
          </Button>
        </div>
        <div className={style.dropdown}>
          {list.length ? (
            <div>
              {list
                .filter((cv) => cv.name.match(searchKeyword))
                .map((cv) => {
                  const itemValue = cv?.topic?.uuid;
                  const isChecked = value?.includes(itemValue);
                  return (
                    <div className={`flex ${style.selection}`} key={itemValue}>
                      <div className={style["selection-name"]}>
                        <div className="flex items-center">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                _onChange([...value, itemValue]);
                              } else {
                                _onChange(
                                  value.filter((v: string) => v !== itemValue),
                                );
                              }
                            }}
                          />
                          <span className="cursor-pointer pl-2 text-sm">
                            {cv?.type === "SYSTEM_HTTP"
                              ? intl.formatMessage({
                                  id: "systemAlarmNoticeObject",
                                  defaultMessage: "System Endpoint",
                                })
                              : cv?.name}
                          </span>
                        </div>
                      </div>
                      <div className={style["selection-type"]}>
                        {endPointNameMap[cv?.type]}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      </div>
    );
  }, [endPointData, endPointNameMap, intl, onChange, searchKeyword, value]);

  return (
    <Select
      {...props}
      showArrow
      mode="multiple"
      value={value}
      onDropdownVisibleChange={(open) => {
        if (open) {
          setSearchKeyword("");
        }
      }}
      onSearch={(v) => {
        setSearchKeyword(v);
      }}
      options={(
        endPointData?.querySNSApplicationEndpointList?.list as any[]
      )?.map((cv) => ({
        label:
          cv?.type === "SYSTEM_HTTP"
            ? intl.formatMessage({
                id: "systemAlarmNoticeObject",
                defaultMessage: "System Endpoint",
              })
            : cv?.name,
        value: cv?.topic?.uuid,
      }))}
      dropdownRender={dropdownRender}
    />
  );
};

export default EndPointSelect;
