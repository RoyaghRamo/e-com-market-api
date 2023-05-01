export class CustomHttpResponse {
  success: boolean;
  errors: any[];

  constructor() {
    this.success = false;
    this.errors = [];
  }
}

export class FetchResponse<T> extends CustomHttpResponse {
  docs: T[];

  constructor() {
    super();
    this.docs = [];
  }
}
