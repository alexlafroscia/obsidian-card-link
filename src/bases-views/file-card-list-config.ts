import type { BasesPropertyId, BasesViewConfig, ViewOption } from "obsidian";

interface PropertyOption {
  displayName: string;
  default?: BasesPropertyId;
}

const VIEW_OPTIONS = {
  title: {
    displayName: "Title",
    default: "file.basename",
  },
  description: {
    displayName: "Description",
    default: "note.description",
  },
  url: {
    displayName: "URL",
    default: "note.url",
  },
  image: {
    displayName: "Image",
    default: "note.image",
  },
  favicon: {
    displayName: "Favicon",
    default: "note.favicon",
  },
} satisfies Record<string, PropertyOption>;

export type ConfigKey = keyof typeof VIEW_OPTIONS;

/**
 * Retreive the configured {@linkcode BasesPropertyId}, falling back to the configured
 * default if a value was not provided by the user
 *
 * This resolves some unexpected behavior where the {@linkcode BasesViewConfig#getAsPropertyId}
 * function returns `null` when a default is configured but the user has not provided an explicit
 * value; rather than providing the default on their behalf, we have to perform the fallback
 * ourselves.
 */
export function getAsValidPropertyId(
  config: BasesViewConfig,
  configKey: ConfigKey,
): BasesPropertyId {
  return config.getAsPropertyId(configKey) ?? VIEW_OPTIONS[configKey].default;
}

export function getViewOptions(): ViewOption[] {
  return [
    {
      displayName: "Card Properties",
      type: "group",
      items: Object.entries(VIEW_OPTIONS).map(([key, value]) => ({
        type: "property",
        key,
        placeholder: value.default,
        ...value,
      })),
    },
  ];
}
