import React, { useRef, useState, useEffect } from "react";
import { Canvas, FabricText, Path, Rect, Shadow } from "fabric";
import { Settings, getIconPath, generateUniqueId } from "./Settings";
import { handleObjectMoving, clearGuidelines } from "./SnappingHelpers";
import LayerList from "./LayerList";
import { Icon, loadIcon } from "@iconify/react";
import {
  Box,
  Input,
  Flex,
  parseColor,
  Separator,
  createListCollection,
} from "@chakra-ui/react";
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
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import fabric from "fabric";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [guidelines, setGuidelines] = useState<any[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 248,
        height: 248,
      });

      initCanvas.backgroundColor = "#ffffff";
      initCanvas.renderAll();

      setCanvas(initCanvas);

      // 監聽物件移動事件
      initCanvas.on("object:moving", (e: any) => {
        handleObjectMoving(initCanvas, e.target, guidelines, setGuidelines);
      });

      // 清除輔助線
      initCanvas.on("object:modified", () => {
        clearGuidelines(initCanvas);
      });

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  // 更新背景顏色
  useEffect(() => {
    if (!canvas) return;
    canvas.backgroundColor = bgColor;
    canvas.renderAll();
  }, [bgColor, canvas]);

  //添加圖標
  const addIcon = async () => {
    if (!canvas) return;

    const pathData = await getIconPath();
    if (!pathData) return;

    // 使用 generateUniqueId 函式生成 ID
    const newId = generateUniqueId(canvas, "mdi:sword-");

    var shadow = new Shadow({
      color: "#000000",
      blur: 0,
    });

    // 創建新的 Path 對象
    const newIconPath = new Path(pathData.path, {
      id: newId,
      stroke: "#000000",
      fill: pathData.fill,
      strokeWidth: pathData.strokeWidth,
      strokeLineCap: pathData.strokeLinecap as CanvasLineCap,
      strokeLineJoin: pathData.strokeLinejoin as CanvasLineJoin,
      top: 50,
      left: 50,
      scaleX: 5,
      scaleY: 5,
      shadow: shadow,
      locked: false,
    });

    if (!newIconPath) return;
    canvas.add(newIconPath);
  };

  //添加矩形
  const addRectangle = () => {
    if (!canvas) return;

    const newId = generateUniqueId(canvas, "rectangle-");

    var shadow = new Shadow({
      color: "#000000",
      blur: 0,
    });

    const rect = new Rect({
      left: 100,
      top: 100,
      fill: "#20B2AA",
      width: 100,
      height: 100,
      id: newId,
      shadow: shadow,
      locked: false,
    });

    canvas.add(rect);
  };

  const handleBgColorChange = (e: any) => {
    const value = e.value?.toString("hex");

    const hexRegex = /^#?([A-Fa-f0-9]{6})$/;

    if (value && hexRegex.test(value)) {
      setBgColor(value.startsWith("#") ? value : `#${value}`);
    }
  };

  const exportIcon = () => {
    if (!canvas) return;

    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    const newWidth = originalWidth + 8;
    const newHeight = originalHeight + 8;

    // 計算畫布的偏移
    const offsetX = (newWidth - originalWidth) / 2;
    const offsetY = (newHeight - originalHeight) / 2;

    // 調整畫布大小並平移內容
    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);
    canvas.getObjects().forEach((obj) => {
      obj.left += offsetX;
      obj.top += offsetY;
      obj.setCoords();
    });

    // 添加白色邊框
    const whiteRect = new Rect({
      left: 0,
      top: 0,
      width: newWidth - 4,
      height: newHeight - 4,
      stroke: "white",
      strokeWidth: 4,
      fill: "#00000000",
      id: "border",
    });
    canvas.add(whiteRect);
    canvas.renderAll();

    // 匯出圖像
    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 0.5,
      left: 0,
      top: 0,
      width: newWidth,
      height: newHeight,
    });

    // 還原
    canvas.remove(whiteRect);
    canvas.getObjects().forEach((obj) => {
      obj.left -= offsetX;
      obj.top -= offsetY;
      obj.setCoords();
    });
    canvas.setWidth(originalWidth);
    canvas.setHeight(originalHeight);
    canvas.renderAll();

    // 下載圖片
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "icon.png";
    link.click();
  };

  //匯出JSON
  const exportJson = () => {
    if (!canvas) return;

    const json = canvas.toDatalessJSON([
      "id",
      "locked",
      "selectable",
      "evented",
    ]);
    const jsonString = JSON.stringify(json, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas.json";
    link.click();
  };

  //匯入JSON
  const importJson = async () => {
    if (!canvas) return;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";

    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const json = JSON.parse(e.target?.result as string);
        canvas.loadFromJSON(json).then(function () {
          canvas.renderAll();
        });
      };

      reader.readAsText(file);
    };

    fileInput.click();

    return () => {
      fileInput.remove();
    };
  };

  //工具列
  const tools = [
    { icon: "material-symbols:square-outline-rounded", onClick: addRectangle },
    { icon: "tdesign:file-icon", onClick: addIcon },
    { icon: "tdesign:folder-import-filled", onClick: importJson },
    { icon: "tdesign:folder-export-filled", onClick: exportJson },
    { icon: "material-symbols:download", onClick: exportIcon },
  ];

  return (
    <Flex mt={2} gap="8" justify="center" wrap="wrap">
      {/* 左邊部分：圖像區域 */}
      <Box bg="gray.700" p={4} shadow="md" borderRadius="md">
        <Box
          mb={4}
          borderWidth="5px"
          borderColor="gray.500"
          borderStyle="dashed"
        >
          <Box borderWidth="4px" borderColor="#FFFFFF">
            <canvas ref={canvasRef} />
          </Box>
        </Box>

        <LayerList canvas={canvas} />
      </Box>

      {/* 中間部分：工具欄 */}
      <Box
        bg="gray.700"
        p={4}
        shadow="md"
        borderRadius="md"
        display="flex"
        flexDirection={{ base: "row", sm: "column" }} // 小螢幕水平排列，較大螢幕垂直排列
        alignItems="center"
        gap={4}
      >
        {tools.map((tool) => {
          return (
            <Button key={tool.icon} w={12} h={12} onClick={tool.onClick}>
              <Icon icon={tool.icon} />
            </Button>
          );
        })}
      </Box>

      {/* 右邊部分：設定欄 */}
      <Box
        bg="gray.700"
        p={4}
        shadow="md"
        borderRadius="md"
        flexGrow={1} // 設定這個讓設定欄可以增長
        maxWidth="400px"
      >
        {/* 背景顏色選擇器 */}
        <ColorPickerRoot
          value={parseColor(bgColor)}
          onValueChange={handleBgColorChange}
        >
          <ColorPickerLabel>背景顏色</ColorPickerLabel>
          <ColorPickerControl>
            <ColorPickerInput onChange={(e) => handleBgColorChange(e.target)} />
            <ColorPickerTrigger />
          </ColorPickerControl>
          <ColorPickerContent>
            <ColorPickerArea />
            <ColorPickerEyeDropper />
            <ColorPickerSliders />
          </ColorPickerContent>
        </ColorPickerRoot>

        <Separator mt={4} mb={4} />

        {/* 圖標選擇器 */}
        <Settings canvas={canvas} />
      </Box>
    </Flex>
  );
};

export default App;
