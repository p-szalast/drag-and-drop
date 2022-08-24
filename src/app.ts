/// COURSE ///

/// Drag & Drop Interfaces
interface Draggable {
  // project items
  dragStartHandler(event: DragEvent): void; //DragEvent built-in TS type
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  // projects lists
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

//Project Type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus // public status: "active" | "finished"
  ) {}
}

type Listener<T> = (items: T[]) => void; //we do not need return

class State<T> {
  protected listeners: Listener<T>[] = [];
  //similar to private, but also allows access from inheriting classes

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(), //id unlikely to repeat (for project purposes)
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.updateListeners(); //leads to list to rerender its items
  }

  //notes D&D
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); //slice - for copy
    }
  }
}

const projectState = ProjectState.getInstance();

///// Validation Logic
interface Validatable {
  value: string | number;
  required: boolean | undefined; // alternative for "?"
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0; // trim can be used only on string so prevetiely we convert it to string
  }
  if (
    validatableInput.minLength != null && // != - refers to null and undefined (without it would be a problem with a value of 0)
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

//Autobind decorator function
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

//// Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T; //where we want render the template
  element: U;

  constructor(
    templateId: string,
    hostId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateEl = <HTMLTemplateElement>document.getElementById(templateId)!;
    this.hostEl = <T>document.getElementById(hostId)!;

    const importedNode = document.importNode(this.templateEl.content, true);

    this.element = <U>importedNode.firstElementChild;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostEl.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

//Project input calss
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleEl: HTMLInputElement;
  descriptionEl: HTMLInputElement;
  peopleEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleEl = this.element.querySelector("#title")! as HTMLInputElement;
    this.descriptionEl = this.element.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleEl = this.element.querySelector("#people")! as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleEl.value;
    const description = this.descriptionEl.value;
    const people = this.peopleEl.value;

    const titleValidatable: Validatable = {
      value: title,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: description,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validatable = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    };

    //basic validation
    if (
      //if one is false show alert
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Innvalid input");
      return;
    } else {
      return [title, description, parseFloat(people)];
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault(); // submit triggers HTTP request
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      //Tuples are arrays
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleEl.value = "";
    this.descriptionEl.value = "";
    this.peopleEl.value = "";
  }
}

const prjInput = new ProjectInput();

////// Project Item //////

//// notatka D&D
class ProjectItem
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

////// Project List ///////

class ProjectList
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
    const listEl = document.getElementById(projectListId)! as HTMLUListElement;
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

const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
