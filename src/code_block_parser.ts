import { LinkMetadata } from "./interfaces";
import { NoRequiredParamsError } from "./errors";

export function parseLinkMetadataFromJSON(linkMetadata: any): LinkMetadata {
  if (!linkMetadata || !linkMetadata.url || !linkMetadata.title) {
    throw new NoRequiredParamsError(
      "required params[url, title] are not found.",
    );
  }

  return {
    url: linkMetadata.url,
    title: linkMetadata.title,
    description: linkMetadata.description,
    host: linkMetadata.host,
    favicon: linkMetadata.favicon,
    image: linkMetadata.image,
  };
}
