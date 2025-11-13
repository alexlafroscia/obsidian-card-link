export interface LinkMetadata {
  url: string;
  title: string;
  description?: string;
  host?: string;
  favicon?: string;
  image?: string;
}

export interface LinkMetadataWithIndent extends LinkMetadata {
  indent: number;
}
