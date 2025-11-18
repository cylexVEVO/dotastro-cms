export type FsNode = {
  name: string;
  path: string;
  children: FsNode[];
  is_file: boolean;
};
