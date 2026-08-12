"use client";

import { Icon } from "@zstack/icon";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { Button } from "../button";
import { Tooltip } from "../tooltip";

interface IProps {
  src: string;
  onClose?: () => void;
}

const RATIO_TIMES = 0.2;

export const ImageReader: React.FC<IProps> = ({ src, onClose = () => {} }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState<boolean>(true);
  const [ratio, setRatio] = useState<number>(1);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [isDown, setIsDown] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src) {
      setRatio(1);
      setImgWidth(0);
      setImgHeight(0);
      setStartX(0);
      setStartY(0);
      setScrollLeft(0);
      setScrollTop(0);
      setLoading(true);
    }
  }, [src]);

  const onImageLoad = (e: any) => {
    const vw = Math.max(
      typeof document !== "undefined"
        ? document.documentElement.clientWidth
        : 1,
      typeof window !== "undefined" ? window.innerWidth : 1,
    );
    const vh =
      Math.max(
        typeof document !== "undefined"
          ? document.documentElement.clientHeight
          : 49,
        typeof window !== "undefined" ? window.innerHeight : 49,
      ) - 48;
    const iw = e.target.offsetWidth || 1;
    const ih = e.target.offsetHeight || 1;
    const r = Math.min(vw / iw, vh / ih, 1);
    setLoading(false);
    setImgWidth(e.target.offsetWidth || 0);
    setImgHeight(e.target.offsetHeight || 0);
    setRatio(r);
  };

  const onMouseDown = (e: any) => {
    setIsDown(true);
    setStartX(e.pageX - (containerRef?.current?.offsetLeft || 0));
    setStartY(e.pageY - (containerRef?.current?.offsetTop || 0));
    setScrollLeft(containerRef?.current?.scrollLeft || 0);
    setScrollTop(containerRef?.current?.scrollTop || 0);
  };

  const onMouseMove = (e: any) => {
    if (!isDown) {
      return;
    }
    e.preventDefault();
    const x = e.pageX - (containerRef?.current?.offsetLeft || 0);
    const y = e.pageY - (containerRef?.current?.offsetTop || 0);
    const walkX = (x - startX) * 1; //scroll-fast
    const walkY = (y - startY) * 1; //scroll-fast
    containerRef!.current!.scrollLeft = scrollLeft - walkX;
    containerRef!.current!.scrollTop = scrollTop - walkY;
  };
  if (src) {
    return (
      <div className="bg-op-70 fixed top-0 left-0 z-9999 flex h-full w-full items-center justify-center bg-neutral-900">
        <div
          className=""
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseLeave={() => setIsDown(false)}
          onMouseUp={() => setIsDown(false)}
          onMouseMove={onMouseMove}
        >
          {src && (
            <img
              src={src}
              onLoad={onImageLoad}
              style={{
                width: loading ? "auto" : `${imgWidth * ratio}px`,
                height: loading ? "auto" : `${imgHeight * ratio}px`,
              }}
              alt=""
            />
          )}
        </div>
        <div className="op-70 fixed top-[90%] left-1/2 z-9999 flex h-8 -translate-x-1/2 rounded-xs bg-neutral-600">
          <Tooltip
            title={intl.formatMessage({
              id: "imageReader.adapt",
              defaultMessage: "适应窗口",
            })}
            placement="top"
          >
            <Button
              variant="subtle"
              className="hover:bg-neutral-1000 flex h-full w-10 items-center justify-center rounded-none text-white"
              onClick={() => setRatio(1)}
              data-testid="imageReader-adapt"
            >
              <Icon type="expand" />
            </Button>
          </Tooltip>
          <Tooltip
            title={intl.formatMessage({
              id: "imageReader.zoomIn",
              defaultMessage: "放大",
            })}
            placement="top"
          >
            <Button
              variant="subtle"
              className="hover:bg-neutral-1000 flex h-full w-10 items-center justify-center rounded-none text-white"
              onClick={() => setRatio(Math.min(ratio * (1 + RATIO_TIMES), 10))}
              disabled={ratio === 10}
              data-testid="imageReader-zoomIn"
            >
              <Icon type="maximize" />
            </Button>
          </Tooltip>
          <Tooltip
            title={intl.formatMessage({
              id: "imageReader.zoomOut",
              defaultMessage: "缩小",
            })}
            placement="top"
          >
            <Button
              variant="subtle"
              className="hover:bg-neutral-1000 flex h-full w-10 items-center justify-center rounded-none text-white"
              onClick={() =>
                setRatio(Math.max(ratio * (1 - RATIO_TIMES), 0.05))
              }
              disabled={ratio === 0.05}
              data-testid="imageReader-zoomOut"
            >
              <Icon type="minimize" />
            </Button>
          </Tooltip>
          <div className="flex h-full w-10 items-center justify-center">
            <div className="text-sm text-white">{Math.floor(ratio * 100)}%</div>
          </div>
        </div>
        <Button
          variant="subtle"
          className="hover:bg-neutral-1000 op-70 fixed top-6 right-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-[50%] bg-neutral-600 p-0 text-white"
          onClick={onClose}
        >
          <Icon type="close" className="h-6 w-6" />
        </Button>
      </div>
    );
  }
  return null;
};
