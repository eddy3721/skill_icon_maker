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

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [guidelines, setGuidelines] = useState<any[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 256,
        height: 256,
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

  //匯出圖標
  const exportIcon = () => {
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 0.5,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "icon.png";
    link.click();
  };

  //工具列
  const tools = [
    { icon: "material-symbols:square-outline-rounded", onClick: addRectangle },
    { icon: "tdesign:file-icon", onClick: addIcon },
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