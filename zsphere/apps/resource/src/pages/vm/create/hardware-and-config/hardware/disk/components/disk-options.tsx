import { Form, Select } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  isRoot: boolean;
  index: number;
  onlyShowBasic?: boolean; ///在模版开发时期内，新增的硬盘可能不支持现有或者rdm，这是一个阶段性参数
}

const { Item } = Form;

const STYLE_WIDTH_200 = { width: 200 } as const;

const useGetCreateDiskOptions = (
  systemImage: boolean,
  onlyShowBasic?: boolean,
) => {
  const intl = useIntl();

  const baseOptions = [
    {
      value: "new",
      text: intl.formatMessage({
        id: "virtualization.create.instance.hardware.disk.createType.new",
        defaultMessage: "New Disk",
      }),
    },
    {
      value: "image",
      text: systemImage
        ? intl.formatMessage({
            id: "virtualization.create.instance.hardware.diskImage.systemImage",
            defaultMessage: "System Image",
          })
        : intl.formatMessage({
            id: "virtualization.create.instance.hardware.diskImage",
            defaultMessage: "Disk Image",
          }),
    },
  ];

  const createdAndLun = [
    {
      value: "created",
      text: intl.formatMessage({
        id: "virtualization.create.instance.hardware.disk.createType.created",
        defaultMessage: "Existing Disk",
      }),
    },
    {
      value: "rdm",
      text: intl.formatMessage({
        id: "virtualization.create.instance.hardware.disk.createType.RDM",
        defaultMessage: "RDM Disk",
      }),
    },
  ];

  return onlyShowBasic ? baseOptions : baseOptions.concat(createdAndLun);
};
const DiskOptions: React.FC<IProps> = ({
  index,
  isRoot,
  onlyShowBasic = false,
}) => {
  const intl = useIntl();
  const systemImage = isRoot || index === 0;

  //获取创建硬盘的筛选项
  const createDiskoptions = useGetCreateDiskOptions(systemImage, onlyShowBasic);

  return (
    <>
      <Item
        name={`diskCreateType-${index}`}
        label={intl.formatMessage({
          id: "virtualization.create.instance.hardware.disk.create.way",
          defaultMessage: "Creation Method",
        })}
        initialValue="new"
      >
        <Select style={STYLE_WIDTH_200}>
          {createDiskoptions.map((t) => (
            <Select.Option value={t.value} key={t.value}>
              {t.text}
            </Select.Option>
          ))}
        </Select>
      </Item>
    </>
  );
};

export default React.memo(DiskOptions);
