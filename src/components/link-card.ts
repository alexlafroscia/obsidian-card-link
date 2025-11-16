import { Notice, ButtonComponent } from "obsidian";

interface CommonLinkProps {
  title: string;
  indent: number;

  description?: string;
  favicon?: string | undefined;
  host?: string;
  image?: string | undefined;
}

export interface ExternalLinkProps extends CommonLinkProps {
  url: string;
}

export interface InternalLinkProps extends CommonLinkProps {
  url?: string;
  onClick: (event: MouseEvent) => void;
}

export type LinkCardProps = InternalLinkProps | ExternalLinkProps;

function isInternal(props: LinkCardProps): props is InternalLinkProps {
  return "onClick" in props;
}

/* === Root Element Creation === */

function createInternalCardElement(props: InternalLinkProps): HTMLElement {
  const cardEl = document.createElement("div");

  cardEl.addClass("auto-card-link-card");
  cardEl.onClickEvent(props.onClick);

  return cardEl;
}

function createExternalCardElement(props: ExternalLinkProps): HTMLElement {
  const cardEl = document.createElement("a");

  cardEl.addClass("auto-card-link-card");
  cardEl.setAttr("href", props.url);

  return cardEl;
}

/* === Card Creation === */

export function createLinkCard(data: LinkCardProps): HTMLElement {
  const isInternalLink = isInternal(data);

  const containerEl = document.createElement("div");
  containerEl.addClass("auto-card-link-container");
  containerEl.setAttr("data-auto-card-link-depth", data.indent);

  const cardEl = isInternalLink
    ? createInternalCardElement(data)
    : createExternalCardElement(data);

  containerEl.appendChild(cardEl);

  const mainEl = document.createElement("div");
  mainEl.addClass("auto-card-link-main");
  cardEl.appendChild(mainEl);

  const titleEl = document.createElement("div");
  titleEl.addClass("auto-card-link-title");
  titleEl.textContent = data.title;
  mainEl.appendChild(titleEl);

  if (data.description) {
    const descriptionEl = document.createElement("div");
    descriptionEl.addClass("auto-card-link-description");
    descriptionEl.textContent = data.description;
    mainEl.appendChild(descriptionEl);
  }

  const hostEl = document.createElement("div");
  hostEl.addClass("auto-card-link-host");
  mainEl.appendChild(hostEl);

  if (data.favicon) {
    const faviconEl = document.createElement("img");
    faviconEl.addClass("auto-card-link-favicon");
    faviconEl.setAttr("src", data.favicon);
    hostEl.appendChild(faviconEl);
  }

  if (data.host) {
    const hostNameEl = document.createElement("span");
    hostNameEl.textContent = data.host;
    hostEl.appendChild(hostNameEl);
  }

  if (data.image) {
    const thumbnailEl = document.createElement("img");
    thumbnailEl.addClass("auto-card-link-thumbnail");
    thumbnailEl.setAttr("src", data.image);
    thumbnailEl.setAttr("draggable", "false");
    cardEl.appendChild(thumbnailEl);
  }

  if (data.url) {
    const { url } = data;

    new ButtonComponent(containerEl)
      .setClass("auto-card-link-copy-url")
      .setClass("clickable-icon")
      .setIcon("copy")
      .setTooltip(`Copy URL\n${url}`)
      .onClick(() => {
        navigator.clipboard.writeText(url);
        new Notice("URL copied to your clipboard");
      });
  }

  return containerEl;
}
