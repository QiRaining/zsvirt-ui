import { Icon } from "@zstack/icon";
import React from "react";

import { IconText } from "./index";

// 使用示例 - 展示组件撑满父容器的效果
const IconTextExample: React.FC = () => {
  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h3>IconText 组件示例 - 撑满父容器</h3>

      {/* 在按钮中使用 - 撑满按钮 */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          type="button"
          style={{
            height: "40px",
            padding: "0 16px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconText
            icon={<Icon size={16} type="download" />}
            text="下载"
            tooltip="点击下载文件"
            clickable
            onClick={() => console.log("下载")}
          />
        </button>

        <button
          type="button"
          style={{
            height: "32px",
            padding: "0 12px",
            border: "none",
            borderRadius: "4px",
            background: "#1890ff",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconText
            icon={<Icon size={16} type="building" />}
            text="创建"
            tooltip="创建新项目"
            clickable
            onClick={() => console.log("创建")}
          />
        </button>
      </div>

      {/* 在不同高度的容器中 */}
      <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
        <div
          style={{
            height: "60px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
          }}
        >
          <IconText
            icon={<Icon size={20} type="disk-2" />}
            text="存储管理"
            tooltip="管理存储资源"
            clickable
            onClick={() => console.log("存储管理")}
          />
        </div>

        <div
          style={{
            height: "80px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f8ff",
          }}
        >
          <IconText
            icon={<Icon size={24} type="server" />}
            text="服务器管理"
            tooltip="管理服务器资源"
            clickable
            onClick={() => console.log("服务器管理")}
          />
        </div>
      </div>

      {/* 在表格单元格中使用 */}
      <div style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #d9d9d9",
                }}
              >
                操作
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #d9d9d9",
                }}
              >
                名称
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #f0f0f0",
                  height: "48px",
                }}
              >
                <IconText
                  icon={<Icon size={16} type="edit" />}
                  text="编辑"
                  tooltip="编辑项目"
                  clickable
                  onClick={() => console.log("编辑")}
                />
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
                项目A
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #f0f0f0",
                  height: "48px",
                }}
              >
                <IconText
                  icon={<Icon size={16} type="trash" />}
                  text="删除"
                  tooltip="删除项目"
                  clickable
                  onClick={() => console.log("删除")}
                />
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
                项目B
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 在卡片中使用 */}
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
          padding: "16px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h4 style={{ margin: "0 0 12px 0" }}>操作面板</h4>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <div
            style={{
              height: "36px",
              minWidth: "120px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fafafa",
            }}
          >
            <IconText
              icon={<Icon size={16} type="download" />}
              text="导出数据"
              tooltip="导出当前数据"
              clickable
              onClick={() => console.log("导出")}
            />
          </div>

          <div
            style={{
              height: "36px",
              minWidth: "120px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fafafa",
            }}
          >
            <IconText
              icon={<Icon size={16} type="building" />}
              text="新建项目"
              tooltip="创建新项目"
              clickable
              onClick={() => console.log("新建")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconTextExample;
