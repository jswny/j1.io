import * as React from "react";

import { PDF } from "../../components/PDF";
import { IVirtualFile } from "../IVirtualFile";

export class VirtualFilePDF implements IVirtualFile {
  readonly name: string;
  readonly content: string;

  public open(): JSX.Element {
    const result = <PDF name={this.name} base64={this.content} />;
    return result;
  }
}
