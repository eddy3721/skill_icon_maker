import React, { useState, useEffect } from "react";
import { Canvas, Path } from "fabric";
import { Icon, loadIcon } from "@iconify/react";
import {
  Box,
  Input,
  Flex,
  parseColor,
  Separator,
  createListCollection,
  Table,
  IconButton,
  Text,
} from "@chakra-ui/react";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { Field } from "@/components/ui/field";

const LayerList = ({ canvas }: { canvas: Canvas | null }) => {
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<any>(null);
  const [locked, setLocked] = useState(false);

  Canvas.prototype.updateZindices = function () {
    const objects = this.getObjects();
    objects.forEach((obj, index) => {
      obj.set({ zIndex: index });
    });
  };

  const moveSelectLayer = (direction: any) => {
    if (!selectedLayer || !canvas) return;

    const objects = canvas.getObjects();
    const object = objects.find((obj: any) => obj.id === selectedLayer);

    if (!object) return;

    const currentIndex = objects.indexOf(object);

    if (direction == "up" && currentIndex < objects.length - 1) {
      const temp = objects[currentIndex];
      objects[currentIndex] = objects[currentIndex + 1];
      objects[currentIndex + 1] = temp;
    } else if (direction == "down" && currentIndex > 0) {
      const temp = objects[currentIndex];
      objects[currentIndex] = objects[currentIndex - 1];
      objects[currentIndex - 1] = temp;
    }

    const backgroundColor = canvas.backgroundColor;

    canvas.clear();

    objects.forEach((obj: any, index) => {
      canvas.add(obj);
      obj.set({ zIndex: index });
    });

    canvas.backgroundColor = backgroundColor;
    canvas.renderAll();

    canvas.setActiveObject(object);

    canvas.renderAll();

    updateLayers();
  };

  const updateLayers = () => {
    if (!canvas) return;

    canvas.updateZindices();
    const objects = canvas
      .getObjects()
      .filter(
        (obj: any) =>
          !(obj.id.startsWith("vertical-") || obj.id.startsWith("horizontal-"))
      )
      .map((obj: any) => ({
        id: obj.id,
        zIndex: obj.zIndex,
        type: obj.type,
      }));

    setLayers([...objects].reverse());
  };

  const handleObjectSelected = (e: any) => {
    const selectedObject = e.selected ? e.selected[0] : null;

    if (selectedObject) {
      setSelectedLayer(selectedObject.id);
      setLocked(selectedObject.locked);
    } else {
      setSelectedLayer(null);
      setLocked(false);
    }
  };

  //切換鎖定
  const toggleLock = () => {
    if (!canvas) return;

    const selectedObject = canvas.getActiveObject() as any;

    if (!selectedObject) return;

    const newLockedState = !selectedObject.locked;

    selectedObject.set({
      selectable: !selectedObject.selectable,
      evented: !selectedObject.evented,
      locked: newLockedState,
    });

    setLocked(newLockedState);

    canvas.renderAll();
  };

  const selectLayerInCanvas = (layerId: any) => {
    if (!canvas) return;
    const object = canvas.getObjects().find((obj: any) => obj.id === layerId);
    if (object) {
      canvas.setActiveObject(object);
      canvas.renderAll();
    }
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case "path":
        return "tdesign:file-icon";
      case "rect":
        return "material-symbols:square-outline-rounded";
      default:
        return "bi:question-lg";
    }
  };

  //刪除圖層
  const deleteLayer = (layerId: any) => {
    if (!canvas) return;

    const object = canvas.getObjects().find((obj: any) => obj.id === layerId);
    if (object) {
      canvas.remove(object);
      canvas.renderAll();
    }
  };

  useEffect(() => {
    if (!canvas) return;

    canvas.on("object:added", updateLayers);
    canvas.on("object:removed", updateLayers);
    canvas.on("object:modified", updateLayers);
    canvas.on("selection:created", handleObjectSelected);
    canvas.on("selection:updated", handleObjectSelected);
    canvas.on("selection:cleared", handleObjectSelected);

    updateLayers();

    return () => {
      canvas.off("object:added", updateLayers);
      canvas.off("object:removed", updateLayers);
      canvas.off("object:modified", updateLayers);
      canvas.off("selection:created", handleObjectSelected);
      canvas.off("selection:updated", handleObjectSelected);
      canvas.off("selection:cleared", handleObjectSelected);
    };
  }, [canvas]);

  return (
    <>
      <Table.ScrollArea maxH={320}>
        <Table.Root size="sm" interactive stickyHeader>
          <Table.Header>
            <Table.Row boxShadow="0 4px 6px rgba(0, 0, 0, 0.2)">
              <Table.ColumnHeader bg="gray.700">
                <Flex justify="space-between" align="center">
                  <Icon width={24} icon="bxs:layer" />
                  <Flex gap={2}>
                    <IconButton
                      rounded="full"
                      size={"md"}
                      variant="ghost"
                      colorPalette={locked ? "red" : "teel"}
                      onClick={toggleLock}
                    >
                      {locked ? (
                        <Icon width={24} icon="si:lock-fill" />
                      ) : (
                        <Icon width={24} icon="si:unlock-fill" />
                      )}
                    </IconButton>
                    <IconButton
                      rounded="full"
                      size={"md"}
                      variant="ghost"
                      onClick={() => moveSelectLayer("up")}
                    >
                      <Icon width={24} icon="tabler:arrow-up" />
                    </IconButton>
                    <IconButton
                      rounded="full"
                      size={"md"}
                      variant="ghost"
                      onClick={() => moveSelectLayer("down")}
                    >
                      <Icon width={24} icon="tabler:arrow-down" />
                    </IconButton>
                  </Flex>
                </Flex>
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {layers.map((layer) => (
              <Table.Row key={layer.id}>
                <Table.Cell
                  h="54px"
                  cursor="pointer"
                  bg={layer.id === selectedLayer ? "gray.600" : "gray.700"}
                  _hover={{ bg: "gray.600" }}
                  onClick={() => selectLayerInCanvas(layer.id)}
                >
                  <Flex justify="space-between">
                    <Flex gap={2} align="center">
                      <Icon width={24} icon={getObjectIcon(layer.type)} />
                      <Text maxWidth="150px" truncate>
                        {layer.id}
                      </Text>
                    </Flex>
                    {layer.id === selectedLayer && (
                      <IconButton
                        rounded="full"
                        size={"sm"}
                        variant="ghost"
                        colorPalette={"red"}
                        onClick={() => deleteLayer(layer.id)}
                      >
                        <Icon width={24} icon="maki:cross" />
                      </IconButton>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  );
};

export default LayerList;
