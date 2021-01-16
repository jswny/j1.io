import * as React from "react";

import { IVirtualFile } from "../IVirtualFile";
import { Gist } from "../../components/Gist";

interface IGistFile {
  displayFile: string;
  id: string;
}

export class VirtualFileGist implements IVirtualFile {
  readonly name: string;
  readonly content: string;

  public open(): JSX.Element {
    const gistFile: IGistFile = this.parseGistFile(this.content);
    const result = <Gist id={gistFile.id} displayFile={gistFile.displayFile} />;
    return result;
  }

  private parseGistFile(jsonString: string): IGistFile {
    console.debug(`Parsing JSON string into Gist file data:`);
    console.debug(jsonString);

    const json = JSON.parse(jsonString) as IGistFile;
    return {
      displayFile: json.displayFile,
      id: json.id,
    };
  }
}
