export class DisplayGistError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = DisplayGistError.name;
  }
}
