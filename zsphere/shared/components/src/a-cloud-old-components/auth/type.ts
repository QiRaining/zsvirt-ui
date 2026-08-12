interface IBaseProps {
  authKey: string;
  resource?: string;
  children?: React.ReactNode;
}

export interface IViewProps extends IBaseProps {
  type: "view";
}

export interface IPageProps extends IBaseProps {
  type: "page";
}

export interface IBlockProps extends IBaseProps {
  type: "block";
}

export type IActionProps = {
  type: "action";
  children?: React.ReactNode;
} & (IBaseProps | { authKeys: string[]; resource?: string });

export type IRouterByAuth = Required<IViewProps> | Required<IBlockProps>;

export type IProps = IViewProps | IPageProps | IActionProps | IBlockProps;
