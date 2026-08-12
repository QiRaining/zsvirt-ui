import { useActionConfig } from "@zstack/zsphere-engine/src/endpoint-email-address";
import type {
  BasicEndPoint as IBasicEndPoint,
  EndPointEmailAddress as IEndPointEmailAddress,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import AddModal from "../action/add-email-address-modal";
import DeleteModal from "../action/delete-email-address-modal";
import ModifyModal from "../action/modify-email-address-modal";
import { verifyDelete, verifySingleSelect } from "../action/validator";

export default (currentEndpoint: IBasicEndPoint) => {
  const intl = useIntl();
  return useActionConfig<IEndPointEmailAddress>([
    {
      key: "add.endpoint.address",
      autoInjectPreValidator: false,
      icon: "plus",
      name: intl.formatMessage({ id: "add", defaultMessage: "Add" }),
      ActionWrapper: (props: any) => (
        <AddModal {...props} currentEndpoint={currentEndpoint} />
      ),
    },
    {
      key: "modify.endpoint.address",
      preValidators: [verifySingleSelect],
      ActionWrapper: (props: any) => (
        <ModifyModal {...props} currentEndpoint={currentEndpoint} />
      ),
    },
    {
      key: "delete",
      preValidators: [verifyDelete],
      ActionWrapper: (props: any) => (
        <DeleteModal {...props} currentEndpoint={currentEndpoint} />
      ),
    },
  ]);
};
