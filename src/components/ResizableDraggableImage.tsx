import React, { useState } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const MIN_W = 40, MIN_H = 40;

function clampImage({x, y, width, height}: {x:number, y:number, width:number, height:number}) {
  // Clamp position and size to fit within canvas
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + width > CANVAS_WIDTH) x = CANVAS_WIDTH - width;
  if (y + height > CANVAS_HEIGHT) y = CANVAS_HEIGHT - height;
  width = Math.max(MIN_W, Math.min(width, CANVAS_WIDTH - x));
  height = Math.max(MIN_H, Math.min(height, CANVAS_HEIGHT - y));
  return {x, y, width, height};
}

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  selected?: boolean;
  onChange: (props: { x: number, y: number, width: number, height: number }) => void;
  onSelect: () => void;
}

export default function ResizableDraggableImage({
  x, y, width, height, src, selected, onChange, onSelect
}: Props) {
  const [drag, setDrag] = useState<null | { dx: number, dy: number }> (null);
  const [resize, setResize] = useState<null | { corner: string, sx: number, sy: number, ox: number, oy: number, ow: number, oh: number }> (null);

  function onMouseDown(e: React.MouseEvent) {
    setDrag({ dx: e.clientX - x, dy: e.clientY - y });
    onSelect();
    e.stopPropagation();
  }
  function onMouseMove(e: MouseEvent) {
    if (drag) {
      onChange(clampImage({ x: e.clientX - drag.dx, y: e.clientY - drag.dy, width, height }));
    }
    if (resize) {
      let { corner, sx, sy, ox, oy, ow, oh } = resize;
      let dx = e.clientX - sx, dy = e.clientY - sy;
      let nx = ox, ny = oy, nw = ow, nh = oh;
      if (corner === "br") { nw = Math.max(MIN_W, ow + dx); nh = Math.max(MIN_H, oh + dy);}
      if (corner === "tl") { nx = ox + dx; ny = oy + dy; nw = Math.max(MIN_W, ow - dx); nh = Math.max(MIN_H, oh - dy);}
      if (corner === "tr") { ny = oy + dy; nw = Math.max(MIN_W, ow + dx); nh = Math.max(MIN_H, oh - dy);}
      if (corner === "bl") { nx = ox + dx; nw = Math.max(MIN_W, ow - dx); nh = Math.max(MIN_H, oh + dy);}
      onChange(clampImage({ x: nx, y: ny, width: nw, height: nh }));
    }
  }
  function onMouseUp() {
    setDrag(null);
    setResize(null);
  }
  React.useEffect(() => {
    if (drag || resize) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x, top: y, width, height, zIndex: 1,
        userSelect: "none", pointerEvents: "auto"
      }}
      tabIndex={-1}
      onMouseDown={onMouseDown}
    >
      <img
        src={src}
        style={{
          width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", borderRadius: 8,
          border: selected ? "2px solid #6366f1" : "none"
        }}
        alt=""
        draggable={false}
      />
      {/* Outline for resize */}
      {selected && (
        <>
          <div style={{
            position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
            border: "2px dashed #6366f1", borderRadius: 8, pointerEvents: "none"
          }}/>
          {/* Resize handles */}
          {["tl", "tr", "br", "bl"].map(corner => {
            const styles: Record<string, React.CSSProperties> = {
              tl: { left: -7, top: -7, cursor: "nwse-resize" },
              tr: { right: -7, top: -7, cursor: "nesw-resize" },
              br: { right: -7, bottom: -7, cursor: "nwse-resize" },
              bl: { left: -7, bottom: -7, cursor: "nesw-resize" },
            };
            return (
              <div
                key={corner}
                style={{
                  position: "absolute", width: 14, height: 14, background: "#fff",
                  border: "2px solid #6366f1", borderRadius: 7, ...styles[corner], zIndex: 10
                }}
                onMouseDown={e => {
                  setResize({ corner, sx: e.clientX, sy: e.clientY, ox: x, oy: y, ow: width, oh: height });
                  e.stopPropagation();
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}