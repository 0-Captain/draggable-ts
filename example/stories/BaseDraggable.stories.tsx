import React, { useCallback, useEffect, useState } from "react";
import { Draggable, DragEndEvent } from "draggable-ts";
import { TodoList } from "../components/TodoList";

export default {
  title: "Example/Draggable",
  component: BaseDraggable,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // backgroundColor: { control: "color" },
  },
};

const dafaultTodoList = [
  "1.早上8:30，起床、洗漱、吃早饭",
  "2.中午12:00，吃午饭（不知道吃什么就摇骰子）",
  "3.晚上12:00，洗漱，睡觉",
  "4.下午6:00，吃晚饭，",
];

export function BaseDraggable() {
  const [data, setData] = useState<string[]>(dafaultTodoList);

  const dragEndHandler = useCallback(
    (event: DragEndEvent) => {
      //
      const dragIndex = Number(event.source?.getAttribute("data-index"));
      const dropIndex = Number(event.over?.getAttribute("data-index"));
      const dragItem = data.splice(dragIndex, 1)[0];
      data.splice(dropIndex + 1, 0, dragItem);
      setData([...data]);
    },
    [data, setData]
  );

  useEffect(() => {
    const draggable = new Draggable({
      draggable: ".draggablez",
    });

    draggable.emitter.on("drag:end", dragEndHandler);
    return () => {
      draggable.destroy();
    };
  }, []);

  return (
    <div>
      <TodoList items={data} />
    </div>
  );
}
