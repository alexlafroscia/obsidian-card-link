import Maybe from "true-myth/maybe";
import Result from "true-myth/result";

export type CardProp = Result<Maybe<string>, string[]>;

export interface LinkCard {
  title: CardProp;
  description: CardProp;
  url: CardProp;
  favicon: CardProp;
  image: CardProp;
}

export interface FileCard extends LinkCard {
  onClick: (event: MouseEvent) => void;
}
