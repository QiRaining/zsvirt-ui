import { renderHook, act } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
/**
 * useTransformPayload 单元测试
 *
 * 该 hook 位于 resource app 内部，负责将 VM 编辑配置表单的值
 * 转换为后端 API payload。是拆分 edit-config/hooks.ts 的前置安全网。
 *
 * 策略：mock 外部依赖，通过 renderHook 测试各 transform 函数的输出。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock 外部依赖
vi.mock("@zstack/zsphere-components", () => ({
  ListItem: {},
}));

vi.mock("@zstack/zsphere-types", () => ({
  SystemTagActionType: {
    Create: "Create",
    Update: "Update",
    Delete: "Delete",
  },
  VGpuType: {
    MdevDevice: "MdevDevice",
    PciDevice: "PciDevice",
  },
}));

vi.mock("@zstack/zsphere-types/graphql", () => ({}));

vi.mock("@zstack/zsphere-utils", () => ({
  parseNumber: (num: number, unit: string) => {
    const unitMap: Record<string, number> = {
      B: 1,
      K: 1024,
      M: 1024 * 1024,
      G: 1024 * 1024 * 1024,
      T: 1024 * 1024 * 1024 * 1024,
      "": 1,
    };
    return num * (unitMap[unit] || 1);
  },
}));

vi.mock(
  "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/disk/utils-common",
  () => ({
    SetDiskQosType: {
      SetBandwidthTotal: "SetBandwidthTotal",
      SetBandwidthWR: "SetBandwidthWR",
      SetIopsTotal: "SetIopsTotal",
      SetIopsWR: "SetIopsWR",
    },
  }),
);

import { useTransformPayload } from "../hooks";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(IntlProvider, { locale: "zh", messages: {} }, children);

const mockVm = {
  uuid: "vm-uuid-001",
  name: "test-vm",
  hostUuid: "host-uuid-001",
  lastHostUuid: "host-uuid-001",
  rootVolumeUuid: "root-vol-001",
  group: { uuid: "group-uuid-001" },
  primaryStorage: { uuid: "ps-uuid-001", type: "Ceph" },
} as any;

describe("useTransformPayload", () => {
  describe("hook initialization", () => {
    it("should return all expected keys", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      expect(result.current).toHaveProperty("payload");
      expect(result.current).toHaveProperty("changeKeys");
      expect(result.current).toHaveProperty("confirmList");
      expect(result.current).toHaveProperty("resetConfig");
      expect(result.current).toHaveProperty("_getNeedRebootKey");
      expect(result.current).toHaveProperty("updateKey2Payload");
      expect(result.current).toHaveProperty("volumeTransform");
      expect(result.current).toHaveProperty("nicTransform");
      expect(result.current).toHaveProperty("cdromTransform");
      expect(result.current).toHaveProperty("usbTransform");
      expect(result.current).toHaveProperty("gpuTransform");
      expect(result.current).toHaveProperty("pcieTransform");
      expect(result.current).toHaveProperty("getDisabledConfig");
    });

    it("should initialize payload with resourceUuid", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      expect(result.current.payload).toEqual({
        resourceUuid: "vm-uuid-001",
      });
    });

    it("should initialize with empty changeKeys and confirmList", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      expect(result.current.changeKeys).toEqual([]);
      expect(result.current.confirmList).toEqual([]);
    });
  });

  describe("updateKey2Payload mapping", () => {
    it("should have transform functions for all expected config keys", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const expectedKeys = [
        "name",
        "guest",
        "group",
        "ha",
        "os",
        "totalCoreNum",
        "sockedNum",
        "CPUMode",
        "cpuQuota",
        "vmPriority",
        "hotPlug",
        "cpuHideKVMMark",
        "memorySize",
        "memHotPlug",
        "cpuBindListByVCpu",
        "vnumaEnabled",
        "gpuType",
        "soundCard",
        "motherboardType",
        "totalGPUMemory",
      ];

      for (const key of expectedKeys) {
        expect(result.current.updateKey2Payload).toHaveProperty(key);
        expect(typeof result.current.updateKey2Payload[key]).toBe("function");
      }
    });
  });

  describe("commonTransform via updateKey2Payload", () => {
    it("name transform should set updateVmInstancePayload.name", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      act(() => {
        result.current.updateKey2Payload.name("new-vm-name");
      });

      expect(result.current.payload.updateVmInstancePayload).toBeDefined();
      expect(result.current.payload.updateVmInstancePayload.name).toBe(
        "new-vm-name",
      );
      expect(result.current.payload.updateVmInstancePayload.uuid).toBe(
        "vm-uuid-001",
      );
    });

    it("ha transform should convert boolean to NeverStop/None", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      act(() => {
        result.current.updateKey2Payload.ha(true);
      });

      expect(result.current.payload.setVmHaLevelPayload.level).toBe(
        "NeverStop",
      );

      // Reset and test false
      act(() => {
        result.current.resetConfig();
      });
      act(() => {
        result.current.updateKey2Payload.ha(false);
      });

      expect(result.current.payload.setVmHaLevelPayload.level).toBe("None");
    });

    it("totalCoreNum transform should set cpuNum", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      act(() => {
        result.current.updateKey2Payload.totalCoreNum(8);
      });

      expect(result.current.payload.updateVmInstancePayload.cpuNum).toBe(8);
    });

    it("memorySize transform should parse number with unit", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      act(() => {
        result.current.updateKey2Payload.memorySize({
          number: 4,
          unit: "G",
        });
      });

      expect(result.current.payload.updateVmInstancePayload.memorySize).toBe(
        4 * 1024 * 1024 * 1024,
      );
    });

    it("totalGPUMemory transform should multiply by 1024", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      act(() => {
        result.current.updateKey2Payload.totalGPUMemory(64);
      });

      expect(result.current.payload.setVmQxlMemoryPayload.vram).toBe(65536);
    });
  });

  describe("cdromTransform", () => {
    it("should generate createVmCdRomPayload for added cdroms", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "cdRomName-1": "cdrom-1",
        "cdRomList-1": [{ uuid: "iso-uuid-001" }],
      };
      const originValues = {};

      act(() => {
        result.current.cdromTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.createVmCdRomPayload).toHaveLength(1);
      expect(result.current.payload.createVmCdRomPayload[0]).toMatchObject({
        vmInstanceUuid: "vm-uuid-001",
        isoUuid: "iso-uuid-001",
      });
    });

    it("should generate deleteCdRomPayload for removed cdroms", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "cdRomName-0": "cdrom-0",
        "cdRomList-0": [{ uuid: "iso-uuid-001" }],
      };
      const originValues = {
        "cdRomName-0": "cdrom-0",
        "cdRomList-0": [{ uuid: "iso-uuid-001" }],
        "cdRomListUuid-0": "cdrom-uuid-001",
        "removecdrom-0": true,
      };

      act(() => {
        result.current.cdromTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.deleteCdRomPayload).toHaveLength(1);
      expect(result.current.payload.deleteCdRomPayload[0].uuid).toBe(
        "cdrom-uuid-001",
      );
    });

    it("should generate detach/attach payloads for updated cdrom ISO", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "cdRomName-0": "cdrom-0",
        "cdRomList-0": [{ uuid: "iso-uuid-002" }],
        "cdRomListUuid-0": "cdrom-uuid-001",
      };
      const originValues = {
        "cdRomName-0": "cdrom-0",
        "cdRomList-0": [{ uuid: "iso-uuid-001" }],
        "cdRomListUuid-0": "cdrom-uuid-001",
      };

      act(() => {
        result.current.cdromTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(
        result.current.payload.detachIsoFromVmInstancePayload,
      ).toHaveLength(1);
      expect(
        result.current.payload.detachIsoFromVmInstancePayload[0].isoUuid,
      ).toBe("iso-uuid-001");
      expect(result.current.payload.attachIsoToVmInstancePayload).toHaveLength(
        1,
      );
      expect(
        result.current.payload.attachIsoToVmInstancePayload[0].isoUuid,
      ).toBe("iso-uuid-002");
    });
  });

  describe("usbTransform", () => {
    it("should generate attachUsbDeviceToVmPayload for added USB devices", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "usbDivice-1": [{ uuid: "usb-uuid-001" }],
        "usbDiviceType-1": "USB",
      };
      const originValues = {};

      act(() => {
        result.current.usbTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.attachUsbDeviceToVmPayload).toHaveLength(1);
      expect(
        result.current.payload.attachUsbDeviceToVmPayload[0],
      ).toMatchObject({
        vmInstanceUuid: "vm-uuid-001",
        usbDeviceUuid: "usb-uuid-001",
        attachType: "USB",
      });
    });

    it("should generate detachUsbDeviceToVmPayload for removed USB devices", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "usbDivice-0": [{ uuid: "usb-uuid-001" }],
        "usbDiviceType-0": "USB",
        "usbDiviceUuid-0": "usb-uuid-001",
      };
      const originValues = {
        "usbDivice-0": [{ uuid: "usb-uuid-001" }],
        "usbDiviceType-0": "USB",
        "usbDiviceUuid-0": "usb-uuid-001",
        "removeusb-0": true,
      };

      act(() => {
        result.current.usbTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.detachUsbDeviceToVmPayload).toHaveLength(1);
      expect(
        result.current.payload.detachUsbDeviceToVmPayload[0].usbDeviceUuid,
      ).toBe("usb-uuid-001");
    });
  });

  describe("gpuTransform", () => {
    it("should generate attachPciDeviceToVMPayloads for added GPU devices", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "gpuDevice-1": [{ uuid: "gpu-uuid-001" }],
        "gpuDeviceType-1": "gpu",
      };
      const originValues = {};

      act(() => {
        result.current.gpuTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.attachPciDeviceToVMPayloads).toHaveLength(
        1,
      );
      expect(
        result.current.payload.attachPciDeviceToVMPayloads[0],
      ).toMatchObject({
        pciDeviceUuid: "gpu-uuid-001",
        vmInstanceUuid: "vm-uuid-001",
      });
    });

    it("should generate attachVGpuToVmInstancePayloads for added vGPU devices", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "gpuDevice-1": [{ uuid: "vgpu-uuid-001", type: "MdevDevice" }],
        "gpuDeviceType-1": "vgpu",
      };
      const originValues = {};

      act(() => {
        result.current.gpuTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(
        result.current.payload.attachVGpuToVmInstancePayloads,
      ).toHaveLength(1);
      expect(
        result.current.payload.attachVGpuToVmInstancePayloads[0],
      ).toMatchObject({
        vGpuDeviceUuid: "vgpu-uuid-001",
        vmInstanceUuid: "vm-uuid-001",
        type: "MdevDevice",
      });
    });

    it("should generate detach payloads for removed GPU devices", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "gpuDevice-0": [{ uuid: "gpu-uuid-001" }],
        "gpuDeviceType-0": "gpu",
        "gpuDeviceUuid-0": "gpu-uuid-001",
      };
      const originValues = {
        "gpuDevice-0": [{ uuid: "gpu-uuid-001" }],
        "gpuDeviceType-0": "gpu",
        "gpuDeviceUuid-0": "gpu-uuid-001",
        "removegpu-0": true,
      };

      act(() => {
        result.current.gpuTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.detachPciDeviceFromVMPayloads).toHaveLength(
        1,
      );
      expect(
        result.current.payload.detachPciDeviceFromVMPayloads[0].pciDeviceUuid,
      ).toBe("gpu-uuid-001");
    });
  });

  describe("pcieTransform", () => {
    it("should generate attachPciDeviceToVMPayloads for added PCIE devices", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "pcieDevice-1": [{ uuid: "pcie-uuid-001" }],
      };
      const originValues = {};

      act(() => {
        result.current.pcieTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.attachPciDeviceToVMPayloads).toHaveLength(
        1,
      );
      expect(
        result.current.payload.attachPciDeviceToVMPayloads[0].pciDeviceUuid,
      ).toBe("pcie-uuid-001");
    });

    it("should generate detach payloads for removed PCIE devices", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const newValues = {
        "pcieDevice-0": [{ uuid: "pcie-uuid-001" }],
        "pcieDeviceUuid-0": "pcie-uuid-001",
      };
      const originValues = {
        "pcieDevice-0": [{ uuid: "pcie-uuid-001" }],
        "pcieDeviceUuid-0": "pcie-uuid-001",
        "removepcie-0": true,
      };

      act(() => {
        result.current.pcieTransform(newValues, originValues, "vm-uuid-001");
      });

      expect(result.current.payload.detachPciDeviceFromVMPayloads).toHaveLength(
        1,
      );
    });
  });

  describe("volumeTransform", () => {
    it("should generate createDataVolumeInEditVmPayload for new disk", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const volumeValues = {
        "diskCreateType-1": "new",
        "diskSize-1": { number: 100, unit: "G" },
        "storePath-1": [{ uuid: "ps-uuid-001", type: "Ceph" }],
        "busType-1": "virtio",
        "diskSharable-1": false,
        "allocationType-1": "ThinProvisioning",
        "volumeStoragePool-1": undefined,
        "turnOnQoS-1": false,
        "cacheMode-1": "none",
        "aio-1": "native",
      };
      const originValues = {};

      act(() => {
        result.current.volumeTransform(volumeValues, originValues, mockVm);
      });

      expect(
        result.current.payload.createDataVolumeInEditVmPayload,
      ).toHaveLength(1);
      const vol = result.current.payload.createDataVolumeInEditVmPayload[0];
      expect(vol.diskSize).toBe(100 * 1024 * 1024 * 1024);
      expect(vol.primaryStorageUuid).toBe("ps-uuid-001");
      expect(vol.cacheMode).toBe("none");
      expect(vol.aio).toBe("native");
    });

    it("should generate attachDataVolumeToVmPayload for 'created' type disk", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const volumeValues = {
        "diskCreateType-1": "created",
        "createDisk-1": [{ uuid: "existing-vol-001" }],
      };
      const originValues = {};

      act(() => {
        result.current.volumeTransform(volumeValues, originValues, mockVm);
      });

      expect(result.current.payload.attachDataVolumeToVmPayload).toHaveLength(
        1,
      );
      expect(
        result.current.payload.attachDataVolumeToVmPayload[0].volumeUuid,
      ).toBe("existing-vol-001");
      expect(
        result.current.payload.attachDataVolumeToVmPayload[0].vmInstanceUuid,
      ).toBe("vm-uuid-001");
    });

    it("should generate attachScsiLunToVmInstancePayloads for 'rdm' type disk", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const volumeValues = {
        "diskCreateType-1": "rdm",
        "RDM-1": [{ uuid: "scsi-lun-001" }],
      };
      const originValues = {};

      act(() => {
        result.current.volumeTransform(volumeValues, originValues, mockVm);
      });

      expect(
        result.current.payload.attachScsiLunToVmInstancePayloads,
      ).toHaveLength(1);
      expect(
        result.current.payload.attachScsiLunToVmInstancePayloads[0].uuid,
      ).toBe("scsi-lun-001");
    });

    it("should generate detachDataVolumeFromVmPayload for removed disk with Detach action", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const volumeValues = {
        "diskCreateType-0": "new",
        "diskUuid-0": "vol-uuid-001",
      };
      const originValues = {
        "diskCreateType-0": "new",
        "diskUuid-0": "vol-uuid-001",
        "removedisk-0": "Detach",
      };

      act(() => {
        result.current.volumeTransform(volumeValues, originValues, mockVm);
      });

      expect(result.current.payload.detachDataVolumeFromVmPayload).toHaveLength(
        1,
      );
      expect(result.current.payload.detachDataVolumeFromVmPayload[0].uuid).toBe(
        "vol-uuid-001",
      );
    });

    it("should generate deleteDataVolumePayload for removed disk with Delete action", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const volumeValues = {
        "diskCreateType-0": "new",
        "diskUuid-0": "vol-uuid-001",
      };
      const originValues = {
        "diskCreateType-0": "new",
        "diskUuid-0": "vol-uuid-001",
        "removedisk-0": "Delete",
      };

      act(() => {
        result.current.volumeTransform(volumeValues, originValues, mockVm);
      });

      expect(result.current.payload.deleteDataVolumePayload).toHaveLength(1);
      expect(result.current.payload.deleteDataVolumePayload[0].uuid).toBe(
        "vol-uuid-001",
      );
    });
  });

  describe("resetConfig", () => {
    it("should reset payload to initial state", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      // Add some data
      act(() => {
        result.current.updateKey2Payload.name("new-name");
      });
      expect(result.current.payload.updateVmInstancePayload).toBeDefined();

      // Reset
      act(() => {
        result.current.resetConfig();
      });

      expect(result.current.payload).toEqual({
        resourceUuid: "vm-uuid-001",
      });
      expect(result.current.changeKeys).toEqual([]);
      expect(result.current.confirmList).toEqual([]);
    });
  });

  describe("getDisabledConfig", () => {
    it("should return disabled=true when VM is Running", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const runningVm = { ...mockVm, state: "Running" };
      const config = result.current.getDisabledConfig(runningVm, {});

      expect(config.disabled).toBe(true);
      expect(config.tooltip).toBeDefined();
    });

    it("should return disabled=false when VM is Stopped", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const stoppedVm = { ...mockVm, state: "Stopped" };
      const config = result.current.getDisabledConfig(stoppedVm, {});

      expect(config.disabled).toBe(false);
      expect(config.tooltip).toBeUndefined();
    });

    it("should enable cpuNum when Running with numa=true", () => {
      const { result } = renderHook(() => useTransformPayload(mockVm, true), {
        wrapper,
      });

      const runningVm = { ...mockVm, state: "Running" };
      const config = result.current.getDisabledConfig(runningVm, {
        numa: { value: "true" },
      });

      expect(config.disabled).toBe(true);
      expect(config.cpuNumDisabled).toBe(false);
      expect(config.memoryDisabled).toBe(false);
    });
  });
});
