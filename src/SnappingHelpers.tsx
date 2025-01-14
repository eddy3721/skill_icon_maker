import { Canvas, Line } from "fabric";

const snappingDistance = 10;

export const handleObjectMoving = (
  canvas: Canvas,
  obj: any,
  guidelines: any,
  setGuidelines: any
) => {
  const canvasWidth = canvas?.width | 0;
  const canvasHeight = canvas?.height | 0;
  const objLeft = obj.left;
  const objTop = obj.top;
  const objRight = objLeft + obj.width * obj.scaleX;
  const objBottom = objTop + obj.height * obj.scaleY;
  const centerX = objLeft + (obj.width * obj.scaleX) / 2;
  const centerY = objTop + (obj.height * obj.scaleY) / 2;

  let newGuidelines = [];
  clearGuidelines(canvas);

  let snapped = false;

  if (Math.abs(objLeft) < snappingDistance) {
    obj.set({ left: 0 });
    if (!guidelineExists(canvas, "vertical-left")) {
      const line = createVerticalGuideline(canvas, 0, "vertical-left");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  if (Math.abs(objTop) < snappingDistance) {
    obj.set({ top: 0 });
    if (!guidelineExists(canvas, "horizontal-top")) {
      const line = createHorizontalGuideline(canvas, 0, "horizontal-top");
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  if (Math.abs(canvasWidth - objRight) < snappingDistance) {
    obj.set({ left: canvasWidth - obj.width * obj.scaleX });
    if (!guidelineExists(canvas, "vertical-right")) {
      const line = createVerticalGuideline(
        canvas,
        canvasWidth,
        "vertical-right"
      );
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  if (Math.abs(canvasHeight - objBottom) < snappingDistance) {
    obj.set({ top: canvasHeight - obj.height * obj.scaleY });
    if (!guidelineExists(canvas, "horizontal-bottom")) {
      const line = createHorizontalGuideline(
        canvas,
        canvasHeight,
        "horizontal-bottom"
      );
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  if (Math.abs(centerX - canvasWidth / 2) < snappingDistance) {
    obj.set({ left: canvasWidth / 2 - (obj.width * obj.scaleX) / 2 });
    if (!guidelineExists(canvas, "vertical-center")) {
      const line = createVerticalGuideline(
        canvas,
        canvasWidth / 2,
        "vertical-center"
      );
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  if (Math.abs(centerY - canvasHeight / 2) < snappingDistance) {
    obj.set({ top: canvasHeight / 2 - (obj.height * obj.scaleY) / 2 });
    if (!guidelineExists(canvas, "horizontal-center")) {
      const line = createHorizontalGuideline(
        canvas,
        canvasHeight / 2,
        "horizontal-center"
      );
      newGuidelines.push(line);
      canvas.add(line);
    }
    snapped = true;
  }

  if (!snapped) {
    clearGuidelines(canvas);
  } else {
    setGuidelines(newGuidelines);
  }

  canvas.renderAll();
};

const guidelineType = {
  stroke: "#D9534F",
  strokeWidth: 2,
  selectable: false,
  evented: false,
  opacity: 0.7,
  strokeDashArray: [5, 5],
};

//建立垂直輔助線
export const createVerticalGuideline = (
  canvas: Canvas,
  x: number,
  id: string
) => {
  return new Line([x, 0, x, canvas.height], { ...guidelineType, id });
};

//建立水平輔助線
export const createHorizontalGuideline = (
  canvas: Canvas,
  y: number,
  id: string
) => {
  return new Line([0, y, canvas.width, y], { ...guidelineType, id });
};

//刪除輔助線
export const clearGuidelines = (canvas: Canvas) => {
  const objects = canvas.getObjects("line");
  objects.forEach((obj: any) => {
    if (
      obj.id &&
      (obj.id.startsWith("vertical-") || obj.id.startsWith("horizontal-"))
    ) {
      canvas.remove(obj);
    }
  });
  canvas.renderAll();
};

//檢查輔助線是否存在
const guidelineExists = (canvas: Canvas, id: string) => {
  const objects = canvas.getObjects("line");
  return objects.some((obj: any) => obj.id === id);
};
