import React, { useCallback, useEffect, useState } from "react";
import {
  Draggable,
  DragEndEvent,
  Mirror,
  MouseSensor,
  mirrorDefaultOptions,
  DraggableOptions,
} from "draggable-ts";
import { TodoList } from "../components/TodoList";

export const argTypes = {
  draggable: ".draggable",
  dropable: ".draggable",
  condition: {
    delay: {
      mouse: 0,
      touch: 100,
      drag: 0,
    },
    distance: 0,
  },
  mirror: mirrorDefaultOptions,
  sensors: [MouseSensor],
  plugins: [Mirror],
};

const defaultOptions = {
  draggable: ".draggable",
  dropable: ".draggable",
  condition: {
    delay: {
      mouse: 0,
      touch: 100,
      drag: 0,
    },
    distance: 0,
  },
  mirror: mirrorDefaultOptions,
  sensors: [MouseSensor],
  plugins: [Mirror],
};

const dafaultTodoList = [
  "1.早上8:30，起床、洗漱、吃早饭",
  "2.中午12:00，吃午饭（不知道吃什么就摇骰子）",
  "3.晚上12:00，洗漱，睡觉",
  "4.下午6:00，吃晚饭，",
];

export function MirrorOptions(options: DraggableOptions = defaultOptions) {
  const [data, setData] = useState<string[]>(dafaultTodoList);

  const dragEndHandler = useCallback(
    (event: DragEndEvent) => {
      //
      const dragIndex = Number(event.source?.getAttribute("data-index"));
      const dropIndex = Number(event.over?.getAttribute("data-index"));
      const dragItem = data.splice(dragIndex, 1)[0];
      let target = dropIndex;
      if (dragIndex > dropIndex) {
        target += 1;
      }
      data.splice(target, 0, dragItem);
      setData([...data]);
    },
    [data, setData]
  );

  useEffect(() => {
    const draggable = new Draggable(options);

    draggable.emitter.on("drag:end", dragEndHandler);
    return () => {
      draggable.destroy();
    };
  }, [options]);

  return (
    <div>
      <p>基础的sortable排序</p>
      <div
        style={{
          display: "flex",
        }}
      >
        <TodoList items={data} />
        <TodoList items={data} />
      </div>
    </div>
  );
}

export default {
  title: "Example/Sortable",
  component: Mirror,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes,
};
