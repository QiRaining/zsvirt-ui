import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

type DialogGuide = {
  confirmWord?: string;
  guideMessage?: ReactNode;
};

vi.mock("@zstack/zsphere-design-biz", () => ({
  DialogP0Smart: ({ guide }: { guide?: DialogGuide }) =>
    guide?.guideMessage ??
    `I confirm the above information. Enter "${
      guide?.confirmWord ?? "delete"
    }" to confirm deletion.`,
}));

vi.mock("@zstack/zsphere-hooks", () => ({
  useAction: () => () => {},
}));

vi.mock("../../../../gql/account-third-party-auth.gql", () => ({
  deleteAccountThirdPartyAuth: "deleteAccountThirdPartyAuth",
  deleteThirdPartyAuths: "deleteThirdPartyAuths",
}));

vi.mock("/src/gql/account-third-party-auth.gql", () => ({
  deleteAccountThirdPartyAuth: "deleteAccountThirdPartyAuth",
  deleteThirdPartyAuths: "deleteThirdPartyAuths",
}));

vi.mock("/src/gql/account-third-party-auth.gql?import", () => ({
  deleteAccountThirdPartyAuth: "deleteAccountThirdPartyAuth",
  deleteThirdPartyAuths: "deleteThirdPartyAuths",
}));

describe("delete third party auth dialog", () => {
  it("keeps the full delete confirmation guide when the confirm word is customized", async () => {
    const { default: DeleteModal } = await import("../delete-modal");
    const selectedSsoServer = {
      uuid: "sso-uuid",
      name: "SSS",
      type: "OAuth2",
      bindResourceref: {
        userCount: 0,
      },
    } as NonNullable<
      ComponentProps<typeof DeleteModal>["selectedList"]
    >[number];

    render(
      <IntlProvider
        locale="en-US"
        messages={{
          "account.3rdPartyAuthentication.modal.delete.alert.danger":
            "Deleting the SSO server will also delete all of its users synchronized to the platform, while the corresponding users in the source SSO server are not affected.",
          "thirdPartyAuth.modal.title.confirm.delete.3rdPartyAuthServer":
            "Delete SSO Server?",
          "3rdPartyAuthServer": "SSO server",
          user: "User",
        }}
      >
        <DeleteModal
          visible
          setVisible={vi.fn()}
          selectedList={[selectedSsoServer]}
          view="main.virtualization"
          position="header"
        />
      </IntlProvider>,
    );

    expect(
      screen.getByText(
        'I confirm the above information. Enter "Delete" to confirm deletion.',
      ),
    ).not.toBeNull();
  });
});
