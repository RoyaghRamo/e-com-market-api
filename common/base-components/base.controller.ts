import {
  CustomHttpResponse,
  FetchResponse,
} from '../interfaces/http.responses';

export abstract class BaseController<T> {
  protected response: CustomHttpResponse;
  protected fetchResponse: FetchResponse<T>;

  protected constructor() {
    this.response = new CustomHttpResponse();
    this.fetchResponse = new FetchResponse<T>();
  }
}
