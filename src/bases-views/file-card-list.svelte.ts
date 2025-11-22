import { BasesView, QueryController } from "obsidian";

import FileCardList, {
  type Props as FileCardListProps,
} from "../components/FileCardList.svelte";
import { resolveBasesEntryCardProps } from "../resolvers/card/from-bases-entry";

import { SvelteComponentChild } from "../svelte-component-child";

export class FileCardListView extends BasesView {
  type = "FileCardListView";

  private fileCardList: SvelteComponentChild<FileCardListProps>;

  constructor(controller: QueryController, containerEl: HTMLElement) {
    super(controller);

    const initialProps: FileCardListProps = {
      cards: [],
    };
    this.fileCardList = this.addChild(
      new SvelteComponentChild(FileCardList, {
        target: containerEl.createDiv(),
        props: initialProps,
      }),
    );
  }

  onDataUpdated() {
    const cards = this.data.data.map((entry) =>
      resolveBasesEntryCardProps(entry, this.config, this.app),
    );

    this.fileCardList.setProps({ cards });
  }
}
