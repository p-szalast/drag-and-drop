/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />

namespace App {
  ////// Project List ///////

  export class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
      this.assignedProjects = [];

      this.configure();
      this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
      // check if data is attached to drag event and if its proper format
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault(); // In JS drop is only allowed (drop event only triggers on element) if on the dragOverHandler of that same element preventDefault is called.          //*default = not allowed dropping, prevent default = allowing droping
        const listEl = this.element.querySelector("ul")!;
        // changing dropable area background to show dropable area
        listEl.classList.add("droppable");
      }
    }

    @Autobind
    dropHandler(event: DragEvent): void {
      // console.log(event); //after printing object to console (obj is reference type, we see latest snapshot in console, when the data is lost (files property is empty in console this way))
      const prjId = event.dataTransfer!.getData("text/plain");
      projectState.moveProject(
        prjId,
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
      );
    }

    @Autobind
    dragLeaveHandler(_: DragEvent): void {
      const listEl = this.element.querySelector("ul")!; //or bind(this)
      // changing dropable area background to show dropable area
      listEl.classList.remove("droppable");
    }

    configure() {
      //notes
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);

      //custom Fn
      projectState.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter((prj) => {
          if (this.type === "active") {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });
        this.assignedProjects = relevantProjects;
        this.renderProjects();
      });
    }

    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;

      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects() {
      const projectListId = `${this.type}-projects-list`;
      const listEl = document.getElementById(
        projectListId
      )! as HTMLUListElement;
      listEl.innerHTML = "";
      for (const prjItem of this.assignedProjects) {
        new ProjectItem(projectListId, prjItem);
        //////// prev option for creating elements
        // const listItem = document.createElement("li"); //creating el
        // listItem.textContent = prjItem.title;
        // listEl.appendChild(listItem);
      }
    }
  }
}
