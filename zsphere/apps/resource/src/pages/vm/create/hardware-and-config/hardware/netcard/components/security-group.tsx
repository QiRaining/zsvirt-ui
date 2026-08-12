import { Text } from "@zstack/design";
import { VmNicDefaultNetflowStrategy } from "@zstack/virtualization-resource/src/pages/security-group/components/VmNicNetflowStrategy";
import SecurityGroupList from "@zstack/virtualization-resource/src/pages/security-group/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form, SortableList } from "@zstack/zsphere-components";
import { Op, SecurityGroupState } from "@zstack/zsphere-types";
import type {
  SecurityGroup as ISecurityGroup,
  VmNic as IVmNic,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "../style.module.less";

interface IProps {
  form: any;
  index: number;
  origin?: IVmNic;
}

const { Item } = Form;

const SecurityGroup: React.FC<IProps> = ({ form, index, origin }) => {
  const intl = useIntl();

  return (
    <Item
      auth={{
        type: "block",
        authKey: "view",
        resource: "security.group",
      }}
      noStyle
      shouldUpdate={(pre, cur) =>
        pre[`nicType-${index}`] !== cur[`nicType-${index}`]
      }
    >
      {() => {
        return form.getFieldValue(`nicType-${index}`) !== "SR-IOV" ? (
          <>
            <Item
              noStyle
              shouldUpdate={(pre, cur) =>
                pre[`securityGroup-${index}`] !== cur[`securityGroup-${index}`]
              }
            >
              {({ getFieldValue, setFields }) => {
                const selectedSgList: ISecurityGroup[] = _.compact(
                  getFieldValue(`securityGroup-${index}`),
                );

                return (
                  <Item
                    label={intl.formatMessage({
                      id: "virtualization.create.instance.hardware.network.card.securityGroup",
                      defaultMessage: "Security Group",
                    })}
                    name={`securityGroup-${index}`}
                    icon="info"
                    iconTooltip={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "virtualization.create.instance.hardware.network.card.securityGroup.iconTooltip",
                          defaultMessage: `### Security Group

The security group rules are ordered by priority. A smaller number indicates a higher priority. Configure carefully to prevent rule conflicts between security groups.`,
                        })}
                      </ReactMarkdown>
                    }
                  >
                    <ModalSelect
                      title={intl.formatMessage({
                        id: "virtualization.create.instance.hardware.network.card.select.securityGroup",
                        defaultMessage: "Select Security Group",
                      })}
                      selectType="checkbox"
                      className={styles["width-200"]}
                      modalWidth={800}
                      label={intl.formatMessage({
                        id: "add.sg",
                        defaultMessage: "Add Security Group",
                      })}
                      renderSelectedList={() => {
                        return (
                          <SortableList
                            className={styles.sortableList}
                            dataSource={_.compact(selectedSgList).map(
                              (it, i) => ({
                                ...it,
                                key: it.uuid,
                                index: i + 1,
                                content: (
                                  <div>
                                    <Text>{it.name}</Text>
                                  </div>
                                ),
                              }),
                            )}
                            onSortEnd={(dataSource: ISecurityGroup[]) => {
                              setFields([
                                {
                                  name: `securityGroup-${index}`,
                                  value: dataSource,
                                },
                              ]);
                            }}
                            onTrash={(item: ISecurityGroup) => {
                              setFields([
                                {
                                  name: `securityGroup-${index}`,
                                  value: selectedSgList.filter(
                                    (it) => it.uuid !== item.uuid,
                                  ),
                                },
                              ]);
                            }}
                          />
                        );
                      }}
                    >
                      <SecurityGroupList
                        view="select"
                        defaultQuery={{
                          conditions: [
                            {
                              key: "state",
                              op: Op.notIn,
                              values: [SecurityGroupState.Disabled],
                            },
                          ],
                        }}
                      />
                    </ModalSelect>
                  </Item>
                );
              }}
            </Item>
            <Item
              noStyle
              shouldUpdate={(pre, cur) =>
                pre[`securityGroup-${index}`] !== cur[`securityGroup-${index}`]
              }
            >
              {({ getFieldValue }) => {
                const isExitedNic = !!origin?.uuid;

                const selectedSgList: ISecurityGroup[] = _.compact(
                  getFieldValue(`securityGroup-${index}`),
                );

                return isExitedNic && selectedSgList.length > 0 ? (
                  <VmNicDefaultNetflowStrategy
                    width="s"
                    ingressPolicyName={`ingressPolicy-${index}`}
                    egressPolicyName={`egressPolicy-${index}`}
                  />
                ) : null;
              }}
            </Item>
          </>
        ) : null;
      }}
    </Item>
  );
};

export default React.memo(SecurityGroup);
