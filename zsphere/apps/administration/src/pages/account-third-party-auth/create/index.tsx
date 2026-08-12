import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import {
  addSSOThirdPartyAuth,
  addThirdPartyAuth,
  syncAccountsFromLdapServer,
  testConnectionThirdParty,
} from "../../../gql/account-third-party-auth.gql";
import { ServerType } from "../constant";
import Authentication from "./authentication";

import style from "./style.module.less";

const STYLE_MARGIN_LEFT_4 = { marginLeft: 4 } as const;

const CreatInstance: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const formsRef = React.useRef<any>({});
  const valuesRef = React.useRef<{ data: any; transformData: any }>({
    data: {},
    transformData: {},
  });

  const formDataRef = React.useRef<any>({});

  const [current, setCurrent] = React.useState<number>(1);

  React.useEffect(() => {
    if (visible) {
      formsRef.current = {};
      valuesRef.current = {
        data: {},
        transformData: {},
      };
      formDataRef.current = {};
      setCurrent(0);
    }
  }, [visible]);

  const createOIDC = usePersistFn((formData: any) => {
    const { authentication, rulesMapping } = formData || {};

    const payload = {
      ...authentication,
      ...rulesMapping,
      grantType: "authorization_code",
    };

    doAction({
      mutation: addSSOThirdPartyAuth,
      payload,
      name: intl.formatMessage({
        id: "create.account.third.party.auth",
        defaultMessage: "Add SSO Server",
      }),
      total: 1,
      type: "SSOThirdPartyAuthVO",
    });
  });

  const syncLdapServer = usePersistFn((resourceUuid: any) => {
    doAction({
      mutation: syncAccountsFromLdapServer,
      payload: {
        uuid: resourceUuid,
      },
      name: intl.formatMessage({
        id: "sync.3rdPartyAuthServer",
        defaultMessage: "Synchronize SSO Server",
      }),
      total: 1,
      type: "ThirdPartyAuthVO",
    });
  });

  const createLdapServer = usePersistFn((payload) => {
    doAction({
      mutation: addThirdPartyAuth,
      payload,
      name: intl.formatMessage({
        id: "add.3rdPartyAuthServer",
        defaultMessage: "Add SSO Server",
      }),
      total: 1,
      onFinish: (addResult) => {
        if (addResult.fail || addResult.exception) {
          return;
        }

        // 同步映射规则
        const resourceUuid = addResult?.inventory?.uuid;

        syncLdapServer(resourceUuid);
      },
    });
  });

  const testConnectLdapServer = usePersistFn((payload) => {
    doAction({
      mutation: testConnectionThirdParty,
      payload,
      name: intl.formatMessage({
        id: "test.connection.3rdPartyAuthServer",
        defaultMessage: "Test Connection of SSO Server",
      }),
      onFinish: (result) => {
        if (result.fail || result.exception) {
          return;
        }

        // create ldap
        createLdapServer(payload);
      },
      total: 1,
    });
  });

  const testConnnectAndCreateLdapServer = usePersistFn((formData: any) => {
    const { authentication } = formData || {};

    testConnectLdapServer(authentication);
  });

  const submitHandle = usePersistFn(async (formData) => {
    const { authentication, rulesMapping } = formData || {};

    const { type, ...restAuthentication } = authentication || {};

    const _formData = { authentication: restAuthentication, rulesMapping };

    formDataRef.current = _formData;

    // create OIDC
    if (type === ServerType.OIDC) {
      createOIDC(_formData);
    }

    // test and create ldap/ad
    if ([ServerType.LDAP, ServerType.AD].includes(type)) {
      testConnnectAndCreateLdapServer(_formData);
    }
  });

  const steps = React.useMemo<
    Array<{ key: string; title: string; content: React.ReactElement }>
  >(
    () => [
      {
        key: "authentication",
        title: intl.formatMessage({
          id: "account.thirdPartyAuth.create.authentication.config.title",
          defaultMessage: "Authentication Configuration",
        }),
        content: <Authentication isCreate />,
      },
    ],
    [intl],
  );

  const validateFields = React.useCallback(async () => {
    const { form } = formsRef.current[current] ?? {};

    if (!form) {
      return;
    }

    const { transform } = formsRef.current[current];

    try {
      const values = await form.validateFields();

      valuesRef.current = {
        data: {
          ...valuesRef.current.data,
          [steps[current].key!]: values,
        },
        transformData: transform
          ? {
              ...valuesRef.current.transformData,
              [steps[current].key!]: transform(values),
            }
          : valuesRef.current.transformData,
      };
    } catch (_e) {
      const error = _e as any;
      if (error.errorFields) {
        const namePath = error.errorFields[0].name;

        form.scrollToField(namePath);

        throw new Error("validate Form field error");
      }

      throw error;
    }
  }, [current, steps]);

  const handleCancelClick = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const handlePrevStepClick = useCallback(() => {
    setCurrent((prev) => prev - 1);
  }, [setCurrent]);

  const handleNextStepClick = useCallback(async () => {
    try {
      await validateFields();
      setCurrent((prev) => prev + 1);
    } catch {
      // handle validation error silently
    }
  }, [setCurrent, validateFields]);

  const handleSubmitClick = useCallback(async () => {
    try {
      await validateFields();
      await submitHandle({
        ...valuesRef.current.data,
        ...valuesRef.current.transformData,
      });
      setVisible(false);
    } catch {
      // handle form submission error silently
    }
  }, [validateFields, submitHandle, setVisible]);

  const footerEle = React.useMemo<JSX.Element>(() => {
    return (
      <>
        <Button variant="subtle" key="cancel" onClick={handleCancelClick}>
          {intl.formatMessage({ id: "bottun.cancel", defaultMessage: "Cancel" })}
        </Button>

        {current > 0 && (
          <Button
            key="prevStep"
            onClick={handlePrevStepClick}
            icon={<Icon type="arrow-ios-left" />}
          >
            {intl.formatMessage({
              id: "prevStep",
              defaultMessage: "Back",
            })}
          </Button>
        )}

        {current < steps.length - 1 ? (
          <Button
            key="nextStep"
            variant="primary"
            onClick={handleNextStepClick}
          >
            {intl.formatMessage({
              id: "nextStep",
              defaultMessage: "Next",
            })}
            <Icon style={STYLE_MARGIN_LEFT_4} type="arrow-ios-right" />
          </Button>
        ) : (
          <Button key="ok" variant="primary" onClick={handleSubmitClick}>
            {intl.formatMessage({ id: "button.ok", defaultMessage: "OK" })}
          </Button>
        )}
      </>
    );
  }, [
    intl,
    current,
    steps.length,
    handleCancelClick,
    handlePrevStepClick,
    handleNextStepClick,
    handleSubmitClick,
  ]);

  const content = React.useMemo(
    () =>
      steps.map((step, index) => (
        <div
          key={step.key}
          style={{ display: index === current ? "block" : "none" }}
          className={style.content}
        >
          {React.cloneElement(step.content, {
            ref: (componentRef: unknown) => {
              formsRef.current[index] = componentRef;
            },
            formData: {
              ...valuesRef.current.data,
              ...valuesRef.current.transformData,
            },
            isCreate: true,
          })}
        </div>
      )),
    [current, steps, valuesRef],
  );

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "virtualization.add.third.party.auth",
        defaultMessage: "Add SSO Server",
      })}
      widthClassName="w-[600px]"
      visible={visible}
      setVisible={setVisible}
      onCancel={handleCancelClick}
      footer={footerEle}
    >
      <div className={style["steps-container"]}>{content}</div>
    </DialogBase>
  );
};

export default CreatInstance;
