import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import React from "react";
import { useIntl } from "react-intl";

import { DialogBase } from "./dialog-base";

/** 三角形 SVG — 覆盖右上角 */
const TriangleSvg = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M0,0 L24,0 L24,24 L0,0 Z" />
  </svg>
);

export interface SelectWayEntry {
  icon: IconTypes;
  title: string;
  description: string;
  value: string;
}

export interface DialogSelectWayProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
  title: string;
  entries: SelectWayEntry[];
  value: string;
  onChange: (value: string) => void;
  tip?: React.ReactNode;
  widthClassName?: string;
  footer?: React.ReactNode;
  hideCancelButton?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const SelectWayCard: React.FC<{
  entry: SelectWayEntry;
  selected: boolean;
  onClick: () => void;
}> = ({ entry, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={[
        "flex flex-col p-4 rounded-sm cursor-pointer flex-1 min-w-0",
        "relative overflow-hidden",
        selected
          ? "bg-theme-50 border border-solid border-theme-600"
          : "bg-neutral-0 border border-solid border-neutral-400 hover:border-neutral-300",
      ].join(" ")}
    >
      {selected && (
        <div className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center">
          <TriangleSvg className="text-theme-600 absolute top-0 right-0" />
          <Icon
            type="checkmark"
            className="text-neutral-0 absolute z-10"
            style={{ top: 1, right: 1, width: 12, height: 12 }}
          />
        </div>
      )}
      <div className="flex flex-row">
        <div
          className={[
            "flex items-center justify-center rounded w-9 h-9 p-2.5 shrink-0",
            selected ? "bg-theme-600" : "bg-theme-50",
          ].join(" ")}
        >
          <Icon
            type={entry.icon}
            className={selected ? "text-neutral-0" : "text-theme-600"}
          />
        </div>
        <div className="ml-2 flex min-w-0 items-center">
          <span className="truncate text-sm text-neutral-700">
            {entry.title}
          </span>
        </div>
      </div>
      <div className="mt-3 min-h-10">
        <Tooltip title={entry.description}>
          <p
            className="line-clamp-2 text-xs leading-5 text-neutral-600"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {entry.description}
          </p>
        </Tooltip>
      </div>
    </div>
  );
};

export const DialogSelectWay: React.FC<DialogSelectWayProps> = (props) => {
  const {
    visible,
    setVisible,
    title,
    entries,
    value,
    onChange,
    tip,
    widthClassName = "w-[600px]",
    footer,
    hideCancelButton = false,
    onCancel,
    onConfirm,
  } = props;

  const intl = useIntl();

  const handleCancel = () => {
    setVisible(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
    setVisible(false);
  };

  const defaultFooter = (
    <>
      <Button
        id="modal-cancel"
        key="cancel"
        variant="link"
        data-testid="action-wrapper-cancel"
        onClick={handleCancel}
        disabled={!visible}
      >
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      <Button
        id="modal-ok"
        key="confirm"
        variant="primary"
        data-testid="action-wrapper-confirm"
        onClick={handleConfirm}
        disabled={!visible}
      >
        {intl.formatMessage({ id: "nextStep", defaultMessage: "Next" })}
        <Icon type="arrow-ios-right" style={{ marginLeft: 4 }} />
      </Button>
    </>
  );

  return (
    <DialogBase
      title={title}
      visible={visible}
      setVisible={setVisible}
      widthClassName={widthClassName}
      hideCancelButton={hideCancelButton}
      onCancel={onCancel}
      footer={footer !== undefined ? footer : defaultFooter}
    >
      <div className="flex flex-col">
        {tip && <div className="text-sm text-neutral-700">{tip}</div>}
        <div className="mt-3 flex flex-row flex-wrap gap-3">
          {/* entries */}
          {entries.map((entry) => (
            <SelectWayCard
              key={entry.value}
              entry={entry}
              selected={entry.value === value}
              onClick={() => onChange(entry.value)}
            />
          ))}
        </div>
      </div>
    </DialogBase>
  );
};
