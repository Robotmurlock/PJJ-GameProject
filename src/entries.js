import axios from "axios";

class GetResults {
  config = {
    baseURL: "http://localhost",
    port: 8000
  };
  constructor() {
    this.httpClient = axios.create({
      baseURL: `${this.config.baseURL}:${this.config.port}`
    });
  }

  getResults() {
    return this.httpClient
      .get("/api/results")
      .then(response =>
        response.data
      );
  }
}

export default new GetResults();