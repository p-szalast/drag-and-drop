namespace App {
  //// Component Base Class

  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
    templateEl: HTMLTemplateElement;
    hostEl: T; //where we want render the template
    element: U;

    constructor(
      templateId: string,
      hostId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.templateEl = <HTMLTemplateElement>(
        document.getElementById(templateId)!
      );
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
}
