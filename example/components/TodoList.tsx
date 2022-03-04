import React from "react";
import "./TodoList.css";

export const TodoList = ({ items }: { items: string[] }) => {
  return (
    <div className="todo-list">
      <h2>Todo List</h2>
      {items.map((item, index) => (
        <ListItem key={index} data={item} index={index} />
      ))}
    </div>
  );
};

const ListItem = ({ data, index }: { data: string; index: number }) => {
  return (
    <div className="list-item draggable" data-index={index}>
      {data}
    </div>
  );
};
