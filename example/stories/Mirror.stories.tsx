import { Mirror, mirrorDefaultOptions, MouseSensor } from "draggable-ts";
import { useEffect, useState } from "react";
import DraggableFC from "../components/Draggable";

// constrainDimensions: true,
// xAxis: true,
// yAxis: true,
// cursorOffsetX: null,
// cursorOffsetY: null,
// thresholdX: 0,
// thresholdY: 0,

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

export const DragCondition = ({
  mouseDelay,
  distance,
}: {
  mouseDelay: number;
  distance: number;
}) => {
  const [options, setOptions] = useState(defaultOptions);

  useEffect(() => {
    const newOptions = { ...defaultOptions };
    newOptions.condition.delay.mouse = mouseDelay;
    newOptions.condition.distance = distance;
    setOptions(newOptions);
  }, [mouseDelay, distance]);

  return <DraggableFC options={options} />;
};

export default {
  title: "Example/Sortable",
  component: DragCondition,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    mouseDelay: {
      control: {
        type: "number",
        min: 0,
      },
    },
    distance: {
      control: {
        type: "number",
        min: 0,
      },
    },
  },
};
