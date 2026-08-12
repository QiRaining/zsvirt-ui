import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@zstack/design";
import { FieldStack, useDialogHookFormAdapter } from "@zstack/form";
import SelectTag from "@zstack/virtualization-resource/src/pages/tag/components/select-tag/index";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import {
  Identity,
  Op,
  type IActionWrapperProps,
  type IQuery,
} from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  Tag as ITag,
  ManagementTagPayload,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName, bus } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import { type FC, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createManagementTagSchema, type ManagementTagValues } from "./schema";

import styles from "../style.module.less";

const ADMINUUID = "36c27e8ff05c4780bf6d2fa65700f22e";

const managementTag = gql`
  mutation managementTag($input: ManagementTagInput!) {
    managementTag(input: $input) {
      actionId
    }
  }
`;

const Action: FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const { currentUser } = usePlatformStore();

  const defaultValues = useMemo<ManagementTagValues>(
    () => ({
      tags:
        _.compact(selectedList).length === 1
          ? (selectedList?.[0]?.tag ?? [])
          : [],
    }),
    [selectedList],
  );
  const formSchema = useMemo(() => createManagementTagSchema(), []);
  const form = useForm<ManagementTagValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = (values: ManagementTagValues) => {
    const tags = values.tags.map((it: ITag) => it.uuid);
    const payload: ManagementTagPayload[] = [];

    _.compact(selectedList).forEach((it) => {
      const originTags = it.tag?.map((tag) => tag.uuid) ?? [];
      const removeTagUuids = _.difference(originTags, tags);
      const addTagUuids = _.difference(tags, originTags);
      if (!removeTagUuids?.length && !addTagUuids.length) {
        return;
      }
      payload.push({
        removeTagUuids,
        addTagUuids,
        resourceUuids: [it.uuid],
      });
    });

    // hack, 避免空请求
    if (_.isEmpty(payload)) {
      _.compact(selectedList).forEach((it) => {
        const originTags = it.tag?.map((tag) => tag.uuid);
        payload.push({
          removeTagUuids: [],
          addTagUuids: originTags ?? [],
          resourceUuids: [it.uuid],
        });
      });
    }

    doAction({
      mutation: managementTag,
      payload,
      name: intl.formatMessage({
        id: "tag.management",
        defaultMessage: "Tag Management",
      }),
      total: 1,
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
        const resourceType = selectedList?.[0]?.__typename;
        if (resourceType) {
          bus.emit(`action:refetch:${resourceType}`);
        }
      },
    });
    setVisible(false);
  };

  const isAdmin = _.includes(
    [Identity.PlatformAdmin, Identity.Admin],
    currentUser?.currentIdentity,
  );

  const tagDefaultQuery = useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [];

    // 单选
    if (selectedList.length === 1) {
      if (isAdmin) {
        conditions.push({
          key: "ownerUuids",
          op: Op.in,
          values: _.compact(
            _.uniq([ADMINUUID, selectedList?.[0]?.owner?.uuid]),
          ),
        });
      }
    }

    // 多选
    if (selectedList.length > 1) {
      if (isAdmin) {
        conditions.push({
          key: "ownerUuids",
          op: Op.in,
          values: [ADMINUUID],
        });
      }
    }

    return {
      conditions,
    };
  }, [selectedList, isAdmin]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "tag.management",
        defaultMessage: "Tag Management",
      })}
      form={dialogForm}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel>
                  {intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}
                </FormLabel>
                <div className="flex flex-col">
                  <SelectTag
                    value={field.value}
                    onChange={field.onChange}
                    className={styles["width-320"]}
                    defaultQuery={tagDefaultQuery}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
