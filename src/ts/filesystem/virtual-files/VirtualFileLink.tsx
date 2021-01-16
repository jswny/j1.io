import { IVirtualFile } from "../IVirtualFile";

export class VirtualFileLink implements IVirtualFile {
  readonly name: string;
  readonly content: string;

  public open(): JSX.Element {
    this.redirectExternal(this.content);
    return null;
  }

  private redirectExternal(url: string) {
    window.location.href = url;
  }
}
