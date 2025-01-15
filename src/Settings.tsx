import React, { useState, useEffect } from "react";
import { Canvas, Path, Shadow } from "fabric";
import { Icon, loadIcon } from "@iconify/react";
import { Slider } from "@/components/ui/slider";
import {
  Box,
  Input,
  Flex,
  parseColor,
  Separator,
  createListCollection,
  Link,
  Text,
  List,
  IconButton,
  Button,
} from "@chakra-ui/react";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import {
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerRoot,
  ColorPickerSliders,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
  PopoverArrow,
} from "@/components/ui/popover";

import { Field } from "@/components/ui/field";

export const getIconPath = async (iconName = "mdi:sword") => {
  const data = await loadIcon(iconName);
  //console.log(data.body);
  if (!data || !data.body) return null;

  // 匹配 d, strokeLinecap, strokeLinejoin
  const fillMatch = data.body.match(/fill="([^"]+)"/);
  const strokeLinecapMatch = data.body.match(/stroke-linecap="([^"]+)"/);
  const strokeLinejoinMatch = data.body.match(/stroke-linejoin="([^"]+)"/);
  const strokeWidthMatch = data.body.match(/stroke-width="([^"]+)"/);
  const dMatch = data.body.match(/d="([^"]+)"/);

  const fill = fillMatch && fillMatch[1] === "none" ? "#00000000" : "#000000";
  const strokeLinecap = strokeLinecapMatch ? strokeLinecapMatch[1] : "butt";
  const strokeLinejoin = strokeLinejoinMatch ? strokeLinejoinMatch[1] : "miter";
  const strokeWidth = strokeWidthMatch ? Number(strokeWidthMatch[1]) : 0;
  const d = dMatch ? dMatch[1] : null;

  if (d) {
    return {
      path: d,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      fill,
    };
  } else {
    return null;
  }
};

//生成唯一icon的id
export const generateUniqueId = (canvas: any, prefix: string) => {
  const existingIds = canvas
    .getObjects()
    .filter((obj: any) => obj.id && obj.id.startsWith(prefix))
    .map((obj: any) => obj.id);

  let idNumber = 1;
  let newId = `${prefix}${idNumber}`;
  while (existingIds.includes(newId)) {
    idNumber++;
    newId = `${prefix}${idNumber}`;
  }
  return newId;
};

type Props = {
  canvas: Canvas | null;
};

export const Settings = ({ canvas }: Props) => {
  const [iconName, setIconName] = useState<string>("mdi:sword");
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [fill, setFill] = useState<string>("");
  const [stroke, setStroke] = useState<string>("");
  const [strokeWidth, setStrokeWidth] = useState<string>("");
  const [angle, setAngle] = useState<string>("");
  const [x, setX] = useState<string>("");
  const [y, setY] = useState<string>("");
  const [shadowBlur, setShadowBlur] = useState<string>("");

  useEffect(() => {
    if (!canvas) return;

    canvas.on("selection:created", (e) => {
      handleObjectSelection(e.selected[0]);
    });

    canvas.on("selection:updated", (e) => {
      handleObjectSelection(e.selected[0]);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
      clearSettings();
    });

    canvas.on("object:modified", (e) => {
      handleObjectSelection(e.target);
    });

    canvas.on("object:scaling", (e) => {
      handleObjectSelection(e.target);
    });

    canvas.on("object:rotating", (e) => {
      handleObjectSelection(e.target);
    });

    canvas.on("object:moving", (e) => {
      handleObjectSelection(e.target);
    });
  }, [canvas]);

  //數據面板
  const handleObjectSelection = (obj: any) => {
    if (!obj) return;

    setSelectedObject(obj);
    console.log(obj);

    if (obj.type === "rect" || obj.type === "path") {
      setWidth(Math.round(obj.width * obj.scaleX).toString());
      setHeight(Math.round(obj.height * obj.scaleY).toString());
      setFill(obj.fill);
      setStroke(obj.stroke);
      setStrokeWidth(obj.strokeWidth);
      setAngle(Math.round(obj.angle).toString());
      setX(Math.round(obj.left).toString());
      setY(Math.round(obj.top).toString());
      setIconName(extractPrefix(obj.id));
      setShadowBlur(obj.shadow.blur);
    }
  };

  //捕捉id前綴
  const extractPrefix = (id: string) => {
    const match = id.match(/(.*)-[^-]+$/);
    return match ? match[1] : "";
  };

  //刪除
  const clearSettings = () => {
    setWidth("");
    setHeight("");
    setFill("");
  };

  const handleWidthChange = (e: any) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setWidth(value);

    if (selectedObject && selectedObject.type === "rect" && initValue >= 0) {
      selectedObject.set({ width: initValue / selectedObject.scaleX });
      canvas?.renderAll();
    }

    if (selectedObject && selectedObject.type === "path" && initValue >= 0) {
      const scaleX = initValue / selectedObject.width;
      selectedObject.set({ scaleX: scaleX });
      canvas?.renderAll();
    }
  };
  const handleHeightChange = (e: any) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setHeight(value);

    if (selectedObject && selectedObject.type === "rect" && initValue >= 0) {
      selectedObject.set({ height: initValue / selectedObject.scaleY });
      canvas?.renderAll();
    }

    if (selectedObject && selectedObject.type === "path" && initValue >= 0) {
      const scaleY = initValue / selectedObject.height;
      selectedObject.set({ scaleY: scaleY });
      canvas?.renderAll();
    }
  };
  const handleFillChange = (e: any) => {
    const value = e.value.toString("hex");

    const hexRegex = /^#?([A-Fa-f0-9]{6})$/;

    if (value && hexRegex.test(value)) {
      setFill(value.startsWith("#") ? value : `#${value}`);
    }

    if (selectedObject) {
      selectedObject.set({ fill: value });
      canvas?.renderAll();
    }
  };

  const handleStrokeChange = (e: any) => {
    const value = e.value.toString("hex");

    const hexRegex = /^#?([A-Fa-f0-9]{6})$/;

    if (value && hexRegex.test(value)) {
      setStroke(value.startsWith("#") ? value : `#${value}`);
    }

    if (selectedObject) {
      selectedObject.set({ stroke: value });
      canvas?.renderAll();
    }
  };

  const handleAngleChange = (e: any) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setAngle(value);

    if (selectedObject && initValue >= 0) {
      selectedObject.set({ angle: initValue });
      canvas?.renderAll();
    }
  };

  const handleXChange = (e: any) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setX(value);

    if (selectedObject && initValue >= 0) {
      selectedObject.set({ left: initValue });
      canvas?.renderAll();
    }
  };

  const handleYChange = (e: any) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setY(value);

    if (selectedObject && initValue >= 0) {
      selectedObject.set({ top: initValue });
      canvas?.renderAll();
    }
  };

  const handleIconNameChange = async (value: any) => {
    if (!canvas) return;
    setIconName(value);

    const newPathData = await getIconPath(value);

    if (selectedObject && newPathData) {
      const newPath = new Path(newPathData.path, {
        left: selectedObject.left,
        top: selectedObject.top,
        stroke: selectedObject.stroke,
        fill: selectedObject.fill,
        strokeWidth: newPathData.strokeWidth,
        strokeLineCap: newPathData.strokeLinecap as CanvasLineCap,
        strokeLineJoin: newPathData.strokeLinejoin as CanvasLineJoin,
        scaleX: selectedObject.scaleX,
        scaleY: selectedObject.scaleY,
        angle: selectedObject.angle,
        id: generateUniqueId(canvas, value + "-"),
      });

      canvas.remove(selectedObject);
      canvas.add(newPath);
      canvas.setActiveObject(newPath);
      handleObjectSelection(newPath);
      canvas.renderAll();
    } else {
      console.error("Selected object is not a Path or SVG path is invalid");
    }
  };

  const handleStrokeWidthChange = (e: any) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setStrokeWidth(value);

    if (selectedObject && initValue >= 0) {
      selectedObject.set({ strokeWidth: initValue });
      canvas?.renderAll();
    }
  };

  const handleShadowBlurChange = (e: any) => {
    const value = e.target.value.replace(/,/g, "");
    const initValue = parseInt(value, 10);
    setShadowBlur(value);

    if (selectedObject && initValue >= 0) {
      selectedObject.set({ shadow: { blur: initValue } });
      canvas?.renderAll();
    }
  };

  //驗證顏色格式
  const validateColor = (color: any) => {
    const parsed = parseColor(color);
    return parsed ? parsed : parseColor("#000000");
  };

  // 預設 icon
  const icon_frameworks = createListCollection({
    items: [
      { label: "劍", value: "mdi:sword" },
      { label: "盾牌", value: "material-symbols:shield" },
      { label: "星星", value: "mdi:star" },
    ],
  });

  return (
    <Flex gap={4} direction="column">
      {selectedObject && (
        <>
          <Flex gap={4}>
            <Flex gap={1} direction="column">
              <Icon width={24} icon="mynaui:letter-x-solid" />
              <Input type="number" value={x} onChange={handleXChange} />
            </Flex>
            <Flex gap={1} direction="column">
              <Icon width={24} icon="mynaui:letter-y-solid" />
              <Input type="number" value={y} onChange={handleYChange} />
            </Flex>
          </Flex>

          <Flex gap={4}>
            <Flex gap={1} direction="column">
              <Icon width={24} icon="ix:width" />
              <Input type="number" value={width} onChange={handleWidthChange} />
            </Flex>
            <Flex gap={1} direction="column">
              <Icon width={24} icon="ix:height" />
              <Input
                type="number"
                value={height}
                onChange={handleHeightChange}
              />
            </Flex>
          </Flex>

          <Flex gap={4}>
            <Flex gap={1} direction="column" flex="1">
              <Icon width={24} icon="ph:angle-bold" />
              <Input type="number" value={angle} onChange={handleAngleChange} />
            </Flex>

            <Flex gap={1} direction="column" flex="1">
              <Flex gap={2} align="center">
                <Icon width={24} icon="material-symbols:ev-shadow-outline" />
                {shadowBlur}
              </Flex>
              <Slider
                mt={2.5}
                max={10}
                w="100%"
                defaultValue={[Number(shadowBlur)]}
                onChange={handleShadowBlurChange}
              />
            </Flex>
          </Flex>

          <ColorPickerRoot
            value={validateColor(fill)}
            onValueChange={handleFillChange}
          >
            <ColorPickerLabel>
              <Icon width={24} icon="bxs:color-fill" />
            </ColorPickerLabel>
            <ColorPickerControl>
              <ColorPickerInput onChange={(e) => handleFillChange(e.target)} />
              <ColorPickerTrigger />
            </ColorPickerControl>
            <ColorPickerContent>
              <ColorPickerArea />
              <ColorPickerEyeDropper />
              <ColorPickerSliders />
            </ColorPickerContent>
          </ColorPickerRoot>
        </>
      )}
      {selectedObject && selectedObject.type === "path" && (
        <>
          <Flex gap={4}>
            <Flex mt={0.5} gap={1} direction="column">
              <Icon width={24} icon="fluent:line-thickness-24-filled" />
              <Input
                type="number"
                value={strokeWidth}
                min={0}
                onChange={handleStrokeWidthChange}
              />
            </Flex>

            <ColorPickerRoot
              value={validateColor(stroke)}
              onValueChange={handleStrokeChange}
            >
              <ColorPickerLabel>
                <Icon width={24} icon="ix:pen" />
              </ColorPickerLabel>
              <ColorPickerControl>
                <ColorPickerInput
                  onChange={(e) => handleStrokeChange(e.target)}
                />
                <ColorPickerTrigger />
              </ColorPickerControl>
              <ColorPickerContent>
                <ColorPickerArea />
                <ColorPickerEyeDropper />
                <ColorPickerSliders />
              </ColorPickerContent>
            </ColorPickerRoot>
          </Flex>

          <Flex gap={4}>
            <Field
              label={
                <>
                  圖標代碼
                  <PopoverRoot positioning={{ placement: "top-start" }}>
                    <PopoverTrigger asChild>
                      <IconButton rounded="full" size={"xs"} variant="ghost">
                        <Icon icon="bi:question-lg" />
                      </IconButton>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverBody>
                        <List.Root>
                          <List.Item>
                            可以在{" "}
                            <Link
                              variant="underline"
                              href="https://icon-sets.iconify.design/"
                              colorPalette="teal"
                              target="_blank" // 這裡新增 target="_blank"
                            >
                              Iconify
                            </Link>{" "}
                            上複製20萬+的 Icon Name
                          </List.Item>
                        </List.Root>
                      </PopoverBody>
                    </PopoverContent>
                  </PopoverRoot>
                </>
              }
            >
              <Input
                placeholder="輸入或選擇圖標代碼"
                value={iconName}
                onChange={(e) => handleIconNameChange(e.target.value)}
              />
            </Field>
            <SelectRoot
              mt={2}
              collection={icon_frameworks}
              value={[iconName]}
              onValueChange={(e) => handleIconNameChange(e.value[0])}
              width={250}
            >
              <SelectLabel mb={1}>預設</SelectLabel>
              <SelectTrigger>
                <SelectValueText placeholder="選擇icon" />
              </SelectTrigger>
              <SelectContent>
                {icon_frameworks.items.map((icon) => (
                  <SelectItem item={icon} key={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Flex>
        </>
      )}
    </Flex>
  );
};
