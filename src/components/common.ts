import Maybe from "true-myth/maybe";
import Result from "true-myth/result";

export type CardProp = Result<Maybe<string>, string[]>;

export type CommonCardProps = {
  title: CardProp;
  description: CardProp;
  url: CardProp;
  favicon: CardProp;
  image: CardProp;
};
