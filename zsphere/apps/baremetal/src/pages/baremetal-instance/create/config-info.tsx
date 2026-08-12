import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form, State } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import { useDebounceFn } from "ahooks";
import {
  flatMap as _flatMap,
  includes as _includes,
  uniqBy as _uniqBy,
} from "lodash-es";
import React, {
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useIntl } from "react-intl";

import TableInForm from "../../vm/action/migrate/components/table-in-form";
import BatchConfigModal from "../action/batch-config-modal";
import SingleConfigModal from "../action/single-config-modal";
import type { IAllNics, IInstanceConfig } from "../type";
import { IDeviceType } from "../type";
import { checkInvalidConfigurations, extractNicsFromChassis } from "../utils";
import BaremetalInstanceCreateContext from "./context";

const { Card } = ZSVForm;

const requiredMarkerStyle: React.CSSProperties = {
  marginLeft: 4,
  color: "var(--danger-500)",
};
const editableCursorStyle: React.CSSProperties = { cursor: "pointer" };

export enum ConfigType {
  "Same" = "Same",
  "Custom" = "Custom",
}

interface IProps {
  form: any;
}

const ConfigPart: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { setDisabledFlag } = useContext(BaremetalInstanceCreateContext);

  const [batchConfigModalVisible, setBatchConfigModalVisible] =
    useState<boolean>(false);
  const [singleConfigModalVisible, setSingleConfigModalVisible] =
    useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [instanceConfigs, setInstanceConfigs] = useState<IInstanceConfig[]>([]);
  const [baremetalChassisUuids, setBaremetalChassisUuids] = useState<string[]>(
    [],
  );
  const [allNicsByChassis, setAllNicsByChassis] = useState<
    Record<string, Omit<IAllNics, "label">[]>
  >({});

  const instanceConfigsRef = useRef<IInstanceConfig[]>([]);

  const getFormValues = useCallback(() => {
    const name = form?.getFieldValue("name");
    const preconfigurationTemplate =
      form?.getFieldValue("preconfigurationTemplate") || [];
    const baremetalChassis = form?.getFieldValue("baremetalChassis") || [];
    const distribution =
      (preconfigurationTemplate?.[0]?.distribution as string) ?? "";
    const customParams =
      preconfigurationTemplate?.[0]?.customParams?.filter(
        (param: string) =>
          !_includes(["pxeserver_dhcp_nic_ip", "extra_repo"], param),
      ) ?? [];

    return { name, baremetalChassis, distribution, customParams };
  }, [form]);

  const createInstanceConfigs = useCallback(
    (
      baremetalChassis: IBaremetalChassis[],
      name: string,
      distribution: string,
      customParams: string[],
    ) => {
      return baremetalChassis.map((chassis, index) => ({
        uuid: chassis.uuid,
        chassic: chassis,
        displayName: `${name}-${index}`,
        username: "",
        password: "",
        distribution,
        networkConfigs: [],
        customConfigurations: customParams.map((custom: string) => ({
          key: custom,
          configType: ConfigType.Same,
          value: "",
        })),
        usedNics: [],
      }));
    },
    [],
  );

  const createNicsMapping = useCallback(
    (baremetalChassis: IBaremetalChassis[]) => {
      const nicsMap: Record<string, Omit<IAllNics, "label">[]> = {};
      baremetalChassis.forEach((chassis) => {
        nicsMap[chassis.uuid] = extractNicsFromChassis([chassis]) as Omit<
          IAllNics,
          "label"
        >[];
      });
      return nicsMap;
    },
    [],
  );

  useEffect(() => {
    const { name, baremetalChassis, distribution, customParams } =
      getFormValues();

    if (!baremetalChassis?.length) {
      setInstanceConfigs([]);
      setAllNicsByChassis({});
      setBaremetalChassisUuids([]);
      return;
    }

    const nicsMap = createNicsMapping(baremetalChassis);
    const configs = createInstanceConfigs(
      baremetalChassis,
      name,
      distribution,
      customParams,
    );
    const chassisUuids = configs
      .map(({ chassic }) => chassic?.cluster?.uuid)
      .filter(Boolean);

    setAllNicsByChassis(nicsMap);
    setBaremetalChassisUuids(chassisUuids);
    setInstanceConfigs(configs);
    instanceConfigsRef.current = configs;
    form.setFieldValue("instanceConfigs", configs);
  }, [
    form?.getFieldValue("baremetalChassis"),
    form?.getFieldValue("preconfigurationTemplate"),
    form?.getFieldValue("name"),
    getFormValues,
    createNicsMapping,
    createInstanceConfigs,
  ]);

  const getAllNicsForBatch = useCallback(() => {
    const values = Object.values(allNicsByChassis);
    return values.reduce((acc, val) => acc.concat(val), []);
  }, [allNicsByChassis]);

  const getNicsForChassis = useCallback(
    (uuid: string) => {
      return allNicsByChassis[uuid] || [];
    },
    [allNicsByChassis],
  );

  const { run: searchVM } = useDebounceFn(
    (inputVal: string) => {
      if (inputVal) {
        const result = instanceConfigsRef.current.filter((config) =>
          config.displayName.includes(inputVal),
        );
        setInstanceConfigs(result);
      } else {
        setInstanceConfigs(instanceConfigsRef.current);
      }
    },
    { wait: 600 },
  );

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys: string[]) => {
        setSelectedRowKeys(keys);
      },
    }),
    [selectedRowKeys],
  );

  const handleSingleConfig = useCallback((record: any, index: number) => {
    setCurrentIndex(index);
    setSingleConfigModalVisible(true);
  }, []);

  const updateInstanceConfig = useCallback(
    (index: number, newConfig: Partial<any>) => {
      const updated = [...instanceConfigs];

      if (newConfig.networkConfigs) {
        const usedNics = _flatMap(newConfig.networkConfigs, (config) => {
          if (config.type === IDeviceType.Nic) {
            return [JSON.parse(config.nicConfig.nic).name];
          }
          return config.bondConfig.nic.map((nic: any) => JSON.parse(nic).name);
        });
        updated[index] = {
          ...updated[index],
          ...newConfig,
          usedNics,
        };
      } else {
        updated[index] = { ...updated[index], ...newConfig };
      }

      setInstanceConfigs(updated);
      instanceConfigsRef.current = updated;
      form.setFieldValue("instanceConfigs", updated);
      setDisabledFlag(checkInvalidConfigurations(updated));
    },
    [instanceConfigs, form, setDisabledFlag],
  );

  const updateNicConfigurations = useCallback(
    (instances: any[], nicList: any[]) => {
      return instances.map((instance) => {
        const chassisUuid = instance.chassic.uuid;
        const matchedNic = nicList.find(
          (nic) => nic.chassisUuid === chassisUuid,
        );
        if (!matchedNic) {
          return instance;
        }
        return {
          ...instance,
          networkConfigs: instance.networkConfigs.map((config: any) => {
            if (config.type === "Nic" || config.type === "NicBond") {
              const key = config.type === "Nic" ? "nicConfig" : "bondConfig";
              const nicValue =
                config.type === "Nic" ? matchedNic.value : [matchedNic.value];
              return {
                ...config,
                [key]: {
                  ...config[key],
                  nic: nicValue,
                },
              };
            }
            return config;
          }),
          usedNicValues: [matchedNic.value],
        };
      });
    },
    [],
  );

  const handleSingleConfigCancel = useCallback(() => {
    setSingleConfigModalVisible(false);
    setCurrentIndex(-1);
  }, []);

  const handleSingleConfigSave = useCallback(
    (config: any) => {
      if (currentIndex >= 0) {
        updateInstanceConfig(currentIndex, config);
      }
      setSingleConfigModalVisible(false);
    },
    [currentIndex, updateInstanceConfig],
  );

  const handleBatchConfigCancel = useCallback(() => {
    setBatchConfigModalVisible(false);
    setCurrentIndex(-1);
  }, []);

  const handleBatchConfigSave = useCallback(
    (config: any) => {
      const updated = instanceConfigs.map((item) =>
        selectedRowKeys.includes(item.uuid) ? { ...item, ...config } : item,
      );
      const updatedConfigs = updateNicConfigurations(
        updated,
        getAllNicsForBatch(),
      );
      setInstanceConfigs(updatedConfigs);

      form.setFieldValue("instanceConfigs", updatedConfigs);

      setDisabledFlag(checkInvalidConfigurations(updatedConfigs));
      setBatchConfigModalVisible(false);
    },
    [
      instanceConfigs,
      selectedRowKeys,
      updateNicConfigurations,
      getAllNicsForBatch,
      form,
      setDisabledFlag,
    ],
  );

  const renderConfigState = useCallback(
    (isConfigured: boolean) => {
      const type = isConfigured ? "success" : "error";
      const messageId = isConfigured
        ? "config.info.success"
        : "config.info.error";
      const defaultMessage = isConfigured ? "Configured" : "Not Configured";

      return (
        <State
          type={type}
          name={intl.formatMessage({ id: messageId, defaultMessage })}
          prefix="dot"
        />
      );
    },
    [intl],
  );

  const instanceColumns = useMemo(
    () => [
      {
        title: intl.formatMessage({
          id: "baremetal.instance",
          defaultMessage: "Bare Metal Instance",
        }),
        key: "name",
        width: 180,
        render: (_: any, record: any) => <Text>{record?.displayName}</Text>,
      },
      {
        title: intl.formatMessage({
          id: "baremetal.display.name",
          defaultMessage: "Bare Metal Chassis Name",
        }),
        key: "displayName",
        width: 180,
        render: (record: any) => <Text>{record?.chassic?.name}</Text>,
      },
      {
        title: (
          <>
            {intl.formatMessage({
              id: "user.config",
              defaultMessage: "Username and Password",
            })}
            <span style={requiredMarkerStyle}>*</span>
          </>
        ),
        key: "userConfig",
        width: 120,
        render: (record: any) =>
          renderConfigState(!!(record.username || record.password)),
      },
      {
        title: (
          <>
            {intl.formatMessage({
              id: "network.config",
              defaultMessage: "Network Configuration",
            })}
            <span style={requiredMarkerStyle}>*</span>
          </>
        ),
        key: "networkConfig",
        width: 120,
        render: (record: any) =>
          renderConfigState(!!record?.networkConfigs?.length),
      },
      {
        title: (
          <>
            {intl.formatMessage({
              id: "network.config",
              defaultMessage: "Network Configuration",
            })}
            <span style={requiredMarkerStyle}>*</span>
          </>
        ),
        key: "networkConfig",
        width: 120,
        render: (record: any) =>
          renderConfigState(!!record?.networkConfigs?.length),
      },
      {
        title: intl.formatMessage({
          id: "operation",
          defaultMessage: "Actions",
        }),
        key: "operation",
        width: 60,
        render: (_: any, record: any, index: number) => (
          <span
            style={editableCursorStyle}
            onClick={() => handleSingleConfig(record, index)}
          >
            <Icon type="edit" />
          </span>
        ),
      },
    ],
    [intl, renderConfigState, handleSingleConfig],
  );

  return (
    <>
      <Card
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
      >
        <Form.Item noStyle name="instanceConfigs">
          <TableInForm
            dataSource={instanceConfigs}
            columns={instanceColumns}
            setBatchConfigModalVisible={setBatchConfigModalVisible}
            inputSearch={searchVM}
            selectedRowKeys={selectedRowKeys}
            rowSelection={rowSelection}
          />
        </Form.Item>
      </Card>

      {singleConfigModalVisible && (
        <SingleConfigModal
          visible={singleConfigModalVisible}
          setVisible={setSingleConfigModalVisible}
          instanceConfig={instanceConfigs[currentIndex]}
          allNics={getNicsForChassis(instanceConfigs[currentIndex]?.uuid).map(
            (nic) => ({
              ...nic,
              label: `${nic.devname} (${nic.mac})`,
            }),
          )}
          baremetalChassisUuids={baremetalChassisUuids}
          onCancel={handleSingleConfigCancel}
          onSave={handleSingleConfigSave}
        />
      )}

      {batchConfigModalVisible && (
        <BatchConfigModal
          visible={batchConfigModalVisible}
          setVisible={setBatchConfigModalVisible}
          instanceConfig={instanceConfigs[0]}
          baremetalChassisUuids={baremetalChassisUuids}
          allNics={_uniqBy(getAllNicsForBatch(), "devname").map((nic) => ({
            ...nic,
            label: nic.devname,
          }))}
          onCancel={handleBatchConfigCancel}
          onSave={handleBatchConfigSave}
        />
      )}
    </>
  );
};

export default ConfigPart;
