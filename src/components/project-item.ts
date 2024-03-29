/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />

namespace App {
  //// notatka D&D
  export class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
  {
    private project: Project;

    get persons() {
      if (this.project.people === 1) {
        return "1 person";
      } else {
        return `${this.project.people} people`;
      }
    }

    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);
      this.project = project;

      this.configure();
      this.renderContent();
    }

    //notatki
    @Autobind
    dragStartHandler(event: DragEvent) {
      //notatki
      event.dataTransfer!.setData("text/plain", this.project.id); //setData (1st argument: format, 2nd: data)
      event.dataTransfer!.effectAllowed = "move"; //alternative: 'copy', sets behavior of coursor and sends info ("about intensions"?) to browser
    }

    dragEndHandler(_: DragEvent) {}

    configure() {
      this.element.addEventListener("dragstart", this.dragStartHandler);
    }

    renderContent() {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent = this.persons;
      // triggers getter // notatka
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }
}
