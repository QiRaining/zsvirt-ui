import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@zstack/icon";
import { Select } from "@zstack/zsphere-components";
import { arrayMoveMutable } from "@zstack/zsphere-utils";
import React, { useRef } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export enum BootOrderKey {
  "HardDisk" = "HardDisk",
  "CdRom" = "CdRom",
  "Network" = "Network",
  "Empty" = "Empty",
}

interface IProps {
  value?: BootOrderKey[];
  onChange?: (val: BootOrderKey[]) => void;
}

interface OrderItem {
  value: BootOrderKey;
}

function SortableSelectItem({
  id,
  selectedValue,
  order,
  options,
  onChange,
}: {
  id: string;
  selectedValue: BootOrderKey;
  order: number;
  options: Array<{ displayName: string; value: BootOrderKey }>;
  onChange: (val: BootOrderKey, index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={itemStyle}
      {...attributes}
      className={style.sortSelectWrap}
    >
      <div className={style.sortSelectContent}>
        <Select
          className={style.select}
          value={selectedValue}
          onChange={(val) => {
            onChange(val, order + 1);
          }}
        >
          {options.map((item) => {
            return (
              <Select.Option key={item.displayName} value={item.value}>
                {item.displayName}
              </Select.Option>
            );
          })}
        </Select>
        <div className={style.dragHandle} {...listeners}>
          <Icon type="drag" className={style["text-after-icon"]} />
        </div>
      </div>
    </div>
  );
}

const BootOrder: React.ForwardRefRenderFunction<HTMLDivElement, IProps> = ({
  value,
  onChange,
}) => {
  const intl = useIntl();
  //多选时，启动顺序默认值为硬件

  // 确保 value 有默认值
  const currentValue = value || [
    BootOrderKey.HardDisk,
    BootOrderKey.Empty,
    BootOrderKey.Empty,
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const initOptionValue = [
    {
      displayName: intl.formatMessage({
        id: "vmHardDisk1",
        defaultMessage: "Disk",
      }),
      value: BootOrderKey.HardDisk,
    },
    {
      displayName: intl.formatMessage({
        id: "vmCdRom",
        defaultMessage: "CD/DVD Drive",
      }),
      value: BootOrderKey.CdRom,
    },
    {
      displayName: intl.formatMessage({
        id: "vmNetwork",
        defaultMessage: "Network",
      }),
      value: BootOrderKey.Network,
    },
    {
      displayName: intl.formatMessage({
        id: "empty",
        defaultMessage: "Empty",
      }),
      value: BootOrderKey.Empty,
    },
  ];

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const updateDataSource = (val: BootOrderKey, index: number) => {
    const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
    if (newValue.length < 3) {
      newValue.push(
        ...Array.from(
          { length: 3 - newValue.length },
          () => BootOrderKey.Empty,
        ),
      );
    }
    newValue[index] = val;
    if (index === 0 && val !== BootOrderKey.Empty) {
      const emptyIndex = newValue.indexOf(val, 1);
      if (emptyIndex !== -1) {
        newValue[emptyIndex] = BootOrderKey.Empty;
      }
    }
    onChange?.(newValue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const menus = Array.isArray(currentValue) ? currentValue.slice(1) : [];
    const oldIndex = menus.findIndex((_, idx) => `item-${idx}` === active.id);
    const newIndex = menus.findIndex((_, idx) => `item-${idx}` === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
    if (newValue.length < 3) {
      newValue.push(
        ...Array.from(
          { length: 3 - newValue.length },
          () => BootOrderKey.Empty,
        ),
      );
    }
    arrayMoveMutable(newValue, oldIndex + 1, newIndex + 1);
    onChange?.(newValue);
  };

  const _menus = Array.isArray(currentValue)
    ? currentValue.slice(1).map((item: BootOrderKey) => ({ value: item }))
    : [];

  const sortableIds = Array.from({ length: 2 }, (_, index) => `item-${index}`);

  return (
    <div className={style.contianer}>
      <div className={style.content}>
        <div className={style.sortOrder}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </div>
        <div>
          <div className={style.sortSelectWrap}>
            <div className={style.sortSelectContent}>
              <Select
                className={style.select}
                value={currentValue?.[0]}
                onChange={(val) => {
                  updateDataSource(val, 0);
                }}
              >
                {initOptionValue
                  .filter((item) => BootOrderKey.Empty !== item.value)
                  .map((item) => {
                    return (
                      <Select.Option key={item.displayName} value={item.value}>
                        {item.displayName}
                      </Select.Option>
                    );
                  })}
              </Select>
              <div className={style.dragHandlePlaceholder} />
            </div>
          </div>
          <div ref={containerRef} className={style.sortableContainer}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <ul className={style.sortableList}>
                  {Array.from({ length: 2 }).map((_, index) => {
                    const selectedValue =
                      _menus[index]?.value ?? BootOrderKey.Empty;
                    const options = initOptionValue.filter(
                      (opt) =>
                        opt.value === BootOrderKey.Empty ||
                        opt.value === selectedValue ||
                        !currentValue ||
                        !Array.isArray(currentValue) ||
                        currentValue.indexOf(opt.value) === -1,
                    );
                    return (
                      <SortableSelectItem
                        key={`item-${index}`}
                        id={`item-${index}`}
                        selectedValue={selectedValue}
                        order={index}
                        options={options}
                        onChange={updateDataSource}
                      />
                    );
                  })}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.forwardRef<HTMLDivElement, IProps>(BootOrder);
