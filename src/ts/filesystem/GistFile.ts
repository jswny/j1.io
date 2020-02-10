export class GistFile {
  public id: string;
  public displayFile: string;

  constructor(jsonString: any) {
    console.debug(`Parsing JSON string into GistFile:`);
    console.debug(jsonString);

    const json: any = JSON.parse(jsonString);
    this.displayFile = json.displayFile;
    this.id = json.id;
  }
}
