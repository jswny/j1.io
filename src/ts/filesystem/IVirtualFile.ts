export interface IVirtualFile {
  readonly name: string;
  readonly content: string;

  open(): JSX.Element;
}
