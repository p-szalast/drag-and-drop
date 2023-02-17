/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../util/validation.ts" />
/// <reference path="../state/project-state.ts" />

namespace App {
  //Project input calss
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleEl: HTMLInputElement;
    descriptionEl: HTMLInputElement;
    peopleEl: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");

      this.titleEl = this.element.querySelector("#title")! as HTMLInputElement;
      this.descriptionEl = this.element.querySelector(
        "#description"
      )! as HTMLInputElement;
      this.peopleEl = this.element.querySelector(
        "#people"
      )! as HTMLInputElement;

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
}
