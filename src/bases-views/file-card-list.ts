import { BasesView, QueryController } from "obsidian";

import { createFileCard } from "../components/file-card";
import { createErrorCard } from "../components/error-card";
import { resolveBasesEntryCardProps } from "../resolvers/bases-entry-to-component-propscard";

export class FileCardListView extends BasesView {
  type = "FileCardListView";

  private cardRootElement: HTMLElement;

  constructor(controller: QueryController, containerEl: HTMLElement) {
    super(controller);

    this.cardRootElement = containerEl.createDiv();
  }

  onDataUpdated() {
    const cardElements = this.data.data
      .map((entry) => resolveBasesEntryCardProps(entry, this.config, this.app))
      .map((result) =>
        result
          .map((props) => createFileCard(props))
          .unwrapOrElse((error) => createErrorCard(error)),
      )
      // Insert a paragraph between each card to act as a spacer
      .flatMap((cardElement, index) => {
        if (index === 0) {
          return [cardElement];
        } else {
          return [window.createEl("p"), cardElement];
        }
      });

    this.cardRootElement.replaceChildren(...cardElements);
  }
}
