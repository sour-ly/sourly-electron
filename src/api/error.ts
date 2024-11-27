import Queue from "../renderer/util/queue";
import { APITypes } from "./api";


/*
  * APIErrorHandler
  * This class acts as a queue for API errors, it is a singleton class that happens to be eventful. This means React Components can listen to this module and output events that happen to be important
  *
  */

class APIErrorHandler extends Queue<APITypes.APIError> {

  private static instance: APIErrorHandler;

  private constructor() {
    super();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new APIErrorHandler();
    }
    return this.instance;
  }


}

export const APIErrorQueue = APIErrorHandler.getInstance();
