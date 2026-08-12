// import React from "react";
// import _ from "lodash-es";
// import { navigateToUrl } from "single-spa";
// import { IMenu } from "@zstack/zsphere-types";
// import { cacheTree } from "@zstack/zsphere-config";
// import { Link, } from "react-router";
// import qs from "qs";
// import { useSessionStorageState } from "ahooks";

// interface IProps {
//   item: IMenu;
//   showType: "topNav" | "leftNav" | "direct";
//   setIframe?: (iframe: any) => void;
//   children?: React.ReactElement;
// }

// export const VendorLink: React.FC<IProps> = ({
//   item,
//   showType,
//   setIframe,
//   children,
//   ...props
// }) => {
//   const [ssoToken] = useSessionStorageState<any>("ssoToken");

//   const name = children || item.name;

//   if (item.source !== "vendor" && !item.url) {
//     return <span>{name}</span>;
//   }

//   let url = item.url!;
//   if (!_.isEmpty(item.tokenReg) && !_.isEmpty(ssoToken)) {
//     const tokenReg = `\`${item.tokenReg}\``;
//     const { accessToken } = ssoToken!;
//     const { idToken } = ssoToken!;
//     const { refreshToken } = ssoToken!;
//     const connector = url.indexOf("?") > 0 ? "&" : "?";
//
//     url += `${connector}${eval(tokenReg)}`;
//   }
//   if (item.target === "iframe") {
//     const search = qs.parse(window.location.search, {
//       ignoreQueryPrefix: true,
//     });
//     // 防止自定义菜单间跳转出错
//     delete search.iframeUrl;
//     if (showType === "topNav") {
//       delete search.parentKey;
//     }
//     search.iframeUrl = encodeURIComponent(url);

//     switch (showType) {
//       case "topNav":
//         return React.createElement(Link as any, { to: `/plugin/vendor?${qs.stringify(search)}` }, name as any) as any;
//       case "leftNav": {
//         const href = `${window.location.origin}${window.location.pathname
//           }?${qs.stringify(search)}`;
//         return (
//           <a
//             href={href}
//             onClick={(e) => {
//               e.preventDefault();
//               window.history.pushState(item.key, item.name as string, href);
//
//               setIframe && setIframe({ url, name: item.name });
//             }}
//           >
//             {name}
//           </a>
//         );
//       }
//       case "direct": {
//         const { keyMap, menuList } = cacheTree;
//         let current = menuList.find((i) => i.url === item.url);
//         const list: IMenu[] = [];
//         while (current && current.parentKey !== "") {
//           list.unshift(current);
//           current = menuList[keyMap[current.parentKey!]];
//         }
//         // 三层/四层菜单
//         if (list.length >= 2) {
//           const parentKey = list[0].key;
//           const basePath =
//             list[0].source === "system"
//               ? `/${parentKey.replace(/\./g, "-")}`
//               : "/plugin/vendor";
//           search.parentKey = parentKey;
//           return (
//             <a
//               href={`${basePath}?${qs.stringify(search)}`}
//               onClick={navigateToUrl}
//             >
//               {name}
//             </a>
//           );
//         }
//         return React.createElement(Link as any, { to: `/plugin/vendor?${qs.stringify(search)}` }, name as any) as any;
//       }
//       default:
//         return <span>{name}</span>;
//     }
//   }
//   return (
//     <a href={url} target="_blank" rel="noreferrer" {...props}>
//       {name}
//     </a>
//   );
// };
