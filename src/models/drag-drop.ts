/// Drag & Drop Interfaces

namespace App {
  export interface Draggable {
    // project items
    dragStartHandler(event: DragEvent): void; //DragEvent built-in TS type
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    // projects lists
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
  }
}
