import { gql, useQuery } from "@apollo/client";
import { zoneList } from "@zstack/virtualization-resource/src/gql/zone.gql";
import VmSpecList from "@zstack/virtualization-resource/src/pages/vm-spec/list";
import Export from "@zstack/virtualization-resource/src/pages/zone/detail/export";
import Recycle from "@zstack/virtualization-resource/src/pages/zone/detail/recycle";
import ZoneList from "@zstack/virtualization-resource/src/pages/zone/list";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import {
  useActionSubscribe,
  useBaremetalLicenseCheck,
} from "@zstack/zsphere-hooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const PreconfigurationTemplateList = React.lazy(() =>
  import("zsv_baremetal/baremetal-pre-config-template/list").catch(() => ({
    default: () => null,
  })),
);

import KmsProviderList from "@zstack/virtualization-resource/src/pages/kms-provider/list";

import Header from "./header";
import Overview from "./overview";

const QUERY_WIDGET_RESOURCE_STATE_COUNT = gql`
  query queryWidgetResourceStateCount(
    $conditions: [Condition!]
    $type: String!
    $hypervisorType: String
  ) {
    queryWidgetResourceStateCount(
      conditions: $conditions
      type: $type
      hypervisorType: $hypervisorType
    ) {
      total
      other
      running
      stopped
      connected
      disconnected
      ready
      attached
      notAttached
      notInstantiated
      idle
      enabled
      disabled
    }
  }
`;

const RootNodeDetail: React.FC = () => {
  const intl = useIntl();
  const isBaremetalAbsent = useBaremetalLicenseCheck();

  const current = {
    name: window.location.hostname,
  };

  const { data: vmInstanceData } = useQuery(QUERY_WIDGET_RESOURCE_STATE_COUNT, {
    variables: {
      type: "vmInstance",
    },
  });

  const { data: hostInstanceData } = useQuery(
    QUERY_WIDGET_RESOURCE_STATE_COUNT,
    {
      variables: {
        type: "host",
      },
    },
  );

  const { data: clusterInstanceData } = useQuery(
    QUERY_WIDGET_RESOURCE_STATE_COUNT,
    {
      variables: {
        type: "cluster",
      },
    },
  );

  const { data: zoneData, refetch: zoneRefetch } = useQuery(zoneList, {});

  const resourceData = useMemo(() => {
    const result: any = {};
    if (vmInstanceData?.queryWidgetResourceStateCount) {
      result.vm = vmInstanceData?.queryWidgetResourceStateCount;
    }
    if (hostInstanceData?.queryWidgetResourceStateCount) {
      result.host = hostInstanceData?.queryWidgetResourceStateCount;
    }
    if (clusterInstanceData?.queryWidgetResourceStateCount) {
      result.cluster = clusterInstanceData?.queryWidgetResourceStateCount;
    }
    if (zoneData?.zoneList) {
      result.zone = { total: zoneData?.zoneList?.total };
    }
    return result;
  }, [vmInstanceData, hostInstanceData, clusterInstanceData, zoneData]);

  useActionSubscribe({
    resourceTypeList: ["Zone"],
    onFinish: () => {
      zoneRefetch();
    },
  });

  const tabsList: AuthTabsListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.overview",
          defaultMessage: "Overview",
        }),
        value: "overview",
        content: () => (
          <Overview current={current!} resourceData={resourceData} />
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.zone",
          defaultMessage: "Data Center",
        }),
        value: "zone",
        auth: {
          resource: "virtualization.zone",
          authKey: "list",
          type: "view" as const,
        },
        content: () => <ZoneList rowSelection={false} view="sub.rootNode" />,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.custom.config.baremetal.template",
          defaultMessage: "Bare Metal Template",
        }),
        value: "baremetalTemplate",
        condition: !isBaremetalAbsent,
        auth: {
          resource: "virtualization.bm.template",
          type: "view" as const,
          authKey: "list",
        },
        content: () => (
          <React.Suspense fallback={null}>
            <PreconfigurationTemplateList view="main" />
          </React.Suspense>
        ),
      },
      {
        label: intl.formatMessage({
          id: "vm.spec",
          defaultMessage: "VM Specifications",
        }),
        value: "vmSpec",
        auth: {
          resource: "virtualization.vm.spec",
          type: "view" as const,
          authKey: "list",
        },
        content: () => <VmSpecList view="main" />,
      },
      {
        label: intl.formatMessage({
          id: "kms.provider",
          defaultMessage: "Key Providers",
        }),
        value: "kmsProvider",
        auth: {
          resource: "virtualization.kms.provider",
          type: "view",
          authKey: "list",
        },
        content: () => <KmsProviderList view="main" />,
      },
      {
        label: intl.formatMessage({
          id: "virtual.recycle.station",
          defaultMessage: "Recycle Bin",
        }),
        value: "recycle",
        content: () => <Recycle />,
      },
      {
        label: intl.formatMessage({
          id: "virtual.export.record",
          defaultMessage: "Export List",
        }),
        value: "export",
        content: () => <Export />,
      },
    ],
    [intl, current, resourceData, isBaremetalAbsent],
  );

  return (
    <div className="zsv-detail-container">
      <Header current={current} />
      <AuthTabs
        variant="line"
        tabsList={tabsList}
        contentId="main-tab"
        rootClassName="flex flex-col flex-1"
        listClassName="pl-6"
        contentClassName="px-6 py-5 flex-1 flex min-w-0 flex-col relative"
      />
    </div>
  );
};

export default RootNodeDetail;
